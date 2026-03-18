/**
 * LOADER.JS — Universal Page Loading Spinner
 * Injects the loader overlay and hides it when DOMContentLoaded fires.
 */
(function () {
    // Inject loader element synchronously before anything else renders
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div class="custom-loader"></div>
        <span class="loader-label">Initializing...</span>
    `;
    document.documentElement.appendChild(loader);

    // Hide on DOMContentLoaded with slight delay for smooth transition
    const hide = () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => loader.remove(), 600);
        }, 280);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hide);
    } else {
        hide();
    }
})();
