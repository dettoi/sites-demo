<?php
// Thin Telegram Bot API client.

function cfg(): array
{
    static $cfg = null;
    return $cfg ??= require __DIR__ . '/../config.php';
}

function tg(string $method, array $params = []): ?array
{
    foreach ($params as $k => $v) if (is_array($v)) $params[$k] = json_encode($v, JSON_UNESCAPED_UNICODE);
    $ch = curl_init('https://api.telegram.org/bot' . cfg()['bot_token'] . '/' . $method);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $params,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    $res = json_decode((string)curl_exec($ch), true);
    if (!($res['ok'] ?? false)) {
        error_log('tg ' . $method . ': ' . json_encode($res, JSON_UNESCAPED_UNICODE));
        return null;
    }
    return $res['result'];
}

function say(int $chat, string $text, ?array $buttons = null): ?array
{
    $p = ['chat_id' => $chat, 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true'];
    if ($buttons !== null) $p['reply_markup'] = ['inline_keyboard' => $buttons];
    return tg('sendMessage', $p);
}

function edit(int $chat, int $msgId, string $text, ?array $buttons = null): void
{
    $p = ['chat_id' => $chat, 'message_id' => $msgId, 'text' => $text, 'parse_mode' => 'HTML'];
    $p['reply_markup'] = ['inline_keyboard' => $buttons ?? []];
    tg('editMessageText', $p);
}

function btn(string $text, string $data): array
{
    return ['text' => $text, 'callback_data' => $data];
}

// Downloads a Telegram file to $dest; returns false on failure.
function tg_download(string $fileId, string $dest): bool
{
    $f = tg('getFile', ['file_id' => $fileId]);
    if (!$f || empty($f['file_path'])) return false;
    $data = @file_get_contents('https://api.telegram.org/file/bot' . cfg()['bot_token'] . '/' . $f['file_path']);
    return $data !== false && file_put_contents($dest, $data) !== false;
}

function h(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES);
}
