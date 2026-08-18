/* REGISTRATION PAGE LOGIC AND XENDIT INTEGRATION */

document.addEventListener('DOMContentLoaded', function() {
  const modalElement = document.getElementById('registerModal');
  const bootstrapModal = new bootstrap.Modal(modalElement);
  
  const labelKategori = document.getElementById('regKategori');
  const selectPilihan = document.getElementById('regPilihan');
  const pilihanLabel = document.getElementById('regPilihanLabel');
  
  let tempRegData = null;
  
  const lombaOptions = [
    { name: 'Storytelling (Rp 15.000)', price: 15000, desc: 'Lomba Storytelling (Batch 2)' },
    { name: 'Cipta & Baca Puisi (Rp 15.000)', price: 15000, desc: 'Lomba Cipta & Baca Puisi (Batch 2)' },
    { name: 'Penulisan Esai (Rp 15.000)', price: 15000, desc: 'Lomba Penulisan Esai (Batch 2)' },
    { name: 'Desain Poster Digital (Rp 15.000)', price: 15000, desc: 'Lomba Desain Poster Digital (Batch 2)' },
    { name: 'Karya Daur Ulang (Rp 15.000)', price: 15000, desc: 'Lomba Karya Daur Ulang (Batch 2)' },
    { name: 'Mobile Legends (Rp 25.000)', price: 25000, desc: 'Lomba Mobile Legends (Batch 2)' },
    { name: 'Mini Soccer (Rp 50.000)', price: 50000, desc: 'Lomba Mini Soccer (Batch 2)' }
  ];
  
  const seminarOptions = [
    { name: 'Penerima KIP-K (GRATIS)', price: 0, desc: 'Seminar Kak Ryu - KIPK PNJ' },
    { name: 'Umum / Non KIP-K (Rp 5.000)', price: 5000, desc: 'Seminar Kak Ryu - Non KIPK / Umum' }
  ];
  
  let currentPrice = 0;
  let currentDesc = '';

  // Check if redirected back from Xendit with success status
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status') === 'success') {
    const regID = urlParams.get('regID');
    const nama = urlParams.get('nama');
    const email = urlParams.get('email');
    const hp = urlParams.get('hp');
    const instansi = urlParams.get('instansi');
    const kategori = urlParams.get('kategori');
    const desc = urlParams.get('desc');
    const price = parseInt(urlParams.get('price') || '0');
    
    // Save to localStorage
    const registrasiList = JSON.parse(localStorage.getItem('registrasi_kipk') || '[]');
    
    // Prevent duplicate entries on refresh
    const exists = registrasiList.some(item => item.regID === regID);
    if (!exists) {
      const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      registrasiList.push({
        regID, nama, email, hp, instansi, kategori, desc, price,
        status: 'Settlement',
        date
      });
      localStorage.setItem('registrasi_kipk', JSON.stringify(registrasiList));

      // Save to MySQL DB via php/api.php
      fetch('php/api.php?action=save_registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          regID, nama, email, hp, instansi, kategori, desc, price,
          status: 'Settlement'
        })
      })
      .then(res => res.json())
      .catch(err => console.error('Error saving registration to database:', err));
    }
    
    // Show success modal directly
    openSuccessModalDirectly(regID, nama, desc);
    
    // Clean URL parameters from address bar
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // Event listener registration buttons
  document.getElementById('daftarLombaIndividuBtn').addEventListener('click', function(e) {
    e.preventDefault();
    openRegModal('Lomba (Individu)');
  });
  
  document.getElementById('daftarLombaTimBtn').addEventListener('click', function(e) {
    e.preventDefault();
    openRegModal('Lomba (Tim)');
  });
  
  document.getElementById('daftarSeminarBtn').addEventListener('click', function(e) {
    e.preventDefault();
    openRegModal('Seminar');
  });
  
  function openRegModal(kategori) {
    labelKategori.value = kategori;
    selectPilihan.innerHTML = '';
    
    resetStepper();
    
    if (kategori.startsWith('Lomba')) {
      pilihanLabel.textContent = 'Pilih Cabang Lomba';
      lombaOptions.forEach((opt, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = opt.name;
        selectPilihan.appendChild(option);
      });
      currentPrice = lombaOptions[0].price;
      currentDesc = lombaOptions[0].desc;
    } else {
      pilihanLabel.textContent = 'Kategori Tiket';
      seminarOptions.forEach((opt, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = opt.name;
        selectPilihan.appendChild(option);
      });
      currentPrice = seminarOptions[0].price;
      currentDesc = seminarOptions[0].desc;
    }
    
    bootstrapModal.show();
  }
  
  selectPilihan.addEventListener('change', function() {
    const idx = parseInt(this.value);
    if (labelKategori.value.startsWith('Lomba')) {
      currentPrice = lombaOptions[idx].price;
      currentDesc = lombaOptions[idx].desc;
    } else {
      currentPrice = seminarOptions[idx].price;
      currentDesc = seminarOptions[idx].desc;
    }
  });
  
  // Form Submit
  document.getElementById('regForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('regNama').value;
    const email = document.getElementById('regEmail').value;
    const hp = document.getElementById('regHP').value;
    const instansi = document.getElementById('regInstansi').value;
    const kategori = document.getElementById('regKategori').value;
    
    if (currentPrice === 0) {
      showSuccess(nama, email, hp, instansi, kategori, currentDesc, 0);
    } else {
      // Show loading state on submit button
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menghubungkan ke Gateway...';
      
      // Request Xendit Invoice from backend
      fetch('php/create-invoice.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama: nama,
          email: email,
          hp: hp,
          instansi: instansi,
          kategori: kategori,
          desc: currentDesc,
          price: currentPrice
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.invoice_url) {
          // Redirect to real Xendit Invoice
          window.location.href = data.invoice_url;
        } else {
          // Graceful simulation fallback if config/API key not set
          console.warn('Xendit redirect failed, falling back to local simulation:', data);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          showPayment(nama, email, hp, instansi, kategori, currentDesc, currentPrice);
        }
      })
      .catch(err => {
        // Graceful fallback on network/connection failure
        console.warn('Fetch to create-invoice.php failed, falling back to local simulation:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showPayment(nama, email, hp, instansi, kategori, currentDesc, currentPrice);
      });
    }
  });
  
  // (Payment Method tabs listener removed as QRIS is now the exclusive payment option)
  
  // Payment Successful Simulation Button
  document.getElementById('btnSimulatePay').addEventListener('click', function() {
    if (tempRegData) {
      showSuccess(
        tempRegData.nama,
        tempRegData.email,
        tempRegData.hp,
        tempRegData.instansi,
        tempRegData.kategori,
        tempRegData.desc,
        tempRegData.price
      );
    }
  });
  
  function resetStepper() {
    document.getElementById('stepIndicator-1').className = 'step active';
    document.getElementById('stepIndicator-2').className = 'step';
    document.getElementById('stepIndicator-3').className = 'step';
    
    document.getElementById('stepLine-1').className = 'step-line';
    document.getElementById('stepLine-2').className = 'step-line';
    
    document.getElementById('stepContent-1').className = 'step-content active';
    document.getElementById('stepContent-2').className = 'step-content';
    document.getElementById('stepContent-3').className = 'step-content';
  }
  
  function showPayment(nama, email, hp, instansi, kategori, desc, price) {
    tempRegData = { nama, email, hp, instansi, kategori, desc, price };
    
    // Update Steppers
    document.getElementById('stepIndicator-1').className = 'step done';
    document.getElementById('stepIndicator-2').className = 'step active';
    document.getElementById('stepLine-1').className = 'step-line done';
    
    // Show step content
    document.getElementById('stepContent-1').className = 'step-content';
    document.getElementById('stepContent-2').className = 'step-content active';
    
    // Populate Invoice details
    document.getElementById('payOrderID').textContent = 'TX-' + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('payTotal').textContent = 'Rp ' + price.toLocaleString('id-ID');
    document.getElementById('payName').textContent = nama;
    document.getElementById('payDesc').textContent = desc;
  }
  
  function showSuccess(nama, email, hp, instansi, kategori, desc, price) {
    const regID = 'REG-KIPKFEST-' + Math.floor(10000 + Math.random() * 90000);
    const status = (price === 0) ? 'KIP-K (Gratis)' : 'Settlement';
    const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Save to localStorage
    const registrasiList = JSON.parse(localStorage.getItem('registrasi_kipk') || '[]');
    const newRegistration = {
      regID: regID,
      nama: nama,
      email: email,
      hp: hp,
      instansi: instansi,
      kategori: kategori,
      desc: desc,
      price: price,
      status: status,
      date: date
    };
    registrasiList.push(newRegistration);
    localStorage.setItem('registrasi_kipk', JSON.stringify(registrasiList));

    // Save to MySQL DB via php/api.php
    fetch('php/api.php?action=save_registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        regID: regID,
        nama: nama,
        email: email,
        hp: hp,
        instansi: instansi,
        kategori: kategori,
        desc: desc,
        price: price,
        status: status
      })
    })
    .then(res => res.json())
    .catch(err => console.error('Error saving registration to database:', err));
    
    // Populate and open success screen
    openSuccessModalDirectly(regID, nama, desc);
    
    // Reset the form
    document.getElementById('regForm').reset();
    tempRegData = null;
  }

  function openSuccessModalDirectly(regID, nama, desc) {
    // Update Steppers
    document.getElementById('stepIndicator-1').className = 'step done';
    document.getElementById('stepIndicator-2').className = 'step done';
    document.getElementById('stepIndicator-3').className = 'step done active';
    document.getElementById('stepLine-1').className = 'step-line done';
    document.getElementById('stepLine-2').className = 'step-line done';
    
    // Show step content
    document.getElementById('stepContent-1').className = 'step-content';
    document.getElementById('stepContent-2').className = 'step-content';
    document.getElementById('stepContent-3').className = 'step-content active';
    
    // Populate registration details
    document.getElementById('finalRegID').textContent = regID;
    document.getElementById('finalName').textContent = nama;
    document.getElementById('finalAcara').textContent = desc;
    
    bootstrapModal.show();
  }
});
