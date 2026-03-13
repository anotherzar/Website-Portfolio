let portfolioDatabase = { categories: [], projects: [] };

async function loadPortfolioData() {
    try {
        // ngambil data porto di json
        const response = await fetch('portfolio-data.json');
        portfolioDatabase = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Gagal memuat data portofolio:', error);
    }
}

function renderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    portfolioDatabase.categories.forEach(cat => {
        // Total karya
        const catProjects = portfolioDatabase.projects.filter(p => p.categoryId === cat.id);
        const count = catProjects.length;
        
        // load cover playlist
        const imageHtml = `
            <div class="playlist-collage single">
                <img src="${cat.thumbnail}" alt="${cat.title}" loading="lazy">
            </div>
        `;

        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.onclick = () => openPlaylist(cat.id, cat.title, cat.description, cat.thumbnail, count);
        card.innerHTML = `
            ${imageHtml}
            <h3>${cat.title}</h3>
            <p>${count} karya</p>
        `;
        grid.appendChild(card);
    });
}

function openPlaylist(categoryId, title, desc, coverSrc, count) {
    document.getElementById('playlist-hub').style.display = 'none';
    document.getElementById('playlist-view').style.display = 'block';
    
    document.getElementById('playlist-title').innerText = title;
    document.getElementById('playlist-desc').innerText = desc;
    document.getElementById('playlist-cover').src = coverSrc;
    document.getElementById('playlist-count-label').innerText = count + ' karya';

    const grid = document.getElementById('dynamic-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // grid setting khusus buat desain grafis
    if (categoryId === 'graphic-design') {
        grid.className = 'masonry-grid';
    } else {
        grid.className = 'grid';
    }
    
    // Loop projects per category
    const filteredProjects = portfolioDatabase.projects.filter(p => p.categoryId === categoryId);
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = '<p style="color:#b3b3b3; grid-column: 1 / -1;">Belum ada karya di kategori ini.</p>';
    } else {
        filteredProjects.forEach(proj => {
            const card = document.createElement('div');
            // Matikan efek hover juga kalo emang ga ada linknya biar ga kerasa ngegocek
            const hasLink = proj.link && proj.link.trim() !== '';
            card.className = hasLink ? 'card motion-hover' : 'card';
            
            const tagOpen = hasLink 
                ? `<a href="${proj.link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: block;">` 
                : `<div style="text-decoration: none; color: inherit; display: block;">`;
            const tagClose = hasLink ? `</a>` : `</div>`;
            const cursorStyle = hasLink ? `cursor: pointer;` : `cursor: default;`;

            const titleHtml = proj.title ? `<h3>${proj.title}</h3>` : '';
            const descHtml = proj.description ? `<p>${proj.description}</p>` : '';
            const isMediaOnly = !proj.title && !proj.description;
            
            // logic kalo json pake costume aspect rasio, default 16:9
            const customRatio = proj.aspectRatio ? `aspect-ratio: ${proj.aspectRatio}; padding-bottom: 0; height: auto;` : '';
            const wrapperStyle = `position: relative; ${cursorStyle} ${isMediaOnly ? 'margin-bottom: 0;' : ''} ${customRatio}`;

            card.innerHTML = `
                ${tagOpen}
                    <div class="fluid-video-wrapper" style="${wrapperStyle}">
                        <img src="${proj.thumbnail}" alt="${proj.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    ${titleHtml}
                    ${descHtml}
                ${tagClose}
            `;
            grid.appendChild(card);
        });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closePlaylist() {
    document.getElementById('playlist-view').style.display = 'none';
    document.getElementById('playlist-hub').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleBackToTop();
}

// Logic button balik ke atas
function handleBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    const playlistView = document.getElementById('playlist-view');
    const footer = document.querySelector('footer');
    
    if (!backToTopBtn || !playlistView || !footer) return;

    // if scroll ke bawah
    const isPlaylistActive = playlistView.style.display === 'block';
    const isScrolledDown = window.scrollY > 300;

    if (isPlaylistActive && isScrolledDown) {
        backToTopBtn.classList.add('visible');
        
        // Logika biar ga nabrak footer
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const buttonMargin = 30; // margin default dari bawah
        
        // Kalo footer mulai keliatan di layar
        if (footerRect.top < viewportHeight) {
            const offset = viewportHeight - footerRect.top + buttonMargin;
            backToTopBtn.style.bottom = `${offset}px`;
        } else {
            backToTopBtn.style.bottom = `${buttonMargin}px`;
        }
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

// pre-fetch data
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioData();
    window.addEventListener('scroll', handleBackToTop);
});
