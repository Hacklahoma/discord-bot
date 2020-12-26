// Main Application File
require('dotenv').config();
import { Bot } from './Bot';

// Call a new Bot
const bot: Bot = new Bot();
// Make the bot listen
bot.listen();
