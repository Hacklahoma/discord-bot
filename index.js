require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

//Send a message when the client is ready
client.once('ready', () => {
	console.log('Ready!');
});

//Listen for message and reply depending on the content of the message
client.on('message', message => {
	if (message.content === '!ping') {
		message.channel.send('Pong.');
	}
});

//Login to discord using the token
client.login(`${process.env.BOT_TOKEN}`);