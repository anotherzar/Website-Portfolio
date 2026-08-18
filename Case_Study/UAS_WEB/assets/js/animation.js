document.addEventListener('DOMContentLoaded', function () {
  // Intersection observer untuk scroll reveal
  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -20px 0px',
    threshold: 0.02,            
  };

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  window.initScrollReveal = function (container) {
    var parent = container || document;
    var revealElements = parent.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .line-draw');
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  };

  // Inisialisasi scan setelah load dengan sedikit jeda
  if (document.readyState === 'complete') {
    setTimeout(function () { window.initScrollReveal(); }, 100);
  } else {
    window.addEventListener('load', function () {
      setTimeout(function () { window.initScrollReveal(); }, 100);
    });
  }

  // Animasi counter up
  var counterElements = document.querySelectorAll('.count-up');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counterElements.forEach(function (el) {
    counterObserver.observe(el);
  });

  // Animasi parallax background orbs dengan GSAP
  if (typeof gsap !== 'undefined') {
    var orbs = document.querySelectorAll('.bg-orb');
    orbs.forEach(function (orb) {
      gsap.to(orb, {
        y: function () { return (Math.random() - 0.5) * 100; },
        x: function () { return (Math.random() - 0.5) * 60; },
        duration: 8 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    // Animasi stagger teks hero
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      // Konversi ke array untuk kompatibilitas Firefox
      var heroChildren = Array.prototype.slice.call(heroContent.children);
      
      // Hapus class transisi CSS bawaan untuk menghindari konflik GSAP
      for (var i = 0; i < heroChildren.length; i++) {
        heroChildren[i].classList.remove('hero-fade-in');
      }
      
      // Gunakan fromTo untuk mencegah kendala sinkronisasi di Firefox
      gsap.fromTo(heroChildren, 
        {
          y: 40,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3
        }
      );
    }
  }
});
