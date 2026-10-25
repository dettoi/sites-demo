<?php
// Turns a confirmed draft into a published car: photos to 800x600 + 480x360 thumbs, rows in SQLite.
require_once __DIR__ . '/cars.php';
require_once __DIR__ . '/tg.php';

const PHOTO_BOX = [800, 600];
const THUMB_BOX = [480, 360];
const MIN_PHOTOS = 3;

function car_title(array $f): string
{
    return trim(($f['make'] ?? '') . ' ' . ($f['model'] ?? ''));
}

// «Выложить так»: a post without a make (e.g. «электрогелик») goes out under a neutral label instead of a guessed brand.
function fill_unbranded(array $f): array
{
    $electric = ($f['fuel'] ?? null) === 'электро';
    if (!$f['make'] && !$f['model']) {
        $f['make'] = $electric ? 'Электромобиль' : 'Автомобиль';
    } elseif (!$f['make']) {
        $f['make'] = $electric ? 'Электро' : 'Без марки';
    }
    $f['model'] ??= '';
    return $f;
}

function slugify(string $s): string
{
    $map = ['а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'c','ч'=>'ch','ш'=>'sh','щ'=>'sch','ы'=>'y','э'=>'e','ю'=>'yu','я'=>'ya'];
    $s = strtr(mb_strtolower($s), $map);
    return trim(preg_replace('/[^a-z0-9]+/', '-', $s), '-');
}

function unique_slug(string $base): string
{
    $q = db()->prepare('SELECT 1 FROM cars WHERE slug = ?');
    for ($i = 1, $slug = $base; ; $slug = $base . '-' . ++$i) {
        $q->execute([$slug]);
        if (!$q->fetchColumn()) return $slug;
    }
}

// Same car already on the site or sold recently: make+model+year and mileage within 1000 km.
function find_duplicate(array $f): ?array
{
    if (!$f['make'] || !$f['year'] || $f['mileage_km'] === null) return null;
    $q = db()->prepare("SELECT * FROM cars WHERE status != 'draft' AND year = ? AND abs(mileage_km - ?) <= 1000 AND lower(title) = lower(?)");
    $q->execute([$f['year'], $f['mileage_km'], car_title($f)]);
    return $q->fetch() ?: null;
}

function fit_jpeg(GdImage $src, string $dest, array $box, int $quality): array
{
    [$w, $h] = [imagesx($src), imagesy($src)];
    $k = min(1, $box[0] / $w, $box[1] / $h);
    [$nw, $nh] = [max(1, (int)round($w * $k)), max(1, (int)round($h * $k))];
    $dst = imagecreatetruecolor($nw, $nh);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
    imageinterlace($dst, true);
    imagejpeg($dst, $dest, $quality);
    return [$nw, $nh];
}

// Downloads and resizes the draft photos into img/cars/<slug>/; returns [[file, w, h], ...].
function store_photos(int $draftId, string $slug): array
{
    $dir = media_dir() . "/$slug";
    @mkdir("$dir/t", 0755, true);
    $q = db()->prepare('SELECT file_id FROM draft_photos WHERE draft_id = ? ORDER BY msg_id, id');
    $q->execute([$draftId]);
    $out = [];
    foreach ($q->fetchAll(PDO::FETCH_COLUMN) as $fileId) {
        $tmp = tempnam(sys_get_temp_dir(), 'bc');
        if (!tg_download($fileId, $tmp) || !($img = @imagecreatefromstring(file_get_contents($tmp)))) { @unlink($tmp); continue; }
        $name = sprintf('%02d', count($out) + 1);
        [$w, $h] = fit_jpeg($img, "$dir/$name.jpg", PHOTO_BOX, 85);
        fit_jpeg($img, "$dir/t/$name.jpg", THUMB_BOX, 80);
        @unlink($tmp);
        $out[] = [$name, $w, $h];
    }
    return $out;
}

// Publishes the draft (new car, or replaces fields and photos of $draft['update_of']). Returns the car row.
function publish_draft(array $draft): array
{
    $f = json_decode($draft['fields'], true);
    $pdo = db();
    $cols = [
        'make' => $f['make'], 'title' => car_title($f), 'year' => $f['year'], 'mileage_km' => $f['mileage_km'],
        'price_rub' => $f['price_rub'], 'volume_l' => $f['volume_l'], 'fuel' => $f['fuel'], 'power_hp' => $f['power_hp'],
    ];

    if ($draft['update_of']) {
        $car = $pdo->query('SELECT * FROM cars WHERE id = ' . (int)$draft['update_of'])->fetch();
        $slug = $car['slug'];
    } else {
        $slug = unique_slug(slugify(car_title($f) . ' ' . $f['year']));
    }

    // new photos go to a fresh folder first, so a failed download never breaks the live car
    $stage = $slug . '.new';
    exec('rm -rf ' . escapeshellarg(media_dir() . "/$stage"));
    $photos = store_photos((int)$draft['id'], $stage);
    if (count($photos) < MIN_PHOTOS) throw new RuntimeException('Не удалось скачать фото: получено ' . count($photos));
    exec('rm -rf ' . escapeshellarg(media_dir() . "/$slug"));
    rename(media_dir() . "/$stage", media_dir() . "/$slug");

    $pdo->beginTransaction();
    if ($draft['update_of']) {
        $set = implode(', ', array_map(fn($k) => "$k = :$k", array_keys($cols)));
        $pdo->prepare("UPDATE cars SET $set, status = 'published', side_photo_id = NULL, sold_at = NULL, updated_at = datetime('now') WHERE id = :id")
            ->execute($cols + ['id' => $car['id']]);
        $pdo->prepare('DELETE FROM photos WHERE car_id = ?')->execute([$car['id']]);
        $carId = (int)$car['id'];
    } else {
        $pdo->prepare('INSERT INTO cars (slug, status, make, title, year, mileage_km, price_rub, volume_l, fuel, power_hp, created_by, published_at)
            VALUES (:slug, \'published\', :make, :title, :year, :mileage_km, :price_rub, :volume_l, :fuel, :power_hp, :by, datetime(\'now\'))')
            ->execute($cols + ['slug' => $slug, 'by' => $draft['user_id']]);
        $carId = (int)$pdo->lastInsertId();
    }
    $ins = $pdo->prepare('INSERT INTO photos (car_id, pos, file, width, height) VALUES (?, ?, ?, ?, ?)');
    foreach ($photos as $i => [$name, $w, $h]) $ins->execute([$carId, $i, $name, $w, $h]);
    $pdo->prepare("UPDATE drafts SET state = 'done' WHERE id = ?")->execute([$draft['id']]);
    $pdo->commit();
    mark_dirty();

    return $pdo->query("SELECT * FROM cars WHERE id = $carId")->fetch();
}
