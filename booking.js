// Booking System - Full implementation

class BookingSystem {
    constructor(eventData) {
        this.eventData = eventData;
        this.selectedDate = null;
        this.selectedSession = null;
        this.tickets = [];
        this.currentStep = 1; // 1: seats, 2: checkout
        this.init();
    }

    init() {
        this.attachScheduleEvents();

        // Listen for custom event from event.html
        document.addEventListener('openBooking', (e) => {
            const { time, price } = e.detail;
            const session = {
                time: time,
                date: '12 Декабря', // Default date for now
                price: price
            };
            this.openBookingModal(session);
        });
    }

    // Attach events to "Полное расписание" links
    attachScheduleEvents() {
        const scheduleLinks = document.querySelectorAll('.schedule-link');
        scheduleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFullSchedule();
            });
        });

        // Also attach to existing schedule cards for quick booking
        const scheduleCards = document.querySelectorAll('.schedule-card');
        scheduleCards.forEach(card => {
            card.addEventListener('click', () => {
                const time = card.querySelector('.schedule-time').textContent;
                this.openBookingModal({ time });
            });
        });
    }

    // Show full schedule modal
    showFullSchedule() {
        const modal = this.createScheduleModal();
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    createScheduleModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const sessions = this.generateSessions();

        overlay.innerHTML = `
            <div class="modal-container">
                <div class="schedule-modal">
                    <div class="schedule-modal-header">
                        <h2 class="schedule-modal-title">Расписание сеансов</h2>
                        <button class="modal-close" aria-label="Закрыть">&times;</button>
                    </div>
                    <div class="schedule-list">
                        ${sessions.map(session => this.createSessionItem(session)).join('')}
                    </div>
                </div>
            </div>
        `;

        // Close button
        overlay.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(overlay);
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });

        // Attach price button events
        overlay.querySelectorAll('.schedule-price-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.closeModal(overlay);
                setTimeout(() => this.openBookingModal(sessions[index]), 300);
            });
        });

        return overlay;
    }

    generateSessions() {
        const sessions = [
            { date: 12, month: 'Дек', day: 'ПЯТНИЦА', time: '17:00', price: this.eventData.basePrice },
            { date: 13, month: 'Дек', day: 'СУББОТА', time: '11:00', price: this.eventData.basePrice },
            { date: 13, month: 'Дек', day: 'СУББОТА', time: '14:00', price: this.eventData.basePrice },
            { date: 13, month: 'Дек', day: 'СУББОТА', time: '17:00', price: this.eventData.basePrice },
            { date: 14, month: 'Дек', day: 'ВОСКРЕСЕНЬЕ', time: '11:00', price: this.eventData.basePrice },
            { date: 14, month: 'Дек', day: 'ВОСКРЕСЕНЬЕ', time: '14:00', price: this.eventData.basePrice },
        ];
        return sessions;
    }

    createSessionItem(session) {
        return `
            <div class="schedule-item">
                <div class="schedule-date">
                    <div class="schedule-date-number">${session.date}</div>
                    <div class="schedule-date-month">${session.month}</div>
                    <div class="schedule-date-day">${session.day}</div>
                </div>
                <div class="schedule-info">
                    <div class="schedule-time">${session.time}</div>
                    <div class="schedule-location">${this.eventData.address}</div>
                </div>
                <button class="schedule-price-btn">От ${session.price} ₽</button>
            </div>
        `;
    }

    // Open booking modal
    openBookingModal(session) {
        this.selectedSession = session;
        const modal = this.createBookingModal();
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    createBookingModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay booking-modal-overlay';

        overlay.innerHTML = `
            <div class="modal-container">
                <div class="booking-modal">
                    <div class="booking-tabs">
                        <button class="booking-tab ${this.currentStep === 1 ? 'active' : ''}" data-step="1">ВЫБОР МЕСТ</button>
                        <button class="booking-tab ${this.currentStep === 2 ? 'active' : ''}" data-step="2">ОФОРМЛЕНИЕ ЗАКАЗА</button>
                    </div>
                    <div class="booking-content">
                        ${this.currentStep === 1 ? this.createSeatsContent() : this.createCheckoutContent()}
                    </div>
                </div>
            </div>
        `;

        // Tab switching
        overlay.querySelectorAll('.booking-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const step = parseInt(tab.dataset.step);
                if (step <= this.currentStep) {
                    this.switchStep(overlay, step);
                }
            });
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });

        this.attachBookingEvents(overlay);

        return overlay;
    }

    createSeatsContent() {
        return `
            <div class="booking-location">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                ${this.eventData.address}
            </div>
            
            <div class="calendar-section">
                <div class="calendar-month">Декабрь</div>
                <div class="calendar-grid">
                    ${this.createCalendar()}
                </div>
                <div class="selected-session">
                    <strong>12 Декабрь 17:00 - 23:00</strong><br>
                    Осталось карт: 1
                </div>
            </div>
            
            <div class="ticket-types-section">
                <h3 class="ticket-types-title">ТИПЫ КАРТ</h3>
                ${this.createTicketTypes()}
            </div>
            
            <button class="purchase-btn" id="purchaseBtn" disabled>КУПИТЬ</button>
        `;
    }

    createCalendar() {
        const days = [];
        const disabledDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const availableDays = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

        for (let i = 1; i <= 31; i++) {
            const isDisabled = disabledDays.includes(i);
            const isAvailable = availableDays.includes(i);
            const isSelected = i === 12;

            days.push(`
                <button 
                    class="calendar-day ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}"
                    ${isDisabled ? 'disabled' : ''}
                    data-day="${i}"
                >
                    ${i}
                </button>
            `);
        }

        return days.join('');
    }

    getTicketTypes() {
        return [
            { price: 2990, name: 'Входная карта', discount: null },
            { price: 4980, name: 'Входная карта «для двоих»', discount: '-50% на вторую входную карту' },
            { price: 2490, name: 'Льготная входная карта', discount: '(школьники, студенты, военнослужащие, пенсионеры)' },
            { price: 3490, name: 'Льготная входная карта «для двоих»', discount: '(школьники, студенты, военнослужащие, пенсионеры)\n-50% на вторую входную карту' },
        ];
    }

    createTicketTypes() {
        const types = this.getTicketTypes();

        return types.map((type, index) => `
            <div class="ticket-type">
                <div class="ticket-type-info">
                    <div class="ticket-type-price">${type.price} ₽</div>
                    <div class="ticket-type-name">${type.name}</div>
                    ${type.discount ? `<div class="ticket-type-discount">${type.discount}</div>` : ''}
                </div>
                <div class="ticket-counter">
                    <button class="counter-btn minus-btn" data-index="${index}">−</button>
                    <span class="counter-value" data-index="${index}">0</span>
                    <button class="counter-btn plus-btn" data-index="${index}">+</button>
                </div>
            </div>
        `).join('');
    }

    createCheckoutContent() {
        const total = this.calculateTotal();

        return `
            <div class="order-summary">
                <div class="order-title">ВАШ ЗАКАЗ:</div>
                <div class="order-event-name">«${this.eventData.title}»</div>
                <div class="order-details">
                    ${this.eventData.address}<br>
                    12 Декабрь 17:00 - 23:00
                </div>
                <div class="order-total">
                    <div class="order-total-label">К ОПЛАТЕ:</div>
                    <div class="order-total-amount">${total} ₽</div>
                </div>
            </div>
            
            <form class="checkout-form" id="checkoutForm">
                <div class="form-group">
                    <label class="form-label">Ваше ФИО</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Ваш телефон</label>
                    <input type="tel" class="form-input" name="phone" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Ваша почта</label>
                    <input type="email" class="form-input" name="email" required>
                </div>
                <button type="submit" class="submit-btn">ОПЛАТИТЬ</button>
            </form>
        `;
    }

    attachBookingEvents(modal) {
        if (this.currentStep === 1) {
            // Calendar selection
            modal.querySelectorAll('.calendar-day.available').forEach(day => {
                day.addEventListener('click', () => {
                    modal.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                    day.classList.add('selected');
                });
            });

            // Counter buttons
            const ticketCounts = [0, 0, 0, 0];

            modal.querySelectorAll('.plus-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    ticketCounts[index]++;
                    modal.querySelector(`.counter-value[data-index="${index}"]`).textContent = ticketCounts[index];
                    this.updatePurchaseButton(modal, ticketCounts);
                });
            });

            modal.querySelectorAll('.minus-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    if (ticketCounts[index] > 0) {
                        ticketCounts[index]--;
                        modal.querySelector(`.counter-value[data-index="${index}"]`).textContent = ticketCounts[index];
                        this.updatePurchaseButton(modal, ticketCounts);
                    }
                });
            });

            // Purchase button
            const purchaseBtn = modal.querySelector('#purchaseBtn');
            purchaseBtn.addEventListener('click', () => {
                this.tickets = ticketCounts;
                this.currentStep = 2;
                this.switchStep(modal, 2);
            });
        } else {
            // Checkout form
            const form = modal.querySelector('#checkoutForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);

                // Get Moscow time
                const moscowTime = new Date().toLocaleString('ru-RU', {
                    timeZone: 'Europe/Moscow',
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Format tickets with names and quantities
                const ticketTypes = this.getTicketTypes();
                const ticketsWithDetails = this.tickets.map((quantity, index) => ({
                    name: ticketTypes[index].name,
                    price: ticketTypes[index].price,
                    quantity: quantity
                }));

                const orderData = {
                    event: {
                        title: this.eventData.title,
                        city: this.eventData.city || 'Москва',
                        address: this.eventData.address,
                        datetime: '12 Декабрь 17:00 - 23:00' // Format: "DD Month HH:MM - HH:MM"
                    },
                    tickets: ticketsWithDetails,
                    customer: {
                        name: formData.get('name'),
                        phone: formData.get('phone'),
                        email: formData.get('email')
                    },
                    total: this.calculateTotal(),
                    createdAt: moscowTime
                };

                // Save to localStorage
                localStorage.setItem('orderData', JSON.stringify(orderData));

                // Redirect to loading page instead of payment
                window.location.href = 'loading.html';
            });
        }
    }

    updatePurchaseButton(modal, ticketCounts) {
        const total = ticketCounts.reduce((sum, count) => sum + count, 0);
        const btn = modal.querySelector('#purchaseBtn');
        btn.disabled = total === 0;
    }

    calculateTotal() {
        const prices = [2990, 4980, 2490, 3490];
        return this.tickets.reduce((sum, count, index) => sum + (count * prices[index]), 0);
    }

    switchStep(modal, step) {
        this.currentStep = step;
        const content = modal.querySelector('.booking-content');
        const tabs = modal.querySelectorAll('.booking-tab');

        // Update tabs
        tabs.forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.step) === step);
        });

        // Update content
        content.innerHTML = step === 1 ? this.createSeatsContent() : this.createCheckoutContent();

        // Reattach events
        this.attachBookingEvents(modal);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get event data from page
    const eventTitle = document.querySelector('.event-hero-title')?.textContent || 'Мероприятие';
    const eventAddress = document.querySelector('.schedule-address')?.textContent || 'Адрес не указан';

    // Extract city from page or use default
    const cityElement = document.querySelector('.event-hero-location') || document.querySelector('.schedule-city');
    const eventCity = cityElement?.textContent.split(',')[0].trim() || 'Москва';

    const eventData = {
        title: eventTitle,
        city: eventCity,
        address: eventAddress,
        basePrice: 2490
    };

    new BookingSystem(eventData);
});
