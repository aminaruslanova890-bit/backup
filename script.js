// Global state
let allEvents = [];
let currentCity = 'Москва';
let currentCategory = 'Все';

document.addEventListener('DOMContentLoaded', () => {
    // Parse city from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCity = urlParams.get('city') || 'Москва';

    // Initialize navigation
    initNavigation(currentCity, currentCategory);

    loadEvents();
    initCategoryScroll();
    initSmoothScrolling();
    setupCategoryFilters();

    // Listen for category changes from navigation
    document.addEventListener('categoryChange', (e) => {
        currentCategory = e.detail.category;
        filterEventsByCategory(e.detail.category);
    });
});

// Load events from API
async function loadEvents() {
    const container = document.getElementById('eventsContainer');
    try {
        const response = await fetch('http://localhost:3002/api/events');
        if (!response.ok) throw new Error('Network response was not ok');

        allEvents = await response.json();
        renderEvents(allEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: red;">Ошибка загрузки мероприятий</div>';
    }
}

// Render events to DOM
function renderEvents(events) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;

    container.innerHTML = ''; // Clear current content

    if (events.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">Ничего не найдено в этой категории</div>';
        return;
    }

    events.forEach(event => {
        const card = document.createElement('article');
        card.className = 'event-card event-card-large'; // Default to large for now

        // Random rating logic for demo
        const rating = (Math.random() * (9.9 - 7.0) + 7.0).toFixed(1);

        card.innerHTML = `
            <a href="event.html?id=${event.id}" style="text-decoration: none; color: inherit; display: block;">
                <div class="event-image" style="background-image: url('${event.image}'); background-size: cover; background-position: center;">
                    <div class="event-rating">${rating}</div>
                </div>
            </a>
            <div class="event-content">
                <div class="event-category">${event.category.toUpperCase()}</div>
                <h2 class="event-title">${event.title}</h2>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    <a href="event.html?id=${event.id}" class="btn-primary" style="text-decoration: none; display: block; text-align: center;">Купить билет</a>
                    <button class="btn-favorite" aria-label="Добавить в избранное">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);

        // Add hover effect
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // Re-initialize favorites for new elements
    initFavoriteButtons();
}

// Setup category filters
function setupCategoryFilters() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            buttons.forEach(b => b.classList.remove('category-btn-active'));
            btn.classList.add('category-btn-active');

            // Filter Logic
            const category = btn.getAttribute('data-cat');
            filterEventsByCategory(category);
        });
    });
}

// Filter events by category
function filterEventsByCategory(category) {
    if (category === 'all' || category === 'Все') {
        renderEvents(allEvents);
    } else {
        const filtered = allEvents.filter(e => e.category === category);
        renderEvents(filtered);
    }
}

// Favorite button functionality
function initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');

    favoriteButtons.forEach(button => {
        // Remove old listeners to prevent duplicates if re-init (simple way: clone node or use event delegation)
        // Here we just accept it might add multiple if called repeatedly on same element, but we clear container so it's fresh elements.
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            button.classList.toggle('active');

            // Add animation
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = '';
            }, 200);
        });
    });
}

// Category scroll with mouse drag
function initCategoryScroll() {
    const scroll = document.querySelector('.categories-scroll');
    if (!scroll) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    scroll.addEventListener('mousedown', (e) => {
        isDown = true;
        scroll.style.cursor = 'grabbing';
        startX = e.pageX - scroll.offsetLeft;
        scrollLeft = scroll.scrollLeft;
    });

    scroll.addEventListener('mouseleave', () => {
        isDown = false;
        scroll.style.cursor = 'grab';
    });

    scroll.addEventListener('mouseup', () => {
        isDown = false;
        scroll.style.cursor = 'grab';
    });

    scroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroll.offsetLeft;
        const walk = (x - startX) * 2;
        scroll.scrollLeft = scrollLeft - walk;
    });
}

// Smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Parallax effect for new images
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.event-image');

    if (window.innerWidth > 768) { // Only on desktop
        parallaxElements.forEach((element, index) => {
            // Simple parallax if needed, but background-attachment: fixed might be better for performance if simple
            // Let's keep it minimal to avoid junkiness
        });
    }
});
