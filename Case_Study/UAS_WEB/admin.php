<?php
require_once __DIR__ . '/php/auth.php';
requireLogin();

$adminNama = getAdminName();
$adminLevel = getAdminLevel();
?>
<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Admin - KIP Kuliah Festival 2026 | Formadiksi PNJ</title>

  <!-- Favicon (Emoji 🛠️) -->
  <link rel="icon"
    href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛠️</text></svg>">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet">

  <!-- CSS Libraries -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/bootstrap-custom.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/animation.css">
  <link rel="stylesheet" href="assets/css/responsive.css">
  <link rel="stylesheet" href="assets/css/admin.css">
</head>

<body>

  <!-- ADMIN NAVBAR -->
  <nav class="navbar navbar-expand-lg fixed-top"
    style="background: rgba(5, 12, 18, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 1rem 0; z-index: 1030;">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="index.html"
        style="font-family: var(--font-display); font-weight: 700; color: #fff; text-decoration: none;">
        <span>🎪 KIPK FESTIVAL</span>
        <span class="badge bg-primary"
          style="font-size: 0.62rem; font-weight: 600; letter-spacing: 0.05em; padding: 0.35em 0.65em;">ADMIN
          PANEL</span>
      </a>
      <div class="ms-auto d-flex align-items-center gap-3">
        <!-- Admin info -->
        <div class="d-none d-md-flex align-items-center gap-2" style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
          <i class="ri-shield-user-line" style="color: var(--color-biru-muda);"></i>
          <span><?= htmlspecialchars($adminNama) ?></span>
          <span class="badge" style="background: rgba(6,214,160,0.15); color: #06d6a0; font-size: 0.6rem; font-weight: 600; padding: 0.3em 0.6em; border-radius: 4px; text-transform: uppercase;">
            <?= htmlspecialchars($adminLevel) ?>
          </span>
        </div>
        <a href="php/logout.php" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" title="Logout" onclick="return confirm('Yakin ingin keluar?');">
          <i class="ri-logout-box-r-line"></i> Logout
        </a>
      </div>
    </div>
  </nav>

  <main class="admin-wrapper">
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>

    <div class="container" style="position: relative; z-index: 5;">

      <!-- HEADER TITLE -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 style="font-family: var(--font-display); font-weight: 700; font-size: 2rem; margin: 0;">Dashboard
            Pengelolaan Peserta</h1>
          <p class="mb-0" style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">Pantau pendaftaran kompetisi dan
            tiket seminar secara real-time.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-danger admin-btn py-2 px-3" onclick="confirmResetDB()">
            <i class="ri-delete-bin-line me-1"></i> Reset Database
          </button>
          <button class="btn btn-primary btn-shine admin-btn py-2 px-3" data-bs-toggle="modal"
            data-bs-target="#manualRegModal">
            <i class="ri-user-add-line me-1"></i> Tambah Manual
          </button>
        </div>
      </div>


      <!-- FILTER PANEL -->
      <div class="glass-card mb-4">
        <div class="row g-3">
          <!-- Search box -->
          <div class="col-md-4">
            <label class="form-label text-muted mb-1" style="font-size: 0.75rem;">Cari Peserta</label>
            <div class="input-group">
              <span class="input-group-text"
                style="background: rgba(9, 24, 37, 0.6); border: 1px solid rgba(100, 173, 224, 0.15); border-right: none; color: rgba(255,255,255,0.4);"><i
                  class="ri-search-line"></i></span>
              <input type="text" id="searchFilter" class="form-control custom-input" style="border-left: none;"
                placeholder="Cari nama, email, instansi, atau ID...">
            </div>
          </div>
          <!-- Filter Kategori -->
          <div class="col-md-4">
            <label class="form-label text-muted mb-1" style="font-size: 0.75rem;">Kategori Acara</label>
            <select id="kategoriFilter" class="form-select custom-input">
              <option value="ALL">Semua Kategori</option>
              <option value="Lomba (Individu)">Lomba (Individu)</option>
              <option value="Lomba (Tim)">Lomba (Tim)</option>
              <option value="Seminar">Seminar</option>
            </select>
          </div>
          <!-- Filter Status -->
          <div class="col-md-4">
            <label class="form-label text-muted mb-1" style="font-size: 0.75rem;">Status Pembayaran</label>
            <select id="statusFilter" class="form-select custom-input">
              <option value="ALL">Semua Status</option>
              <option value="Settlement">Settlement</option>
              <option value="KIP-K (Gratis)">KIP-K (Gratis)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- PARTICIPANT TABLE -->
      <div class="glass-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 style="font-family: var(--font-display); font-weight: 700; margin: 0; font-size: 1.15rem;">Daftar Peserta
            Terdaftar</h4>
          <span class="badge badge-primary" id="tableRowCounter"
            style="font-size: 0.75rem; font-weight: 600;">Menampilkan 0 data</span>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 17%">ID Pendaftaran</th>
                <th style="width: 20%">Data Diri</th>
                <th style="width: 18%">Instansi / Sekolah</th>
                <th style="width: 20%">Acara & Detail</th>
                <th style="width: 13%">Status</th>
                <th style="width: 12%">Aksi</th>
              </tr>
            </thead>
            <tbody id="participantTableBody">
              <!-- Dynamically populated rows -->
            </tbody>
          </table>

          <div id="emptyTableMessage" class="text-center py-5 d-none">
            <i class="ri-database-2-line text-muted mb-3" style="font-size: 3.5rem; display: block; opacity: 0.4;"></i>
            <h5 class="text-white-50">Database Kosong</h5>
            <p class="text-muted mb-0" style="font-size: 0.85rem;">Tidak ada data peserta yang cocok dengan kriteria
              filter.</p>
          </div>
        </div>
      </div>

    </div>
  </main>

  <!-- MODAL TAMBAH MANUAL -->
  <div class="modal fade" id="manualRegModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modal-content-custom">
        <div class="modal-header border-0 pb-0 px-4 pt-4">
          <h5 class="modal-title" style="font-family: var(--font-display); font-weight: 700;">Tambah Peserta Manual</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body px-4 py-4">
          <form id="manualRegForm">
            <div class="row g-3">
              <div class="col-md-12">
                <label for="manualNama" class="form-label" style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Nama
                  Lengkap</label>
                <input type="text" id="manualNama" class="form-control custom-input" required
                  placeholder="Contoh: Rian Alfian">
              </div>
              <div class="col-md-6">
                <label for="manualEmail" class="form-label"
                  style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Email</label>
                <input type="email" id="manualEmail" class="form-control custom-input" required
                  placeholder="rian@email.com">
              </div>
              <div class="col-md-6">
                <label for="manualHP" class="form-label" style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">No.
                  WhatsApp/HP</label>
                <input type="tel" id="manualHP" class="form-control custom-input" required placeholder="0812xxxxxxxx">
              </div>
              <div class="col-md-12">
                <label for="manualInstansi" class="form-label"
                  style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Instansi / Sekolah</label>
                <input type="text" id="manualInstansi" class="form-control custom-input" required
                  placeholder="Politeknik Negeri Jakarta">
              </div>
              <div class="col-md-6">
                <label for="manualKategori" class="form-label"
                  style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Kategori Acara</label>
                <select id="manualKategori" class="form-select custom-input">
                  <option value="Lomba (Individu)">Lomba (Individu)</option>
                  <option value="Lomba (Tim)">Lomba (Tim)</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="manualPilihan" class="form-label"
                  style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Pilihan Detail</label>
                <select id="manualPilihan" class="form-select custom-input">
                  <!-- Injected via JS -->
                </select>
              </div>
              <div class="col-md-6">
                <label for="manualPrice" class="form-label"
                  style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Biaya Pendaftaran (Rp)</label>
                <input type="number" id="manualPrice" class="form-control custom-input" required value="15000">
              </div>
              <div class="col-md-6">
                <label for="manualStatus" class="form-label"
                  style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">Status</label>
                <select id="manualStatus" class="form-select custom-input">
                  <option value="Settlement">Settlement</option>
                  <option value="KIP-K (Gratis)">KIP-K (Gratis)</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-shine w-100 mt-4 py-2" style="font-weight: 600;">
              Simpan Peserta <i class="ri-save-line ms-1"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- SCRIPTS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="assets/js/admin.js?v=2.1"></script>
</body>

</html>
