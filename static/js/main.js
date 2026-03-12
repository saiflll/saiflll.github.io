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
        if (!marquee) return;

        // If no data, show a "Systems initializing" placeholder
        if (repoData.length === 0) {
            marquee.innerHTML = `<div class="p-10 text-slate-500 font-mono text-[10px] animate-pulse">/ INITIALIZING REPOSITORY TELEMETRY...</div>`;
            return;
        }

        const itemsHtml = repoData.map(repo => {
            const statusLabel = repo.is_private ? 
                (translations[lang]?.status_private || '🔒 Private Mission') : 
                (translations[lang]?.status_public || '🌐 Public Interface');
            
            return `
                <div class="repo-marquee-item">
                    <div class="repo-status ${repo.is_private ? 'status-private' : 'status-public'}">
                        ${statusLabel}
                    </div>
                    <h4 class="text-white font-black italic mb-2 uppercase tracking-tight">${repo.name}</h4>
                    <p class="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">${repo.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-[9px] font-mono text-eng font-bold p-1 px-2 bg-eng/10 rounded border border-eng/20 uppercase tracking-widest">${repo.tech_stack}</span>
                        <span class="text-[8px] font-mono text-slate-600 uppercase italic">${repo.last_update}</span>
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
            
            // If the file exists but is empty (GitHub Action error), force fallback
            if (!repoData || repoData.length === 0) {
                throw new Error('Data stream empty.');
            }
            
            renderMarquee(localStorage.getItem('selectedLang') || 'en');
        } catch (error) {
            console.warn('Showcase Telemetry Error: Loading fallback data.');
            // Fallback for local testing if file is missing or fetch fails (CORS)
            repoData = [
                { name: "system-core-alpha", is_private: true, description: "Automated mission-critical orchestration module.", tech_stack: "Go", last_update: "2026-03-12" },
                { name: "legacy-bridge-v1", is_private: true, description: "Industrial hardware bus decoder and telemetry sync.", tech_stack: "C++", last_update: "2026-03-11" },
                { name: "saiflll-interface", is_private: false, description: "Dynamic portfolio project with real-time GitHub sync.", tech_stack: "JavaScript", last_update: "2026-03-10" }
            ];
            renderMarquee(localStorage.getItem('selectedLang') || 'en');
        }
    }

    // --- Serial Monitor Simulator ---
    function initSerialMonitor() {
        const logContainer = document.getElementById('serial-logs');
        if (!logContainer) return;

        const logTypes = [
            { label: 'INFO', color: 'text-eng-light' },
            { label: 'SYNC', color: 'text-dev-light' },
            { label: 'PROC', color: 'text-slate-400' },
            { label: 'WARN', color: 'text-amber-500' },
            { label: 'INIT', color: 'text-blue-400' }
        ];

        const actions = [
            "Handshake with PLC_S7_BRG established",
            "Gateway telemetry sync [OK]",
            "K8s pod cluster internal scaling...",
            "RS485 Modbus packet decoding...",
            "JWT verification for encrypted OTA",
            "Energy profile optimized via LoRaWAN",
            "WMS core rebalancing sub-services",
            "Hardware buffer overflow prevented",
            "New activity detected on saiflll/core",
            "Database commit: Indexing 102 repos",
            "Uptime check: 99.98% system stable",
            "Reverse engineering bitstream [1/10]",
            "TCP connection secured on port 502",
            "Cloud-native blueprint deploying..."
        ];

        function addLog() {
            const now = new Date();
            const time = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds();
            const type = logTypes[Math.floor(Math.random() * logTypes.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];

            const logLine = document.createElement('div');
            logLine.className = 'flex gap-2';
            logLine.innerHTML = `
                <span class="text-slate-600">[${time}]</span>
                <span class="${type.color} font-bold">[${type.label}]</span>
                <span class="truncate">${action}</span>
            `;

            logContainer.appendChild(logLine);
            logContainer.scrollTop = logContainer.scrollHeight;

            // Keep log count under 50 for performance
            if (logContainer.children.length > 50) {
                logContainer.removeChild(logContainer.firstChild);
            }

            // Randomize next log timing
            setTimeout(addLog, Math.random() * 2000 + 500);
        }

        // Start the sequence
        addLog();
    }

    initRepoMarquee();
    initSerialMonitor();
});
