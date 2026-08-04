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

// PHPMailer laden
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

$mail = new PHPMailer(true);

try {
    // SMTP-Einstellungen
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'noreply@saakyan.ai';
    $mail->Password   = 'fhhj&3&V-B$2ZA8';  // <-- hier dein Passwort eintragen
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // Absender und Empfänger
    $mail->setFrom('noreply@saakyan.ai', 'saakyan.ai Kontaktformular');
    $mail->addAddress('hello@saakyan.ai', 'Anna Saakyan');
    $mail->addReplyTo($email, $name);

    // Inhalt
    $mail->Subject = 'Neue Kontaktanfrage von ' . $name;
    $mail->Body    = "Name: $name\nE-Mail: $email\n\nNachricht:\n$message";

    $mail->send();
    header('Location: /?sent=1');

} catch (Exception $e) {
    http_response_code(500);
    exit('Fehler beim Senden: ' . $mail->ErrorInfo);
}
?>
