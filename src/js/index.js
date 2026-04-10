async function kirimPesan() {
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const subjek = document.getElementById("subjek").value;
    const pesan = document.getElementById("pesan").value;
    const status = document.getElementById("status");

    if (nama === "" || subjek === "" || pesan === "" || !email.includes("@")) {
        status.innerText = "Mohon lengkapi data dengan benar!";
        status.style.color = "#ff4d4d";
        return;
    }

    status.innerText = "Sedang mengirim pesan...";
    status.style.color = "#8e8e93";

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                access_key: "13d2cb84-714c-400e-bf21-db18caa75743",
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
            document.getElementById("contactForm").reset();
        } else {
            status.innerText = "Gagal mengirim pesan. Silakan coba lagi nanti.";
            status.style.color = "#ff4d4d";
        }
    } catch (error) {
        status.innerText = "Terjadi kesalahan jaringan.";
        status.style.color = "#ff4d4d";
    }
}

// Drag-to-scroll slider
const slider = document.querySelector('.clients-slider');
let isDown = false;
let startX;
let scrollLeft;

// Event 1: Mousedown (mulai drag)
slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

// Event 2: Mouseleave (batal drag)
slider.addEventListener('mouseleave', () => {
    isDown = false;
});

// Event 3: Mouseup (stop drag)
slider.addEventListener('mouseup', () => {
    isDown = false;
});

// Event 4: Mousemove (handle dragging)
slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
});
