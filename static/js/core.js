/**
 * CORE ENGINE — Portfolio v4.0
 * Fixes: project cards, privacy badges, lang switcher, dark/light toggle, header links
 */

const CONFIG = {
    IP_API: 'https://ipapi.co/json/',
    REPO_DATA: (() => {
        const p = document.location.pathname;
        if (p.match(/\/page\/[^/]+\//)) return '../../repos_data.json';
        if (p.includes('/page/')) return '../repos_data.json';
        return 'repos_data.json';
    })()
};

// ─── THEME MANAGER ────────────────────────────────────────────────────────────
const Theme = {
    current: localStorage.getItem('theme') || 'dark',

    apply(mode) {
        if (mode === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
        this.current = mode;
        localStorage.setItem('theme', mode);
        this.updateIcon();
    },

    toggle() {
        this.apply(this.current === 'dark' ? 'light' : 'dark');
    },

    updateIcon() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        if (this.current === 'light') {
            btn.innerHTML = `<!-- Moon icon -->
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>`;
            btn.title = 'Switch to Dark Mode';
        } else {
            btn.innerHTML = `<!-- Sun icon -->
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>`;
            btn.title = 'Switch to Light Mode';
        }
    },

    init() {
        this.apply(this.current);
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggle());
    }
};

// ─── MODAL SINGLETON ─────────────────────────────────────────────────────────
const Modal = {
    el: null, img: null, title: null, desc: null,

    init() {
        this.el = document.getElementById('image-modal');
        this.img = document.getElementById('modal-img');
        this.title = document.getElementById('modal-title');
        this.desc = document.getElementById('modal-desc');
        if (!this.el) return;

        document.getElementById('modal-close')?.addEventListener('click', () => this.close());
        this.el.addEventListener('click', (e) => { if (e.target === this.el) this.close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    },

    open(imgSrc, titleText, htmlDesc, plainDesc) {
        if (!this.el) return;
        this.title.innerText = titleText || '';

        if (imgSrc && imgSrc.trim()) {
            this.img.src = imgSrc;
            this.img.style.display = 'block';
        } else {
            this.img.src = '';
            this.img.style.display = 'none';
        }

        if (htmlDesc) {
            this.desc.innerHTML = htmlDesc;
        } else {
            this.desc.innerHTML = '';
            this.desc.innerText = plainDesc || '';
        }

        this.el.style.display = 'flex';
        requestAnimationFrame(() => this.el.classList.add('active'));
    },

    close() {
        if (!this.el) return;
        this.el.classList.remove('active');
        setTimeout(() => { this.el.style.display = 'none'; }, 300);
    }
};

window.Modal = Modal; // Expose globally
window.openProjectModal = (title, descOrHtml, img, isHtml) => {
    if (isHtml) Modal.open(img, title, descOrHtml, null);
    else Modal.open(img, title, null, descOrHtml);
};

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
class PortfolioEngine {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.projects = [];
        this.userIP = '—';
        this.init();
    }

    async init() {
        Theme.init();
        this.updateDynamicYears();
        Modal.init();
        this.applyTranslations();
        this.setupNav();
        this.setupCVDropdown();

        if (document.getElementById('project-container')) {
            await this.loadData();
        }
        if (document.getElementById('about')) {
            this.injectServiceHub();
        }
        if (document.getElementById('serial-logs')) {
            this.initSniffing();
        }
        if (document.getElementById('github-repos')) {
            this.initGithubActivity();
        }
        this.bindStaticCards();
    }

    // ── DYNAMIC YEARS ─────────────────────────────────────────────────────────
    updateDynamicYears() {
        const startYear = 2020, startMonth = 4;
        const now = new Date();
        let years = now.getFullYear() - startYear;
        if (now.getMonth() < startMonth) years--;
        if (window.translations) {
            Object.keys(window.translations).forEach(lk => {
                if (lk === 'projects') return;
                const l = window.translations[lk];
                if (l.exp_years) l.exp_years = l.exp_years.replace(/\d+/, years);
            });
        }
        const el = document.getElementById('runtime-years');
        if (el) el.innerText = `${years}Y`;
    }

    // ── TRANSLATIONS ──────────────────────────────────────────────────────────
    applyTranslations() {
        const lang = translations[this.currentLang];
        if (!lang) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (lang[key] !== undefined) el.innerHTML = lang[key];
        });
        document.documentElement.lang = this.currentLang;
        const picker = document.getElementById('lang-picker');
        if (picker) picker.value = this.currentLang;
    }

    // ── NAVIGATION ────────────────────────────────────────────────────────────
    setupNav() {
        document.getElementById('lang-picker')?.addEventListener('change', (e) => {
            localStorage.setItem('lang', e.target.value);
            location.reload();
        });

        const menuBtn = document.getElementById('mobile-menu-btn');
        const overlay = document.getElementById('mobile-menu');
        const menuIcon = menuBtn?.querySelector('.menu-icon');
        const closeIcon = menuBtn?.querySelector('.close-icon');

        menuBtn?.addEventListener('click', () => {
            const isOpen = overlay.classList.toggle('active');
            menuIcon?.classList.toggle('hidden', isOpen);
            closeIcon?.classList.toggle('hidden', !isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        overlay?.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                overlay.classList.remove('active');
                menuIcon?.classList.remove('hidden');
                closeIcon?.classList.add('hidden');
                document.body.style.overflow = '';
            });
        });
    }

    // ── CV DROPDOWN ───────────────────────────────────────────────────────────
    setupCVDropdown() {
        const cvToggle = document.getElementById('cv-toggle');
        const cvDropdown = document.getElementById('cv-dropdown');
        if (!cvToggle || !cvDropdown) return;
        cvToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            cvDropdown.classList.toggle('active-click');
        });
        document.addEventListener('click', () => cvDropdown.classList.remove('active-click'));
    }

    // ── PROJECT DATA LOADING ──────────────────────────────────────────────────
    async loadData() {
        const localProjects = translations.projects || [];
        let githubProjects = [];

        try {
            const res = await fetch(CONFIG.REPO_DATA);
            if (res.ok) {
                const data = await res.json();
                githubProjects = data.map((repo, i) => ({
                    id: `gh-${i}`,
                    title: repo.name.replace(/-/g, ' '),
                    desc: repo.description || 'Engineering Project',
                    // Primary: tech_stack strictly determines Engineering (C, C++, Rust are hardware/low-level)
                    // Secondary: Mixed tech can be Engineering if category is hardware
                    type: (() => {
                        const t = (repo.tech_stack || '').toLowerCase();
                        if (['c++', 'c', 'rust'].includes(t)) return 'Engineering';
                        if (['mixed', 'mixed tech', ''].includes(t) && repo.category === 'hardware') return 'Engineering';
                        return 'Development'; // Force Go, Dart, TS, etc. to Development
                    })(),
                    category: repo.category || 'hardware',
                    image: repo.img || '',
                    tags: [repo.tech_stack || 'Mixed'],
                    isPrivate: repo.is_private || false,
                    techDesc: (() => {
                        const ghUrl = repo.github_url || `https://github.com/saiflll/${repo.name}`;
                        const parts = [
                            `<p class="modal-project-desc">${repo.description || ''}</p>`
                        ];
                        const links = [];
                        if (repo.doc) {
                            links.push(`
                                <a href="${repo.doc}" target="_blank" rel="noopener" class="modal-link-btn">
                                    <span class="modal-link-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                            <polyline points="10 9 9 9 8 9"/>
                                        </svg>
                                    </span>
                                    <span>View Documentation</span>
                                    <svg class="modal-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
                                </a>`);
                        }
                        links.push(`
                            <a href="${ghUrl}" target="_blank" rel="noopener" class="modal-link-btn modal-link-github">
                                <span class="modal-link-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                    </svg>
                                </span>
                                <span>View on GitHub</span>
                                <svg class="modal-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
                            </a>`);
                        if (links.length) parts.push(`<div class="modal-links-row">${links.join('')}</div>`);
                        parts.push(`<p class="modal-last-updated">🕐 Last updated: ${repo.last_update || '—'}</p>`);
                        return parts.join('');
                    })(),
                    link: repo.github_url || `https://github.com/saiflll/${repo.name}`
                }));
            }
        } catch (e) {
            console.warn('[Engine] GitHub sync offline — using local data.');
        }

        this.projects = [...localProjects, ...githubProjects];

        const deployCountEl = document.getElementById('deploy-count');
        if (deployCountEl) deployCountEl.innerText = `${this.projects.length}+`;

        this.renderProjects();
        this.prepareFilters();
    }

    // ── PRIVACY BADGE HTML ────────────────────────────────────────────────────
    _privacyBadge(isPrivate) {
        const lang = translations[this.currentLang] || translations['en'];
        if (isPrivate) {
            return `<span class="privacy-badge private">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>${lang.private_badge || 'Private'}</span>`;
        }
        return `<span class="privacy-badge public">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/>
            </svg>${lang.public_badge || 'Public'}</span>`;
    }

    // ── RENDER PROJECT CARDS ──────────────────────────────────────────────────
    renderProjects(activeFilter = 'all') {
        const container = document.getElementById('project-container');
        if (!container) return;

        const filtered = activeFilter === 'all'
            ? this.projects
            : this.projects.filter(p => p.category === activeFilter);

        if (filtered.length === 0) {
            container.innerHTML = `<p class="text-slate-600 font-mono text-sm py-12 px-6">
                // No units found matching this filter.
            </p>`;
            return;
        }

        container.innerHTML = filtered.map((p, idx) => {
            const isDevType = p.category === 'logic' || p.category === 'support';
            const catClass = isDevType ? 'dev' : '';
            const catLabel = p.category ? p.category.toUpperCase() : 'PROJECT';
            return `
            <div class="project-card glass-card rounded-[2rem] cursor-pointer fade-up fade-up-${Math.min(idx + 1, 5)}"
                style="height:30vh;"
                data-category="${p.category}"
                data-img="${this._esc(p.image)}"
                data-tech-desc="${this._esc(p.techDesc)}"
                data-tech-desc-html="1"
                data-title="${this._esc(p.title)}">
                <div class="project-card-inner">
                    <div class="project-card-top">
                        <span class="project-card-category ${catClass}">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
                            ${catLabel}
                        </span>
                        ${this._privacyBadge(p.isPrivate)}
                    </div>
                    <h4 class="project-card-title">${p.title}</h4>
                    <p class="project-card-desc">${(p.desc || '').replace(/<\/?[^>]+(>|$)/g, "")}</p>
                    <div class="project-card-footer">
                        ${p.tags.map(t => `<span class="${isDevType ? 'dev-tag' : 'tech-tag'}">${t}</span>`).join('')}
                        <span class="project-card-cta">
                            Details
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                    </div>
                </div>
            </div>`;
        }).join('');

        this.bindStaticCards();
    }

    // ── FILTER BUTTONS ────────────────────────────────────────────────────────
    prepareFilters() {
        const hub = document.getElementById('filter-hub');
        if (!hub) return;

        const lang = translations[this.currentLang] || translations['en'];
        const categories = [
            {
                key: 'all', label: lang.filter_all || 'All',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
            },
            {
                key: 'hardware', label: lang.filter_hardware || 'Hardware',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/></svg>`
            },
            {
                key: 'logic', label: lang.filter_logic || 'Logic',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
            },
            {
                key: 'support', label: lang.filter_support || 'Support',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
            }
        ];

        hub.innerHTML = categories.map(c => `
            <button class="filter-btn flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-200 hover:border-eng/50 ${c.key === 'all' ? 'bg-eng text-white border-eng' : 'text-slate-500 bg-transparent'}"
                data-filter="${c.key}">
                <span class="btn-icon">${c.icon}</span>
                ${c.label}
            </button>`).join('');

        hub.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            const filter = btn.getAttribute('data-filter');
            hub.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-eng', 'text-white', 'border-eng');
                b.classList.add('text-slate-500', 'bg-transparent');
            });
            btn.classList.add('bg-eng', 'text-white', 'border-eng');
            btn.classList.remove('text-slate-500', 'bg-transparent');
            this.renderProjects(filter);
        });
    }

    // ── BIND MODAL ────────────────────────────────────────────────────────────
    bindStaticCards() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.onclick = () => {
                const img = card.getAttribute('data-img') || '';
                const title = card.getAttribute('data-title') || card.querySelector('h4')?.innerText || '';
                const raw = card.getAttribute('data-tech-desc') || '';
                const isHtml = card.hasAttribute('data-tech-desc-html');
                const desc = raw.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                Modal.open(img, title, isHtml ? desc : null, isHtml ? null : desc);
            };
        });
    }

    // ── SNIFFING TERMINAL ─────────────────────────────────────────────────────
    async initSniffing() {
        const log = document.getElementById('serial-logs');
        if (!log) return;
        const addLine = (text, cls = 'text-slate-500') => {
            const div = document.createElement('div');
            div.className = cls; div.innerText = text;
            log.appendChild(div); log.scrollTop = log.scrollHeight;
        };
        const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
        addLine(`[${now()}] Booting saiflll_core v4.0...`, 'text-slate-600');
        try {
            const res = await fetch(CONFIG.IP_API);
            const data = await res.json();
            this.userIP = data.ip || '—';
            addLine(`[${now()}] [SEC-SCAN]: Node ${data.ip} detected at ${data.city || '?'}, ${data.country_name || '?'}.`, 'text-eng font-bold');
            addLine(`[${now()}] Provider: ${data.org || 'Unknown'} | ASN: ${data.asn || '?'}`, 'text-slate-500');
        } catch {
            addLine(`[${now()}] Passive scan blocked by network policy.`, 'text-slate-600');
        }
        addLine(`[${now()}] System nominal. Standing by.`, 'text-green-600');
    }

    // ── GITHUB ACTIVITY ───────────────────────────────────────────────────────
    async initGithubActivity() {
        const container = document.getElementById('github-repos');
        if (!container) return;
        try {
            const res = await fetch('https://api.github.com/users/saiflll/events/public?per_page=10');
            if (!res.ok) throw new Error('API limit');
            const events = await res.json();
            if (!Array.isArray(events) || events.length === 0) {
                container.innerHTML = '<p class="text-slate-500 text-xs font-mono">No recent activity detected.</p>';
                return;
            }
            const valid = events.filter(e => ['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(e.type)).slice(0, 3);
            if (!valid.length) {
                container.innerHTML = '<p class="text-slate-500 text-xs font-mono">No recent pushes or created repos.</p>';
                return;
            }
            container.innerHTML = valid.map((e, idx) => {
                const repoName = e.repo.name.split('/')[1] || e.repo.name;
                const timeStr = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                let actionStr = 'Updated', iconWrapperClass = 'bg-dev/10 text-dev';
                let iconSvg = '<path d="M12 19V5M5 12l7-7 7 7"/>';
                if (e.type === 'PushEvent') {
                    const c = e.payload.commits?.length || 0;
                    actionStr = `Pushed ${c} commit${c !== 1 ? 's' : ''} to`;
                    iconWrapperClass = 'bg-eng/10 text-eng';
                    iconSvg = '<path d="M12 5v14m-7-7l7 7 7-7"/>';
                } else if (e.type === 'CreateEvent') {
                    actionStr = 'Created repository';
                    iconWrapperClass = 'bg-safety/10 text-safety';
                    iconSvg = '<path d="M12 5v14m-7-7h14"/>';
                } else if (e.type === 'PullRequestEvent') {
                    actionStr = `${e.payload.action} PR in`;
                    iconWrapperClass = 'bg-slate-700/50 text-slate-300';
                    iconSvg = '<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>';
                }
                return `
                <div class="glass-card p-4 rounded-xl border border-white/5 flex gap-4 hover:border-eng/30 transition-all cursor-crosshair group fade-up fade-up-${idx + 1}">
                    <div class="w-8 h-8 rounded-lg ${iconWrapperClass} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">${iconSvg}</svg>
                    </div>
                    <div>
                        <a href="https://github.com/${e.repo.name}" target="_blank" class="font-black text-white group-hover:text-eng transition-colors text-sm">${repoName}</a>
                        <p class="text-xs text-slate-400 mt-0.5">${actionStr}</p>
                        <p class="text-[9px] font-mono text-slate-500 mt-2 uppercase tracking-widest block">${timeStr}</p>
                    </div>
                </div>`;
            }).join('');
        } catch {
            container.innerHTML = '<p class="text-slate-500 text-[10px] uppercase tracking-widest font-mono border border-white/5 p-4 rounded-xl">ACTIVITY FEED OFFLINE</p>';
        }
    }

    // ── SERVICE HUB ───────────────────────────────────────────────────────────
    injectServiceHub() {
        const about = document.getElementById('about');
        if (!about || document.getElementById('whatsapp-form')) return;
        const grid = about.querySelector('.grid');
        if (!grid) return;
        const lang = translations[this.currentLang] || translations['en'];
        grid.insertAdjacentHTML('beforeend', `
            <div class="glass-card p-8 sm:p-12 rounded-[2.5rem] border-t-4 border-eng">
                <span class="section-tag block mb-4">// SERVICE TICKET</span>
                <h3 class="text-2xl sm:text-4xl font-black italic uppercase mb-8 tracking-tighter">${lang.service_hub_title || 'Service Hub'}</h3>
                <form id="whatsapp-form" class="space-y-6">
                    <div class="grid sm:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">${lang.form_name}</label>
                            <input type="text" name="name" required autocomplete="name"
                                class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-eng focus:ring-1 focus:ring-eng/30 transition-all text-white placeholder-slate-600 text-sm"
                                placeholder="Your name">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">${lang.form_urgency}</label>
                            <select name="urgency" class="w-full bg-dark-900 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-eng transition-all text-white text-sm cursor-pointer">
                                <option value="Routine">Routine</option>
                                <option value="Priority">Priority</option>
                                <option value="Critical">Mission Critical</option>
                            </select>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">${lang.form_scope}</label>
                        <textarea name="scope" required rows="4"
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-eng focus:ring-1 focus:ring-eng/30 transition-all text-white placeholder-slate-600 text-sm resize-none"
                            placeholder="Describe your project scope, requirements, or challenge..."></textarea>
                    </div>
                    <button type="submit" class="w-full py-4 bg-eng hover:bg-eng-dark active:scale-95 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        ${lang.form_submit}
                    </button>
                </form>
            </div>`);

        document.getElementById('whatsapp-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const name = fd.get('name').trim();
            const urgency = fd.get('urgency');
            const scope = fd.get('scope').trim();
            const phone = (translations[this.currentLang]?.whatsapp_phone || translations['en'].whatsapp_phone || '').replace(/\D/g, '');
            if (!name || !scope) return;
            const text = `[SYS-REQ] Scope: ${scope} | Urgency: ${urgency} | Tracer: ${this.userIP} | From: ${name}`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    // ── UTILITY ───────────────────────────────────────────────────────────────
    _esc(str = '') {
        return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    window.engine = new PortfolioEngine();
});
