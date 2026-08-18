<?php
session_start();


function getDBConnection() {
    require __DIR__ . '/../config/database.php';
    return $conn;
}

function isLoggedIn() {
    return isset($_SESSION['admin_id']) && isset($_SESSION['admin_username']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function getAdminName() {
    return $_SESSION['admin_nama'] ?? 'Admin';
}

function getAdminLevel() {
    return $_SESSION['admin_level'] ?? 'operator';
}
