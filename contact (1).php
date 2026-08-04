<?php
// Nur POST-Anfragen verarbeiten
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Eingaben bereinigen
$name    = htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8');

// Pflichtfelder prüfen
if (!$name || !$email || !$message) {
    http_response_code(400);
    exit('Bitte alle Felder ausfüllen.');
}

// E-Mail zusammenstellen
$to      = 'hello@saakyan.ai';
$subject = 'Neue Kontaktanfrage von ' . $name;
$body    = "Name: $name\nE-Mail: $email\n\nNachricht:\n$message";
$headers = implode("\r\n", [
    'From: hello@saakyan.ai',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

// Senden
if (mail($to, $subject, $body, $headers)) {
    header('Location: /?sent=1');
} else {
    http_response_code(500);
    exit('Fehler beim Senden. Bitte versuche es später erneut.');
}
?>
