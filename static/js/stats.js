/**
 * STATS.JS — Animated Skill/Integrity Stats Bars
 * Edit the data objects below to change labels, values, and icons.
 * Values are 0–100 (percentage).
 *
 * Renders into:
 *   #eng-stats-container  → engineering.html sidebar
 *   #dev-stats-container  → development.html sidebar
 */

// ── SVG ICON SNIPPETS (inline, no external library) ───────────────────────────
const ICONS = {
    shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    lock:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    cpu:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/></svg>`,
    wifi:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
    zap:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    server:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    refresh:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    eye:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const engStats = [
    { label: "TKDN Compliance",       value: 85, icon: ICONS.shield,  tooltip: "Component localization compliance for government-linked industrial projects." },
    { label: "Firmware Hardening",    value: 95, icon: ICONS.lock,    tooltip: "Watchdog, secure-boot, CRC validation, and fault-handler coverage." },
    { label: "Protocol Coverage",     value: 90, icon: ICONS.cpu,     tooltip: "RS485, CAN, SPI, I2C, UART, LoRa, BLE, Modbus — field-tested." },
    { label: "Signal Integrity",      value: 80, icon: ICONS.wifi,    tooltip: "PCB layout, differential pairs, impedance matching up to 50Ω." },
    { label: "Real-Time Performance", value: 92, icon: ICONS.zap,     tooltip: "FreeRTOS task jitter < 1ms on Cortex-M4 at full load." }
];

const devStats = [
    { label: "Service Availability",  value: 99, icon: ICONS.server,  tooltip: "99.9% SLA on K8s clusters with automated failover and health checks." },
    { label: "Cluster Resilience",    value: 90, icon: ICONS.shield,  tooltip: "Multi-node deployment with auto-recovery and persistent volume claims." },
    { label: "API Throughput",        value: 87, icon: ICONS.zap,     tooltip: "gRPC + protobuf pipeline. Sustained 10k+ req/s at < 50ms p99 latency." },
    { label: "CI/CD Automation",      value: 94, icon: ICONS.refresh, tooltip: "GitHub Actions → Docker build → K8s rolling deploy. Zero manual steps." },
    { label: "Observability",         value: 82, icon: ICONS.eye,     tooltip: "Prometheus metrics, Grafana dashboards, structured JSON logging." }
];

// ─── RENDERER ─────────────────────────────────────────────────────────────────
function renderStats(containerId, statsData, accentColor) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = statsData.map((stat, i) => `
        <div class="stat-bar-item fade-up fade-up-${Math.min(i + 1, 5)}" data-index="${i}">
            <div class="flex justify-between items-center mb-1.5 gap-2">
                <div class="flex items-center gap-1.5">
                    <span class="stat-icon text-${accentColor}">${stat.icon}</span>
                    <p class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">${stat.label}</p>
                </div>
                <span class="stat-value text-[10px] font-black text-${accentColor} tabular-nums flex-shrink-0">0%</span>
            </div>
            <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-help group relative"
                 title="${stat.tooltip}">
                <div class="stat-bar h-full bg-${accentColor} rounded-full w-0 transition-none"
                     data-target="${stat.value}"></div>
                <!-- Tooltip popup -->
                <div class="absolute bottom-full left-0 mb-2 w-56 p-3 bg-dark-900 border border-white/10 rounded-xl
                            text-[10px] text-slate-400 leading-relaxed font-mono
                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
                    ${stat.tooltip}
                </div>
            </div>
        </div>
    `).join('');
}

// ─── ANIMATED FILL on scroll into view ────────────────────────────────────────
function animateBars(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const bars = entry.target.querySelectorAll('.stat-bar');
            bars.forEach((bar, i) => {
                const target = parseInt(bar.getAttribute('data-target'), 10);
                const valueEl = bar.closest('.stat-bar-item')?.querySelector('.stat-value');

                setTimeout(() => {
                    bar.style.transition = `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 120}ms`;
                    bar.style.width = `${target}%`;

                    let current = 0;
                    const duration = 1200 + i * 120;
                    const steps = 60;
                    const increment = target / steps;
                    const interval = duration / steps;

                    const timer = setInterval(() => {
                        current = Math.min(current + increment, target);
                        if (valueEl) valueEl.textContent = `${Math.round(current)}%`;
                        if (current >= target) clearInterval(timer);
                    }, interval);
                }, 100);
            });

            observer.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    observer.observe(container);
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('eng-stats-container')) {
        renderStats('eng-stats-container', engStats, 'eng');
        animateBars('eng-stats-container');
    }
    if (document.getElementById('dev-stats-container')) {
        renderStats('dev-stats-container', devStats, 'dev-light');
        animateBars('dev-stats-container');
    }
});
