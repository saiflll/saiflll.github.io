/**
 * DEV_PROJECTS.JS — Development Hub Projects
 * ============================================
 * SOURCE 1 (Auto): repos_data.json → category === 'logic' OR 'support'
 * SOURCE 2 (Manual): devProjectsData array below — always shown first.
 *
 * To add a manual project, push to devProjectsData.
 * repos_data.json is auto-synced via GitHub Actions (update_repos.py).
 */

// ── MANUAL FEATURED ENTRIES ───────────────────────────────────────────────────
const devProjectsData = [
    {
        title: "Factory IoT Orchestrator (WMS)",
        desc: "Kubernetes-based orchestration for 100+ factory edge nodes with auto-failover and real-time telemetry visualization.",
        img: "../static/img/wms-preview.jpg",
        tags: ["K8s", "Golang", "gRPC", "Prometheus"],
        techDocs: "Microservices architecture for high-availability industrial monitoring. Handles 10k+ telemetry points/sec via gRPC. Custom Grafana dashboards. Zero-downtime rolling deployments.",
        isHtml: false
    },
    {
        title: "OTA System Dashboard",
        desc: "Centralized web dashboard for managing Over-The-Air firmware updates to distributed IoT nodes.",
        img: "../static/img/wms-preview.jpg",
        tags: ["JavaScript", "Flask", "REST API", "SQLite"],
        techDocs: "Single-page app with live update status, version history, and per-device rollback. Backend in Python Flask with SQLite state management.",
        isHtml: false
    }
];

// ── RENDER ────────────────────────────────────────────────────────────────────
async function renderDevProjects() {
    const container = document.getElementById('dev-projects-container');
    if (!container) return;

    // Fetch repos_data.json (same file used by index.html project showcase)
    let repoProjects = [];
    try {
        const res = await fetch('../repos_data.json');
        if (res.ok) {
            const data = await res.json();
            // Filter: logic + support categories for Development tab
            repoProjects = data
                .filter(r => r.category === 'logic' || r.category === 'support')
                .map(r => ({
                    title: r.name.replace(/-/g, ' '),
                    desc: r.description || 'Development Project',
                    img: r.img || '',
                    tags: [r.tech_stack || 'Mixed'],
                    techDocs: [
                        r.description || '',
                        r.doc  ? `📄 <a href="${r.doc}" target="_blank" class="text-dev-light underline">View Documentation</a>` : '',
                        `🔗 <a href="${r.github_url || '#'}" target="_blank" class="text-dev-light underline">View on GitHub</a>`,
                        `🕐 Last updated: ${r.last_update || '—'}`
                    ].filter(Boolean).join('<br>'),
                    isHtml: true
                }));
        }
    } catch (e) {
        console.warn('[DEV] repos_data.json offline — showing manual entries only.');
    }

    // Combine: manual first, then auto-synced
    const allProjects = [...devProjectsData, ...repoProjects];

    const sectionHeader = `<h3 class="section-tag italic mb-8">/ INFRASTRUCTURE REPOSITORY <span class="text-slate-700">(${allProjects.length} systems)</span></h3>`;

    const cards = allProjects.map((p, i) => {
        const safeTitle = (p.title || '').replace(/"/g, '&quot;');
        const safeDocs  = (p.techDocs || p.desc || '').replace(/"/g, '&quot;');
        const safeImg   = (p.img || '').replace(/"/g, '&quot;');
        const htmlFlag  = p.isHtml ? 'data-html="1"' : '';

        return `
        <div class="project-card glass-card p-8 sm:p-10 rounded-[2.5rem] group cursor-pointer hover:border-dev/40 transition-all"
            data-img="${safeImg}"
            data-title="${safeTitle}"
            data-tech-desc="${safeDocs}"
            ${htmlFlag}>
            <div class="flex justify-between items-start mb-5 gap-4">
                <div class="flex-1">
                    <span class="text-[9px] font-mono text-dev-light/50 tracking-widest uppercase block mb-1">// SYS-${String(i + 1).padStart(2, '0')}</span>
                    <h4 class="text-xl sm:text-2xl font-black italic uppercase tracking-tighter group-hover:text-dev-light transition-colors leading-tight">${p.title}</h4>
                </div>
                <div class="p-2.5 bg-dev/10 rounded-xl flex-shrink-0 group-hover:bg-dev/20 transition-all">
                    <svg class="w-4 h-4 text-dev-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                </div>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">${p.desc}</p>
            <div class="flex flex-wrap items-center gap-2">
                ${p.tags.map(t => `<span class="dev-tag">${t}</span>`).join('')}
                <span class="ml-auto text-[9px] font-black text-dev-light/40 group-hover:text-dev-light/80 uppercase tracking-widest transition-colors">DETAILS →</span>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = sectionHeader + `<div class="space-y-6">${cards}</div>`;

    // Bind modal
    container.querySelectorAll('.project-card').forEach(card => {
        card.onclick = () => {
            if (!window.openProjectModal) return;
            window.openProjectModal(
                card.getAttribute('data-title'),
                card.getAttribute('data-tech-desc'),
                card.getAttribute('data-img'),
                card.hasAttribute('data-html')
            );
        };
    });
}

document.addEventListener('DOMContentLoaded', renderDevProjects);
