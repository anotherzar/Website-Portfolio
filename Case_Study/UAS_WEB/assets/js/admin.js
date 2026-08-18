/* ADMIN DASHBOARD FUNCTIONALITY - MYSQL API INTEGRATED */

document.addEventListener('DOMContentLoaded', function() {
  let currentDB = [];

  // Fetch Database from MySQL via API
  function fetchDatabase() {
    fetch('php/api.php?action=get_participants')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          currentDB = data;
        } else {
          currentDB = [];
        }
        renderTable();
      })
      .catch(err => {
        console.error('Error fetching database:', err);
        currentDB = [];
        renderTable();
      });
  }

  // Populate Table
  function renderTable() {
    const tbody = document.getElementById('participantTableBody');
    const emptyMsg = document.getElementById('emptyTableMessage');
    tbody.innerHTML = '';

    const searchQuery = document.getElementById('searchFilter').value.toLowerCase();
    const kategoriVal = document.getElementById('kategoriFilter').value;
    const statusVal = document.getElementById('statusFilter').value;

    let filtered = currentDB.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchQuery) ||
                          item.email.toLowerCase().includes(searchQuery) ||
                          (item.instansi && item.instansi.toLowerCase().includes(searchQuery)) ||
                          item.regID.toLowerCase().includes(searchQuery);
      
      const matchKategori = (kategoriVal === 'ALL') || (item.kategori === kategoriVal);
      const matchStatus = (statusVal === 'ALL') || (item.status === statusVal);

      return matchSearch && matchKategori && matchStatus;
    });

    // Counter label
    document.getElementById('tableRowCounter').textContent = `Menampilkan ${filtered.length} dari ${currentDB.length} data`;

    if (filtered.length === 0) {
      emptyMsg.classList.remove('d-none');
      return;
    }
    emptyMsg.classList.add('d-none');

    // Display rows (newest first)
    [...filtered].reverse().forEach(item => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';

      let statusBadge = '';
      if (item.status === 'Settlement') {
        statusBadge = `<span class="badge badge-settlement">Settlement</span>`;
      } else if (item.status === 'KIP-K (Gratis)') {
        statusBadge = `<span class="badge badge-free">KIP-K / Gratis</span>`;
      } else {
        statusBadge = `<span class="badge badge-pending">${item.status}</span>`;
      }

      tr.innerHTML = `
        <td>
          <div class="text-white font-semibold">${item.regID}</div>
          <div style="font-size: 0.68rem; color: rgba(255,255,255,0.4); margin-top: 0.2rem;">${item.date}</div>
        </td>
        <td>
          <div class="text-white" style="font-weight:600;">${item.nama}</div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${item.email}</div>
          <div style="font-size: 0.75rem; color: var(--color-biru-muda);">${item.hp}</div>
        </td>
        <td>
          <div class="text-white-50">${item.instansi || ''}</div>
        </td>
        <td>
          <div class="badge bg-secondary mb-1" style="font-size: 0.65rem; color: #fff;">${item.kategori}</div>
          <div class="text-white" style="font-size: 0.8rem; font-weight: 500;">${item.desc}</div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">Biaya: Rp ${(item.price || 0).toLocaleString('id-ID')}</div>
        </td>
        <td>
          ${statusBadge}
        </td>
        <td>
          <div class="d-flex gap-2 align-items-center">
            <button class="action-btn action-btn-toggle" onclick="toggleStatus('${item.regID}')" title="Ubah Status Pembayaran">
              <i class="ri-swap-line"></i>
            </button>
            <button class="action-btn action-btn-delete" onclick="deletePeserta('${item.regID}')" title="Hapus Peserta">
              <i class="ri-delete-bin-6-line"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Filter events
  document.getElementById('searchFilter').addEventListener('input', renderTable);
  document.getElementById('kategoriFilter').addEventListener('change', renderTable);
  document.getElementById('statusFilter').addEventListener('change', renderTable);

  // Manual Modal Categories Dropdown logic
  const manualKategori = document.getElementById('manualKategori');
  const manualPilihan = document.getElementById('manualPilihan');
  const manualPrice = document.getElementById('manualPrice');
  const manualStatus = document.getElementById('manualStatus');

  const optionsMap = {
    'Lomba (Individu)': [
      { name: 'Storytelling (Rp 15.000)', price: 15000, desc: 'Lomba Storytelling (Batch 2)' },
      { name: 'Cipta & Baca Puisi (Rp 15.000)', price: 15000, desc: 'Lomba Cipta & Baca Puisi (Batch 2)' },
      { name: 'Penulisan Esai (Rp 15.000)', price: 15000, desc: 'Lomba Penulisan Esai (Batch 2)' },
      { name: 'Desain Poster Digital (Rp 15.000)', price: 15000, desc: 'Lomba Desain Poster Digital (Batch 2)' },
      { name: 'Karya Daur Ulang (Rp 15.000)', price: 15000, desc: 'Lomba Karya Daur Ulang (Batch 2)' }
    ],
    'Lomba (Tim)': [
      { name: 'Mobile Legends (Rp 25.000)', price: 25000, desc: 'Lomba Mobile Legends (Batch 2)' },
      { name: 'Mini Soccer (Rp 50.000)', price: 50000, desc: 'Lomba Mini Soccer (Batch 2)' }
    ],
    'Seminar': [
      { name: 'Penerima KIP-K (GRATIS)', price: 0, desc: 'Seminar Kak Ryu - KIPK PNJ' },
      { name: 'Umum / Non KIP-K (Rp 5.000)', price: 5000, desc: 'Seminar Kak Ryu - Non KIPK / Umum' }
    ]
  };

  function updateManualPilihan() {
    const cat = manualKategori.value;
    const opts = optionsMap[cat];
    manualPilihan.innerHTML = '';
    
    opts.forEach((item, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = item.name;
      manualPilihan.appendChild(option);
    });

    // Set default price
    manualPrice.value = opts[0].price;
    if (opts[0].price === 0) {
      manualStatus.value = 'KIP-K (Gratis)';
    } else {
      manualStatus.value = 'Settlement';
    }
  }

  manualKategori.addEventListener('change', updateManualPilihan);
  manualPilihan.addEventListener('change', function() {
    const cat = manualKategori.value;
    const idx = parseInt(this.value);
    const item = optionsMap[cat][idx];
    manualPrice.value = item.price;
    if (item.price === 0) {
      manualStatus.value = 'KIP-K (Gratis)';
    } else {
      manualStatus.value = 'Settlement';
    }
  });

  // Submit manual reg form
  document.getElementById('manualRegForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nama = document.getElementById('manualNama').value;
    const email = document.getElementById('manualEmail').value;
    const hp = document.getElementById('manualHP').value;
    const instansi = document.getElementById('manualInstansi').value;
    const kategori = manualKategori.value;
    
    const optIdx = parseInt(manualPilihan.value);
    const selectedOpt = optionsMap[kategori][optIdx];

    const price = parseInt(manualPrice.value);
    const status = manualStatus.value;

    const regID = 'REG-KIPKFEST-' + Math.floor(10000 + Math.random() * 90000);

    fetch('php/api.php?action=save_registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        regID,
        nama,
        email,
        hp,
        instansi,
        kategori,
        desc: selectedOpt.desc,
        price,
        status
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Reset and hide modal
        document.getElementById('manualRegForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('manualRegModal')).hide();

        // Reload data
        fetchDatabase();
      } else {
        alert('Gagal menambahkan peserta: ' + (data.error || 'Kesalahan Server'));
      }
    })
    .catch(err => {
      console.error('Error saving manual participant:', err);
      alert('Terjadi kesalahan koneksi server.');
    });
  });

  // Global actions on window
  window.toggleStatus = function(regID) {
    fetch('php/api.php?action=toggle_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ regID })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        fetchDatabase();
      } else {
        alert('Gagal mengubah status: ' + (data.error || 'Kesalahan Server'));
      }
    })
    .catch(err => console.error('Error toggling status:', err));
  };

  window.deletePeserta = function(regID) {
    if (confirm(`Apakah Anda yakin ingin menghapus peserta dengan ID ${regID}?`)) {
      fetch('php/api.php?action=delete_participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ regID })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchDatabase();
        } else {
          alert('Gagal menghapus peserta: ' + (data.error || 'Kesalahan Server'));
        }
      })
      .catch(err => console.error('Error deleting participant:', err));
    }
  };

  window.confirmResetDB = function() {
    if (confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH database registrasi? Tindakan ini tidak dapat dibatalkan.")) {
      fetch('php/api.php?action=reset_database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchDatabase();
        } else {
          alert('Gagal melakukan reset database: ' + (data.error || 'Kesalahan Server'));
        }
      })
      .catch(err => console.error('Error resetting database:', err));
    }
  };

  // Init load
  updateManualPilihan();
  fetchDatabase();
});
