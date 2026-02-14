const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Store pending payments for confirmation
const pendingPayments = new Map();

// Format Moscow time
function getMoscowTime() {
    const now = new Date();
    return now.toLocaleString('ru-RU', {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// API endpoint to send payment notification
app.post('/api/payment-notification', async (req, res) => {
    try {
        const { orderData, paymentId } = req.body;

        // Store payment data
        pendingPayments.set(paymentId, {
            ...orderData,
            timestamp: Date.now(),
            status: 'pending'
        });

        // Format ticket info
        const ticketInfo = orderData.tickets
            .map((ticket, index) => {
                if (ticket.quantity > 0) {
                    return `${ticket.name} (${ticket.quantity} шт.)`;
                }
                return null;
            })
            .filter(Boolean)
            .join(', ');

        // Send notification to group
        const groupMessage = `🔔🦣 перешел на страницу оплаты🔔
ФИО: ${orderData.customer.name}
Сумма: ${orderData.total} руб.
${orderData.event.city} | ${orderData.event.title} | ${ticketInfo} | ${orderData.event.datetime}`;

        await bot.sendMessage(process.env.GROUP_CHAT_ID, groupMessage);

        // Send confirmation request to admin
        const adminMessage = `📋 Новый заказ #${paymentId}

👤 ${orderData.customer.name}
📧 ${orderData.customer.email}
📱 ${orderData.customer.phone}

🎭 Мероприятие: ${orderData.event.title}
📍 ${orderData.event.city}, ${orderData.event.address}
📅 ${orderData.event.datetime}

🎫 Билеты:
${ticketInfo}

💰 Сумма: ${orderData.total} руб.

⏰ Заказ создан: ${getMoscowTime()}`;

        await bot.sendMessage(process.env.ADMIN_USER_ID, adminMessage, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Подтвердить оплату', callback_data: `confirm_${paymentId}` },
                        { text: '❌ Отклонить', callback_data: `reject_${paymentId}` }
                    ]
                ]
            }
        });

        res.json({ success: true, paymentId });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint to check payment status
app.get('/api/payment-status/:paymentId', (req, res) => {
    const { paymentId } = req.params;
    const payment = pendingPayments.get(paymentId);

    if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({
        success: true,
        status: payment.status,
        message: payment.message || ''
    });
});

// Handle Telegram bot callbacks
bot.on('callback_query', async (callbackQuery) => {
    const { data, message } = callbackQuery;
    const [action, paymentId] = data.split('_');

    const payment = pendingPayments.get(paymentId);

    if (!payment) {
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: 'Заказ не найден или уже обработан',
            show_alert: true
        });
        return;
    }

    if (action === 'confirm') {
        payment.status = 'confirmed';
        payment.message = 'Оплата подтверждена администратором';

        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Оплата подтверждена'
        });

        await bot.editMessageText(
            message.text + '\n\n✅ ОПЛАТА ПОДТВЕРЖДЕНА',
            {
                chat_id: message.chat.id,
                message_id: message.message_id
            }
        );

        // Notify group
        await bot.sendMessage(
            process.env.GROUP_CHAT_ID,
            `✅ Оплата подтверждена для заказа ${payment.customer.name} на сумму ${payment.total} руб.`
        );

    } else if (action === 'reject') {
        payment.status = 'rejected';
        payment.message = 'Оплата отклонена. Пожалуйста, попробуйте снова или обратитесь в поддержку.';

        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Оплата отклонена'
        });

        await bot.editMessageText(
            message.text + '\n\n❌ ОПЛАТА ОТКЛОНЕНА',
            {
                chat_id: message.chat.id,
                message_id: message.message_id
            }
        );

        // Notify group
        await bot.sendMessage(
            process.env.GROUP_CHAT_ID,
            `❌ Оплата отклонена для заказа ${payment.customer.name}`
        );
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: 'running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🤖 Telegram bot is active`);
});

// Handle bot errors
bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error);
});
