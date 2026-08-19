// Deployment trigger: 2026-03-13
const currentLang = () => localStorage.getItem('preferred-lang') || 'id';
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
        const catTitle = currentLang() === 'en' && cat.title_en ? cat.title_en : cat.title;
        const catDesc = currentLang() === 'en' && cat.description_en ? cat.description_en : cat.description;
        
        card.onclick = () => openPlaylist(cat.id, catTitle, catDesc, cat.thumbnail, count);
        const title = currentLang() === 'en' && cat.title_en ? cat.title_en : cat.title;
        const countLabel = getT('worksCount');

        card.innerHTML = `
            ${imageHtml}
            <h3>${title}</h3>
            <p>${count} ${countLabel}</p>
        `;
        grid.appendChild(card);
    });
}

let currentCategoryId = null;
let currentCategoryCount = 0;
let currentSortOrder = 'newest';

function openPlaylist(categoryId, title, desc, coverSrc, count) {
    currentCategoryId = categoryId;
    currentCategoryCount = count;
    
    document.getElementById('playlist-hub').style.display = 'none';
    document.getElementById('playlist-view').style.display = 'block';
    
    document.getElementById('playlist-title').innerText = title;
    document.getElementById('playlist-desc').innerText = desc;
    document.getElementById('playlist-cover').src = coverSrc;
    document.getElementById('playlist-count-label').innerText = count + ' ' + getT('worksCount');

    renderPlaylistGrid();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setSortOrder(order) {
    if (currentSortOrder === order) return;
    currentSortOrder = order;
    
    const btnNewest = document.getElementById('sort-btn-newest');
    const btnOldest = document.getElementById('sort-btn-oldest');
    if (btnNewest && btnOldest) {
        btnNewest.classList.toggle('active', order === 'newest');
        btnOldest.classList.toggle('active', order === 'oldest');
    }
    
    renderPlaylistGrid();
}

function renderPlaylistGrid() {
    if (!currentCategoryId) return;

    const grid = document.getElementById('dynamic-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // grid setting khusus buat desain grafis
    if (currentCategoryId === 'graphic-design') {
        grid.className = 'masonry-grid';
    } else {
        grid.className = 'grid';
    }
    
    // Loop projects per category and sort by date according to currentSortOrder
    const filteredProjects = portfolioDatabase.projects
        .filter(p => p.categoryId === currentCategoryId)
        .sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            if (currentSortOrder === 'newest') {
                return dateB.localeCompare(dateA);
            } else {
                return dateA.localeCompare(dateB);
            }
        });
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = `<p style="color:#b3b3b3; grid-column: 1 / -1;">${getT('noWorks')}</p>`;
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

            const title = currentLang() === 'en' && proj.title_en ? proj.title_en : proj.title;
            const desc = currentLang() === 'en' && proj.description_en ? proj.description_en : proj.description;

            const titleHtml = title ? `<h3>${title}</h3>` : '';
            const descHtml = desc ? `<p>${desc}</p>` : '';
            const formattedDate = proj.date ? formatDate(proj.date) : '';
            const dateHtml = formattedDate && title ? `<span class="project-date" style="display: block; font-size: 0.8rem; color: #888; margin-top: 4px;">${formattedDate}</span>` : '';
            const isMediaOnly = !title && !desc;
            
            // logic kalo json pake costume aspect rasio, default 16:9
            const customRatio = proj.aspectRatio ? `aspect-ratio: ${proj.aspectRatio}; padding-bottom: 0; height: auto;` : '';
            const wrapperStyle = `position: relative; ${cursorStyle} ${isMediaOnly ? 'margin-bottom: 0;' : ''} ${customRatio}`;

            card.innerHTML = `
                ${tagOpen}
                    <div class="fluid-video-wrapper" style="${wrapperStyle}">
                        <img src="${proj.thumbnail}" alt="${title || 'Portfolio'}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    ${titleHtml}
                    ${descHtml}
                    ${dateHtml}
                ${tagClose}
            `;
            grid.appendChild(card);
        });
    }
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

// Helper format tanggal
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(Date.UTC(year, month, day));
    const lang = currentLang() === 'en' ? 'en-US' : 'id-ID';
    return dateObj.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// pre-fetch data
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioData();
    window.addEventListener('scroll', handleBackToTop);
    window.addEventListener('languageChanged', () => {
        if (currentCategoryId) {
            const countLabelEl = document.getElementById('playlist-count-label');
            if (countLabelEl) {
                countLabelEl.innerText = currentCategoryCount + ' ' + getT('worksCount');
            }
            renderPlaylistGrid();
        }
    });
});
