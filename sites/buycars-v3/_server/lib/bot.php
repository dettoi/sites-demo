<?php
// Bot logic: managers send photos + text in a private chat, confirm a card, the car goes to the site.
require_once __DIR__ . '/publish.php';
require_once __DIR__ . '/parse.php';

const DEBOUNCE_SEC = 4;      // an album arrives as separate updates within a second or two
const DRAFT_TTL_H = 24;
const HELP = "Пришлите фото машины (можно несколько альбомов) и текст: марка и модель, год, пробег, двигатель, цена. "
    . "Можно просто переслать пост из канала. Я покажу карточку, вы подтвердите, и машина появится на сайте.\n\n"
    . "/list машины на сайте: продано, цена\n/cancel отменить текущую машину\n/id ваш Telegram ID";

// ---------- access ----------

function user_row(int $id): ?array
{
    $q = db()->prepare('SELECT * FROM users WHERE tg_id = ?');
    $q->execute([$id]);
    $u = $q->fetch() ?: null;
    if (!$u && $id === (int)cfg()['owner_id']) {
        db()->prepare("INSERT INTO users (tg_id, name, role) VALUES (?, 'Владелец', 'owner')")->execute([$id]);
        return user_row($id);
    }
    return $u;
}

// ---------- drafts ----------

