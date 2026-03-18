/**
 * ENG_PROJECTS.JS — Engineering Deep-Dive Projects
 * SOURCE 1 (Auto): repos_data.json → category === 'hardware'
 * SOURCE 2 (Manual): engProjectsData array below — always shown first.
 */

const engProjectsData = [
    // Manual entries (uncomment and fill to add featured projects)
    // { title: "PLC Protocol Bridge", desc: "...", img: "", tags: ["RS485","C++"], techDocs: "...", isPrivate: false }
];

// ── PRIVACY BADGE ─────────────────────────────────────────────────────────────
function engPrivacyBadge(isPrivate) {
    const t = (typeof translations !== 'undefined' && translations.en) ? translations.en : {};
    if (isPrivate) {
        return `<span class="privacy-badge private">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>${t.private_badge || 'Private'}</span>`;
    }
    return `<span class="privacy-badge public">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/>
        </svg>${t.public_badge || 'Public'}</span>`;
}

// ── RESOLVE REPO PATH ─────────────────────────────────────────────────────────
function getRepoPath() {
    const p = document.location.pathname;
    if (p.match(/\/page\/[^/]+\//)) return '../../repos_data.json';
    if (p.includes('/page/'))         return '../repos_data.json';
    return 'repos_data.json';
}

// ── RENDER ────────────────────────────────────────────────────────────────────
async function renderEngProjects() {
    const container = document.getElementById('eng-projects-container');
    if (!container) return;

    let repoProjects = [];
    try {
        const res = await fetch(getRepoPath());
        if (res.ok) {
            const data = await res.json();
            repoProjects = data
                .filter(r => {
                    const t = (r.tech_stack || '').toLowerCase();
                    if (['c++', 'c', 'rust'].includes(t)) return true;
                    if (['mixed', 'mixed tech', ''].includes(t) && r.category === 'hardware') return true;
                    return false;
                })
                .map(r => ({
                    title:     r.name.replace(/-/g, ' '),
                    desc:      r.description || 'Hardware Engineering Project',
                    img:       r.img || '',
                    tags:      [r.tech_stack || 'C/C++'],
                    isPrivate: r.is_private || false,
                    techDocs:  (() => {
                        const ghUrl = r.github_url || '#';
                        const parts = [`<p class="modal-project-desc">${r.description || ''}</p>`];
                        const links = [];
                        if (r.doc) {
                            links.push(`<a href="${r.doc}" target="_blank" rel="noopener" class="modal-link-btn">
                                <span class="modal-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                                <span>View Documentation</span>
                                <svg class="modal-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
                            </a>`);
                        }
                        links.push(`<a href="${ghUrl}" target="_blank" rel="noopener" class="modal-link-btn modal-link-github">
                            <span class="modal-link-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></span>
                            <span>View on GitHub</span>
                            <svg class="modal-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
                        </a>`);
                        if (links.length) parts.push(`<div class="modal-links-row">${links.join('')}</div>`);
                        parts.push(`<p class="modal-last-updated">🕐 Last updated: ${r.last_update || '—'}</p>`);
                        return parts.join('');
                    })(),
                    isHtml: true
                }));
        }
    } catch (e) {
        console.warn('[ENG] repos_data.json offline — showing manual entries only.');
    }

    const allProjects = [...engProjectsData, ...repoProjects];

    if (allProjects.length === 0) {
        container.innerHTML = `<p class="text-slate-500 font-mono text-sm">// No engineering projects found.</p>`;
        return;
    }

    const sectionHeader = `<h3 class="section-tag italic mb-8">/ DETAILED MISSION ARCHIVE <span class="text-slate-700">(${allProjects.length} units)</span></h3>`;

    const cards = allProjects.map((p, i) => {
        const safeTitle = (p.title || '').replace(/"/g, '&quot;');
        const safeDocs  = (p.techDocs || p.desc || '').replace(/"/g, '&quot;');
        const safeImg   = (p.img || '').replace(/"/g, '&quot;');
        const htmlFlag  = p.isHtml ? 'data-tech-desc-html="1"' : '';
        const cleanDesc = (p.desc || '').replace(/<\/?[^>]+(>|$)/g, "");

        return `
        <div class="project-card glass-card rounded-[2rem] group cursor-pointer hover:border-eng/40 transition-all"
            data-img="${safeImg}"
            data-title="${safeTitle}"
            data-tech-desc="${safeDocs}"
            ${htmlFlag}>
            <div class="p-8 sm:p-10">
                <div class="flex justify-between items-start mb-4 gap-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="text-[9px] font-mono text-eng/60 tracking-widest uppercase">// UNIT-${String(i+1).padStart(2,'0')}</span>
                            ${engPrivacyBadge(p.isPrivate)}
                        </div>
                        <h4 class="text-xl sm:text-2xl font-black italic uppercase tracking-tighter group-hover:text-eng transition-colors leading-tight">${p.title}</h4>
                    </div>
                    <div class="p-2.5 bg-eng/10 rounded-xl flex-shrink-0 group-hover:bg-eng/20 transition-all">
                        <svg class="w-4 h-4 text-eng" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                </div>
                <p class="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">${cleanDesc}</p>
                <div class="flex flex-wrap items-center gap-2">
                    ${p.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    <span class="ml-auto text-[9px] font-black text-eng/40 group-hover:text-eng/80 uppercase tracking-widest transition-colors flex items-center gap-1">
                        DETAILS
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                </div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = sectionHeader + `<div class="space-y-6">${cards}</div>`;

    // Bind modal — wait for openProjectModal from core.js
    const bindModal = () => {
        container.querySelectorAll('.project-card').forEach(card => {
            card.onclick = () => {
                if (!window.openProjectModal) return;
                window.openProjectModal(
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tech-desc'),
                    card.getAttribute('data-img'),
                    card.hasAttribute('data-tech-desc-html')
                );
            };
        });
    };

    // core.js may not have loaded yet; retry after it runs
    if (typeof window.openProjectModal === 'function') {
        bindModal();
    } else {
        window.addEventListener('DOMContentLoaded', bindModal);
        setTimeout(bindModal, 500); // fallback
    }
}

document.addEventListener('DOMContentLoaded', renderEngProjects);
