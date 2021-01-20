// Main Application File
require('dotenv').config();
import { Bot } from './Bot';
import { ExpressServer } from './server/ExpressServer';

// Call a new Bot
const bot: Bot = new Bot();
// Make the bot listen
bot.listen();

const server: ExpressServer = new ExpressServer(bot);
server.listen();
