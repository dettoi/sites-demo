<?php
// Заявка с сайта -> письмо владельцу. Перед выкладкой впишите почту.
const TO = 'ПОЧТА_ВЛАДЕЛЬЦА@example.ru';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !empty($_POST['website']) || empty($_POST['agree'])) {
  header('Location: index.html'); exit;
}
$name  = mb_substr(trim(strip_tags($_POST['name'] ?? '')), 0, 100);
$phone = mb_substr(preg_replace('/[^\d+\-() ]/', '', $_POST['phone'] ?? ''), 0, 30);
$msg   = mb_substr(trim(strip_tags($_POST['message'] ?? '')), 0, 2000);
if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 10) {
  header('Location: index.html#callback'); exit;
}
$body = "Имя: $name\nТелефон: $phone\n\n$msg\n\nСогласие на обработку ПД: да, " . date('d.m.Y H:i');
mail(TO, '=?UTF-8?B?' . base64_encode('Заявка с сайта Дон61Авто') . '?=', $body,
  "Content-Type: text/plain; charset=UTF-8\r\nFrom: site@" . $_SERVER['SERVER_NAME']);
header('Location: thanks.html'); exit;
