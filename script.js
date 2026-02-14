// Афиша.ru - Interactive Features

// Favorite button functionality
document.addEventListener('DOMContentLoaded', () => {
    initFavoriteButtons();
    initCategoryScroll();
    initSmoothScrolling();
});

// Initialize favorite buttons
function initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    favoriteButtons.forEach(button => {
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

// Category button active state
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('category-btn-active'));
        button.classList.add('category-btn-active');
    });
});

// Add hover effect for event cards
const eventCards = document.querySelectorAll('.event-card');
eventCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Parallax effect for event images (subtle)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.event-image');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5;
        const yPos = -(scrolled * speed / (index + 1));
        element.style.transform = `translateY(${yPos}px)`;
    });
});
