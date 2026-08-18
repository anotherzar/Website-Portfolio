class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.render();
        this.updateTexts();
        window.addEventListener('languageChanged', () => this.updateTexts());
    }

    updateTexts() {
        const lang = localStorage.getItem('preferred-lang') || 'id';
        const data = window.translationsData;
        if (!data || !data[lang]) return;

        const footerDesc = this.querySelector('[data-t="footer_desc"]');
        const footerLinksTitle = this.querySelector('[data-t="footer_links_title"]');
        const footerContactTitle = this.querySelector('[data-t="footer_contact_title"]');
        const navHome = this.querySelector('[data-t="nav_home"]');
        const navAbout = this.querySelector('[data-t="nav_about"]');
        const navPortfolio = this.querySelector('[data-t="nav_portfolio"]');
        const navContact = this.querySelector('[data-t="nav_contact"]');

        if (footerDesc && data[lang]["footer_desc"]) footerDesc.textContent = data[lang]["footer_desc"];
        if (footerLinksTitle && data[lang]["footer_links_title"]) footerLinksTitle.textContent = data[lang]["footer_links_title"];
        if (footerContactTitle && data[lang]["footer_contact_title"]) footerContactTitle.textContent = data[lang]["footer_contact_title"];
        if (navHome && data[lang]["nav_home"]) navHome.textContent = data[lang]["nav_home"];
        if (navAbout && data[lang]["nav_about"]) navAbout.textContent = data[lang]["nav_about"];
        if (navPortfolio && data[lang]["nav_portfolio"]) navPortfolio.textContent = data[lang]["nav_portfolio"];
        if (navContact && data[lang]["nav_contact"]) navContact.textContent = data[lang]["nav_contact"];
    }

    render() {
        this.innerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <!-- Brand Section -->
                    <div class="footer-brand">
                        <a href="index.html" class="footer-logo">Zar's Portfolio</a>
                        <p class="footer-desc" data-t="footer_desc">Motion graphics, VFX, dan desain visual modern yang dirancang untuk memberikan dampak visual maksimal.</p>
                        <div class="footer-socials">
                            <a href="https://www.instagram.com/zarvx_/" target="_blank" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="https://www.youtube.com/@endline9722" target="_blank" aria-label="YouTube">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                            </a>
                            <a href="https://github.com/anotherzar" target="_blank" aria-label="GitHub">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            </a>
                        </div>
                    </div>
            
                    <!-- Links Column -->
                    <div class="footer-links">
                        <h4 data-t="footer_links_title">Navigasi</h4>
                        <ul>
                            <li><a href="index.html" data-t="nav_home">Home</a></li>
                            <li><a href="about.html" data-t="nav_about">About</a></li>
                            <li><a href="portfolio.html" data-t="nav_portfolio">Portofolio</a></li>
                            <li><a href="contact.html" data-t="nav_contact">Contact</a></li>
                        </ul>
                    </div>
            
                    <!-- Contact Column -->
                    <div class="footer-contact">
                        <h4 data-t="footer_contact_title">Hubungi Saya</h4>
                        <p><a href="mailto:044fajar@gmail.com" class="footer-email">044fajar@gmail.com</a></p>
                        <p class="footer-location">📍 Jakarta, Indonesia</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 zarvx_. Made with &hearts; and precision.</p>
                </div>
            </footer>
        `;
    }
}

customElements.define('footer-component', FooterComponent);
