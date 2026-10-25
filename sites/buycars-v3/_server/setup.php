<?php
// CLI only: php ~/buycars/setup.php https://<host>/bot/hook.php
// Generates webhook_secret if empty, registers the webhook. Prints no secrets.
if (PHP_SAPI !== 'cli') exit;

$path = getenv('HOME') . '/buycars/config.php';
$cfg = require $path;
if ($cfg['bot_token'] === '') exit("bot_token is empty in config.php\n");

if ($cfg['webhook_secret'] === '') {
    $secret = bin2hex(random_bytes(24));
    $src = preg_replace("/'webhook_secret'\s*=>\s*''/", "'webhook_secret' => '$secret'", file_get_contents($path));
    file_put_contents($path, $src);
    $cfg['webhook_secret'] = $secret;
    echo "webhook_secret generated\n";
}

$api = 'https://api.telegram.org/bot' . $cfg['bot_token'];
$ch = curl_init("$api/setWebhook");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => [
        'url' => $argv[1],
        'secret_token' => $cfg['webhook_secret'],
        'allowed_updates' => json_encode(['message', 'callback_query']),
    ],
    CURLOPT_RETURNTRANSFER => true,
]);
echo 'setWebhook: ', curl_exec($ch), "\n";

$me = json_decode(file_get_contents("$api/getMe"), true);
echo 'bot: @', $me['result']['username'] ?? '?', "\n";
