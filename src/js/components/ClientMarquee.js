// SECTION: DATA KLIEN
class ClientMarquee extends HTMLElement {
    constructor() {
        super();
        this.clientsData = [
            [
                { src: 'src/assets/images/RoofMRI.webp', alt: 'RoofMRI' },
                { src: 'https://cms.wika.co.id/storage/1888/Wika-Industri-Kontruksi.png', alt: 'wikaikon' },
                { src: 'src/assets/images/Sony Music.webp', alt: 'sonymusic' },
                { src: 'src/assets/images/forRevenge.webp', alt: 'ForRevenge' },
                { src: 'src/assets/images/SHA.webp', alt: 'sha' },
                { src: 'https://companieslogo.com/img/orig/TLK_BIG.D-379b1fbf.png?t=1720244494', alt: 'telkom' },
                { src: 'https://www.orbituniverse.id/logo/Logo_Orbit_White.png', alt: 'orbituniverse' }
            ],
            [
                { src: 'https://ilovelife.co.id/assets/images/medium_logo_ojk_4845c50e19.webp', alt: 'ojk' },
                { src: 'src/assets/images/D3.webp', alt: 'D3' },
                { src: 'src/assets/images/Studio_titikSembilan.webp', alt: 'Titiksembilan' },
                { src: 'src/assets/images/logo-smk.webp', alt: 'smk' },
                { src: 'src/assets/images/akross-light.webp', alt: 'akross' },
                { src: 'src/assets/images/Compass.svg', alt: 'compass' },
                { src: 'src/assets/images/NPM.webp', alt: 'Network_Pro_Marketing' }
            ]
        ];
    }

    // SECTION: INISIALISASI KOMPONEN & EVENT LISTENER
    connectedCallback() {
        this.render();
        this.updateTexts();
        window.addEventListener('languageChanged', () => this.updateTexts());
    }

    // SECTION: UPDATE TEKS BERDASARKAN BAHASA
    updateTexts() {
        const lang = localStorage.getItem('preferred-lang') || 'id';
        const data = window.translationsData;
        
        const titleKey = this.getAttribute('data-t-title');
        const subtitleKey = this.getAttribute('data-t-subtitle');

        if (data && data[lang]) {
            if (titleKey && data[lang][titleKey]) {
                const titleEl = this.querySelector('h2');
                if (titleEl) titleEl.innerHTML = data[lang][titleKey];
            }
            if (subtitleKey && data[lang][subtitleKey]) {
                const subEl = this.querySelector('.skills-sub');
                if (subEl) subEl.innerHTML = data[lang][subtitleKey];
            }
        }
    }

    // SECTION: RENDER HTML UTAMA
    render() {
        const title = this.getAttribute('title') || 'Client Saya';
        const subtitle = this.getAttribute('subtitle') || 'Kolaborasi yang ngebentuk gaya visual dan cara kerja saya hari ini.';

        this.innerHTML = `
            <section class="clients">
                <div>
                    <h2>${title}</h2>
                    <p class="skills-sub">${subtitle}</p>
                </div>
                
                <div class="clients-container">
                    <div class="marquee-wrapper">
                        <div class="marquee-track scroll-right">
                            ${this.renderRow(0)}
                            ${this.renderRow(0)}
                        </div>
                    </div>

                    <div class="marquee-wrapper">
                        <div class="marquee-track scroll-left">
                            ${this.renderRow(1)}
                            ${this.renderRow(1)}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // SECTION: RENDER BARIS LOGO KLIEN
    renderRow(rowIndex) {
        return this.clientsData[rowIndex].map(client => `
            <div class="client-card">
                <img src="${client.src}" alt="${client.alt}" loading="lazy">
            </div>
        `).join('');
    }
}

// SECTION: REGISTRASI WEB COMPONENT
customElements.define('client-marquee', ClientMarquee);
