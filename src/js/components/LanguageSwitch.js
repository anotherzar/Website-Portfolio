// SECTION: DATA TRANSLATE PORTFOLIO
const translations = {
    id: {
        "worksCount": "karya",
        "noWorks": "Belum ada karya di kategori ini.",
        "backToCats": "Kembali ke Kategori"
    },
    en: {
        "worksCount": "works",
        "noWorks": "No works available in this category yet.",
        "backToCats": "Back to Categories"
    }
};

// SECTION: CLASS UTAMA LANGUAGE SWITCH
class LanguageSwitch {
    constructor() {
        this.currentLang = localStorage.getItem('preferred-lang') || 'id';
        this.init();
    }

    // SECTION: INISIALISASI & EVENT LISTENER
    init() {
        this.injectSwitcher();
        this.applyLanguage(this.currentLang);
        
        window.addEventListener('scroll', () => this.handlePosition());
        document.addEventListener('DOMContentLoaded', () => this.handlePosition());
    }

    // SECTION: INJECT TOMBOL SWITCHER KE DOM
    injectSwitcher() {
        if (document.querySelector('.lang-switch')) return;

        const container = document.createElement('div');
        container.className = 'lang-switch';
        container.innerHTML = `
            <button id="lang-id" class="${this.currentLang === 'id' ? 'active' : ''}">ID</button>
            <button id="lang-en" class="${this.currentLang === 'en' ? 'active' : ''}">EN</button>
        `;
        document.body.appendChild(container);

        document.getElementById('lang-id').addEventListener('click', () => this.setLanguage('id'));
        document.getElementById('lang-en').addEventListener('click', () => this.setLanguage('en'));
    }

    // SECTION: SET BAHASA & DISPATCH EVENT
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferred-lang', lang);
        this.applyLanguage(lang);
        
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));

        if (typeof renderCategories === 'function') {
            renderCategories();
        }
    }

    // SECTION: TERAPKAN BAHASA KE SELURUH ELEMEN
    applyLanguage(lang) {
        const btnID = document.getElementById('lang-id');
        const btnEN = document.getElementById('lang-en');
        
        if (btnID && btnEN) {
            btnID.classList.toggle('active', lang === 'id');
            btnEN.classList.toggle('active', lang === 'en');
        }

        document.documentElement.lang = lang;

        // Translate pake data (data-t)
        const tElements = document.querySelectorAll('[data-t], [data-t-placeholder], [data-t-aria-label]');
        tElements.forEach(el => {
            const data = window.translationsData;
            if (!data) return;

            if (el.hasAttribute('data-t')) {
                const key = el.getAttribute('data-t');
                if (data[lang] && data[lang][key]) {
                    el.innerHTML = data[lang][key];
                }
            }
            if (el.hasAttribute('data-t-placeholder')) {
                const key = el.getAttribute('data-t-placeholder');
                if (data[lang] && data[lang][key]) {
                    el.placeholder = data[lang][key];
                }
            }
            if (el.hasAttribute('data-t-aria-label')) {
                const key = el.getAttribute('data-t-aria-label');
                if (data[lang] && data[lang][key]) {
                    el.setAttribute('aria-label', data[lang][key]);
                }
            }
        });

        // SECTION: FALLBACK TRANSLATE INLINE
        const enElements = document.querySelectorAll('[data-en], [data-en-placeholder], [data-en-aria-label]');
        enElements.forEach(el => {
            if (lang === 'en') {
                if (el.hasAttribute('data-en')) {
                    if (!el.getAttribute('data-id-original')) el.setAttribute('data-id-original', el.innerHTML);
                    el.innerHTML = el.getAttribute('data-en');
                }
                if (el.hasAttribute('data-en-placeholder')) {
                    if (!el.getAttribute('data-id-placeholder-original')) el.setAttribute('data-id-placeholder-original', el.placeholder);
                    el.placeholder = el.getAttribute('data-en-placeholder');
                }
                if (el.hasAttribute('data-en-aria-label')) {
                    if (!el.getAttribute('data-id-aria-original')) el.setAttribute('data-id-aria-original', el.ariaLabel || el.getAttribute('aria-label') || '');
                    el.setAttribute('aria-label', el.getAttribute('data-en-aria-label'));
                }
            } else {
                const original = el.getAttribute('data-id-original');
                if (original) el.innerHTML = original;
                
                const originalPlaceholder = el.getAttribute('data-id-placeholder-original');
                if (originalPlaceholder) el.placeholder = originalPlaceholder;

                const originalAria = el.getAttribute('data-id-aria-original');
                if (originalAria) el.setAttribute('aria-label', originalAria);
            }
        });
    }

    // SECTION: BUTTON TRANSLATE
    handlePosition() {
        const langSwitch = document.querySelector('.lang-switch');
        const footer = document.querySelector('footer');
        if (!langSwitch || !footer) return;

        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const buttonMargin = 30;

        if (footerRect.top < viewportHeight) {
            const offset = viewportHeight - footerRect.top + buttonMargin;
            langSwitch.style.bottom = `${offset}px`;
        } else {
            langSwitch.style.bottom = `${buttonMargin}px`;
        }
    }
}

// SECTION: HELPER GLOBAL UNTUK KONTEN DINAMIS
window.getT = (key) => {
    const lang = localStorage.getItem('preferred-lang') || 'id';
    return translations[lang][key] || key;
};

// SECTION: INISIALISASI KOMPONEN
new LanguageSwitch();
