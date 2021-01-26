import { Message } from 'discord.js';
import { Command } from '../abstracts/Command';

// Command to hand walk ins
export class WalkIn extends Command {
  constructor() {
    super('Walk-in User', "Add's Hacker to walkin and changes his name", [
      'walkin',
    ]);
  }

  // Execute the command
  async execute(message: Message, args: string[]): Promise<void> {
    if (message.member.hasPermission('ADMINISTRATOR')) {
      await message.guild.members.fetch().then((members) => {
        const member = members.find(
          (member) => member.user.id === args[0] || member.user.tag === args[0]
        );
        console.log(member);
        if (member) {
          // Add the hacker role to the member
          if (!member.roles.cache.has('725846354223693895')) {
            member.roles.add('725846354223693895').catch(console.error);
            member.roles.remove('796165808950476800').catch(console.error);
          }

          // Get rid of the discord Id
          args.shift();

          // Get the nickname
          const nickname = args.toString().replace(/,/g, ' ');

          // Set the nickname
          member.setNickname(nickname);

          // Reply to the message
          message.reply(
            `Success! I was able to find user ${member.user.tag} and changed their name to ${nickname}`
          );
        } else {
          message.reply(`Could not find User by the Discord id ${args[0]}`);
        }
      });
    } else {
      message.delete();
    }
  }
}
