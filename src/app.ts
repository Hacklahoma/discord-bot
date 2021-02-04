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

  setInterval(async () => {
    try {
      await server.ping();
      console.log('Ping!');
    } catch (e) {
      console.error('Unable to ping server: ', e);
    }
  }, 15 * 60 * 1000);
});
