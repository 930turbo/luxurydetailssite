<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize fields
    $name    = strip_tags(trim($_POST["name"]));
    $email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $phone   = strip_tags(trim($_POST["phone"]));
    $subject = strip_tags(trim($_POST["subject"]));
    $service = strip_tags(trim($_POST["service"]));
    $message = strip_tags(trim($_POST["message"]));

    // Where the form sends
    $to = "luxurydetails@comcast.net";
    $email_subject = "Luxury Details — New Consultation: $subject";

    // Email body
    $body = "You have a new consultation request:\n\n"
          . "Name: $name\n"
          . "Email: $email\n"
          . "Phone: $phone\n"
          . "Subject: $subject\n"
          . "Service Interest: $service\n\n"
          . "Message:\n$message\n";

    // Headers
    $headers = "From: Luxury Details Website <no-reply@luxurydetails.com>\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Attempt send
    if (mail($to, $email_subject, $body, $headers)) {
        header("Location: /pages/thank-you.html"); // success redirect
        exit;
    } else {
        echo "Sorry, something went wrong. Please try again.";
    }
} else {
    http_response_code(403);
    echo "Forbidden.";
}
