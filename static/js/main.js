document.addEventListener('DOMContentLoaded', () => {
    console.log('Operational Status: System v1.5.0 - Muhammad Saifulloh [LEN_COMPLIANT]');

    // --- Modal Logic: Mechanical-Humanist ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeBtn = document.getElementById('modal-close');

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const imgPath = card.getAttribute('data-img');
            const title = card.querySelector('h4').textContent;
            const desc = card.getAttribute('data-tech-desc') || 'Project Technical Overview. All systems operational.';
            
            if (imgPath) {
                modalImg.src = imgPath;
                modalTitle.textContent = title;
                modalDesc.textContent = desc;
                modal.classList.add('active');
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // --- GitHub Dynamic Activity ---
    async function fetchGitHubData() {
        const username = 'saiflll';
        const repoContainer = document.getElementById('github-repos');
        
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`);
            const repos = await response.json();
            
            if (repoContainer) {
                repoContainer.innerHTML = repos.map(repo => `
                    <a href="${repo.html_url}" target="_blank" class="repo-card block">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-white text-sm tracking-tight">${repo.name}</h4>
                            <span class="text-[9px] font-mono text-eng uppercase">${repo.language || 'Code'}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 line-clamp-2 mb-3">
                            ${repo.description || 'No description available for this critical industrial module.'}
                        </p>
                        <div class="flex items-center gap-4 text-[9px] font-mono text-slate-600">
                            <span>⭐ ${repo.stargazers_count}</span>
                            <span>🔄 ${new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) {
            console.error('Core Telemetry Error: Failed to fetch GitHub activity.', error);
        }
    }

    fetchGitHubData();

    // --- Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('mobile-nav-active');
            
            // Toggle hamburger animation if icons exist
            const menuIcon = mobileMenuBtn.querySelector('.menu-icon');
            const closeIcon = mobileMenuBtn.querySelector('.close-icon');
            if (menuIcon && closeIcon) {
                menuIcon.classList.toggle('hidden');
                closeIcon.classList.toggle('hidden');
            }
        });

        // Close menu when clicking a link
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.classList.remove('mobile-nav-active');
            });
        });
    }
});
