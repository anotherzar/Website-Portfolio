// SECTION: LOGIC UTAMA HALAMAN ABOUT (LOAD SEMUA DATA JSON SECARA PARALEL)
let aboutPageData = {
    profile: null,
    techStack: [],
    experience: [],
    education: null
};

// SECTION: FETCH ALL DATA PARALLEL
async function loadAboutPageData() {
    try {
        const [profileRes, techStackRes, experienceRes, educationRes] = await Promise.all([
            fetch('src/data/profile.json'),
            fetch('src/data/tech-stack.json'),
            fetch('src/data/experience.json'),
            fetch('src/data/education.json')
        ]);

        if (!profileRes.ok || !techStackRes.ok || !experienceRes.ok || !educationRes.ok) {
            throw new Error('Gagal mengambil salah satu file JSON data');
        }

        aboutPageData.profile = await profileRes.json();
        aboutPageData.techStack = await techStackRes.json();
        aboutPageData.experience = await experienceRes.json();
        aboutPageData.education = await educationRes.json();

        renderAllAboutPage();
    } catch (error) {
        console.error('Error saat memuat data halaman About:', error);
    }
}

// SECTION: RENDER ALL SECTIONS
function renderAllAboutPage() {
    const currentLang = localStorage.getItem('preferred-lang') || 'id';

    renderProfileSection(currentLang);
    renderTechStackSection(currentLang);
    renderExperienceSection(currentLang);
    renderEducationSection(currentLang);
}

// 1. RENDER PROFIL & BIO
function renderProfileSection(lang) {
    const p = aboutPageData.profile;
    if (!p) return;

    const bannerImg = document.getElementById('profile-banner-img');
    if (bannerImg && p.banner) {
        bannerImg.src = p.banner;
        if (p.bannerAlt) bannerImg.alt = p.bannerAlt;
    }

    const avatarImg = document.getElementById('profile-img');
    if (avatarImg && p.avatar) {
        avatarImg.src = p.avatar;
        if (p.avatarAlt) avatarImg.alt = p.avatarAlt;
    }

    const nameEl = document.getElementById('profile-name');
    if (nameEl && p.name) {
        nameEl.innerHTML = p.name[lang] || p.name['id'] || '';
    }

    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) {
        if (p.username) {
            const userStr = p.username.startsWith('@') ? p.username : `@${p.username}`;
            usernameEl.textContent = userStr;
            usernameEl.style.display = 'inline';
        } else {
            usernameEl.style.display = 'none';
        }
    }

    const pronounsEl = document.getElementById('profile-pronouns');
    if (pronounsEl) {
        const pronounsText = p.pronouns
            ? (typeof p.pronouns === 'object' ? (p.pronouns[lang] || p.pronouns['id']) : p.pronouns)
            : '';
        if (pronounsText) {
            pronounsEl.textContent = pronounsText;
            pronounsEl.style.display = 'inline-block';
        } else {
            pronounsEl.style.display = 'none';
        }
    }

    const roleEl = document.getElementById('profile-role');
    if (roleEl && p.role) {
        roleEl.innerHTML = p.role[lang] || p.role['id'] || '';
    }

    const locSpan = document.getElementById('profile-location-span');
    if (locSpan && p.location) {
        locSpan.innerHTML = p.location[lang] || p.location['id'] || '';
    }

    const bioEl = document.getElementById('profile-bio-text');
    if (bioEl && p.bio) {
        bioEl.innerHTML = p.bio[lang] || p.bio['id'] || '';
    }
}

