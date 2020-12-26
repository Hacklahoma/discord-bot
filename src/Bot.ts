import { Client } from 'discord.js';
import { Command } from './abstracts/Command';
import { Test } from './commands/Test';

export class Bot {
  client: Client;
  commands: Command[];
  prefix: string;

  // Make a bot with a client and a collection of commands
  constructor() {
    this.client = new Client();
    this.commands = [];
    this.prefix = process.env.PREFIX;

    this.importCommands();
    this.login();
  }

  // Import the commands
  private importCommands(): void {
    this.commands.push(new Test());
  }

  // Log the bot into the server
  private async login(): Promise<void> {
    await this.client.login(process.env.BOT_TOKEN);
    console.log(`Logged in as ${this.client.user.tag}`);
  }

  // Listen to the discord server
  listen(): void {
    // Wait for a message to be sent by a user
    this.client.on('message', (message) => {
      // Check to see if the command starts with the specified prefix or if the author is the bot
      if (!message.content.startsWith(this.prefix) || message.author.bot) {
        return;
      }

      //get the arguments from the message
      const args: string[] = message.content
        .slice(this.prefix.length)
        .trim()
        .split(/ +/);

      //Pull the command from the arguments
      const command: string = args.shift().toLowerCase();

      //Try searching to see if a command is able to be executed
      try {
        //Loop through the commands finding triggers and then execute
        for (let i = 0; i < this.commands.length; i++) {
          if (this.commands[i].getTriggers().includes(command)) {
            this.commands[i].execute(message, args);
          }
        }
      } catch (error: any) {
        console.error(error);
        message.reply(
          'Something went wrong while trying to execute that command!'
        );
      }
    });
  }
}
