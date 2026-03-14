/**
 * CERTIFICATIONS.JS — Profile Page Credentials
 * ===============================================
 * Edit certificationsData below to add/update certifications.
 *
 * Fields:
 *   abbr     : Short label shown on the card (e.g. "CKA")
 *   title    : Full certification name
 *   issuer   : Issuing organization
 *   date     : Year obtained
 *   img      : Path to credential image / scan (shown in popup)
 *   path     : Link to credential PDF or verify URL (optional)
 *   techDesc : Detailed description shown in the popup modal
 */

const certificationsData = [
    {
        abbr: "Networking",
        title: "Cisco Networking Specialist",
        issuer: "Cisco / AMIKOM",
        date: "2023",
        img: "../static/img/cert-cisco.jpg",
        path: "",
        techDesc: "Cisco Networking Specialist — focus on enterprise routing, switching, VLAN segmentation, and secure network infrastructure orchestration. Completed as part of the Cisco Networking Academy program."
    },
    {
        abbr: "KKNI VI",
        title: "Competency Certificate — KKNI Level VI",
        issuer: "BNSP Indonesia",
        date: "2024",
        img: "../static/img/cert-kkni.jpg",
        path: "",
        techDesc: "BNSP (Badan Nasional Sertifikasi Profesi) KKNI Level VI — Junior Network Administrator. Covers enterprise network design, network security, and system administration at national competency standard."
    },
    {
        abbr: "Lab Asst",
        title: "Laboratory Assistant — Informatics",
        issuer: "AMIKOM Yogyakarta",
        date: "2022",
        img: "../static/img/assistant-forum.jpg",
        path: "",
        techDesc: "Official certification as Laboratory Assistant at Department of Informatics, AMIKOM Yogyakarta (2022–2023). Modules: Computer Networks, Web Systems, Operating Systems Architecture. Responsible for lab session facilitation, module authoring, and practical assessment."
    },
    {
        abbr: "IoT Cert",
        title: "IoT Engineering Practitioner",
        issuer: "Internal / Industry",
        date: "2024",
        img: "../static/img/wms-preview.jpg",
        path: "",
        techDesc: "IoT Engineering Practitioner certification. Focus: edge device architecture, MQTT/gRPC telemetry pipelines, and industrial IoT gateway integration."
    }
];

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderCertifications() {
    const container = document.getElementById('cert-container');
    if (!container) return;

    container.innerHTML = certificationsData.map((cert, i) => {
        const safeTitle = (cert.title || '').replace(/"/g, '&quot;');
        const safeDesc  = (cert.techDesc || '').replace(/"/g, '&quot;');
        const safeImg   = (cert.img || '').replace(/"/g, '&quot;');

        return `
        <div class="cert-card relative p-4 bg-white/5 rounded-xl border border-white/5
                    hover:bg-eng/10 hover:border-eng/40 cursor-pointer group transition-all fade-up fade-up-${Math.min(i + 1, 5)}"
            data-img="${safeImg}"
            data-title="${safeTitle}"
            data-tech-desc="${safeDesc}">

            <!-- Award icon -->
            <div class="flex items-center gap-2 mb-2">
                <span class="icon-shimmer text-yellow-500/70 group-hover:text-yellow-400 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                </span>
                <span class="text-xs font-black text-white leading-tight group-hover:text-eng transition-colors">${cert.abbr}</span>
                <span class="absolute top-2 right-2 text-[7px] font-black text-slate-700 group-hover:text-eng/50 uppercase tracking-wider transition-colors">↗</span>
            </div>

            <!-- Thumbnail -->
            ${cert.img ? `
            <div class="w-full h-10 mb-2 rounded-lg overflow-hidden bg-white/5 border border-white/5">
                <img src="${cert.img}" alt="${cert.abbr}"
                    class="w-full h-full object-cover opacity-40 group-hover:opacity-75 transition-opacity"
                    onerror="this.parentElement.style.display='none'">
            </div>` : ''}

            <p class="text-[8px] text-slate-500 leading-tight">${cert.issuer}</p>
            <p class="text-[7px] text-slate-600 font-mono mt-0.5">${cert.date}</p>
        </div>`;
    }).join('');

    // Bind click → modal
    container.querySelectorAll('.cert-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!window.openProjectModal) return;
            window.openProjectModal(
                card.getAttribute('data-title'),
                card.getAttribute('data-tech-desc'),
                card.getAttribute('data-img'),
                false   // plain text desc
            );
        });
    });
}

document.addEventListener('DOMContentLoaded', renderCertifications);
