document.addEventListener('DOMContentLoaded', () => {
    console.log('Operational Status: System v1.6.0 - Muhammad Saifulloh [MULTI_LANG_ENABLED]');

    // --- Language Logic ---
    const langPicker = document.getElementById('lang-picker');
    const currentLang = localStorage.getItem('selectedLang') || 'en';

    let repoData = [];

    function applyTranslations(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        localStorage.setItem('selectedLang', lang);
        
        // Update marquee labels if data already exists
        if (repoData.length > 0) renderMarquee(lang);
    }

    if (langPicker) {
        langPicker.value = localStorage.getItem('selectedLang') || 'en';
        langPicker.addEventListener('change', (e) => applyTranslations(e.target.value));
    }

    applyTranslations(localStorage.getItem('selectedLang') || 'en');

    // --- Modal Logic: Mechanical-Humanist ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeBtn = document.getElementById('modal-close');

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const imgPath = card.getAttribute('data-img');
            const title = card.querySelector('h4').textContent;
            const desc = card.getAttribute('data-tech-desc') || 'Project Technical Overview. All systems operational.';
            
            if (imgPath) {
                modalImg.src = imgPath;
                modalTitle.textContent = title;
                modalDesc.textContent = desc;
                modal.classList.add('active');
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // --- GitHub Dynamic Activity ---
    async function fetchGitHubData() {
        const username = 'saiflll';
        const repoContainer = document.getElementById('github-repos');
        
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`);
            const repos = await response.json();
            
            if (repoContainer) {
                repoContainer.innerHTML = repos.map(repo => `
                    <a href="${repo.html_url}" target="_blank" class="repo-card block">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-white text-sm tracking-tight">${repo.name}</h4>
                            <span class="text-[9px] font-mono text-eng uppercase">${repo.language || 'Code'}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 line-clamp-2 mb-3">
                            ${repo.description || 'No description available for this critical industrial module.'}
                        </p>
                        <div class="flex items-center gap-4 text-[9px] font-mono text-slate-600">
                            <span>⭐ ${repo.stargazers_count}</span>
                            <span>🔄 ${new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) {
            console.error('Core Telemetry Error: Failed to fetch GitHub activity.', error);
        }
    }

    fetchGitHubData();

    // --- Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('mobile-nav-active');
            
            // Toggle hamburger animation if icons exist
            const menuIcon = mobileMenuBtn.querySelector('.menu-icon');
            const closeIcon = mobileMenuBtn.querySelector('.close-icon');
            if (menuIcon && closeIcon) {
                menuIcon.classList.toggle('hidden');
                closeIcon.classList.toggle('hidden');
            }
        });

        // Close menu when clicking a link
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.classList.remove('mobile-nav-active');
            });
        });
    }

    // --- CV Dropdown Click Support (Mobile/Touch) ---
    const cvToggle = document.getElementById('cv-toggle');
    const cvDropdown = document.getElementById('cv-dropdown');

    if (cvToggle && cvDropdown) {
        cvToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            cvDropdown.classList.toggle('active-click');
        });

        document.addEventListener('click', (e) => {
            if (!cvDropdown.contains(e.target)) {
                cvDropdown.classList.remove('active-click');
            }
        });
    }

    // --- Auto-scrolling Repo Showcase ---
    function renderMarquee(lang) {
        const marquee = document.getElementById('repo-marquee');
        if (!marquee || repoData.length === 0) return;

        const itemsHtml = repoData.map(repo => {
            const statusLabel = repo.private ? 
                (translations[lang]?.status_private || '🔒 Private Mission') : 
                (translations[lang]?.status_public || '🌐 Public Interface');
            
            return `
                <div class="repo-marquee-item">
                    <div class="repo-status ${repo.private ? 'status-private' : 'status-public'}">
                        ${statusLabel}
                    </div>
                    <h4 class="text-white font-black italic mb-2 uppercase tracking-tight">${repo.name}</h4>
                    <p class="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">${repo.description}</p>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-mono text-slate-400 p-1 bg-white/5 rounded border border-white/5">${repo.language || 'Binary'}</span>
                    </div>
                </div>
            `;
        }).join('');

        marquee.innerHTML = itemsHtml + itemsHtml;
    }

    async function initRepoMarquee() {
        const marquee = document.getElementById('repo-marquee');
        if (!marquee) return;

        // Determine correct path to repos_data.json regardless of page depth
        const pathPrefix = window.location.pathname.includes('/page/') ? '../' : './';
        
        try {
            const response = await fetch(pathPrefix + 'repos_data.json');
            if (!response.ok) throw new Error('Data telemetry source offline.');
            repoData = await response.json();
            renderMarquee(localStorage.getItem('selectedLang') || 'en');
        } catch (error) {
            console.warn('Showcase Telemetry Error: Loading fallback data.');
            // Fallback for local testing if file is missing or fetch fails (CORS)
            repoData = [
                { name: "system-core-alpha", private: true, description: "Automated mission-critical orchestration module.", language: "Go" },
                { name: "legacy-bridge-v1", private: true, description: "Industrial hardware bus decoder and telemetry sync.", language: "C++" },
                { name: "saiflll-interface", private: false, description: "Dynamic portfolio project with real-time GitHub sync.", language: "JavaScript" }
            ];
            renderMarquee(localStorage.getItem('selectedLang') || 'en');
        }
    }

    initRepoMarquee();
});
