// Abstract class to set up commands

import {Message} from 'discord.js';

export abstract class Command {
  name: string;
  description: string;
  triggers: string[];

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  abstract execute(message: Message, args: string[]): Promise<void>;
}