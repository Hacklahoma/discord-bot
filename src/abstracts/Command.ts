// Abstract class to set up commands

import { Message } from 'discord.js';

export abstract class Command {
  private name: string;
  private description: string;
  private triggers: string[];

  constructor(name: string, description: string, triggers: string[]) {
    this.name = name;
    this.description = description;
    this.triggers = triggers;
  }

  //Get the Name of the command
  getName(): string {
    return this.name;
  }

  //Get the Description of the command
  getDescription(): string {
    return this.description;
  }

  //Get the Triggers for the command
  getTriggers(): string[] {
    return this.triggers;
  }

  //Abstract execute function for executing command
  abstract execute(message: Message, args: string[]): Promise<void>;
}
