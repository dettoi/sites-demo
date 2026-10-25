<?php
// Free-text car description -> fields. YandexGPT Lite first, regexes as a fallback.
require_once __DIR__ . '/tg.php';

const FIELDS = [
    'make'       => 'Марка',
    'model'      => 'Модель',
    'year'       => 'Год',
    'mileage_km' => 'Пробег, км',
    'price_rub'  => 'Цена, ₽',
    'volume_l'   => 'Объём, л',
    'fuel'       => 'Топливо',
    'power_hp'   => 'Мощность, л.с.',
];
const REQUIRED = ['make', 'model', 'year', 'mileage_km', 'price_rub'];
const FUELS = ['бензин', 'дизель', 'гибрид', 'электро', 'газ'];

function parse_car_text(string $text): array
{
    $ai = parse_with_yandex($text);
    $rx = parse_with_regex($text);
    // regexes are exact when they hit; the model fills what they miss
    $out = [];
    foreach (array_keys(FIELDS) as $k) $out[$k] = $rx[$k] ?? $ai[$k] ?? null;
    // the model likes to guess brands from slang («гелик» -> Mercedes); keep a name only if the text names it
    if ($out['make'] && !mentions_make($text, $out['make'])) $out['make'] = null;
    if ($out['model'] && !mentions($text, $out['model'])) $out['model'] = null;
    return normalize_fields($out);
}

function squash(string $s): string
{
    // latin and cyrillic spellings meet in one rough form: «Камри» and «Camry» both become «kamri»
    static $map = ['а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i','й'=>'i','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'ts','ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'','ы'=>'i','ь'=>'','э'=>'e','ю'=>'yu','я'=>'ya'];
    $s = strtr(mb_strtolower($s), $map);
    $s = strtr($s, ['ph' => 'f', 'c' => 'k', 'y' => 'i', 'w' => 'v', 'x' => 'h', 'q' => 'k']);
    return preg_replace('/[^a-z0-9]+/', '', $s);
}

function mentions(string $text, string $name): bool
{
    $n = squash($name);
    return $n !== '' && str_contains(squash($text), $n);
}

// word stems, so declined forms match: «тойоту», «мерса», «на ладе»
const MAKE_STEMS = [
    'mercedes-benz' => ['мерс', 'гелендваген'], 'bmw' => ['бмв', 'бэх'], 'toyota' => ['тойот', 'тоёт'], 'lada' => ['лад[аеуыо]', 'ваз'],
    'lexus' => ['лексус'], 'porsche' => ['порш'], 'tesla' => ['тесл'], 'mazda' => ['мазд'], 'audi' => ['ауди'],
    'volkswagen' => ['фольксваген', 'vw'], 'kia' => ['киа'], 'hyundai' => ['хенда', 'хёнда', 'хунда', 'хюнда'], 'nissan' => ['ниссан'],
    'honda' => ['хонд'], 'mitsubishi' => ['митсубис', 'мицубис'], 'skoda' => ['шкод'], 'renault' => ['рено'], 'ford' => ['форд'],
    'chevrolet' => ['шевроле'], 'land rover' => ['ленд ровер', 'рендж ровер', 'range rover'], 'volvo' => ['вольво'],
    'infiniti' => ['инфинити'], 'subaru' => ['субару'], 'suzuki' => ['сузуки'], 'geely' => ['джили'], 'haval' => ['хавал', 'хавейл'],
    'chery' => ['чери'], 'changan' => ['чанган'], 'exeed' => ['эксид'], 'li auto' => ['лисян', 'lixiang'], 'zeekr' => ['зикр'],
    'jeep' => ['джип'], 'uaz' => ['уаз'], 'peugeot' => ['пежо'], 'opel' => ['опел'], 'cadillac' => ['кадиллак'],
];

function mentions_make(string $text, string $make): bool
{
    if (mentions($text, $make)) return true;
    foreach (MAKE_STEMS[mb_strtolower($make)] ?? [] as $stem) {
        if (preg_match('/(?<!\p{L})' . $stem . '/iu', $text)) return true;
    }
    return false;
}