// 2. RENDER TECH STACK
function renderTechStackSection(lang) {
    const container = document.getElementById('tech-stack-container');
    const data = aboutPageData.techStack;
    if (!container || !data || !data.length) return;

    container.innerHTML = '';

    data.forEach(cat => {
        const categoryTitle = cat.category[lang] || cat.category['id'] || '';

        const itemsHtml = cat.items.map(item => {
            const iconMarkup = item.type === 'image'
                ? `<img src="${item.icon}" alt="${item.name}" width="50px">`
                : `<i class="${item.icon}"></i>`;

            return `
                <div class="tech-icon-item">
                    ${iconMarkup}
                    <span>${item.name}</span>
                </div>
            `;
        }).join('');

        const catEl = document.createElement('div');
        catEl.className = 'tech-category';
        catEl.innerHTML = `
            <h3 class="tech-category-title">${categoryTitle}</h3>
            <div class="tech-icons">
                ${itemsHtml}
            </div>
        `;
        container.appendChild(catEl);
    });

    if (typeof anime !== 'undefined' && container.children.length > 0) {
        anime({
            targets: '#tech-stack-container .tech-category',
            opacity: [0, 1],
            translateY: [40, 0],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }
}

// 3. RENDER PENGALAMAN
function renderExperienceSection(lang) {
    const container = document.getElementById('experience-timeline');
    const data = aboutPageData.experience;
    if (!container || !data) return;

    container.innerHTML = '';

    data.forEach(item => {
        const titleText = item.title[lang] || item.title['id'] || '';
        const companyText = item.company[lang] || item.company['id'] || '';
        const periodText = item.period[lang] || item.period['id'] || '';
        const descText = item.description[lang] || item.description['id'] || '';

        let certHtml = '';
        if (item.certificate && item.certificate.url) {
            const certLabel = item.certificate.label ? (item.certificate.label[lang] || item.certificate.label['id']) : 'Lihat Sertifikat';
            certHtml = `
                <a href="${item.certificate.url}" target="_blank" rel="noopener noreferrer" class="timeline-cert-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    <span>${certLabel}</span>
                </a>
            `;
        }

        const itemEl = document.createElement('div');
        itemEl.className = 'timeline-item';
        itemEl.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <div class="timeline-logo">
                        <img src="${item.logo}" alt="${item.logoAlt || 'Logo'}">
                    </div>
                    <div class="timeline-details">
                        <h3 class="timeline-title">${titleText}</h3>
                        <p class="timeline-company">${companyText}</p>
                        <p class="timeline-period">${periodText}</p>
                    </div>
                </div>
                <p class="timeline-desc">${descText}</p>
                ${certHtml}
            </div>
        `;
        container.appendChild(itemEl);
    });

    if (typeof anime !== 'undefined' && container.children.length > 0) {
        anime({
            targets: '#experience-timeline .timeline-item',
            opacity: [0, 1],
            translateY: [40, 0],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }
}

// 4. RENDER PENDIDIKAN & SERTIFIKASI
function renderEducationSection(lang) {
    const container = document.getElementById('education-container');
    const data = aboutPageData.education;
    if (!container || !data) return;

    container.innerHTML = '';

    // Formal Education
    if (data.education && Array.isArray(data.education)) {
        data.education.forEach(item => {
            const degreeText = item.degree[lang] || item.degree['id'] || '';
            const schoolText = item.school[lang] || item.school['id'] || '';
            const yearText = item.year[lang] || item.year['id'] || '';
            const descText = item.description[lang] || item.description['id'] || '';

            const itemEl = document.createElement('div');
            itemEl.className = 'pendidikan-item';

            const iconHtml = item.iconType === 'image'
                ? `<img src="${item.icon}" alt="${degreeText}" style="width: 140px; height: 140px; object-fit: contain;">`
                : (item.icon || '🎓');

            itemEl.innerHTML = `
                <div class="pendidikan-icon">${iconHtml}</div>
                <div class="pendidikan-content">
                    <h3 class="pendidikan-degree">${degreeText}</h3>
                    <p class="pendidikan-school">${schoolText}</p>
                    <p class="pendidikan-year">${yearText}</p>
                    <p class="pendidikan-desc">${descText}</p>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    // Certifications Section
    if (data.certificationsSection) {
        const certSection = data.certificationsSection;
        const certTitleText = certSection.title[lang] || certSection.title['id'] || '';
        const certProviderText = certSection.provider[lang] || certSection.provider['id'] || '';
        const certPeriodText = certSection.period[lang] || certSection.period['id'] || '';

        let certCardsHtml = '';
        if (certSection.items && Array.isArray(certSection.items)) {
            certCardsHtml = certSection.items.map(cert => {
                const certTitle = cert.title[lang] || cert.title['id'] || '';
                const certIssuer = cert.issuer[lang] || cert.issuer['id'] || '';
                return `
                    <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="certificate-card">
                        <div class="cert-icon">${cert.icon || '💻'}</div>
                        <div class="cert-info">
                            <h4>${certTitle}</h4>
                            <p>${certIssuer}</p>
                        </div>
                        <span class="cert-link-icon">↗</span>
                    </a>
                `;
            }).join('');
        }

        const certSectionEl = document.createElement('div');
        certSectionEl.className = 'pendidikan-item';
        certSectionEl.innerHTML = `
            <div class="pendidikan-icon">${certSection.icon || '📜'}</div>
            <div class="pendidikan-content">
                <h3 class="pendidikan-degree">${certTitleText}</h3>
                <p class="pendidikan-school">${certProviderText}</p>
                <p class="pendidikan-year">${certPeriodText}</p>
                <div class="certificate-cards">
                    ${certCardsHtml}
                </div>
            </div>
        `;
        container.appendChild(certSectionEl);
    }
}

// SECTION: EVENT LISTENERS
window.addEventListener('languageChanged', () => {
    renderAllAboutPage();
});

document.addEventListener('DOMContentLoaded', () => {
    loadAboutPageData();
});
