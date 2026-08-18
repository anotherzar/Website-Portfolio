<?php
require_once __DIR__ . '/auth.php';

// Destroy session and redirect to login
$_SESSION = [];
session_destroy();

header('Location: ../login.php');
exit;
