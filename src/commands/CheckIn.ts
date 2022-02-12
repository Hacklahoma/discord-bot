import { GuildMember, Message, MessageEmbed, User } from 'discord.js';
import { Command } from '../abstracts/Command';

// Test command for testing Command Handling
export class CheckIn extends Command {
  constructor() {
    super('Check-in', 'Prompts user to check in', ['checkin', 'check-in']);
  }

  // Execute the command
  async execute(message: Message, args: string[]): Promise<void> {
    // Check if message author has permission to run command
    if (message.member && !message.member.hasPermission('ADMINISTRATOR')) {
      return;
    }

    // Get member object and id of either author or a member
    // that was added by id in the args
    let member: GuildMember | User;
    let id = args[0];
    if (!id) {
      id = message.author.id;
      member = message.member || message.author;
    } else {
      member = await message.guild.members.fetch(id);
    }

    // Stop if couldn't find member with ID
    if (!member) {
      message.member.send('I was unable to find a member with the ID of ' + id);
      return;
    }

    // Links
    const checkInLink = `https://register.hacklahoma.org/accounts/discord/${id}/`;
    const walkInLink = 'https://forms.gle/Qqo1q6UbscC4UYrq8';

    // Craft embed message and send
    const embed = new MessageEmbed()
      .setAuthor(
        'Hacklahoma',
        'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
        'https://2022.hacklahoma.org'
      )
      .setColor('#e43132')
      .setTitle('Welcome to Hacklahoma 2022!')
      .setDescription(`Hey <@${id}>, we're excited to have you here!`)
      .addField(
        'How to check in',
        `We first need to find your application that you submitted.\n[Click here to check in](${checkInLink})`
      )
      .addField(
        'For In-Person Hackers!',
        `If you applied to be in-person, use the same check in link above to make it quicker to get checked in! However when you show up, please find the table with the Hacklahoma team members at the far right to say you have arrived and we'll give you your lanyard!`
      )
      .addField(
        "Didn't apply?",
        `No problem! We're offering walk-ins this year to a select number of people.\n[Click here to submit a walk-in form](${walkInLink})`
      )
      .addField(
        'Having trouble?',
        'Please ask for help in the [#check-in-help](https://discord.gg/RTZZeMxVFX) channel.'
      )
      .setFooter('Happy hacking!');
    await member.send(embed);
  }
}
