import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../abstracts/Command';

// Test command for testing Command Handling
export class CheckIn extends Command {
  constructor() {
    super('Check-in', 'Prompts user to check in', ['checkin', 'check-in']);
  }

  // Execute the command
  async execute(message: Message, args: string[]): Promise<void> {
    // Try to get id of mentioned members, users, or author.
    let id = message.mentions.members?.first()?.id;
    if (!id) {
      id = message.mentions.users?.first()?.id;
      if (!id) {
        id = message.author.id;
      }
    }

    // Links
    const checkInLink = `https://register.hacklahoma.org/accounts/discord/${id}/`;
    const walkInLink = 'https://forms.gle/Qqo1q6UbscC4UYrq8';

    // Craft embed message and send
    const embed = new MessageEmbed()
      .setAuthor(
        'Hacklahoma',
        'https://hacklahoma.org/static/media/logo2021.2851f7a5.png',
        'https://2021.hacklahoma.org'
      )
      .setColor('#fe8826')
      .setTitle('Welcome to Hacklahoma 2021!')
      .setDescription(`Hey <@${id}>, we're excited to have you here!`)
      .addField(
        'How to check in',
        `We first need to find your application that you submitted.\n[Click here to check in](${checkInLink})`
      )
      .addField(
        "Didn't apply?",
        `No problem! We're offering walk-ins this year to a select number of people.\n[Click here to submit a walk-in form](${walkInLink})`
      )
      .addField(
        'Having trouble?',
        'Please ask for help in the [#check-in-help](https://discord.gg/QURbd28TpE) channel.'
      )
      .setFooter('Happy hacking!');
    await message.channel.send(embed);
  }
}
