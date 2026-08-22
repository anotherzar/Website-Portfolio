// ==============================
// SCROLL-TRIGGERED ANIMATIONS
// ==============================

// Helper: Animate elements when they enter the viewport (IntersectionObserver)
function initScrollAnimations() {
    if (typeof anime === 'undefined') return;

    // Selectors for elements that should animate on scroll
    const scrollTargets = [
        '.content', '.grid .card', '.section-title', '.teks-bio',
        '.minat-card', '.tech-category', '.timeline-item',
        '.pendidikan-item', '.personality-container', '.certificate-card',
        'spotify-component', '.bagian-profil',
        '.skill-card', '.playlist-grid'
    ].join(', ');

    const observedElements = Array.from(document.querySelectorAll(scrollTargets))
        .filter(el => !el.classList.contains('profile-img') && el.id !== 'profile-img');

    if (!observedElements.length) return;

    // Set initial state: invisible
    observedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
    });

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (!visible.length) return;

        visible.forEach(entry => {
            observer.unobserve(entry.target);
        });

        anime({
            targets: visible.map(e => e.target),
            opacity: [0, 1],
            translateY: [40, 0],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    observedElements.forEach(el => observer.observe(el));
}

// Hero animations — always run immediately (above the fold)
function runHeroAnimations() {
    if (typeof anime === 'undefined') return;

    const heroTargets = '.hero h1, .hero p, .hero-img, .cta-container .cta-btn, .hero-socials a, .skills-pattern h2, .skills-pattern .skills-sub';
    const heroElements = document.querySelectorAll(heroTargets);
    if (!heroElements.length) return;

    anime({
        targets: heroTargets,
        opacity: [0, 1],
        translateY: [50, 0],
        easing: 'easeOutExpo',
        duration: 800,
        delay: anime.stagger(100)
    });
}

// Combined runner
function runAnimations() {
    runHeroAnimations();
    initScrollAnimations();
}

// ==============================
// PRELOADER
// ==============================

const languages = [
    "Halo", "Hello", "Hola", "Bonjour", "Ciao",
    "こんにちは", "안녕하세요", "你好", "Guten Tag",
    "Привет", "Olá", "Merhaba", "Sawadee", "Salam"
];

function startPreloader() {
    const loader = document.getElementById("preloader");
    const text = document.getElementById("loading-text");

    let i = 0;
    let duration = 450;
    const totalTime = 3000;
    let elapsed = 0;

    const switchText = () => {
        // Fade out
        text.style.opacity = 0;

        setTimeout(() => {
            // Ganti teks ke bahasa berikutnya
            text.textContent = languages[i % languages.length];
            text.style.opacity = 1;
        }, 150);

        i++;
        elapsed += duration;
        duration = Math.max(60, duration - 40); // Makin cepat

        if (elapsed < totalTime) {
            setTimeout(switchText, duration);
        } else {
            // Selesai - fade out loader
            loader.style.transition = "opacity .5s ease";
            loader.style.opacity = 0;

            setTimeout(() => {
                loader.style.display = "none";
                window.dispatchEvent(new Event('preloaderFinished'));

                if (typeof runAnimations === "function") {
                     runAnimations();
                }
            }, 500);

            // Simpan ke localStorage
            localStorage.setItem("visited", "true");
        }
    };

    switchText();
}

// Event load - cek udah pernah visit atau belum
window.addEventListener("load", () => {
    const DEBUG_PRELOADER = false;
    const loader = document.getElementById("preloader");

    if (DEBUG_PRELOADER) {
        localStorage.removeItem("visited");
    }

    const hasVisited = localStorage.getItem("visited");

    // Kalau belum pernah visit, jalankan preloader
    if (!hasVisited) {
        startPreloader();
    } else {
        // Kalau udah pernah, langsung skip
        if (loader) {
            loader.style.display = "none";
        }
        window.dispatchEvent(new Event('preloaderFinished'));

        if (typeof runAnimations === "function") {
            runAnimations();
        }
    }
});
