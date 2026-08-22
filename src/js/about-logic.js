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

// Track state for tech stack expand/collapse
let isTechStackExpanded = false;

// 2. RENDER TECH STACK
function renderTechStackSection(lang) {
    const container = document.getElementById('tech-stack-container');
    const data = aboutPageData.techStack;
    if (!container || !data || !data.length) return;

    container.innerHTML = '';

    const initialVisibleCount = 2;

    data.forEach((cat, index) => {
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
        if (index >= initialVisibleCount && !isTechStackExpanded) {
            catEl.classList.add('tech-category-hidden');
        }

        catEl.innerHTML = `
            <h3 class="tech-category-title">${categoryTitle}</h3>
            <div class="tech-icons">
                ${itemsHtml}
            </div>
        `;
        container.appendChild(catEl);
    });

    // Add See More / See Less Button if category count > initialVisibleCount
    if (data.length > initialVisibleCount) {
        const fadeOverlay = document.createElement('div');
        fadeOverlay.className = `tech-stack-fade-overlay ${isTechStackExpanded ? 'hidden' : ''}`;
        container.appendChild(fadeOverlay);

        const seeMoreWrapper = document.createElement('div');
        seeMoreWrapper.className = `see-more-container ${isTechStackExpanded ? 'expanded' : ''}`;
        
        const seeMoreText = lang === 'en' ? 'See More Tech Stack' : 'Lihat Selengkapnya';
        const seeLessText = lang === 'en' ? 'Show Less' : 'Lihat Lebih Sedikit';
        const btnLabel = isTechStackExpanded ? seeLessText : seeMoreText;

        seeMoreWrapper.innerHTML = `
            <button type="button" class="btn-see-more ${isTechStackExpanded ? 'expanded' : ''}" id="btn-toggle-techstack">
                <span class="btn-see-more-label">${btnLabel}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
        `;
        container.appendChild(seeMoreWrapper);

        const btnToggle = seeMoreWrapper.querySelector('#btn-toggle-techstack');
        btnToggle.addEventListener('click', () => {
            isTechStackExpanded = !isTechStackExpanded;

            fadeOverlay.classList.toggle('hidden', isTechStackExpanded);
            seeMoreWrapper.classList.toggle('expanded', isTechStackExpanded);

            const hiddenCats = container.querySelectorAll('.tech-category');
            hiddenCats.forEach((el, idx) => {
                if (idx >= initialVisibleCount) {
                    if (isTechStackExpanded) {
                        el.classList.remove('tech-category-hidden');
                    } else {
                        el.classList.add('tech-category-hidden');
                    }
                }
            });

            btnToggle.classList.toggle('expanded', isTechStackExpanded);
            const labelSpan = btnToggle.querySelector('.btn-see-more-label');
            if (labelSpan) {
                labelSpan.textContent = isTechStackExpanded ? seeLessText : seeMoreText;
            }

            if (isTechStackExpanded && typeof anime !== 'undefined') {
                const newlyVisible = Array.from(hiddenCats).slice(initialVisibleCount);
                anime({
                    targets: newlyVisible,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    easing: 'easeOutExpo',
                    duration: 500,
                    delay: anime.stagger(80)
                });
            } else if (!isTechStackExpanded) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (typeof anime !== 'undefined' && container.children.length > 0) {
        const visibleCats = container.querySelectorAll('.tech-category:not(.tech-category-hidden)');
        anime({
            targets: visibleCats,
            opacity: [0, 1],
            translateY: [40, 0],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }
}

// Track state for experience expand/collapse
let isExperienceExpanded = false;

// 3. RENDER PENGALAMAN
function renderExperienceSection(lang) {
    const container = document.getElementById('experience-timeline');
    const data = aboutPageData.experience;
    if (!container || !data) return;

    container.innerHTML = '';

    const initialVisibleCount = 1;

    data.forEach((item, index) => {
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
        if (index >= initialVisibleCount && !isExperienceExpanded) {
            itemEl.classList.add('timeline-item-hidden');
        }

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

    // Add See More / See Less Button if experience count > initialVisibleCount
    if (data.length > initialVisibleCount) {
        // Create Gradient Fade Overlay Element
        const fadeOverlay = document.createElement('div');
        fadeOverlay.className = `timeline-fade-overlay ${isExperienceExpanded ? 'hidden' : ''}`;
        container.appendChild(fadeOverlay);

        const seeMoreWrapper = document.createElement('div');
        seeMoreWrapper.className = `see-more-container ${isExperienceExpanded ? 'expanded' : ''}`;
        
        const seeMoreText = lang === 'en' ? 'See More Experience' : 'Lihat Selengkapnya';
        const seeLessText = lang === 'en' ? 'Show Less' : 'Lihat Lebih Sedikit';
        const btnLabel = isExperienceExpanded ? seeLessText : seeMoreText;

        seeMoreWrapper.innerHTML = `
            <button type="button" class="btn-see-more ${isExperienceExpanded ? 'expanded' : ''}" id="btn-toggle-experience">
                <span class="btn-see-more-label">${btnLabel}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
        `;
        container.appendChild(seeMoreWrapper);

        const btnToggle = seeMoreWrapper.querySelector('#btn-toggle-experience');
        btnToggle.addEventListener('click', () => {
            isExperienceExpanded = !isExperienceExpanded;

            fadeOverlay.classList.toggle('hidden', isExperienceExpanded);
            seeMoreWrapper.classList.toggle('expanded', isExperienceExpanded);

            const hiddenItems = container.querySelectorAll('.timeline-item');
            hiddenItems.forEach((el, idx) => {
                if (idx >= initialVisibleCount) {
                    if (isExperienceExpanded) {
                        el.classList.remove('timeline-item-hidden');
                    } else {
                        el.classList.add('timeline-item-hidden');
                    }
                }
            });

            btnToggle.classList.toggle('expanded', isExperienceExpanded);
            const labelSpan = btnToggle.querySelector('.btn-see-more-label');
            if (labelSpan) {
                labelSpan.textContent = isExperienceExpanded ? seeLessText : seeMoreText;
            }

            if (isExperienceExpanded && typeof anime !== 'undefined') {
                const newlyVisible = Array.from(hiddenItems).slice(initialVisibleCount);
                anime({
                    targets: newlyVisible,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    easing: 'easeOutExpo',
                    duration: 500,
                    delay: anime.stagger(80)
                });
            } else if (!isExperienceExpanded) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (typeof anime !== 'undefined' && container.children.length > 0) {
        const visibleItems = container.querySelectorAll('.timeline-item:not(.timeline-item-hidden)');
        anime({
            targets: visibleItems,
            opacity: [0, 1],
            translateY: [40, 0],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }
}

// Track state for education expand/collapse
let isEducationExpanded = false;

// 4. RENDER PENDIDIKAN & SERTIFIKASI
function renderEducationSection(lang) {
    const container = document.getElementById('education-container');
    const data = aboutPageData.education;
    if (!container || !data) return;

    container.innerHTML = '';

    const initialVisibleCount = 1;
    let totalItemCount = 0;

    // Formal Education
    if (data.education && Array.isArray(data.education)) {
        data.education.forEach(item => {
            const degreeText = item.degree[lang] || item.degree['id'] || '';
            const schoolText = item.school[lang] || item.school['id'] || '';
            const yearText = item.year[lang] || item.year['id'] || '';
            const descText = item.description[lang] || item.description['id'] || '';

            const itemEl = document.createElement('div');
            itemEl.className = 'pendidikan-item';
            if (totalItemCount >= initialVisibleCount && !isEducationExpanded) {
                itemEl.classList.add('pendidikan-item-hidden');
            }

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
            totalItemCount++;
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
        if (totalItemCount >= initialVisibleCount && !isEducationExpanded) {
            certSectionEl.classList.add('pendidikan-item-hidden');
        }

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
        totalItemCount++;
    }

    // Add See More / See Less Button if totalItemCount > initialVisibleCount
    if (totalItemCount > initialVisibleCount) {
        const fadeOverlay = document.createElement('div');
        fadeOverlay.className = `education-fade-overlay ${isEducationExpanded ? 'hidden' : ''}`;
        container.appendChild(fadeOverlay);

        const seeMoreWrapper = document.createElement('div');
        seeMoreWrapper.className = `see-more-container ${isEducationExpanded ? 'expanded' : ''}`;
        
        const seeMoreText = lang === 'en' ? 'See More Education & Certifications' : 'Lihat Selengkapnya';
        const seeLessText = lang === 'en' ? 'Show Less' : 'Lihat Lebih Sedikit';
        const btnLabel = isEducationExpanded ? seeLessText : seeMoreText;

        seeMoreWrapper.innerHTML = `
            <button type="button" class="btn-see-more ${isEducationExpanded ? 'expanded' : ''}" id="btn-toggle-education">
                <span class="btn-see-more-label">${btnLabel}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
        `;
        container.appendChild(seeMoreWrapper);

        const btnToggle = seeMoreWrapper.querySelector('#btn-toggle-education');
        btnToggle.addEventListener('click', () => {
            isEducationExpanded = !isEducationExpanded;

            fadeOverlay.classList.toggle('hidden', isEducationExpanded);
            seeMoreWrapper.classList.toggle('expanded', isEducationExpanded);

            const hiddenItems = container.querySelectorAll('.pendidikan-item');
            hiddenItems.forEach((el, idx) => {
                if (idx >= initialVisibleCount) {
                    if (isEducationExpanded) {
                        el.classList.remove('pendidikan-item-hidden');
                    } else {
                        el.classList.add('pendidikan-item-hidden');
                    }
                }
            });

            btnToggle.classList.toggle('expanded', isEducationExpanded);
            const labelSpan = btnToggle.querySelector('.btn-see-more-label');
            if (labelSpan) {
                labelSpan.textContent = isEducationExpanded ? seeLessText : seeMoreText;
            }

            if (isEducationExpanded && typeof anime !== 'undefined') {
                const newlyVisible = Array.from(hiddenItems).slice(initialVisibleCount);
                anime({
                    targets: newlyVisible,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    easing: 'easeOutExpo',
                    duration: 500,
                    delay: anime.stagger(80)
                });
            } else if (!isEducationExpanded) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (typeof anime !== 'undefined' && container.children.length > 0) {
        const visibleEdu = container.querySelectorAll('.pendidikan-item:not(.pendidikan-item-hidden)');
        anime({
            targets: visibleEdu,
            opacity: [0, 1],
            translateY: [40, 0],
            easing: 'easeOutExpo',
            duration: 600,
            delay: anime.stagger(100)
        });
    }
}

// SECTION: EVENT LISTENERS
window.addEventListener('languageChanged', () => {
    renderAllAboutPage();
});

document.addEventListener('DOMContentLoaded', () => {
    loadAboutPageData();
});
