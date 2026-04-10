// SECTION: DATA FAQ
class FaqComponent extends HTMLElement {
    constructor() {
        super();
        this.faqs = [
            { q: 'faq_q2', a: 'faq_a2' },
            { q: 'faq_q3', a: 'faq_a3' },
            { q: 'faq_q5', a: 'faq_a5' }
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
        if (!data || !data[lang]) return;

        const titleKey = this.getAttribute('data-t-title');
        if (titleKey && data[lang][titleKey]) {
            const titleEl = this.querySelector('.faq-title');
            if (titleEl) titleEl.innerHTML = data[lang][titleKey];
        }

        const items = this.querySelectorAll('.faq-item');
        items.forEach((item, index) => {
            const qKey = this.faqs[index].q;
            const aKey = this.faqs[index].a;
            
            const qEl = item.querySelector('.faq-question h3');
            const aEl = item.querySelector('.faq-answer p');

            if (qEl && data[lang][qKey]) qEl.innerHTML = data[lang][qKey];
            if (aEl && data[lang][aKey]) aEl.innerHTML = data[lang][aKey];
        });
    }

    // SECTION: RENDER HTML UTAMA
    render() {
        this.innerHTML = `
            <section class="faq-section">
                <div class="faq-header">
                    <h2 class="faq-title">FAQ</h2>
                    <p class="faq-subtitle" data-t="faq_subtitle">Common questions about my workflow and services.</p>
                </div>
                <div class="faq-container">
                    <div class="faq-list">
                        ${this.faqs.map((faq, index) => `
                            <div class="faq-item ${index === 0 ? 'active' : ''}">
                                <button class="faq-question">
                                    <h3>Question</h3>
                                    <div class="faq-icon-wrapper">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </div>
                                </button>
                                <div class="faq-answer">
                                    <p>Answer</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;

        // SECTION: LOGIKA ACCORDION (BUKA-TUTUP)
        this.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.parentElement;
                const isOpen = item.classList.contains('active');
                
                this.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        });
    }
}

// SECTION: REGISTRASI WEB COMPONENT
customElements.define('faq-component', FaqComponent);
