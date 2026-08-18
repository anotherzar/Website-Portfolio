<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$action = $_GET['action'] ?? '';

// Actions that require admin login
$adminActions = ['get_participants', 'toggle_status', 'delete_participant', 'reset_database'];
if (in_array($action, $adminActions) && (!isset($_SESSION['admin_id']))) {
    echo json_encode(['error' => 'Unauthorized. Please login first.']);
    exit;
}

// GET REQUESTS
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_participants') {
        $sql = "SELECT t.reg_id as regID, p.nama, p.email, p.no_hp as hp, p.instansi, k.nama_kegiatan as description, k.harga as price, t.status_pembayaran as status, t.metode_pembayaran as metode, t.tanggal_pembayaran as date, k.id_kegiatan
                FROM transaksi_pembayaran t
                JOIN peserta p ON t.id_peserta = p.id_peserta
                JOIN kegiatan k ON t.id_kegiatan = k.id_kegiatan
                ORDER BY t.id_transaksi ASC";
        
        $result = $conn->query($sql);
        $participants = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $id_keg = (int)$row['id_kegiatan'];
                $kategori = 'Seminar';
                if ($id_keg >= 1 && $id_keg <= 5) {
                    $kategori = 'Lomba (Individu)';
                } else if ($id_keg === 6 || $id_keg === 7) {
                    $kategori = 'Lomba (Tim)';
                }
                
                // Format date
                $formattedDate = $row['date'] ? date('d M Y, H:i', strtotime($row['date'])) : '';
                
                // Map status values to match front-end expectations
                $status = $row['status'];
                $metode = $row['metode'] ?? '';
                $price = (int)$row['price'];

                // Detect KIP-K / Gratis entries by status, metode, or price
                if (stripos($status, 'kip-k') !== false || stripos($status, 'gratis') !== false 
                    || stripos($metode, 'Gratis') !== false || stripos($metode, 'KIP-K') !== false
                    || $price === 0) {
                    $status = 'KIP-K (Gratis)';
                } else if (strtolower($status) === 'settlement') {
                    $status = 'Settlement';
                } else if (strtolower($status) === 'pending') {
                    $status = 'Pending';
                }

                $participants[] = [
                    'regID' => $row['regID'],
                    'nama' => $row['nama'],
                    'email' => $row['email'],
                    'hp' => $row['hp'],
                    'instansi' => $row['instansi'] ?? '',
                    'kategori' => $kategori,
                    'desc' => $row['description'],
                    'price' => $price,
                    'status' => $status,
                    'date' => $formattedDate
                ];
            }
        }
        echo json_encode($participants);
        exit;
    }
} 
// POST REQUESTS
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'save_registration') {
        $regID = $input['regID'] ?? '';
        $nama = $input['nama'] ?? '';
        $email = $input['email'] ?? '';
        $hp = $input['hp'] ?? '';
        $instansi = $input['instansi'] ?? '';
        $kategori = $input['kategori'] ?? '';
        $desc = $input['desc'] ?? '';
        $price = (int)($input['price'] ?? 0);
        $status = $input['status'] ?? 'Settlement';
        
        if (empty($nama) || empty($email) || empty($regID)) {
            echo json_encode(['success' => false, 'error' => 'Data input tidak lengkap']);
            exit;
        }
        
        // Find or create participant
        $stmt = $conn->prepare("SELECT id_peserta FROM peserta WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();
        $id_peserta = null;
        
        if ($res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $id_peserta = $row['id_peserta'];
            // Update details
            $update_stmt = $conn->prepare("UPDATE peserta SET nama = ?, no_hp = ?, instansi = ? WHERE id_peserta = ?");
            $update_stmt->bind_param("sssi", $nama, $hp, $instansi, $id_peserta);
            $update_stmt->execute();
            $update_stmt->close();
        } else {
            $date_now = date('Y-m-d');
            $insert_stmt = $conn->prepare("INSERT INTO peserta (nama, email, no_hp, instansi, tanggal_daftar) VALUES (?, ?, ?, ?, ?)");
            $insert_stmt->bind_param("sssss", $nama, $email, $hp, $instansi, $date_now);
            $insert_stmt->execute();
            $id_peserta = $insert_stmt->insert_id;
            $insert_stmt->close();
        }
        $stmt->close();
        
        // Find id_kegiatan
        $id_kegiatan = 8; // fallback to KIPK seminar
        if (stripos($desc, 'Storytelling') !== false) $id_kegiatan = 1;
        else if (stripos($desc, 'Puisi') !== false) $id_kegiatan = 2;
        else if (stripos($desc, 'Esai') !== false) $id_kegiatan = 3;
        else if (stripos($desc, 'Poster') !== false) $id_kegiatan = 4;
        else if (stripos($desc, 'Daur Ulang') !== false) $id_kegiatan = 5;
        else if (stripos($desc, 'Mobile Legends') !== false) $id_kegiatan = 6;
        else if (stripos($desc, 'Soccer') !== false) $id_kegiatan = 7;
        else if (stripos($desc, 'Umum') !== false || stripos($desc, 'Non KIPK') !== false) $id_kegiatan = 9;
        
        // Save transaction
        $date_time_now = date('Y-m-d H:i:s');
        $db_status = 'settlement';
        if (stripos($status, 'kip-k') !== false || $price === 0) {
            $db_status = 'KIP-K (Gratis)';
        } else if (strtolower($status) === 'pending') {
            $db_status = 'pending';
        }

        $method = ($price === 0) ? 'Gratis (KIP-K)' : 'QRIS';
        $stmt = $conn->prepare("INSERT INTO transaksi_pembayaran (reg_id, id_peserta, id_kegiatan, metode_pembayaran, status_pembayaran, tanggal_pembayaran, total_bayar) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("siisssd", $regID, $id_peserta, $id_kegiatan, $method, $db_status, $date_time_now, $price);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
        exit;
    }
    
    if ($action === 'toggle_status') {
        $regID = $input['regID'] ?? '';
        if (empty($regID)) {
            echo json_encode(['success' => false, 'error' => 'regID required']);
            exit;
        }
        
        $stmt = $conn->prepare("SELECT status_pembayaran FROM transaksi_pembayaran WHERE reg_id = ?");
        $stmt->bind_param("s", $regID);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $current = $row['status_pembayaran'];
            $new_status = ($current === 'settlement') ? 'KIP-K (Gratis)' : 'settlement';
            
            $update_stmt = $conn->prepare("UPDATE transaksi_pembayaran SET status_pembayaran = ? WHERE reg_id = ?");
            $update_stmt->bind_param("ss", $new_status, $regID);
            $update_stmt->execute();
            $update_stmt->close();
            
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Transaction not found']);
        }
        $stmt->close();
        exit;
    }
    
    if ($action === 'delete_participant') {
        $regID = $input['regID'] ?? '';
        if (empty($regID)) {
            echo json_encode(['success' => false, 'error' => 'regID required']);
            exit;
        }
        
        // Get id_peserta before deleting the transaction
        $stmt = $conn->prepare("SELECT id_peserta FROM transaksi_pembayaran WHERE reg_id = ?");
        $stmt->bind_param("s", $regID);
        $stmt->execute();
        $res = $stmt->get_result();
        $id_peserta = null;
        if ($res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $id_peserta = $row['id_peserta'];
        }
        $stmt->close();
        
        // Delete the transaction
        $stmt = $conn->prepare("DELETE FROM transaksi_pembayaran WHERE reg_id = ?");
        $stmt->bind_param("s", $regID);
        $stmt->execute();
        $stmt->close();
        
        // Delete the peserta if no other transactions reference them
        if ($id_peserta) {
            $check = $conn->prepare("SELECT COUNT(*) as cnt FROM transaksi_pembayaran WHERE id_peserta = ?");
            $check->bind_param("i", $id_peserta);
            $check->execute();
            $count_res = $check->get_result()->fetch_assoc();
            $check->close();
            
            if ((int)$count_res['cnt'] === 0) {
                $del = $conn->prepare("DELETE FROM peserta WHERE id_peserta = ?");
                $del->bind_param("i", $id_peserta);
                $del->execute();
                $del->close();
            }
        }
        
        echo json_encode(['success' => true]);
        exit;
    }
    
    if ($action === 'reset_database') {
        $conn->query("SET FOREIGN_KEY_CHECKS = 0");
        $conn->query("TRUNCATE TABLE transaksi_pembayaran");
        $conn->query("TRUNCATE TABLE peserta");
        $conn->query("SET FOREIGN_KEY_CHECKS = 1");
        
        echo json_encode(['success' => true]);
        exit;
    }
}

echo json_encode(['error' => 'Invalid action']);
exit;
