// Animate hero section
anime({
    targets: '.hero h1, .hero p, .hero-img, .cta-container .cta-btn, .hero-socials a, .skills-pattern h2, .skills-pattern .skills-sub, .skill-card',
    opacity: [0, 1],
    translateY: [50, 0],
    easing: 'easeOutExpo',
    duration: 800,
    delay: anime.stagger(100)
});

// Animate content fade in
anime({
    targets: '.content, .grid .card, .section-title, .teks-bio, .minat-card, .tech-category, .timeline-item, .pendidikan-item, .personality-container, .certificate-card',
    opacity: [0, 1],
    translateY: [60, 0],
    easing: 'easeOutExpo',
    duration: 600,
    delay: anime.stagger(150)
});

const languages = [
    "Halo", "Hello", "Hola", "Bonjour", "Ciao",
    "こんにちは", "안녕하세요", "你好", "Guten Tag",
    "Привет", "Olá", "Merhaba", "Sawadee", "Salam"
];

// Preloader function - ganti bahasa
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
        loader.style.display = "none";

        if (typeof runAnimations === "function") {
            runAnimations();
        }
    }
});

