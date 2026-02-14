// Chat Widget Functionality

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createWidget();
        this.attachEvents();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <button class="chat-button" aria-label="Открыть чат">
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                <span class="chat-badge">1</span>
            </button>
            <div class="chat-popup">
                <div class="chat-header">
                    Здравствуйте. Чем могу помочь?
                </div>
                <div class="chat-body">
                    <p style="color: #666; font-size: 14px;">Добро пожаловать! Задайте ваш вопрос, и я постараюсь помочь.</p>
                </div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input" placeholder="Enter your message...">
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        this.button = widget.querySelector('.chat-button');
        this.popup = widget.querySelector('.chat-popup');
        this.input = widget.querySelector('.chat-input');
    }

    attachEvents() {
        this.button.addEventListener('click', () => this.toggle());

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.chat-widget')) {
                this.close();
            }
        });

        // Send message on Enter
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.input.value.trim()) {
                this.sendMessage(this.input.value);
                this.input.value = '';
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.popup.classList.add('active');
        this.input.focus();

        // Remove badge
        const badge = this.button.querySelector('.chat-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    close() {
        this.isOpen = false;
        this.popup.classList.remove('active');
    }

    sendMessage(message) {
        const chatBody = this.popup.querySelector('.chat-body');
        const messageEl = document.createElement('div');
        messageEl.style.cssText = 'margin: 8px 0; padding: 8px 12px; background: #f0f0f0; border-radius: 12px; font-size: 14px;';
        messageEl.textContent = message;
        chatBody.appendChild(messageEl);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Simulate response
        setTimeout(() => {
            const response = document.createElement('div');
            response.style.cssText = 'margin: 8px 0; padding: 8px 12px; background: #FF4C4C; color: white; border-radius: 12px; font-size: 14px;';
            response.textContent = 'Спасибо за ваше сообщение! Наш оператор скоро свяжется с вами.';
            chatBody.appendChild(response);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});
