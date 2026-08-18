<?php
require_once __DIR__ . '/php/auth.php';

// If already logged in, redirect to admin
if (isLoggedIn()) {
    header('Location: admin.php');
    exit;
}

// Handle login POST
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        $conn = getDBConnection();
        if ($conn) {
            $stmt = $conn->prepare("SELECT id_admin, username, password, nama_admin, level FROM admin WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $admin = $result->fetch_assoc();
                if (password_verify($password, $admin['password'])) {
                    // Login successful
                    $_SESSION['admin_id'] = $admin['id_admin'];
                    $_SESSION['admin_username'] = $admin['username'];
                    $_SESSION['admin_nama'] = $admin['nama_admin'];
                    $_SESSION['admin_level'] = $admin['level'];
                    
                    header('Location: admin.php');
                    exit;
                } else {
                    $error = 'Password salah. Silakan coba lagi.';
                }
            } else {
                $error = 'Username tidak ditemukan.';
            }
            $stmt->close();
            $conn->close();
        } else {
            $error = 'Gagal terhubung ke database.';
        }
    } else {
        $error = 'Harap isi username dan password.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Admin - KIP Kuliah Festival 2026</title>

  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔐</text></svg>">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">

  <style>
    :root {
      --font-body: 'Inter', sans-serif;
      --font-display: 'Space Grotesk', sans-serif;
      --bg-dark: #060d13;
      --bg-card: rgba(9, 24, 37, 0.7);
      --color-biru-muda: #64ade0;
      --color-biru-tua: #1a6fb5;
      --color-hijau-muda: #06d6a0;
      --radius-lg: 16px;
      --radius-md: 10px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-body);
      background: var(--bg-dark);
      color: #f8f9fc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Animated Background Orbs */
    .bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      pointer-events: none;
      z-index: 0;
    }
    .bg-orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #1a6fb5, transparent);
      top: -150px; left: -100px;
      animation: orbFloat1 12s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #06d6a0, transparent);
      bottom: -100px; right: -80px;
      animation: orbFloat2 14s ease-in-out infinite;
    }
    .bg-orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, #64ade0, transparent);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: orbFloat3 10s ease-in-out infinite;
    }

    @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(60px,40px)} }
    @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,-30px)} }
    @keyframes orbFloat3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }

    /* Login Card */
    .login-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      background: var(--bg-card);
      border: 1px solid rgba(100, 173, 224, 0.12);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
      animation: cardSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
      transform: translateY(30px);
    }

    @keyframes cardSlideIn {
      to { opacity: 1; transform: translateY(0); }
    }

    .login-card .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-card .logo-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .login-card .logo-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }

    .login-card .logo-subtitle {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.45);
    }

    .login-card .badge-admin {
      display: inline-block;
      background: rgba(100, 173, 224, 0.15);
      color: var(--color-biru-muda);
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.3em 0.8em;
      border-radius: 20px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 0.5rem;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.78rem;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      margin-bottom: 0.4rem;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .label-row label {
      margin-bottom: 0;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper i {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.3);
      font-size: 1.1rem;
      transition: color 0.3s;
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.75rem 0.9rem 0.75rem 2.6rem;
      background: rgba(5, 12, 18, 0.6);
      border: 1px solid rgba(100, 173, 224, 0.15);
      border-radius: var(--radius-md);
      color: #f8f9fc;
      font-family: var(--font-body);
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.3s, box-shadow 0.3s;
    }

    .input-wrapper input::placeholder {
      color: rgba(255,255,255,0.3);
    }

    .input-wrapper input:focus {
      border-color: var(--color-biru-muda);
      box-shadow: 0 0 0 3px rgba(100, 173, 224, 0.1);
    }

    .input-wrapper input:focus + i,
    .input-wrapper input:focus ~ i {
      color: var(--color-biru-muda);
    }

    .toggle-password {
      color: rgba(255,255,255,0.35);
      font-size: 0.78rem;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-family: var(--font-body);
      font-weight: 500;
      transition: color 0.3s;
    }

    .toggle-password i {
      font-size: 0.95rem;
    }

    .toggle-password:hover {
      color: var(--color-biru-muda);
    }

    /* Submit button */
    .btn-login {
      width: 100%;
      padding: 0.8rem;
      background: linear-gradient(135deg, var(--color-biru-tua), var(--color-biru-muda));
      border: none;
      border-radius: var(--radius-md);
      color: #fff;
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: transform 0.2s, box-shadow 0.3s;
      position: relative;
      overflow: hidden;
    }

    .btn-login::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      transition: left 0.5s;
    }

    .btn-login:hover::before {
      left: 100%;
    }

    .btn-login:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(26, 111, 181, 0.35);
    }

    .btn-login:active {
      transform: translateY(0);
    }

    /* Error message */
    .error-msg {
      background: rgba(255, 71, 87, 0.1);
      border: 1px solid rgba(255, 71, 87, 0.25);
      color: #ff6b7a;
      font-size: 0.8rem;
      padding: 0.65rem 0.9rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: shakeError 0.4s ease;
    }

    @keyframes shakeError {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }

    /* Footer hint */
    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .login-footer a {
      color: var(--color-biru-muda);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 500;
      transition: color 0.3s;
    }

    .login-footer a:hover {
      color: #fff;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-card {
        margin: 1rem;
        padding: 1.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="bg-orb bg-orb-1"></div>
  <div class="bg-orb bg-orb-2"></div>
  <div class="bg-orb bg-orb-3"></div>

  <div class="login-card">
    <div class="logo-section">
      <span class="logo-icon">🎪</span>
      <div class="logo-title">KIPK Festival 2026</div>
      <div class="logo-subtitle">Panel Administrasi Pendaftaran</div>
      <span class="badge-admin">🔒 Akses Terbatas</span>
    </div>

    <?php if (!empty($error)): ?>
      <div class="error-msg">
        <i class="ri-error-warning-line"></i>
        <?= htmlspecialchars($error) ?>
      </div>
    <?php endif; ?>

    <form method="POST" action="login.php">
      <div class="form-group">
        <label for="username">Username</label>
        <div class="input-wrapper">
          <input type="text" id="username" name="username" placeholder="Masukkan username" 
                 value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" required autofocus>
          <i class="ri-user-3-line"></i>
        </div>
      </div>

      <div class="form-group">
        <div class="label-row">
          <label for="password">Password</label>
          <button type="button" class="toggle-password" onclick="togglePasswordVisibility()">
            <i class="ri-eye-off-line" id="eyeIcon"></i>
            <span id="eyeLabel">Tampilkan</span>
          </button>
        </div>
        <div class="input-wrapper">
          <input type="password" id="password" name="password" placeholder="Masukkan password" required>
          <i class="ri-lock-2-line"></i>
        </div>
      </div>

      <button type="submit" class="btn-login">
        <i class="ri-login-box-line"></i> Masuk ke Dashboard
      </button>
    </form>

    <div class="login-footer">
      <a href="index.html"><i class="ri-arrow-left-line"></i> Kembali ke Halaman Utama</a>
    </div>
  </div>

  <script>
    function togglePasswordVisibility() {
      const pw = document.getElementById('password');
      const icon = document.getElementById('eyeIcon');
      const label = document.getElementById('eyeLabel');
      if (pw.type === 'password') {
        pw.type = 'text';
        icon.className = 'ri-eye-line';
        label.textContent = 'Sembunyikan';
      } else {
        pw.type = 'password';
        icon.className = 'ri-eye-off-line';
        label.textContent = 'Tampilkan';
      }
    }
  </script>
</body>
</html>
