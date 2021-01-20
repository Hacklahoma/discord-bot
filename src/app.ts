// Main Application File
require('dotenv').config();
import { Bot } from './Bot';
import { ExpressServer } from './server/ExpressServer';

// Call a new Bot
const bot: Bot = new Bot();

// Login the bot
bot.login().then(() => {
  bot.listen();

  // Open express server
  const server: ExpressServer = new ExpressServer(bot);
  server.listen();
});
