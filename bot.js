const mineflayer = require('mineflayer');
const express = require('express');

// ================= НАСТРОЙКИ (МЕНЯЙ ПОД СЕБЯ) =================
const CONFIG = {
  host: 'Spermoglot3.aternos.me', // IP или домен твоего сервера Aternos
  port: 25565,                    // Порт (оставь 25565, бот сам найдет реальный порт)
  username: 'SpermoglotBot',      // Ник твоего бота в игре
  version: '1.20.6'               // ТОЧНАЯ версия твоего сервера (обязательно укажи как в игре!)
};
// =============================================================

// 1. Мини-сайт для Render (чтобы хостинг не засыпал каждые 15 минут)
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Бот успешно работает 24/7!');
});

app.listen(PORT, () => {
  console.log(`🌐 Веб-сервер запущен на порту ${PORT}`);
});

// 2. Функция запуска бота
let bot = null;

function createBot() {
  console.log(`🔄 Подключение к серверу ${CONFIG.host} под ником ${CONFIG.username} (версия ${CONFIG.version})...`);

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version // Указываем версию явно, чтобы бот не падал с ошибками
  });

  // Когда бот успешно зашел в мир
  bot.on('spawn', () => {
    console.log('✅ Бот успешно появился на сервере!');
    startAntiAfk();
  });

  // Если произошла ошибка сети или авторизации
  bot.on('error', (err) => {
    console.log('❌ Ошибка Mineflayer:', err.message);
  });

  // Когда бота кикнуло или соединение оборвалось
  bot.on('end', (reason) => {
    console.log(`⚠️ Бот отключился от сервера. Причина: ${reason}`);
    
    // Останавливаем таймер анти-афк, если он работал
    if (windowAfkInterval) clearInterval(windowAfkInterval);

    // Ждем 45 секунд и переподключаемся (чтобы Aternos не банил IP)
    reconnect();
  });
}

// 3. Защита от кика за АФК (делает движения, чтобы сервер видел активность)
let windowAfkInterval = null;

function startAntiAfk() {
  if (windowAfkInterval) clearInterval(windowAfkInterval);

  windowAfkInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    // Случайный поворот головы влево/вправо
    const randomYaw = Math.random() * Math.PI * 2;
    bot.look(randomYaw, 0, true);

    // Легкий прыжок каждые 2 минуты
    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 500);

    console.log('[Anti-AFK] Бот сделал движение, чтобы не получить кик за бездействие.');
  }, 60000); // Срабатывает каждую 1 минуту
}

// 4. Безопасное переподключение с паузой
function reconnect() {
  console.log('⏳ Ждем 45 секунд перед следующей попыткой входа...');
  setTimeout(() => {
    console.log('🚀 Пробуем зайти снова...');
    createBot();
  }, 45000); // 45 секунд паузы — идеальное время, чтобы старая сессия на сервере закрылась
}

// Запускаем бота первый раз при старте программы
createBot();
