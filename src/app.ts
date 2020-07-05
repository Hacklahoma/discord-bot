import { Client, Message } from 'discord.js';
require('dotenv').config();

const client = new Client();

client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", (message: Message) => {
    if(message.content === "!ping"){
        message.channel.send('Pong.');
    }
});


client.on("error", e => {
    console.error("Discord client error!", e);
});

client.login(process.env.BOT_TOKEN);
