import {Client, Message} from 'discord.js';

export class Bot {
  client: Client;

  constructor() {
    this.client = new Client();
  }

  async listen() {
    await this.client.login(process.env.BOT_TOKEN);

    console.log(`Logged in as ${this.client.user.tag}`);

    await this.client.on('message', (message) => {
      if(message.content === 'ping') {
        message.reply('pong');
      }
    });

  }
}