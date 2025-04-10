require('dotenv').config(); // Load .env nếu có
const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Dùng biến môi trường BOT_TOKEN để Render nhận
const TELEGRAM_TOKEN = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const GEMINI_API_URL = 'https://dichvukey.site/apishare/hoi.php?text={}';

// Khởi động bot với polling
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Xử lý tin nhắn Telegram
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  try {
    const url = GEMINI_API_URL.replace('{}', encodeURIComponent(userInput));
    const res = await axios.get(url);
    const reply = res.data?.message || 'Không thể xử lý yêu cầu.';
    await bot.sendMessage(chatId, reply);
  } catch (error) {
    await bot.sendMessage(chatId, `Đã xảy ra lỗi: ${error.message}`);
  }
});

// Ping route cho UptimeRobot
app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

// Route phục vụ file tùy tên
app.get('/file/:name', (req, res) => {
  const fileName = req.params.name;
  const filePath = path.join(__dirname, 'public', fileName);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Phục vụ file tĩnh (nếu có thư mục /public)
app.use(express.static(path.join(__dirname, 'public')));

// Khởi chạy server Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
