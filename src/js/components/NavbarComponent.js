class NavbarComponent extends HTMLElement {
    connectedCallback() {
        this.render();
        this.updateTexts();
        window.addEventListener('languageChanged', () => this.updateTexts());
    }

    updateTexts() {
        const lang = localStorage.getItem('preferred-lang') || 'id';
        const data = window.translationsData;
        if (!data || !data[lang]) return;

        const navHome = this.querySelector('[data-t="nav_home"]');
        const navAbout = this.querySelector('[data-t="nav_about"]');
        const navPortfolio = this.querySelector('[data-t="nav_portfolio"]');
        const navContact = this.querySelector('[data-t="nav_contact"]');

        if (navHome && data[lang]["nav_home"]) navHome.textContent = data[lang]["nav_home"];
        if (navAbout && data[lang]["nav_about"]) navAbout.textContent = data[lang]["nav_about"];
        if (navPortfolio && data[lang]["nav_portfolio"]) navPortfolio.textContent = data[lang]["nav_portfolio"];
        if (navContact && data[lang]["nav_contact"]) navContact.textContent = data[lang]["nav_contact"];
    }

    render() {
        // Get the current page filename to mark the active menu item
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        this.innerHTML = `
            <header>
                <nav class="nav">
                    <a href="index.html" data-t="nav_home" class="${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">Home</a>
                    <a href="about.html" data-t="nav_about" class="${currentPath === 'about.html' ? 'active' : ''}">About</a>
                    <a href="portfolio.html" data-t="nav_portfolio" class="${currentPath === 'portfolio.html' ? 'active' : ''}">Portofolio</a>
                    <a href="contact.html" data-t="nav_contact" class="${currentPath === 'contact.html' ? 'active' : ''}">Contact</a>
                </nav>
            </header>
        `;
    }
}

customElements.define('navbar-component', NavbarComponent);