function parse_with_yandex(string $text): array
{
    $cfg = cfg();
    if (empty($cfg['yandex_api_key'])) return [];
    $prompt = <<<P
    Извлеки из объявления о продаже автомобиля поля и верни только JSON без пояснений:
    {"make": марка латиницей как пишет производитель (BMW, Mercedes-Benz, Lada, Toyota), "model": модель (X5, GLC, Granta), "year": год выпуска числом, "mileage_km": пробег в километрах числом, "price_rub": цена в рублях числом, "volume_l": объём двигателя в литрах числом, "fuel": одно из "бензин","дизель","гибрид","электро","газ", "power_hp": мощность в л.с. числом}
    Правила: «2.49 млн», «2,49», «2.49🍋» означают 2490000 рублей; «194 тыс» пробега означает 194000. Если поля нет в тексте, ставь null. Ничего не придумывай.
    P;
    $body = [
        'modelUri' => 'gpt://' . $cfg['yandex_folder'] . '/yandexgpt-lite/latest',
        'completionOptions' => ['temperature' => 0, 'maxTokens' => 300],
        'messages' => [['role' => 'system', 'text' => $prompt], ['role' => 'user', 'text' => mb_substr($text, 0, 2000)]],
    ];
    $ch = curl_init('https://llm.api.cloud.yandex.net/foundationModels/v1/completion');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['Authorization: Api-Key ' . $cfg['yandex_api_key'], 'Content-Type: application/json'],
    ]);
    $res = json_decode((string)curl_exec($ch), true);
    $answer = $res['result']['alternatives'][0]['message']['text'] ?? '';
    if (!preg_match('/\{.*\}/s', $answer, $m)) {
        error_log('yandex parse failed: ' . mb_substr(json_encode($res, JSON_UNESCAPED_UNICODE), 0, 300));
        return [];
    }
    return json_decode($m[0], true) ?: [];
}

function parse_with_regex(string $text): array
{
    $t = mb_strtolower(str_replace(["\u{00A0}", '’'], [' ', "'"], $text));
    $out = [];
    if (preg_match('/\b(19[89]\d|20[0-3]\d)\s*(?:г\.?|года?|г\.в\.)/u', $t, $m)) $out['year'] = (int)$m[1];
    if (preg_match('/пробег\D{0,15}([\d\s.,]+)\s*(тыс|т\.? ?км|км)?/u', $t, $m)) {
        $n = (float)str_replace([' ', ','], ['', '.'], trim($m[1]));
        if (!empty($m[2]) && str_starts_with($m[2], 'т') && $n < 2000) $n *= 1000;
        if ($n > 0) $out['mileage_km'] = (int)round($n);
    }
    if (preg_match('/(\d[.,]\d)\s*\/\s*(бензин|дизель|гибрид|электро|газ)\s*\/\s*(\d{2,4})\s*л\.?\s*с/u', $t, $m)) {
        $out['volume_l'] = (float)str_replace(',', '.', $m[1]);
        $out['fuel'] = $m[2];
        $out['power_hp'] = (int)$m[3];
    }
    if (preg_match('/(\d{1,3}(?:[.,]\d{1,3})?)\s*(?:🍋|млн)/u', $t, $m)) {
        $out['price_rub'] = (int)round((float)str_replace(',', '.', $m[1]) * 1e6);
    }
    return $out;
}

function normalize_fields(array $f): array
{
    $int = fn($v) => is_numeric($v) ? (int)round((float)$v) : null;
    $f['year'] = $int($f['year']);
    $f['mileage_km'] = $int($f['mileage_km']);
    $f['price_rub'] = $int($f['price_rub']);
    $f['power_hp'] = $int($f['power_hp']);
    $f['volume_l'] = is_numeric($f['volume_l']) ? round((float)$f['volume_l'], 1) : null;
    $f['fuel'] = in_array(mb_strtolower((string)$f['fuel']), FUELS, true) ? mb_strtolower($f['fuel']) : null;
    foreach (['make', 'model'] as $k) $f[$k] = trim((string)$f[$k]) ?: null;
    // sanity: drop values that cannot be right instead of publishing them
    if ($f['year'] !== null && ($f['year'] < 1950 || $f['year'] > (int)date('Y') + 1)) $f['year'] = null;
    if ($f['price_rub'] !== null && ($f['price_rub'] < 50000 || $f['price_rub'] > 500000000)) $f['price_rub'] = null;
    if ($f['mileage_km'] !== null && $f['mileage_km'] > 2000000) $f['mileage_km'] = null;
    if ($f['fuel'] === 'электро') $f['volume_l'] = null;
    return $f;
}

// Value typed by a user for one field; null if it does not parse.
function parse_field(string $key, string $v)
{
    $v = trim($v);
    if (in_array($key, ['make', 'model'], true)) return $v !== '' ? $v : null;
    if ($key === 'fuel') { $v = mb_strtolower($v); return in_array($v, FUELS, true) ? $v : null; }
    $n = (float)str_replace([' ', "\u{00A0}", ','], ['', '', '.'], preg_replace('/[^\d.,\s]/u', '', $v));
    if ($key === 'price_rub' && $n > 0 && $n < 1000) $n *= 1e6;            // «2,49» means millions
    if ($key === 'mileage_km' && preg_match('/тыс/u', $v) && $n < 2000) $n *= 1000;
    if ($n <= 0) return null;
    $f = array_fill_keys(array_keys(FIELDS), null);
    $f[$key] = $n;
    return normalize_fields($f)[$key];
}
