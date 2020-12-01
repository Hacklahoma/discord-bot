import {Client, Message} from 'discord.js';
require('dotenv').config();

var client: Client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if(msg.content === 'ping') {
        msg.reply('pong');
    }
});

client.login(process.env.BOT_TOKEN);