import { GuildMember, Message, MessageEmbed, User } from 'discord.js';
import { Command } from '../abstracts/Command';
import axios from 'axios';

// command used to mark people as have arrived to the event.
export class Arrived extends Command {
  constructor() {
    super('Arrived', 'Marks off a hacker as has arrived at the event.', ['arrived']);
  }

  async send_reseponse(
    { discord_id, first_name, last_name, email } : 
    { discord_id?: string, first_name?: string, last_name?: string, email?: string }
  ) {
    const response = await axios({
      method: 'post',
      url: `${process.env.OURBOROS}application/arrived/`,
      data: {
        discord_id: discord_id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        request_user: process.env.REG_USERNAME,
        request_password: process.env.REG_PASSWORD
      },
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    })

    if (JSON.stringify(response.data).includes('has been checked in!')) {
      return new MessageEmbed()
      .setAuthor(
        'Hacklahoma',
        'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
        'https://2022.hacklahoma.org'
      )
      .setColor('#01a7c2')
      .setTitle('Success!')
      .setDescription(response.data)
    } else if (JSON.stringify(response.data).includes('no_app')) {
      return new MessageEmbed()
        .setAuthor(
          'Hacklahoma',
          'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
          'https://2022.hacklahoma.org'
        )
        .setColor('#e43132')
        .setTitle('Issue Checking Hacker In')
        .setDescription('An Application hasn\'t couldn\'t be found for the Hacker.')
    } else {
      return new MessageEmbed()
        .setAuthor(
          'Hacklahoma',
          'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
          'https://2022.hacklahoma.org'
        )
        .setColor('#e43132')
        .setTitle('Issue Checking Hacker In')
        .setDescription(response.data)
      }
    
  }

  // Execute the command
  async execute(message: Message, args: string[]): Promise<void> {
    // Check if message author has permission to run command
    if (message.member && !message.member.hasPermission('ADMINISTRATOR')) {
      return;
    }

    try {
      // Command using either discord id or 
      if (args.length == 1) {
        // A mention was used
        if (args[0].includes('<@!') || args[0].includes('<@')) {
          let userID = args[0].includes('<@!') ? args[0].replace('<@!', '').replace('>', '')
            : args[0].includes('<@') ? args[0].replace('<@', '').replace('<', '') : '';

          if (userID === '') {
            message.reply('Invalid user ID or mention.');
            return;
          }

          const members = await message.guild.members.fetch();
          const member = members.find((member) => member.user.id === userID);

          if (!member) {
            // Craft embed message and send
            const embed = new MessageEmbed()
              .setAuthor(
                'Hacklahoma',
                'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
                'https://2022.hacklahoma.org'
              )
              .setColor('#e43132')
              .setTitle('Could not find user specified.')
              .setDescription(`A user with the tag ${args[0]} could not be found.`)
            await message.reply(embed);

            return;
          }

        

          await message.reply(await this.send_reseponse({ discord_id: userID }));
        }
        // Email was used
        else if (args[0].toLowerCase().match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
          await message.reply(await this.send_reseponse({ email: args[0] }));
        }
        // Invalid use
        else {
          // Craft embed message and send
          const embed = new MessageEmbed()
            .setAuthor(
              'Hacklahoma',
              'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
              'https://2022.hacklahoma.org'
            )
            .setColor('#e43132')
            .setTitle('Invalid Use')
            .setDescription('This command is used to mark off people as have arrived.')
            .addField('Usage', `\`\`\`!arrived [Discord tag | Full Name | Email Used to Register]\`\`\``)
          await message.reply(embed);
        }
      }

      // First and last name was used
      else if (args.length === 2) {
        await message.reply(await this.send_reseponse({ first_name: args[0], last_name: args[1] }));
      }

      // Invalid use
      else {
        // Craft embed message and send
        const embed = new MessageEmbed()
          .setAuthor(
            'Hacklahoma',
            'https://hacklahoma.org/static/media/logo2022.e2bb5577.png',
            'https://2022.hacklahoma.org'
          )
          .setColor('#e43132')
          .setTitle('Invalid Use')
          .setDescription('This command is used to mark off people as have arrived.')
          .addField('Usage', `\`\`\`!arrived [Discord tag | Full Name | Email Used to Register]\`\`\``)

        await message.reply(embed);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
