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
        date: "2022",
        img: "../../static/sertif/CIsco.png",
        path: "",
        techDesc: "Cisco Networking Specialist — focus on enterprise routing, switching, VLAN segmentation, and secure network infrastructure orchestration. Completed as part of the Cisco Networking Academy program."
    },
    {
        abbr: "Study",
        title: "Assistent Forum Design Grafis",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/design-asis.png",
        path: "",
        techDesc: "Assistent Forum Design Grafis — focus on enterprise design grafis."
    },
    {
        abbr: "Lab Asst",
        title: "Assistent Forum Jaringan",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/jaringan-asis.png",
        path: "",
        techDesc: "Assistent Forum Jaringan — focus on Networking and cisco."
    },
    {
        abbr: "Lab Asst",
        title: "Assistent Forum Pemrograman",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/pemrograman-asis.png",
        path: "",
        techDesc: "Assistent Forum Pemrograman — focus on Programing class."
    },
    {
        abbr: "Lab Asst",
        title: "Assistent E Bussines",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/e-bussines.png",
        path: "",
        techDesc: "Assistent E Bussines — focus on e-bussines."
    },
    {
        abbr: "Lab Asst",
        title: "Assistent Forum Pemrograman",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/pemrograman-asis.png",
        path: "",
        techDesc: "Assistent Forum Pemrograman — focus on Programing class."
    },
    {
        abbr: "Lab Koor",
        title: "Assistent Forum Design Grafis",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/design-koor.png",
        path: "",
        techDesc: "Koordinator Forum Design Grafis — focus on Design Grafis class."
    },
    {
        abbr: "Lab Asst",
        title: "Assistent Forum Operational System",
        issuer: "AMIKOM Yogyakarta",
        date: "2022/2023",
        img: "../../static/sertif/os-asis.png",
        path: "",
        techDesc: "Assistent Forum Operational System — focus on Operating System."
    },
    {
        abbr: "Training",
        title: "Studi Indipendent",
        issuer: "MSIB",
        date: "2022/2023",
        img: "../../static/sertif/msib.png",
        path: "",
        techDesc: "Studi Indipendent — focus on MSIB studiying full-stack development."
    }
];

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderCertifications() {
    const container = document.getElementById('cert-container');
    if (!container) return;

    container.innerHTML = certificationsData.map((cert, i) => {
        const safeTitle = (cert.title || '').replace(/"/g, '&quot;');
        const safeDesc = (cert.techDesc || '').replace(/"/g, '&quot;');
        const safeImg = (cert.img || '').replace(/"/g, '&quot;');

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

    // Use event delegation on container — works regardless of script load order
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.cert-card');
        if (!card) return;

        const title = card.getAttribute('data-title');
        const desc = card.getAttribute('data-tech-desc');
        const img = card.getAttribute('data-img');

        // Prefer the new Modal singleton if it exists
        if (window.Modal && window.Modal.open) {
            window.Modal.open(img, title, null, desc);
        } else if (window.openProjectModal) {
            // Fallback to the global wrapper
            window.openProjectModal(title, desc, img, false);
        }
    });
}

// Run after DOM — core.js may already be loaded by then
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCertifications);
} else {
    renderCertifications();
}
