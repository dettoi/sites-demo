<?php
// CLI: php ~/buycars/export.php [out.json]
// Writes published cars in the shape _build/build.mjs expects (default: ~/buycars/site/data/cars.json).
if (PHP_SAPI !== 'cli') exit;
require __DIR__ . '/lib/cars.php';

$out = $argv[1] ?? BUYCARS_HOME . '/site/data/cars.json';
$json = json_encode(published_cars_for_site(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
file_put_contents($out . '.tmp', $json . "\n");
rename($out . '.tmp', $out);
echo 'exported ', count(json_decode($json)), " cars to $out\n";
