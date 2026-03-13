# 🎬 Zar's Portfolio

Selamat datang di repositori portofolio website saya. Website ini dirancang untuk memamerkan karya-karya di bidang **Motion Design**, **VFX**, **Video Editing**, dan **Graphic Design** dengan pendekatan visual yang modern dan interaktif.

## 🚀 Fitur Utama

-   **Dynamic Playlist System**: Karya-karya dikelompokkan dalam kategori ala playlist (Animation, Video, Design, Case Study) yang datanya dimuat secara dinamis dari file JSON.
-   **Smart Masonry Grid**: Khusus untuk kategori *Graphic Design*, tampilan berubah menjadi layout masonry yang responsif untuk menonjolkan aspek visual dari setiap karya.
-   **Interactive UI**: Menggunakan **Anime.js** untuk transisi smooth dan micro-interactions yang memberikan kesan hidup pada setiap elemen.
-   **Premium Aesthetics**: Implementasi desain modern dengan efek **Glassmorphism**, tipografi bersih (Inter/Google Fonts), dan skema warna gelap yang kontras (premium dark mode).
-   **Safe "Back to Top" Button**: Tombol kembali ke atas yang hanya muncul saat dibutuhkan (di dalam view playlist) dan memiliki logika pintar agar tidak menabrak footer saat di-scroll mentok ke bawah.

## 🛠️ Tech Stack

-   **Core**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla ES6+).
-   **Animation**: [Anime.js](https://animejs.com/) untuk engine animasi.
-   **Data Management**: Fetch API untuk memproses `portfolio-data.json`.
-   **Optimasi**: WebP image format untuk performa loading yang cepat.

## 📂 Struktur Folder

```text
├── src/
│   ├── assets/           # Media (Images, Videos, Icons, Thumbnails)
│   ├── js/               # Logic (portfolio-logic.js, anim.js, dll.)
│   └── style/            # CSS (global.css, index.css, portfolio-dynamic.css)
├── portfolio-data.json   # Sumber data utama untuk semua project
├── index.html            # Landing Page
├── portfolio.html        # Halaman Galeri Karya
├── about.html            # Halaman Pengenalan
└── contact.html          # Halaman Kontak & Kolaborasi
```

## 📝 Cara Menambah Project Baru

Semua data project tersentralisasi di `portfolio-data.json`. Untuk menambah project baru, cukup tambahkan object baru ke dalam array `projects`:

```json
{
    "categoryId": "animation",
    "title": "Nama Project",
    "description": "Deskripsi singkat project.",
    "link": "https://link-ke-video-atau-beance.com",
    "thumbnail": "path/ke/thumbnail.webp",
    "aspectRatio": "16/9" // Opsional, default 16/9
}
```

## 👨‍💻 Author

**Zarvx**
-   Portfolio: [zarvx.github.io](https://anotherzar.github.io/Website-Portfolio/)
-   Instagram: [@zarvx_](https://www.instagram.com/zarvx_/)
-   YouTube: [Endline](https://www.youtube.com/@endline9722)

---
*Made with ❤️ by Zarvx © 2025*