function active_draft(int $chat): ?array
{
    $q = db()->prepare("SELECT * FROM drafts WHERE chat_id = ? AND state IN ('collecting','review')
                        AND created_at > datetime('now', ?) ORDER BY id DESC LIMIT 1");
    $q->execute([$chat, '-' . DRAFT_TTL_H . ' hours']);
    return $q->fetch() ?: null;
}

function draft(int $id): ?array
{
    $q = db()->prepare('SELECT * FROM drafts WHERE id = ?');
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

function draft_photo_count(int $id): int
{
    $q = db()->prepare('SELECT count(*) FROM draft_photos WHERE draft_id = ?');
    $q->execute([$id]);
    return (int)$q->fetchColumn();
}

// New input reopens the draft for collecting and restarts the debounce clock.
function touch_draft(int $chat, int $user, ?string $text, ?array $photo, int $msgId): array
{
    $d = active_draft($chat);
    if (!$d) {
        db()->prepare('INSERT INTO drafts (chat_id, user_id, touched_at) VALUES (?, ?, ?)')->execute([$chat, $user, microtime(true)]);
        $d = draft((int)db()->lastInsertId());
    }
    if ($d['state'] === 'review' && $d['card_msg_id']) edit_card_off($d);
    if ($text !== null && trim($text) !== '') {
        $d['text'] = trim($d['text'] . "\n" . $text);
    }
    if ($photo) {
        db()->prepare('INSERT OR IGNORE INTO draft_photos (draft_id, file_id, file_unique, msg_id) VALUES (?, ?, ?, ?)')
            ->execute([$d['id'], $photo['file_id'], $photo['file_unique_id'], $msgId]);
    }
    $t = microtime(true);
    db()->prepare("UPDATE drafts SET text = ?, state = 'collecting', touched_at = ? WHERE id = ?")->execute([$d['text'], $t, $d['id']]);
    $d['touched_at'] = $t;
    return $d;
}

// Called after the response is sent: only the last update of a burst gets to show the card.
function settle_draft(array $d): void
{
    sleep(DEBOUNCE_SEC);
    $q = db()->prepare("UPDATE drafts SET state = 'review' WHERE id = ? AND state = 'collecting' AND touched_at = ?");
    $q->execute([$d['id'], $d['touched_at']]);
    if ($q->rowCount() !== 1) return;
    show_card(draft((int)$d['id']), true);
}

// ---------- the card ----------

function fmt_num(?int $n): string
{
    return $n === null ? '' : number_format($n, 0, '', ' ');
}

function card_text(array $d, array $f, int $photos): string
{
    $v = fn($k) => $f[$k] ?? null;
    $engine = implode(', ', array_filter([
        $v('volume_l') !== null ? str_replace('.', ',', sprintf('%.1f', $v('volume_l'))) . ' л' : null,
        $v('fuel'),
        $v('power_hp') !== null ? $v('power_hp') . ' л.с.' : null,
    ]));
    $lines = [
        '<b>' . h(trim(($v('make') ?? '?') . ' ' . ($v('model') ?? '?'))) . ', ' . ($v('year') ?? '?') . '</b>',
        'Пробег: ' . ($v('mileage_km') !== null ? fmt_num($v('mileage_km')) . ' км' : '?'),
        'Двигатель: ' . ($engine ?: 'не указан'),
        'Цена: ' . ($v('price_rub') !== null ? fmt_num($v('price_rub')) . ' ₽' : '?'),
        'Фото: ' . $photos . ($photos < MIN_PHOTOS ? ' (нужно минимум ' . MIN_PHOTOS . ')' : ''),
    ];
    $missing = array_values(array_map(fn($k) => mb_strtolower(FIELDS[$k]), array_filter(REQUIRED, fn($k) => $v($k) === null)));
    if ($missing) $lines[] = "\nНе хватает: " . implode(', ', $missing) . '. Нажмите «Исправить» или допишите текстом.';
    if (only_name_missing($f)) $lines[] = 'Или «Выложить так»: на сайте будет «' . h(car_title(fill_unbranded($f))) . '».';
    if ($d['update_of']) $lines[] = "\nОбновлю машину, которая уже на сайте.";
    elseif ($d['dup_car_id'] && ($dup = db()->query('SELECT * FROM cars WHERE id = ' . (int)$d['dup_car_id'])->fetch())) {
        $lines[] = "\nПохоже на машину, которая уже есть: <b>" . h($dup['title']) . ', ' . $dup['year'] . '</b>, ' . fmt_num((int)$dup['mileage_km']) . ' км, '
            . fmt_num((int)$dup['price_rub']) . ' ₽' . ($dup['status'] === 'sold' ? ' (продана)' : '') . '. Это она?';
    }
    if (!$missing && $photos >= MIN_PHOTOS && !$d['dup_car_id']) $lines[] = "\nВсё верно?";
    return implode("\n", $lines);
}

// Everything required is there except the make and/or model.
function only_name_missing(array $f): bool
{
    $missing = array_filter(REQUIRED, fn($k) => ($f[$k] ?? null) === null);
    return $missing && !array_diff($missing, ['make', 'model']);
}

function card_buttons(array $d, array $f, int $photos): array
{
    $id = $d['id'];
    $rows = [];
    $complete = !array_filter(REQUIRED, fn($k) => ($f[$k] ?? null) === null) && $photos >= MIN_PHOTOS;
    if ($d['dup_car_id'] && !$d['update_of']) $rows[] = [btn('Да, обновить её', "d:upd:$id"), btn('Нет, другая', "d:new:$id")];
    elseif ($complete) $rows[] = [btn('Да, опубликовать', "d:ok:$id")];
    elseif (only_name_missing($f) && $photos >= MIN_PHOTOS) $rows[] = [btn('Выложить так', "d:asis:$id")];
    $rows[] = [btn('Исправить', "d:fix:$id"), btn('Добавить фото', "d:more:$id")];
    $rows[] = [btn('Отмена', "d:no:$id")];
    return $rows;
}

function show_card(array $d, bool $reparse = false): void
{
    $f = json_decode((string)$d['fields'], true) ?: [];
    $photos = draft_photo_count((int)$d['id']);
    if ($d['text'] === '' && !$f) {
        say((int)$d['chat_id'], "Фото получил: $photos. Теперь пришлите текст: марка и модель, год, пробег, двигатель, цена.");
        db()->prepare("UPDATE drafts SET state = 'collecting' WHERE id = ?")->execute([$d['id']]);
        return;
    }
    if ($reparse && $d['text'] !== '') {
        $fixed = $f['_fixed'] ?? [];
        $parsed = parse_car_text($d['text']);
        foreach ($fixed as $k) $parsed[$k] = $f[$k];      // values typed via «Исправить» win over the parser
        $f = $parsed + ['_fixed' => $fixed];
        $dup = $d['update_of'] ? null : find_duplicate($f);
        $d['dup_car_id'] = $dup['id'] ?? null;
        db()->prepare('UPDATE drafts SET fields = ?, dup_car_id = ? WHERE id = ?')
            ->execute([json_encode($f, JSON_UNESCAPED_UNICODE), $d['dup_car_id'], $d['id']]);
    }
    $msg = say((int)$d['chat_id'], card_text($d, $f, $photos), card_buttons($d, $f, $photos));
    if ($msg) db()->prepare('UPDATE drafts SET card_msg_id = ? WHERE id = ?')->execute([$msg['message_id'], $d['id']]);
}

function edit_card_off(array $d, string $suffix = ''): void
{
    if (!$d['card_msg_id']) return;
    $f = json_decode((string)$d['fields'], true) ?: [];
    edit((int)$d['chat_id'], (int)$d['card_msg_id'], card_text($d, $f, draft_photo_count((int)$d['id'])) . $suffix);
}

// ---------- waits: the next text from this user is a field value ----------

function set_wait(int $user, ?array $data): void
{
    if ($data === null) db()->prepare('DELETE FROM waits WHERE user_id = ?')->execute([$user]);
    else db()->prepare('INSERT OR REPLACE INTO waits (user_id, data) VALUES (?, ?)')->execute([$user, json_encode($data)]);
}

function get_wait(int $user): ?array
{
    $q = db()->prepare('SELECT data FROM waits WHERE user_id = ?');
    $q->execute([$user]);
    $v = $q->fetchColumn();
    return $v ? json_decode($v, true) : null;
}

function handle_wait(array $w, int $chat, int $user, string $text): void
{
    $val = parse_field($w['field'], $text);
    if ($val === null) { say($chat, 'Не понял значение. Попробуйте ещё раз, например: ' . field_example($w['field'])); return; }
    set_wait($user, null);
    if (isset($w['draft'])) {
        $d = draft((int)$w['draft']);
        if (!$d || !in_array($d['state'], ['collecting', 'review'], true)) return;
        $f = json_decode((string)$d['fields'], true) ?: array_fill_keys(array_keys(FIELDS), null);
        $f[$w['field']] = $val;
        $f['_fixed'] = array_values(array_unique([...($f['_fixed'] ?? []), $w['field']]));
        $dup = $d['update_of'] ? null : find_duplicate($f);
        db()->prepare("UPDATE drafts SET fields = ?, dup_car_id = ?, state = 'review' WHERE id = ?")
            ->execute([json_encode($f, JSON_UNESCAPED_UNICODE), $dup['id'] ?? null, $d['id']]);
        show_card(draft((int)$d['id']));
    } elseif (isset($w['car']) && $w['field'] === 'price_rub') {
        db()->prepare("UPDATE cars SET price_rub = ?, updated_at = datetime('now') WHERE id = ?")->execute([$val, $w['car']]);
        mark_dirty();
        say($chat, 'Цена обновлена: ' . fmt_num($val) . ' ₽. Сайт обновится в течение пары минут.');
    }
}

function field_example(string $k): string
{
    return ['make' => 'BMW', 'model' => 'X5', 'year' => '2016', 'mileage_km' => '194000', 'price_rub' => '2490000 или 2,49',
        'volume_l' => '2.0', 'fuel' => 'бензин', 'power_hp' => '150'][$k] ?? '';
}

// ---------- /list ----------

function list_cars(int $chat): void
{
    $cars = db()->query("SELECT id, title, year, price_rub FROM cars WHERE status = 'published' ORDER BY title, year")->fetchAll();
    if (!$cars) { say($chat, 'На сайте пока нет машин.'); return; }
    $rows = array_map(fn($c) => [btn($c['title'] . ', ' . $c['year'] . ', ' . fmt_num((int)$c['price_rub']) . ' ₽', 'c:' . $c['id'])], $cars);
    say($chat, 'Машины на сайте: ' . count($cars) . '. Выберите машину:', $rows);
}

// First word of the model: «Cayenne» for Porsche Cayenne Coupe, «X5» for BMW X5.
function model_word(array $c): string
{
    $model = trim(mb_substr($c['title'], mb_strlen($c['make'])));
    return preg_split('/\s+/u', $model)[0] ?? '';
}

// «Porsche Cayenne купе продано»: find the car by the name in the text and ask before taking it off the site.
function offer_sold(int $chat, string $text): void
{
    $cars = db()->query("SELECT * FROM cars WHERE status = 'published'")->fetchAll();
    // by model first («Cayenne», «X5»); if the text names only the brand, every car of that brand
    $hits = array_values(array_filter($cars, fn($c) => model_word($c) !== '' && mentions($text, model_word($c))));
    if (!$hits) $hits = array_values(array_filter($cars, fn($c) => mentions_make($text, $c['make'])));
    // a year in the text narrows it down
    if (count($hits) > 1 && preg_match('/\b(19[5-9]\d|20[0-3]\d)\b/', $text, $y)) {
        $byYear = array_values(array_filter($hits, fn($c) => (int)$c['year'] === (int)$y[1]));
        if ($byYear) $hits = $byYear;
    }
    if (!$hits) { say($chat, 'Не нашёл такую машину на сайте. Выберите её в /list и нажмите «Продано».'); return; }
    $rows = array_map(fn($c) => [btn('Продано: ' . $c['title'] . ', ' . $c['year'] . ', ' . fmt_num((int)$c['price_rub']) . ' ₽', 'c:sold:' . $c['id'])], array_slice($hits, 0, 8));
    $rows[] = [btn('Нет, ничего не снимать', 'x')];
    say($chat, count($hits) === 1 ? 'Снять с сайта как проданную?' : 'Нашёл несколько похожих. Какую снять?', $rows);
}

function car_menu(int $chat, int $msgId, int $carId): void
{
    $c = db()->query('SELECT * FROM cars WHERE id = ' . $carId)->fetch();
    if (!$c) return;
    edit($chat, $msgId, '<b>' . h($c['title']) . ', ' . $c['year'] . '</b>, ' . fmt_num((int)$c['mileage_km']) . ' км, ' . fmt_num((int)$c['price_rub']) . ' ₽',
        [[btn('Продано', "c:sold?:$carId"), btn('Изменить цену', "c:price:$carId")]]);
}

// ---------- entry ----------

function handle_update(array $u): ?callable
{
    if (isset($u['callback_query'])) { handle_callback($u['callback_query']); return null; }
    $m = $u['message'] ?? null;
    if (!$m || ($m['chat']['type'] ?? '') !== 'private') return null;
    $chat = (int)$m['chat']['id'];
    $from = (int)$m['from']['id'];
    $text = $m['text'] ?? $m['caption'] ?? null;

    if ($text !== null && preg_match('~^/(id|start)\b~', $text) && !user_row($from)) {
        say($chat, "Ваш Telegram ID: <code>$from</code>. Передайте его владельцу, чтобы он выдал доступ.");
        return null;
    }
    $user = user_row($from);
    if (!$user) { say($chat, "Нет доступа. Ваш Telegram ID: <code>$from</code>. Передайте его владельцу."); return null; }

    if ($text !== null && str_starts_with($text, '/') && !isset($m['photo'])) { handle_command($chat, $user, $text); return null; }

    if (!isset($m['photo']) && $text !== null && ($w = get_wait($from))) { handle_wait($w, $chat, $from, $text); return null; }

    if (!isset($m['photo']) && $text !== null && preg_match('/продан|продали/iu', $text) && !active_draft($chat)) { offer_sold($chat, $text); return null; }

    if (isset($m['photo']) || $text !== null) {
        $photo = isset($m['photo']) ? end($m['photo']) : null;
        $d = touch_draft($chat, $from, $text, $photo, (int)$m['message_id']);
        return fn() => settle_draft($d);
    }
    if (isset($m['document']) || isset($m['video'])) say($chat, 'Видео и файлы не принимаю, пришлите фото обычным способом.');
    return null;
}

function handle_command(int $chat, array $user, string $text): void
{
    $owner = $user['role'] === 'owner';
    [$cmd, $arg] = array_pad(preg_split('/\s+/', trim($text), 2), 2, '');
    $cmd = strtolower(preg_replace('/@.*/', '', $cmd));
    switch ($cmd) {
        case '/start': case '/help':
            say($chat, HELP . ($owner ? "\n\nВладельцу:\n/add ID Имя дать доступ\n/remove ID забрать доступ\n/users кто имеет доступ" : ''));
            break;
        case '/id':
            say($chat, "Ваш Telegram ID: <code>{$user['tg_id']}</code>");
            break;
        case '/list':
            list_cars($chat);
            break;
        case '/cancel':
            if ($d = active_draft($chat)) {
                db()->prepare("UPDATE drafts SET state = 'cancelled' WHERE id = ?")->execute([$d['id']]);
                edit_card_off($d, "\n\nОтменено.");
            }
            set_wait((int)$user['tg_id'], null);
            say($chat, 'Отменено. Можно присылать следующую машину.');
            break;
        case '/add':
            if (!$owner) break;
            if (!preg_match('/^(\d{5,15})\s*(.*)$/u', $arg, $mm)) { say($chat, 'Формат: /add 123456789 Иван. ID человек узнает, написав боту /id.'); break; }
            db()->prepare("INSERT INTO users (tg_id, name, role) VALUES (?, ?, 'manager') ON CONFLICT(tg_id) DO UPDATE SET name = excluded.name")
                ->execute([(int)$mm[1], $mm[2] ?: null]);
            say($chat, 'Доступ выдан: ' . h($mm[2] ?: $mm[1]) . '.');
            say((int)$mm[1], "Вам выдали доступ к боту сайта БАЙКАРС.\n\n" . HELP);
            break;
        case '/remove':
            if (!$owner) break;
            $id = (int)$arg;
            if ($id === (int)cfg()['owner_id']) { say($chat, 'Владельца удалить нельзя.'); break; }
            $q = db()->prepare('DELETE FROM users WHERE tg_id = ?');
            $q->execute([$id]);
            say($chat, $q->rowCount() ? 'Доступ забран.' : 'Такого пользователя нет.');
            break;
        case '/users':
            if (!$owner) break;
            $rows = db()->query('SELECT * FROM users ORDER BY role DESC, added_at')->fetchAll();
            say($chat, implode("\n", array_map(fn($r) => '<code>' . $r['tg_id'] . '</code> ' . h($r['name'] ?? '') . ($r['role'] === 'owner' ? ' (владелец)' : ''), $rows)));
            break;
        default:
            say($chat, HELP);
    }
}

function handle_callback(array $cb): void
{
    $from = (int)$cb['from']['id'];
    $chat = (int)$cb['message']['chat']['id'];
    $msgId = (int)$cb['message']['message_id'];
    tg('answerCallbackQuery', ['callback_query_id' => $cb['id']]);
    if (!user_row($from)) return;
    $parts = explode(':', $cb['data'] ?? '');
    if ($parts[0] === 'x') { edit($chat, $msgId, 'Ок, ничего не меняю.'); return; }

    if ($parts[0] === 'c') {
        [, $act, $id] = array_pad($parts, 3, null);
        if ($id === null) { car_menu($chat, $msgId, (int)$act); return; }
        $id = (int)$id;
        if ($act === 'sold?') {
            edit($chat, $msgId, 'Снять машину с сайта как проданную?', [[btn('Да, продано', "c:sold:$id"), btn('Нет', "c:$id")]]);
        } elseif ($act === 'sold') {
            db()->prepare("UPDATE cars SET status = 'sold', sold_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND status = 'published'")->execute([$id]);
            mark_dirty();
            $c = db()->query("SELECT title, year FROM cars WHERE id = $id")->fetch();
            edit($chat, $msgId, h($c['title']) . ', ' . $c['year'] . ': снята с сайта. Сайт обновится в течение пары минут.');
        } elseif ($act === 'price') {
            set_wait($from, ['car' => $id, 'field' => 'price_rub']);
            say($chat, 'Новая цена? Например: ' . field_example('price_rub'));
        }
        return;
    }

    if ($parts[0] !== 'd') return;
    [, $act, $id, $key] = array_pad($parts, 4, null);
    $d = draft((int)$id);
    if (!$d || !in_array($d['state'], ['collecting', 'review'], true)) { edit($chat, $msgId, 'Эта карточка уже неактуальна.'); return; }
    $f = json_decode((string)$d['fields'], true) ?: [];

    switch ($act) {
        case 'asis':
            if (!only_name_missing($f)) { show_card($d); return; }
            $f = fill_unbranded($f);
            db()->prepare('UPDATE drafts SET fields = ? WHERE id = ?')->execute([json_encode($f, JSON_UNESCAPED_UNICODE), $d['id']]);
            $d['fields'] = json_encode($f, JSON_UNESCAPED_UNICODE);
            // fall through to publishing
        case 'ok':
            $missing = array_filter(REQUIRED, fn($k) => ($f[$k] ?? null) === null);
            if ($missing || draft_photo_count((int)$d['id']) < MIN_PHOTOS) { show_card($d); return; }
            edit($chat, $msgId, card_text($d, $f, draft_photo_count((int)$d['id'])) . "\n\nПубликую...");
            try {
                $car = publish_draft($d);
                edit($chat, $msgId, card_text($d, $f, draft_photo_count((int)$d['id'])) . "\n\nОпубликовано. Сайт обновится в течение пары минут.");
            } catch (Throwable $e) {
                error_log('publish: ' . $e->getMessage());
                edit($chat, $msgId, card_text($d, $f, draft_photo_count((int)$d['id'])) . "\n\nНе получилось опубликовать: " . h($e->getMessage()) . '. Попробуйте ещё раз.', card_buttons($d, $f, draft_photo_count((int)$d['id'])));
            }
            break;
        case 'upd':
            db()->prepare('UPDATE drafts SET update_of = dup_car_id WHERE id = ?')->execute([$d['id']]);
            edit_card_off($d);
            show_card(draft((int)$d['id']));
            break;
        case 'new':
            db()->prepare('UPDATE drafts SET dup_car_id = NULL WHERE id = ?')->execute([$d['id']]);
            edit_card_off($d);
            show_card(draft((int)$d['id']));
            break;
        case 'fix':
            $rows = array_chunk(array_map(fn($k) => btn(FIELDS[$k], "d:f:{$d['id']}:$k"), array_keys(FIELDS)), 2);
            edit($chat, $msgId, card_text($d, $f, draft_photo_count((int)$d['id'])) . "\n\nЧто исправить?", $rows);
            break;
        case 'f':
            if (!isset(FIELDS[$key])) return;
            set_wait($from, ['draft' => (int)$d['id'], 'field' => $key]);
            edit_card_off($d);
            say($chat, FIELDS[$key] . '? Например: ' . field_example($key));
            break;
        case 'more':
            say($chat, 'Пришлите фото, я добавлю их и покажу карточку заново.');
            break;
        case 'no':
            db()->prepare("UPDATE drafts SET state = 'cancelled' WHERE id = ?")->execute([$d['id']]);
            edit($chat, $msgId, card_text($d, $f, draft_photo_count((int)$d['id'])) . "\n\nОтменено.");
            break;
    }
}
