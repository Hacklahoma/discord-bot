// Main Application File
require('dotenv').config();
import {Bot} from './Bot';

// Call a new Bot
var bot: Bot = new Bot();
// Make the bot listen
bot.listen();