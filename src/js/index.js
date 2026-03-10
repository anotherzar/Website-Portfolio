// Variabel global
let count = 0;
let toggle = false;

// Fungsi validasi form kontak
function kirimPesan() {
    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const subjek = document.getElementById("subjek").value;
    const pesan = document.getElementById("pesan").value;

    if (nama === "" || subjek === "" || pesan === "" || !email.includes("@")) {
        document.getElementById("status").innerText = "Data tidak valid!";
        document.getElementById("status").style.color = "red";
        return;
    }

    document.getElementById("status").innerText = "Pesan siap dikirim!";
    document.getElementById("status").style.color = "#3b82f6";
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
