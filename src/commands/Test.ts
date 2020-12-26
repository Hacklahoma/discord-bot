import { Message } from 'discord.js';
import { Command } from '../abstracts/Command';

// Test command for testing Command Handling
export class Test extends Command {
  constructor() {
    super('Test', 'Testing Command Handling', ['im', "i'm"]);
  }

  // Execute the command
  async execute(message: Message, args: string[]): Promise<void> {
    await message.channel.send(`Hi ${args[0]}! I'm dad!`);
  }
}
