<?php
// Telegram webhook. Code and secrets live in ~/buycars, outside the web root.
$home = dirname(__DIR__, 2) . '/buycars';
require $home . '/lib/bot.php';

$secret = (string)cfg()['webhook_secret'];
if ($secret === '' || !hash_equals($secret, $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '')) {
    http_response_code(403);
    exit;
}

$update = json_decode(file_get_contents('php://input'), true);
if (!is_array($update)) exit;

try {
    $after = handle_update($update);
} catch (Throwable $e) {
    error_log('bot: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    $after = null;
}

if ($after) {
    // answer Telegram now, then wait out the album in the background (mod_php has no fastcgi_finish_request)
    ignore_user_abort(true);
    set_time_limit(60);
    header('Connection: close');
    header('Content-Length: 0');
    http_response_code(200);
    while (ob_get_level()) ob_end_flush();
    flush();
    try {
        $after();
    } catch (Throwable $e) {
        error_log('bot after: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    }
}
