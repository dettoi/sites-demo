<?php
// Car records <-> the data/cars.json shape that _build/build.mjs reads.
require_once __DIR__ . '/db.php';

const NBSP = "\u{00A0}"; // the site keeps numbers and units together

function fmt_volume(float $l): string
{
    return str_replace('.', ',', number_format($l, 1, '.', '')) . NBSP . 'л';
}

function photo_entry(string $slug, string $file): array
{
    return [
        'src'   => "img/cars/$slug/$file.jpg",
        'thumb' => "img/cars/$slug/t/$file.jpg",
        'tg'    => $file,
    ];
}

function car_to_site(array $car, array $photos): array
{
    $specs = [];
    if ($car['volume_l'] !== null) $specs[] = ['Объём', fmt_volume((float)$car['volume_l'])];
    if ($car['fuel'] !== null)     $specs[] = ['Топливо', $car['fuel']];
    if ($car['power_hp'] !== null) $specs[] = ['Мощность', $car['power_hp'] . NBSP . 'л.с.'];

    $engine = implode(', ', array_filter([
        $car['fuel'],
        $car['power_hp'] !== null ? $car['power_hp'] . NBSP . 'л.с.' : null,
    ]));

    $side = $photos[0];
    foreach ($photos as $p) if ((int)$p['id'] === (int)$car['side_photo_id']) $side = $p;

    return [
        'slug'         => $car['slug'],
        'tg_post'      => $car['tg_post'] !== null ? (int)$car['tg_post'] : null,
        'title'        => $car['title'],
        'make'         => $car['make'],
        'year'         => (int)$car['year'],
        'mileage_km'   => (int)$car['mileage_km'],
        'price_rub'    => (int)$car['price_rub'],
        'engine_short' => $engine,
        'fuel'         => $car['fuel'],
        'specs_extra'  => $specs,
        'side'         => photo_entry($car['slug'], $side['file']),
        'photos'       => array_map(fn($p) => photo_entry($car['slug'], $p['file']), $photos),
    ];
}

function published_cars_for_site(): array
{
    $pdo = db();
    $cars = $pdo->query("SELECT * FROM cars WHERE status = 'published' ORDER BY price_rub DESC")->fetchAll();
    $ph = $pdo->prepare("SELECT * FROM photos WHERE car_id = ? AND kind = 'ext' ORDER BY pos");
    $out = [];
    foreach ($cars as $car) {
        $ph->execute([$car['id']]);
        $photos = $ph->fetchAll();
        if (!$photos) continue;
        $out[] = car_to_site($car, $photos);
    }
    return $out;
}

// Parse the site shape back into columns (used by the one-off import).
function site_to_columns(array $c): array
{
    $spec = [];
    foreach ($c['specs_extra'] as [$k, $v]) $spec[$k] = $v;
    return [
        'slug'       => $c['slug'],
        'make'       => $c['make'],
        'title'      => $c['title'],
        'year'       => $c['year'],
        'mileage_km' => $c['mileage_km'],
        'price_rub'  => $c['price_rub'],
        'volume_l'   => isset($spec['Объём']) ? (float)str_replace(',', '.', $spec['Объём']) : null,
        'fuel'       => $spec['Топливо'] ?? $c['fuel'] ?? null,
        'power_hp'   => isset($spec['Мощность']) ? (int)$spec['Мощность'] : null,
        'tg_post'    => $c['tg_post'] ?? null,
    ];
}
