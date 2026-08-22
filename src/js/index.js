async function kirimPesan() {
    const namaEl = document.getElementById("nama");
    const emailEl = document.getElementById("email");
    const subjekEl = document.getElementById("subjek");
    const pesanEl = document.getElementById("pesan");
    const status = document.getElementById("status");

    if (!namaEl || !emailEl || !subjekEl || !pesanEl || !status) return;

    const nama = namaEl.value.trim();
    const email = emailEl.value.trim();
    const subjek = subjekEl.value.trim();
    const pesan = pesanEl.value.trim();

    if (nama === "" || subjek === "" || pesan === "" || !email.includes("@")) {
        status.innerText = "Mohon lengkapi data dengan benar!";
        status.style.color = "#ff4d4d";
        return;
    }

    status.innerText = "Sedang mengirim pesan...";
    status.style.color = "#8e8e93";

    const apiKey = typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.WEB3FORMS_KEY
        ? SITE_CONFIG.WEB3FORMS_KEY
        : "13d2cb84-714c-400e-bf21-db18caa75743";

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: apiKey,
                subject: `Kontak dari Portfolio: ${subjek}`,
                from_name: nama,
                email: email,
                message: pesan,
            }),
        });

        const result = await response.json();
        if (result.success) {
            status.innerText = "Pesan berhasil dikirim! Saya akan segera menghubungi Anda.";
            status.style.color = "#badb6e";
            const form = document.getElementById("contactForm");
            if (form) form.reset();
        } else {
            status.innerText = "Gagal mengirim pesan. Silakan coba lagi nanti.";
            status.style.color = "#ff4d4d";
        }
    } catch (error) {
        status.innerText = "Terjadi kesalahan jaringan.";
        status.style.color = "#ff4d4d";
    }
}

// Drag-to-scroll slider (only on pages with .clients-slider)
const slider = document.querySelector('.clients-slider');
if (slider) {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Safari & iOS Video Autoplay / Play Button Fix
const initAndPlayVideos = () => {
    const videos = document.querySelectorAll('.skill-card video');
    
    videos.forEach(video => {
        // Explicitly set muted and playsinline programmatically for Safari support
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        
        const attemptPlay = () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay was prevented by browser policy (e.g., Low Power Mode or Safari settings)
                    // We set up listeners to play as soon as the user interacts with the page
                    const playOnInteraction = () => {
                        video.play().then(cleanUp).catch(() => {});
                    };
                    
                    const cleanUp = () => {
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                        document.removeEventListener('scroll', playOnInteraction);
                    };
                    
                    document.addEventListener('click', playOnInteraction, { passive: true });
                    document.addEventListener('touchstart', playOnInteraction, { passive: true });
                    document.addEventListener('scroll', playOnInteraction, { passive: true });
                });
            }
        };

        // Try playing immediately
        attemptPlay();

        // Extra trigger: Try playing when the parent card is hovered/touched
        const card = video.closest('.skill-card');
        if (card && !card.dataset.hasVideoListeners) {
            card.dataset.hasVideoListeners = 'true';
            card.addEventListener('mouseenter', () => {
                if (video.paused) {
                    video.play().catch(() => {});
                }
            });
            card.addEventListener('touchstart', () => {
                if (video.paused) {
                    video.play().catch(() => {});
                }
            }, { passive: true });
        }
    });
};

// Run on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initAndPlayVideos);
} else {
    initAndPlayVideos();
}

// Run when preloader is finished/skipped
window.addEventListener('preloaderFinished', initAndPlayVideos);

// Run on window load just in case
window.addEventListener('load', initAndPlayVideos);
