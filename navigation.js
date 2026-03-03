// Navigation Component - Shared across all pages
// Usage: Include this script and call initNavigation(currentCity, currentCategory)

function initNavigation(city = 'МОСКВА', activeCategory = 'Все') {
    const categories = [
        { name: 'Все', slug: 'all' },
        { name: 'Музеи', slug: 'museum' },
        { name: 'Выставки', slug: 'exhibition' },
        { name: 'Квесты', slug: 'quest' },
        { name: 'Экстрим', slug: 'extreme' },
        { name: 'Еда', slug: 'food' },
        { name: 'Шоу', slug: 'show' },
        { name: 'Досуг', slug: 'leisure' }
    ];

    const header = document.createElement('header');
    header.className = 'afisha-header';
    header.innerHTML = `
        <a href="/" class="afisha-logo" id="afishaLogo">
            <div class="afisha-logo-icon">≡</div>
            <div class="afisha-logo-text">
                <div class="afisha-logo-title">афиша</div>
                <div class="afisha-logo-city" id="cityLabel">${city.toUpperCase()}</div>
            </div>
        </a>
        
        <nav class="afisha-nav" id="categoryNav">
            ${categories.map(cat => `
                <a href="#" 
                   class="nav-pill ${cat.name === activeCategory ? 'active' : ''}" 
                   data-category="${cat.slug}"
                   data-name="${cat.name}">
                    ${cat.name}
                </a>
            `).join('')}
        </nav>
        
    `;

    // Insert at the beginning of body
    document.body.insertBefore(header, document.body.firstChild);

    // Add click handlers
    setupNavigationHandlers();
}

function setupNavigationHandlers() {
    // Logo click - go to home with current city
    document.getElementById('afishaLogo').addEventListener('click', (e) => {
        e.preventDefault();
        const currentCity = getCurrentCityFromURL();
        window.location.href = currentCity ? `/?city=${currentCity}` : '/';
    });

    // Category pills click
    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.name;
            const currentCity = getCurrentCityFromURL();

            // Update active state
            document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');

            // Dispatch custom event for filtering
            document.dispatchEvent(new CustomEvent('categoryChange', {
                detail: { category, slug: e.target.dataset.category }
            }));
        });
    });
}

function getCurrentCityFromURL() {
    // Try to get city from URL path or query params
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');

    if (cityParam) return cityParam;

    // Try to extract from path (e.g., /moscow/event/...)
    const pathParts = window.location.pathname.split('/').filter(p => p);
    if (pathParts.length > 0 && pathParts[0] !== 'generator' && pathParts[0] !== 'admin-pannel') {
        return pathParts[0];
    }

    return null;
}

function updateCityLabel(city) {
    const label = document.getElementById('cityLabel');
    if (label) {
        label.textContent = city.toUpperCase();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initNavigation, updateCityLabel, getCurrentCityFromURL };
}
