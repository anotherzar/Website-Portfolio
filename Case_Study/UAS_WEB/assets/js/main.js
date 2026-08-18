document.addEventListener('DOMContentLoaded', function () {
  // Load reusable components
  loadComponent('navbar-placeholder', 'components/navbar.html');
  loadComponent('footer-placeholder', 'components/footer.html');
  loadComponent('cta-placeholder', 'components/cta.html');
});

// Memuat komponen HTML ke placeholder
function loadComponent(placeholderId, componentPath) {
  var placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  fetch(componentPath)
    .then(function (response) {
      if (!response.ok) throw new Error('Component not found: ' + componentPath);
      return response.text();
    })
    .then(function (html) {
      placeholder.innerHTML = html;

      // Inisialisasi navbar setelah loading
      if (placeholderId === 'navbar-placeholder') {
        initNavbarAfterLoad();
      }

      // Inisialisasi scroll reveal untuk elemen dinamis
      if (window.initScrollReveal) {
        window.initScrollReveal(placeholder);
      }
    })
    .catch(function (err) {
      console.warn('Could not load component:', err.message);
    });
}

// Inisialisasi perilaku navbar
function initNavbarAfterLoad() {
  var navbar = document.querySelector('.navbar-main');
  if (!navbar) return;

  var scrollThreshold = 50;

  function handleScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Menandai menu aktif
  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Tutup menu mobile saat link diklik
  var navbarCollapse = document.querySelector('.navbar-collapse');
  var navbarToggler = document.querySelector('.navbar-toggler');

  if (navbarCollapse && navbarToggler) {
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navbarCollapse.classList.contains('show')) {
          navbarToggler.click();
        }
      });
    });
  }
}

// Fungsi throttle untuk performa event
function throttle(fn, delay) {
  var lastTime = 0;
  return function () {
    var now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, arguments);
    }
  };
}
