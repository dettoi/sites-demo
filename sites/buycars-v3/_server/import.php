<?php
// CLI, one-off: php ~/buycars/import.php ~/buycars/site/data/cars.json
// Loads the current site cars into SQLite as published. Skips slugs that already exist.
if (PHP_SAPI !== 'cli') exit;
require __DIR__ . '/lib/cars.php';

$src = json_decode(file_get_contents($argv[1]), true, 512, JSON_THROW_ON_ERROR);
$pdo = db();
$cfg = require __DIR__ . '/config.php';

$pdo->prepare("INSERT OR IGNORE INTO users(tg_id, name, role) VALUES (?, 'Владелец', 'owner')")
    ->execute([$cfg['owner_id']]);

$insCar = $pdo->prepare('INSERT INTO cars (slug, status, make, title, year, mileage_km, price_rub, volume_l, fuel, power_hp, tg_post, published_at)
    VALUES (:slug, \'published\', :make, :title, :year, :mileage_km, :price_rub, :volume_l, :fuel, :power_hp, :tg_post, datetime(\'now\'))');
$insPh = $pdo->prepare('INSERT INTO photos (car_id, pos, file, width, height) VALUES (?, ?, ?, ?, ?)');
$exists = $pdo->prepare('SELECT 1 FROM cars WHERE slug = ?');

$pdo->beginTransaction();
foreach ($src as $c) {
    $exists->execute([$c['slug']]);
    if ($exists->fetchColumn()) { echo "skip {$c['slug']}\n"; continue; }

    $insCar->execute(site_to_columns($c));
    $carId = (int)$pdo->lastInsertId();
    $sideId = null;
    foreach ($c['photos'] as $i => $p) {
        $size = @getimagesize(media_dir() . "/{$c['slug']}/{$p['tg']}.jpg") ?: [null, null];
        $insPh->execute([$carId, $i, $p['tg'], $size[0], $size[1]]);
        if ($p['tg'] === $c['side']['tg']) $sideId = (int)$pdo->lastInsertId();
    }
    $pdo->prepare('UPDATE cars SET side_photo_id = ? WHERE id = ?')->execute([$sideId, $carId]);
    echo "ok {$c['slug']}: " . count($c['photos']) . " photos\n";
}
$pdo->commit();
mark_dirty();
