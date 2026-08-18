<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read JSON input from AJAX request
$input = json_decode(file_get_contents('php://input'), true);

$nama = $input['nama'] ?? '';
$email = $input['email'] ?? '';
$hp = $input['hp'] ?? '';
$instansi = $input['instansi'] ?? '';
$kategori = $input['kategori'] ?? '';
$desc = $input['desc'] ?? '';
$price = (int)($input['price'] ?? 0);

if (empty($nama) || empty($email) || $price <= 0) {
    echo json_encode(['error' => 'Data input tidak lengkap']);
    exit;
}

$xendit_secret_key = 'xnd_development_j6I9mUpOt2Ne8vjvHzm9XPaI7iuVlcPiKBX6xdu56PiSwSeVoVGmd5Pd6xZhWU'; 

// Generate unique registration ID and external ID
$regID = 'REG-KIPKFEST-' . rand(10000, 90000);

// Set redirect URLs after payment is completed
$baseUrl = "http://localhost/UAS_WEB/daftar.html";
$successUrl = $baseUrl . "?" . http_build_query([
    'status' => 'success',
    'regID' => $regID,
    'nama' => $nama,
    'email' => $email,
    'hp' => $hp,
    'instansi' => $instansi,
    'kategori' => $kategori,
    'desc' => $desc,
    'price' => $price
]);
$failureUrl = $baseUrl . "?status=failed";

// Prepare payload for Xendit API
$payload = [
    'external_id' => $regID,
    'amount' => $price,
    'description' => 'Pendaftaran ' . $desc . ' - KIPK Festival 2026',
    'invoice_duration' => 86400, // 24 hours
    'customer' => [
        'given_names' => $nama,
        'email' => $email,
        'mobile_number' => $hp
    ],
    'payment_methods' => ['QRIS'],
    'success_redirect_url' => $successUrl,
    'failure_redirect_url' => $failureUrl
];

// Execute cURL request to Xendit Invoice API
$ch = curl_init('https://api.xendit.co/v2/invoices');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($xendit_secret_key . ':')
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code >= 200 && $http_code < 300) {
    $result = json_decode($response, true);
    // Send back invoice_url
    echo json_encode([
        'success' => true,
        'invoice_url' => $result['invoice_url']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Gagal menghubungi server Xendit',
        'details' => json_decode($response, true)
    ]);
}
