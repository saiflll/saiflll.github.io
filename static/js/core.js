/**
 * CORE ENGINE - Portfolio v3.0
 * Fully optimized. All buttons functional. Responsive. Elegant.
 */

const CONFIG = {
    IP_API: 'https://ipapi.co/json/',
    // Resolve path relative to root, works from both / and /page/
    REPO_DATA: document.location.pathname.includes('/page/') ? '../repos_data.json' : 'repos_data.json'
};

// ─── MODAL SINGLETON ─────────────────────────────────────────────────────────
const Modal = {
    el: null,
    img: null,
    title: null,
    desc: null,

    init() {
        this.el    = document.getElementById('image-modal');
        this.img   = document.getElementById('modal-img');
        this.title = document.getElementById('modal-title');
        this.desc  = document.getElementById('modal-desc');

        if (!this.el) return;

        // Close on button click
        document.getElementById('modal-close')?.addEventListener('click', () => this.close());

        // Close on backdrop click
        this.el.addEventListener('click', (e) => {
            if (e.target === this.el) this.close();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open(imgSrc, titleText, htmlDesc, plainDesc) {
        if (!this.el) return;
        this.title.innerText = titleText || '';

        // Image: hide if blank to avoid broken img element
        if (imgSrc) {
            this.img.src = imgSrc;
            this.img.style.display = 'block';
        } else {
            this.img.src = '';
            this.img.style.display = 'none';
        }

        // Description: HTML takes priority over plain text
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
        // Wait for CSS transition before hiding
        setTimeout(() => { this.el.style.display = 'none'; }, 300);
    }
};

// Expose globally so eng_projects.js / dev_projects.js / milestones.js can call it
window.openProjectModal = (title, descOrHtml, img, isHtml) => {
    if (isHtml) {
        Modal.open(img, title, descOrHtml, null);
    } else {
        Modal.open(img, title, null, descOrHtml);
    }
};

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
class PortfolioEngine {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.projects    = [];
        this.userIP      = '—';
        this.init();
    }

    async init() {
        this.updateDynamicYears();
        Modal.init();
        this.applyTranslations();
        this.setupNav();
        this.setupCVDropdown();

        // Only run project showcase logic on index.html
        if (document.getElementById('project-container')) {
            await this.loadData();
        }

        // Only inject service hub on index.html
        if (document.getElementById('about')) {
            this.injectServiceHub();
        }

        // Only run terminal sniffing where the terminal exists
        if (document.getElementById('serial-logs')) {
            this.initSniffing();
        }

        if (document.getElementById('github-repos')) {
            this.initGithubActivity();
        }

        // Re-attach modal to any static .project-card already in DOM
        this.bindStaticCards();
    }

    // ── DYNAMIC YEARS CALCULATION ─────────────────────────────────────────────
    updateDynamicYears() {
        const startYear = 2020;
        const startMonth = 4; // May (0-indexed)
        const now = new Date();
        
        let years = now.getFullYear() - startYear;
        if (now.getMonth() < startMonth) {
            years--;
        }

        // Update translations in memory before application
        if (window.translations) {
            Object.keys(window.translations).forEach(langKey => {
                if (langKey === 'projects') return;
                const lang = window.translations[langKey];
                if (lang.exp_years) {
                    lang.exp_years = lang.exp_years.replace(/\d+/, years);
                }
            });
        }

        // Update static UI element if it exists
        const runtimeEl = document.getElementById('runtime-years');
        if (runtimeEl) {
            runtimeEl.innerText = `${years}Y`;
        }
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
        // Language picker
        document.getElementById('lang-picker')?.addEventListener('change', (e) => {
            localStorage.setItem('lang', e.target.value);
            location.reload();
        });

        // Mobile menu toggle
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

        // Close mobile menu when a link inside it is clicked
        overlay?.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                overlay.classList.remove('active');
                menuIcon?.classList.remove('hidden');
                closeIcon?.classList.add('hidden');
                document.body.style.overflow = '';
            });
        });
    }

    // ── CV DROPDOWN (click-based, not Tailwind-group-hover) ───────────────────
    setupCVDropdown() {
        const cvToggle = document.getElementById('cv-toggle');
        const cvDropdown = document.getElementById('cv-dropdown');
        if (!cvToggle || !cvDropdown) return;

        cvToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            cvDropdown.classList.toggle('active-click');
        });
        document.addEventListener('click', () => {
            cvDropdown.classList.remove('active-click');
        });
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
                    type: (repo.tech_stack === 'C++' || repo.tech_stack === 'C') ? 'Engineering' : 'Development',
                    category: repo.category || ((repo.tech_stack === 'C++' || repo.tech_stack === 'C') ? 'hardware' : 'logic'),
                    // Use img from JSON if present, else blank (no broken images)
                    image: repo.img || '',
                    tags: [repo.tech_stack || 'Mixed'],
                    techDesc: [
                        repo.description || '',
                        repo.doc  ? `📄 <a href="${repo.doc}" target="_blank" class="text-eng underline">View Documentation</a>` : '',
                        `🔗 <a href="${repo.github_url || `https://github.com/saiflll/${repo.name}`}" target="_blank" class="text-eng underline">View on GitHub</a>`,
                        `🕐 Last updated: ${repo.last_update || '—'}`
                    ].filter(Boolean).join('<br>'),
                    link: repo.github_url || `https://github.com/saiflll/${repo.name}`
                }));
            }
        } catch (e) {
            console.warn('[Engine] GitHub sync offline — using local data.');
        }

        this.projects = [...localProjects, ...githubProjects];
        
        // Update System Deployments Count
        const deployCountEl = document.getElementById('deploy-count');
        if (deployCountEl) {
            deployCountEl.innerText = `${this.projects.length}+`;
        }

        this.renderProjects();
        this.prepareFilters();
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

        container.innerHTML = filtered.map(p => `
            <div class="project-card glass-card rounded-[2.5rem] hover-lift cursor-pointer flex flex-col min-w-[300px] sm:min-w-[350px] h-[400px] snap-center"
                data-category="${p.category}"
                data-img="${p.image}"
                data-tech-desc="${this._esc(p.techDesc)}"
                data-tech-desc-html="1"
                data-title="${this._esc(p.title)}">
                <div class="p-8 sm:p-10 flex flex-col h-full bg-gradient-to-br from-eng/5 to-transparent relative overflow-hidden group">
                    <span class="text-[9px] font-bold text-eng-light tracking-widest uppercase mb-4">${p.category}</span>
                    <h4 class="text-xl sm:text-2xl font-black mb-4 leading-none uppercase italic">${p.title}</h4>
                    <p class="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">${p.desc}</p>
                    <div class="flex flex-wrap gap-2 mt-auto">
                        ${p.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        this.bindStaticCards();
    }

    // ── FILTER BUTTONS ────────────────────────────────────────────────────────
    prepareFilters() {
        const hub = document.getElementById('filter-hub');
        if (!hub) return;

        const lang = translations[this.currentLang];
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
                key: 'support', label: lang.filter_support || 'Support App',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
            }
        ];

        hub.innerHTML = categories.map(c => `
            <button
                class="filter-btn flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-200 hover:border-eng/50 ${c.key === 'all' ? 'bg-eng text-white border-eng' : 'text-slate-500 bg-transparent'}"
                data-filter="${c.key}">
                <span class="btn-icon">${c.icon}</span>
                ${c.label}
            </button>
        `).join('');

        hub.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            const filter = btn.getAttribute('data-filter');

            // Active state
            hub.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-eng', 'text-white', 'border-eng');
                b.classList.add('text-slate-500', 'bg-transparent');
            });
            btn.classList.add('bg-eng', 'text-white', 'border-eng');
            btn.classList.remove('text-slate-500', 'bg-transparent');

            // Re-render with filter
            this.renderProjects(filter);
        });
    }

    // ── BIND MODAL TO .project-card ELEMENTS ─────────────────────────────────
    bindStaticCards() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.onclick = () => {
                const img      = card.getAttribute('data-img') || '';
                const title    = card.getAttribute('data-title') || card.querySelector('h4')?.innerText || '';
                const descRaw  = card.getAttribute('data-tech-desc') || '';
                const isHtml   = card.hasAttribute('data-tech-desc-html');

                // Decode HTML entities back for display
                const desc = descRaw
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

                Modal.open(img, title, isHtml ? desc : null, isHtml ? null : desc);
            };
        });
    }

    // ── PASSIVE SNIFFING → TERMINAL ───────────────────────────────────────────
    async initSniffing() {
        const log = document.getElementById('serial-logs');
        if (!log) return;

        const addLine = (text, cls = 'text-slate-500') => {
            const div = document.createElement('div');
            div.className = cls;
            div.innerText = text;
            log.appendChild(div);
            log.scrollTop = log.scrollHeight;
        };

        const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
        addLine(`[${now()}] Booting saiflll_core v3.0...`, 'text-slate-600');

        try {
            const res  = await fetch(CONFIG.IP_API);
            const data = await res.json();
            this.userIP = data.ip || '—';
            addLine(`[${now()}] [SEC-SCAN]: Node ${data.ip} detected at ${data.city || '?'}, ${data.country_name || '?'}.`, 'text-eng-light font-bold');
            addLine(`[${now()}] Provider: ${data.org || 'Unknown'} | ASN: ${data.asn || '?'}`, 'text-slate-500');
        } catch {
            addLine(`[${now()}] Passive scan blocked by network policy.`, 'text-slate-600');
        }

        addLine(`[${now()}] System nominal. Standing by.`, 'text-green-600');
    }

    // ── GITHUB ACTIVITY FETCHER ───────────────────────────────────────────────
    async initGithubActivity() {
        const container = document.getElementById('github-repos');
        if (!container) return;

        try {
            const res = await fetch('https://api.github.com/users/saiflll/events/public?per_page=10');
            if (!res.ok) throw new Error('API Rate Limit or Network Error');
            const events = await res.json();
            
            if (!Array.isArray(events) || events.length === 0) {
                container.innerHTML = '<p class="text-slate-500 text-xs font-mono">No recent activity detected.</p>';
                return;
            }

            const validEvents = events.filter(e => 
                e.type === 'PushEvent' || 
                e.type === 'CreateEvent' || 
                e.type === 'PullRequestEvent'
            ).slice(0, 3);
            
            if (validEvents.length === 0) {
                container.innerHTML = '<p class="text-slate-500 text-xs font-mono">No recent pushes or created repos.</p>';
                return;
            }

            container.innerHTML = validEvents.map((e, index) => {
                const repoName = e.repo.name.split('/')[1] || e.repo.name;
                const timeStr = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                let actionStr = 'Updated';
                let iconWrapperClass = 'bg-dev/10 text-dev';
                let iconSvg = '<path d="M12 19V5M5 12l7-7 7 7"/>'; // default up arrow

                if (e.type === 'PushEvent') {
                    const commits = e.payload.commits ? e.payload.commits.length : 0;
                    actionStr = `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to`;
                    iconWrapperClass = 'bg-eng/10 text-eng';
                    iconSvg = '<path d="M12 5v14m-7-7l7 7 7-7"/>'; // push down
                } else if (e.type === 'CreateEvent') {
                    actionStr = 'Created repository';
                    iconWrapperClass = 'bg-safety/10 text-safety';
                    iconSvg = '<path d="M12 5v14m-7-7h14"/>'; // plus/cross
                } else if (e.type === 'PullRequestEvent') {
                    actionStr = `${e.payload.action} PR in`;
                    iconWrapperClass = 'bg-slate-700/50 text-slate-300';
                    iconSvg = '<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>'; // branch
                }

                return `
                <div class="glass-card p-4 rounded-xl border border-white/5 flex gap-4 hover:border-eng/30 transition-all cursor-crosshair group fade-up fade-up-${index + 1}">
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
            
        } catch (error) {
            container.innerHTML = '<p class="text-slate-500 text-[10px] uppercase tracking-widest font-mono border border-white/5 p-4 rounded-xl">ACTIVITY FEED OFFLINE</p>';
        }
    }

    // ── SERVICE HUB (WHATSAPP FORM) ───────────────────────────────────────────
    injectServiceHub() {
        const about = document.getElementById('about');
        if (!about || document.getElementById('whatsapp-form')) return; // don't double-inject

        const grid = about.querySelector('.grid');
        if (!grid) return;

        const lang = translations[this.currentLang];
        const formHtml = `
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
                            <select name="urgency"
                                class="w-full bg-dark-900 border border-white/10 rounded-xl px-5 py-4 outline-none focus:border-eng transition-all text-white text-sm cursor-pointer">
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
                    <button type="submit"
                        class="w-full py-4 bg-eng hover:bg-eng-dark active:scale-95 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        ${lang.form_submit}
                    </button>
                </form>
            </div>
        `;

        grid.insertAdjacentHTML('beforeend', formHtml);

        document.getElementById('whatsapp-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd      = new FormData(e.target);
            const name    = fd.get('name').trim();
            const urgency = fd.get('urgency');
            const scope   = fd.get('scope').trim();
            const phone   = (translations[this.currentLang].whatsapp_phone || '').replace(/\D/g, '');

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
