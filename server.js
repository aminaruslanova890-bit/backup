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
app.use(express.static(__dirname)); // Serve static files from root

// Routes without .html extension
app.get('/generator', (req, res) => {
    res.sendFile(__dirname + '/generator.html');
});

app.get('/admin-pannel', (req, res) => {
    res.sendFile(__dirname + '/admin-pannel.html');
});

// New route for event pages with SEO-friendly URLs
// Example: /moscow/event/show/123
app.get('/:city/event/:category/:id', (req, res) => {
    // Check if link is blocked if lid (linkId) is provided
    const linkId = req.query.lid;
    if (linkId) {
        const link = links.get(linkId);
        if (link && !link.isActive) {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <title>Доступ ограничен</title>
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; }
                        .error-box { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                        h1 { color: #dc3545; margin-bottom: 16px; }
                        p { color: #6c757d; font-size: 18px; }
                    </style>
                </head>
                <body>
                    <div class="error-box">
                        <h1>Ссылка заблокирована</h1>
                        <p>Данная страница более недоступна. Пожалуйста, обратитесь к администратору.</p>
                    </div>
                </body>
                </html>
            `);
        }
    }
    res.sendFile(__dirname + '/event.html');
});

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// --- DATA STORAGE (In-Memory) ---
const cities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград",
    "Краснодар", "Саратов", "Тюмень", "Тольятти", "Ижевск",
    "Барнаул", "Ульяновск", "Иркутск", "Хабаровск", "Махачкала",
    "Владивосток", "Ярославль", "Оренбург", "Томск", "Кемерово",
    "Альметьевск", "Ангарск", "Армавир", "Архангельск", "Астрахань",
    "Балаково", "Балашиха", "Батайск", "Белгород", "Березники",
    "Бийск", "Братск", "Брянск", "Буйнакск", "Великий Новгород",
    "Владикавказ", "Дербент"
];

const events = [
    // --- 🎨 Выставки, музеи, искусство (Музеи) ---
    {
        id: "dali_picasso_vr",
        category: "Музеи",
        title: "Сальвадор Дали & Пабло Пикассо VR Gallery",
        description: "Погружение в мир великих художников в формате виртуальной реальности. Ожившие картины, звук и эффект присутствия.",
        image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 900,
        age: "12+",
        duration: "1 час"
    },
    {
        id: "real_space",
        category: "Музеи",
        title: "Реальный космос",
        description: "Интерактивная выставка о Вселенной, планетах и космических технологиях. Подходит для взрослых и детей.",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 800,
        age: "6+",
        duration: "1.5 часа"
    },
    {
        id: "warhol_rus_art",
        category: "Музеи",
        title: "Энди Уорхол и русское искусство",
        description: "Современная экспозиция о влиянии поп-арта на русскую художественную культуру.",
        image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 700,
        age: "16+",
        duration: "2 часа"
    },
    {
        id: "aivazovsky_kandinsky",
        category: "Музеи",
        title: "Айвазовский. Кандинский. Живые полотна",
        description: "Мультимедийное шоу, где шедевры оживают на больших экранах под музыку.",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1000,
        age: "0+",
        duration: "45 минут"
    },
    {
        id: "wax_museum",
        category: "Музеи",
        title: "Музей восковых фигур",
        description: "Реалистичные фигуры знаменитостей, исторических личностей и киногероев.",
        image: "https://images.unsplash.com/photo-1545989253-02cc26577f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 600,
        age: "6+",
        duration: "1 час"
    },
    {
        id: "vr_museum",
        category: "Музеи",
        title: "VR Музей",
        description: "Выставки в виртуальной реальности с возможностью перемещаться и взаимодействовать с экспонатами.",
        image: "https://images.unsplash.com/photo-1626386449699-595d73854ee8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1200,
        age: "10+",
        duration: "1 час"
    },
    {
        id: "weapon_history",
        category: "Музеи",
        title: "Музей истории оружия",
        description: "Коллекция оружия разных эпох с подробными историческими описаниями.",
        image: "https://images.unsplash.com/photo-1595163351939-74d32e56bd69?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 500,
        age: "12+",
        duration: "1.5 часа"
    },
    {
        id: "jewelry_museum",
        category: "Музеи",
        title: "Музей драгоценностей",
        description: "Экспозиция редких украшений, камней и ювелирных изделий.",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb053331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1500,
        age: "6+",
        duration: "1 час"
    },
    {
        id: "planetarium_saturn",
        category: "Музеи",
        title: "Планетарий Saturn",
        description: "Космические фильмы и шоу под куполом планетария. Захватывающее путешествие среди звёзд.",
        image: "https://images.unsplash.com/photo-1532968961962-8e0bf3fb06a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 800,
        age: "0+",
        duration: "1 час"
    },

    // --- 🧩 Квесты и экшн-развлечения (Квесты) ---
    {
        id: "last_excursion",
        category: "Квесты",
        title: "Последняя экскурсия. Выжить любой ценой",
        description: "Экстремальный квест с элементами хоррора, где важно принимать быстрые решения.",
        image: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3500,
        age: "18+",
        duration: "90 минут"
    },
    {
        id: "cursed_abode",
        category: "Квесты",
        title: "Обитель проклятых",
        description: "Мистический квест с напряжённой атмосферой и неожиданными сюжетными поворотами.",
        image: "https://images.unsplash.com/photo-1509248961158-bec54f61c071?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3000,
        age: "16+",
        duration: "60 минут"
    },
    {
        id: "escape_alcatraz",
        category: "Квесты",
        title: "Побег из Алькатраса",
        description: "Командный квест по мотивам легендарной тюрьмы. Логика, стратегия и время.",
        image: "https://images.unsplash.com/photo-1569769363063-f2730da1d0d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2800,
        age: "12+",
        duration: "60 минут"
    },
    {
        id: "bank_heist",
        category: "Квесты",
        title: "Ограбление банка",
        description: "Динамичный квест с планированием, задачами и ограниченным временем.",
        image: "https://images.unsplash.com/photo-1563911892437-1c6c54715869?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3200,
        age: "12+",
        duration: "75 минут"
    },
    {
        id: "time_machine",
        category: "Квесты",
        title: "Машина времени",
        description: "Приключенческий квест с путешествием между эпохами.",
        image: "https://images.unsplash.com/photo-1501139083538-0139583c61dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2500,
        age: "10+",
        duration: "60 минут"
    },
    {
        id: "dont_breathe",
        category: "Квесты",
        title: "Не дыши",
        description: "Квест на максимальное напряжение и концентрацию, где важна тишина.",
        image: "https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3600,
        age: "18+",
        duration: "60 минут"
    },
    {
        id: "outlast_horror",
        category: "Квесты",
        title: "Аутласт",
        description: "Хоррор-квест для любителей острых ощущений и сильных эмоций.",
        image: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 4000,
        age: "18+",
        duration: "90 минут"
    },
    {
        id: "sherlock_detective",
        category: "Квесты",
        title: "Шерлок",
        description: "Детективный квест с расследованием, уликами и логическими задачами.",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2200,
        age: "12+",
        duration: "60 минут"
    },

    // --- 🏎 Активный отдых и адреналин (Экстрим) ---
    {
        id: "aerotube_fly",
        category: "Экстрим",
        title: "Аэротруба",
        description: "Полёт в мощном воздушном потоке. Безопасно и подходит новичкам.",
        image: "https://images.unsplash.com/photo-1541539550156-3a339994c6f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2500,
        age: "6+",
        duration: "15 минут"
    },
    {
        id: "horse_riding",
        category: "Экстрим",
        title: "Прогулка на лошадях",
        description: "Спокойный отдых на природе и общение с лошадьми.",
        image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1800,
        age: "6+",
        duration: "1 час"
    },
    {
        id: "karting_race",
        category: "Экстрим",
        title: "Картинг",
        description: "Гонки на профессиональной трассе с заездами на скорость.",
        image: "https://images.unsplash.com/photo-1516003506937-2317135e806c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1200,
        age: "10+",
        duration: "20 минут"
    },
    {
        id: "paintball_game",
        category: "Экстрим",
        title: "Пейнтбол",
        description: "Командная игра с тактикой, укрытиями и адреналином.",
        image: "https://images.unsplash.com/photo-1559639556-9e66db890538?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1500,
        age: "12+",
        duration: "2 часа"
    },
    {
        id: "quad_biking",
        category: "Экстрим",
        title: "Прогулка на квадроциклах",
        description: "Активное приключение по пересечённой местности.",
        image: "https://images.unsplash.com/photo-1533842104183-f8a18451e06d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3500,
        age: "16+",
        duration: "1.5 часа"
    },
    {
        id: "shooting_range",
        category: "Экстрим",
        title: "Профессиональный тир",
        description: "Стрельба под контролем инструктора из различных видов оружия.",
        image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2000,
        age: "18+",
        duration: "1 час"
    },

    // --- 🍷 Еда, дегустации и атмосфера (Еда) ---
    {
        id: "cheese_wine_tasting",
        category: "Еда",
        title: "Дегустация сыров и вин",
        description: "Подборка вин и сыров с комментариями специалиста. Идеально для пар.",
        image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 4500,
        age: "18+",
        duration: "2 часа"
    },
    {
        id: "beer_tasting",
        category: "Еда",
        title: "Дегустация пива",
        description: "Знакомство с сортами пива и особенностями их вкуса.",
        image: "https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2000,
        age: "18+",
        duration: "1.5 часа"
    },
    {
        id: "tea_ceremony",
        category: "Еда",
        title: "Дегустация чая",
        description: "Чайная церемония и редкие сорта из разных стран.",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1500,
        age: "6+",
        duration: "1 час"
    },
    {
        id: "gastro_tour",
        category: "Еда",
        title: "Гастро-тур «Tasty»",
        description: "Маршрут по лучшим гастро-локациям города.",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 5000,
        age: "16+",
        duration: "3 часа"
    },
    {
        id: "bbq_festival",
        category: "Еда",
        title: "Фестиваль BBQ & Smoke",
        description: "Мясо, дым, соусы и уличная еда в формате фестиваля.",
        image: "https://images.unsplash.com/photo-1529193591187-b1db30d69649?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1000,
        age: "0+",
        duration: "Весь день"
    },

    // --- 🎉 Шоу, фестивали, события (Шоу) ---
    {
        id: "roof_cinema",
        category: "Шоу",
        title: "Кинотеатр на крыше",
        description: "Просмотр фильмов под открытым небом с панорамным видом.",
        image: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1200,
        age: "12+",
        duration: "2 часа"
    },
    {
        id: "zoo_contact",
        category: "Шоу",
        title: "Контактный зоопарк",
        description: "Животные, которых можно кормить и гладить.",
        image: "https://images.unsplash.com/photo-1552885934-8b64e622432e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 600,
        age: "0+",
        duration: "Не ограничено"
    },
    {
        id: "party_bus",
        category: "Шоу",
        title: "Party Bus",
        description: "Вечеринка на колёсах с музыкой, светом и танцами.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3000,
        age: "18+",
        duration: "2 часа"
    },
    {
        id: "retro_life_exhibit",
        category: "Выставки",
        title: "Выставка «Retro life»",
        description: "Атмосфера прошлых десятилетий и культовые предметы эпохи.",
        image: "https://images.unsplash.com/photo-1550948537-130a1ce83314?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 800,
        age: "0+",
        duration: "1.5 часа"
    },
    {
        id: "japan_festival",
        category: "Шоу",
        title: "Фестиваль японской культуры",
        description: "Японская еда, традиции, костюмы и современная поп-культура.",
        image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 500,
        age: "0+",
        duration: "Весь день"
    },
    {
        id: "cooking_class",
        category: "Шоу",
        title: "Кулинарный мастер-класс",
        description: "Практическое приготовление блюд под руководством шеф-повара.",
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2500,
        age: "12+",
        duration: "2 часа"
    },
    {
        id: "magic_festival",
        category: "Шоу",
        title: "Фестиваль иллюзионистов",
        description: "Шоу фокусов и магии для всех возрастов.",
        image: "https://images.unsplash.com/photo-1534533990810-0931165a2542?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1800,
        age: "6+",
        duration: "2 часа"
    },
    {
        id: "moto_extreme",
        category: "Шоу",
        title: "Мотошоу «Extreme»",
        description: "Экстремальные трюки и зрелищные выступления моторайдеров.",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3000,
        age: "12+",
        duration: "2 часа"
    },
    {
        id: "laser_show",
        category: "Шоу",
        title: "Лазерное шоу с диджеем",
        description: "Музыка, световые эффекты и танцевальная атмосфера.",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 2000,
        age: "16+",
        duration: "3 часа"
    },
    {
        id: "sunset_romance",
        category: "Шоу",
        title: "Романтика на закате",
        description: "Красивое событие для пар с видом на закат и атмосферной обстановкой.",
        image: "https://images.unsplash.com/photo-1495619127755-2701915db95b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 5000,
        age: "18+",
        duration: "3 часа"
    },

    // --- 🎯 Спокойный досуг (Развлечения / Досуг) ---
    {
        id: "rage_room",
        category: "Досуг",
        title: "Комната гнева",
        description: "Безопасное пространство для снятия стресса и выплеска эмоций.",
        image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 3000,
        age: "18+",
        duration: "1 час"
    },
    {
        id: "billiards_club",
        category: "Досуг",
        title: "Бильярд",
        description: "Классическая игра для отдыха и общения.",
        image: "https://images.unsplash.com/photo-1585644163273-345331f24d9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 800,
        age: "12+",
        duration: "1 час"
    },
    {
        id: "bowling_center",
        category: "Досуг",
        title: "Боулинг",
        description: "Развлечение для компаний, друзей и семей.",
        image: "https://images.unsplash.com/photo-1542385150-1c390a1c62f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        priceFrom: 1200,
        age: "6+",
        duration: "1 час"
    }
];

// Map to store generated links: linkId -> { eventId, city, date, workerId, active: boolean, clicks: number, seats: number }
const links = new Map();

// Generate unique ID for links
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// --- API ENDPOINTS ---

// Get all cities
app.get('/api/cities', (req, res) => {
    res.json(cities);
});

// Get all events
app.get('/api/events', (req, res) => {
    res.json(events);
});

// Get event by ID
app.get('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
});

// Generate new link
app.post('/api/generate-link', (req, res) => {
    const { eventId, city, date, workerId, seats } = req.body;

    if (!eventId || !city || !workerId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const linkId = generateId();
    const linkData = {
        id: linkId,
        eventId,
        city,
        date,
        workerId,
        seats: seats || 1, // Default to 1 if not provided
        isActive: true,
        clicks: 0,
        createdAt: new Date()
    };

    links.set(linkId, linkData);

    // Return URL parameters that frontend can attach to event.html
    const params = `id=${eventId}&city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}&ref=${workerId}&lid=${linkId}`;

    res.json({ success: true, linkId, params });
});

// Get link data (for tracking/validation)
app.get('/api/link/:linkId', (req, res) => {
    const link = links.get(req.params.linkId);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    // Check if link is active
    if (!link.isActive) return res.status(403).json({ error: 'Link is disabled' });

    // Track click
    link.clicks++;

    res.json(link);
});

// Admin: Get all links
app.get('/api/admin/links', (req, res) => {
    const allLinks = Array.from(links.values());
    res.json(allLinks);
});

// Admin: Toggle link status
app.post('/api/admin/toggle-link', (req, res) => {
    const { linkId, isActive } = req.body;
    const link = links.get(linkId);

    if (!link) return res.status(404).json({ error: 'Link not found' });

    link.isActive = isActive;
    res.json({ success: true, link });
});

// Admin: Delete single link
app.delete('/api/admin/links/:id', (req, res) => {
    const { id } = req.params;
    if (links.has(id)) {
        links.delete(id);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Link not found' });
    }
});

// Admin: Delete all links
app.delete('/api/admin/links', (req, res) => {
    links.clear();
    res.json({ success: true });
});

// Admin: Update event image
app.patch('/api/admin/events/:id/image', (req, res) => {
    const { id } = req.params;
    const { image } = req.body;
    const event = events.find(e => e.id === id);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.image = image;
    res.json({ success: true, event });
});

// Admin: Update event details
app.patch('/api/admin/events/:id', (req, res) => {
    const { id } = req.params;
    const { title, category, description, image, priceFrom } = req.body;
    const idx = events.findIndex(e => e.id === id);

    if (idx === -1) return res.status(404).json({ error: 'Event not found' });

    if (title) events[idx].title = title;
    if (category) events[idx].category = category;
    if (description) events[idx].description = description;
    if (image !== undefined) events[idx].image = image;
    if (priceFrom) events[idx].priceFrom = priceFrom;

    res.json({ success: true, event: events[idx] });
});

// Admin: Add new event
app.post('/api/admin/events', (req, res) => {
    const { title, category, description, image, priceFrom } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const id = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
    const newEvent = {
        id,
        title,
        category: category || 'leisure',
        description: description || '',
        image: image || '',
        priceFrom: priceFrom || 2490
    };
    events.push(newEvent);
    res.json({ success: true, event: newEvent });
});


// --- LEGACY PAYMENT LOGIC (Still needed for bot interaction) ---

// Store pending payments for confirmation
const pendingPayments = new Map();

// Format Moscow time for notifications
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

        try {
            await bot.sendMessage(process.env.GROUP_CHAT_ID, groupMessage);
        } catch (e) { console.error('Bot group msg error', e); }

        // Send confirmation request to admin (if ID exists)
        if (process.env.ADMIN_USER_ID) {
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

            try {
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
            } catch (e) { console.error('Bot admin msg error', e); }
        }

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

        try {
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
        } catch (e) { console.error(e); }

    } else if (action === 'reject') {
        payment.status = 'rejected';
        payment.message = 'Оплата отклонена. Пожалуйста, попробуйте снова или обратитесь в поддержку.';

        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Оплата отклонена'
        });

        try {
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
        } catch (e) { console.error(e); }
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
