/**
 * ENG_PROJECTS.JS — Engineering Deep-Dive Projects
 * ===================================================
 * SOURCE 1 (Auto): repos_data.json → category === 'hardware'
 * SOURCE 2 (Manual): engProjectsData array below — always shown first.
 *
 * To add a manual deep-dive project, push to engProjectsData.
 * repos_data.json is auto-synced via GitHub Actions (update_repos.py).
 */

// ── MANUAL DEEP-DIVE ENTRIES (featured / detailed projects) ──────────────────
// These appear FIRST and have richer detail (full techDocs, custom img, etc.)
const engProjectsData = [
    // {
    //     title: "PLC Protocol Bridge",
    //     desc: "Non-intrusive bus-sniffing for industrial PLC data extraction (Siemens, Hyundai). Zero-interruption on live production lines.",
    //     img: "../static/img/plc-preview.jpg",
    //     tags: ["RS485 Sniffing", "C/C++", "Industrial"],
    //     techDocs: "Passive bus monitoring via differential probe on RS485. Decoded Siemens S7 and Hyundai PLC proprietary frames. Output: normalized JSON → MQTT ingestion. Zero production interruption."
    // },
    // {
    //     title: "WSN Journal Research",
    //     desc: "Published research on energy-efficient LoRaWAN communication in signal-deprived environments.",
    //     img: "../static/img/wsn-preview.jpg",
    //     tags: ["LoRa", "nRF52840", "WSN", "Scientific"],
    //     techDocs: "LoRaWAN network optimization for terrain-challenged areas. Power management at nano-ampere levels. Star-mesh hybrid topology. Published in National Scientific Journal 2025."
    // }
];

// ── RENDER ────────────────────────────────────────────────────────────────────
async function renderEngProjects() {
    const container = document.getElementById('eng-projects-container');
    if (!container) return;

    // Fetch repos_data.json (same file used by index.html project showcase)
    let repoProjects = [];
    const repoDataPath = '../repos_data.json';
    try {
        const res = await fetch(repoDataPath);
        if (res.ok) {
            const data = await res.json();
            // Filter: only hardware category for Engineering tab
            repoProjects = data
                .filter(r => r.category === 'hardware')
                .map(r => ({
                    title: r.name.replace(/-/g, ' '),
                    desc: r.description || 'Hardware Engineering Project',
                    img: r.img || '',
                    tags: [r.tech_stack || 'C/C++'],
                    techDocs: [
                        r.description || '',
                        r.doc ? `📄 <a href="${r.doc}" target="_blank" class="text-eng underline">View Documentation</a>` : '',
                        `🔗 <a href="${r.github_url || '#'}" target="_blank" class="text-eng underline">View on GitHub</a>`,
                        `🕐 Last updated: ${r.last_update || '—'}`
                    ].filter(Boolean).join('<br>'),
                    isHtml: true
                }));
        }
    } catch (e) {
        console.warn('[ENG] repos_data.json offline — showing manual entries only.');
    }

    // Combine: manual deep-dives first, then auto-synced GitHub repos
    const allProjects = [...engProjectsData, ...repoProjects];

    const sectionHeader = `<h3 class="section-tag italic mb-8">/ DETAILED MISSION ARCHIVE <span class="text-slate-700">(${allProjects.length} units)</span></h3>`;

    const cards = allProjects.map((p, i) => {
        const safeTitle = (p.title || '').replace(/"/g, '&quot;');
        const safeDocs = (p.techDocs || p.desc || '').replace(/"/g, '&quot;');
        const safeImg = (p.img || '').replace(/"/g, '&quot;');
        const htmlFlag = p.isHtml ? 'data-html="1"' : '';

        // Strip HTML tags from description for card view to prevent nesting/stacking issues
        const cleanDesc = (p.desc || '').replace(/<\/?[^>]+(>|$)/g, "");

        return `
        <div class="project-card glass-card p-8 sm:p-10 rounded-[2.5rem] group cursor-pointer hover:border-eng/40 transition-all"
            data-img="${safeImg}"
            data-title="${safeTitle}"
            data-tech-desc="${safeDocs}"
            ${htmlFlag}>
            <div class="flex justify-between items-start mb-5 gap-4">
                <div class="flex-1">
                    <span class="text-[9px] font-mono text-eng/60 tracking-widest uppercase block mb-1">// UNIT-${String(i + 1).padStart(2, '0')}</span>
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
                <span class="ml-auto text-[9px] font-black text-eng/40 group-hover:text-eng/80 uppercase tracking-widest transition-colors">DETAILS →</span>
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

document.addEventListener('DOMContentLoaded', renderEngProjects);
