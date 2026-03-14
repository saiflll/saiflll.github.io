/**
 * MILESTONES.JS — Career Milestones Data
 * Each card is clickable and opens a detailed popup modal.
 * Edit details[], img, and photos[] freely.
 */

const milestonesData = [
    {
        company: "PT PESTA PORA ABADI",
        role: "IT IoT Development SPV",
        period: "2025 — Present",
        summary: "Memimpin orkestrasi infrastruktur IoT pabrik dengan uptime 99.9% menggunakan K8s dan Golang.",
        accentColor: "border-blue-500",
        details: [
            "Orchestrated 100+ factory IoT edge nodes using Kubernetes for zero-downtime operations.",
            "Developed real-time telemetry pipeline: sensor → gateway → gRPC → cloud dashboard.",
            "Managed cross-functional team of 5 engineers across firmware, backend, and infra roles.",
            "Achieved 99.9% uptime SLA through automated failover and health-check mechanisms.",
            "Standardized firmware OTA deployment across all edge devices."
        ],
        img: "../static/img/hero.jpeg",
        link: "development.html"
    },
    {
        company: "Freelance Hardware Engineer",
        role: "Global Operations",
        period: "2020 — Present",
        summary: "Menyelesaikan 32+ proyek IoT kecil hingga menengah untuk berbagai industri.",
        accentColor: "border-slate-600",
        details: [
            "Delivered 32+ end-to-end IoT projects spanning agriculture, logistics, and manufacturing.",
            "Specialization: custom PCB design, STM32/ESP32 firmware, industrial protocol bridging.",
            "Reverse-engineered Siemens S7 and Hyundai PLC proprietary protocols for client integrations.",
            "Developed LoRaWAN WSN research prototype published in a national scientific journal.",
            "Managed full project lifecycle: requirement gathering → prototyping → deployment → handover."
        ],
        img: "../static/img/plc-preview.jpg",
        link: "engineering.html"
    }
];

function renderMilestones() {
    const container = document.getElementById('milestone-container');
    if (!container) return;

    container.innerHTML = milestonesData.map((m, i) => `
        <div class="glass-card p-8 sm:p-10 rounded-3xl border-l-4 ${m.accentColor} hover:bg-white/[0.02] transition-all cursor-pointer group fade-up fade-up-${Math.min(i + 1, 5)}"
             onclick="openMilestoneModal(${i})">
            <div class="flex items-start justify-between mb-4 gap-4">
                <div class="flex items-start gap-3">
                    <div class="item-icon bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all mt-0.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <rect x="2" y="7" width="20" height="14" rx="2"/>
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-black text-white italic text-lg sm:text-xl leading-tight">${m.company}</h4>
                        <p class="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mt-1">${m.role}</p>
                        <p class="text-[10px] font-mono text-slate-600 mt-0.5">${m.period}</p>
                    </div>
                </div>
                <div class="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </div>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed mb-5">${m.summary}</p>
            <span class="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400 transition-colors">CLICK FOR FULL LOG →</span>
        </div>
    `).join('');
}

window.openMilestoneModal = function(index) {
    const m = milestonesData[index];
    if (!m) return;

    const detailsList = m.details.map(d =>
        `<li class="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
            <span class="text-eng mt-1 flex-shrink-0">▹</span>
            <span>${d}</span>
        </li>`
    ).join('');

    const descHtml = `
        <div class="space-y-4">
            <div>
                <p class="text-[10px] font-mono font-bold tracking-widest uppercase text-eng mb-1">${m.role}</p>
                <p class="text-[10px] font-mono text-slate-500">${m.period}</p>
            </div>
            <ul class="space-y-3">${detailsList}</ul>
            ${m.link ? `<a href="${m.link}" class="inline-block mt-4 text-[10px] font-black text-eng hover:underline tracking-widest uppercase">FULL CASE STUDY →</a>` : ''}
        </div>
    `;

    if (window.openProjectModal) {
        window.openProjectModal(m.company, descHtml, m.img, true);
    }
};

document.addEventListener('DOMContentLoaded', renderMilestones);
