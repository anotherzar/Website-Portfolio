<?php
// config/database.php - Centralized Database Connection Configuration

$host = 'localhost';
$user = 'root';
$pass = '';
$db_name = 'uas_web';

// Initialize MySQLi connection
$conn = new mysqli($host, $user, $pass, $db_name);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}
