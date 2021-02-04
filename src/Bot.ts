import {
  Client,
  Collection,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  MessageReaction,
  PartialMessage,
  PartialUser,
  Role,
  TextChannel,
  User,
  VoiceState,
} from 'discord.js';
import { CensorSensor } from 'censor-sensor';
import { response } from 'express';
import { flag, explicit } from './helpers/bad-words';
import { Command } from './abstracts/Command';
import { Test } from './commands/Test';
import { CheckIn } from './commands/CheckIn';
import { WalkIn } from './commands/WalkIn';
import sponsorRooms from './helpers/sponsor-rooms';

type WaitingRoomMeta = {
  memberId: string;
  waitingRoomVoiceChannelId: string;
  discussionRoomVoiceChannelIds: string[];
  messageId: string;
};

const reactions = ['1️⃣', '2️⃣', '3️⃣'];

export class Bot {
  client: Client;
  commands: Command[];
  prefix: string;
  waitingRoomMeta: WaitingRoomMeta[];
  explicitCensor: CensorSensor;
  flagCensor: CensorSensor;

  // Make a bot with a client and a collection of commands
  constructor() {
    this.client = new Client();
    this.commands = [];
    this.prefix = process.env.PREFIX;
    this.waitingRoomMeta = [];
    this.explicitCensor = new CensorSensor();
    this.flagCensor = new CensorSensor();
    this.explicitCensor.addLocale('explicit', explicit);
    this.explicitCensor.setLocale('explicit');
    this.flagCensor.addLocale('flag', flag);
    this.flagCensor.setLocale('flag');

    this.importCommands();
  }

  // Import the commands
  private importCommands(): void {
    this.commands.push(new Test());
    this.commands.push(new WalkIn());
    this.commands.push(new CheckIn());
  }

  // Log the bot into the server
  async login(): Promise<void> {
    await this.client.login(process.env.BOT_TOKEN);
    console.log(`Logged in as ${this.client.user.tag}`);
  }

  /**
   * Handles errors that were thrown
   * @param error
   */
  private handleError(error: Error): void {
    const errorChannelId = '806630672445472808';
    const errorChannel = this.client.channels.cache.get(
      errorChannelId
    ) as TextChannel;
    console.error('Unhandled error:', error);
    errorChannel.send(JSON.stringify(error));
  }

  /**
   * Checks that message was a command and executes it
   *
   * @param message Message that was sent
   */
  private onCommand(message: Message): void {
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
  }

  /**
   * Moderates messages that come through and takes appropriate actions based on content
   *
   * @see bad-words.ts
   */
  private moderateMessage(message: Message | PartialMessage): void {
    if (message.author.bot) {
      return;
    }

    const sendMessage = (isExplicit: boolean): void => {
      // Prepare variables to send message in admin channel
      const flaggedMessagesChannelId = '796164291710943252';
      const adminChannel = this.client.channels.cache.get(
        flaggedMessagesChannelId
      ) as TextChannel;
      const author = message.author;
      const channel = message.channel as TextChannel;

      let color;
      let title;
      let description;
      if (isExplicit) {
        color = '#f53b3b';
        title = 'Explicit Message';
        description = `<@${author.id}>'s message has been removed in <#${channel.id}>`;
      } else {
        color = '#f5983b';
        title = 'Flagged Message';
        description = `Please review <@${author.id}>'s message in <#${channel.id}>`;
      }

      // Get list of keywords
      const keywords = Object.keys(isExplicit ? explicit : flag)
        .filter((val) => message.content.includes(val))
        .reverse();

      let friendlyKeywords = '';
      for (const val of keywords) {
        if (friendlyKeywords.length > 1) {
          friendlyKeywords += `, ${val}`;
        } else {
          friendlyKeywords = val;
        }
      }

      // Format message
      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .addField('Message', message.content)
        .addField(`Keyword${keywords.length > 1 ? 's' : ''}`, friendlyKeywords)
        .setTimestamp();

      if (!isExplicit) {
        embed.setURL(message.url);
      }

      // Alert admin channel
      adminChannel.send(embed);
    };

    // Explicit is found
    if (this.explicitCensor.isProfane(message.content)) {
      // Delete message
      message.delete();

      // Alert #flagged-messages channel
      sendMessage(true);
      return;
    }

    // Message to be flagged is found
    if (this.flagCensor.isProfane(message.content)) {
      // Alert #flagged-messages channel
      sendMessage(false);
      return;
    }
  }

  /**
   * Checks that a member joined a waiting room and sends a message to the sponsor
   * text channel and adds information to the waiting room meta to use for later.
   *
   * @param newMember Information of member after they joined the new voice channel
   */
  private async onJoinWaitingRoom(
    oldMember: VoiceState,
    newMember: VoiceState
  ): Promise<void> {
    // Make sure that the member changed channels
    if (oldMember.channelID === newMember.channelID) {
      return;
    }

    // Attempt to find the sponsor room object
    const sponsorRoomObject = sponsorRooms.find(
      (candidate) => candidate.waitingRoomVoiceChannelId == newMember.channelID
    );

    // Check that the member did join a sponsor waiting room
    if (sponsorRoomObject) {
      const {
        sponsorTextChannelId,
        waitingRoomVoiceChannelId,
        discussionRoomVoiceChannelIds,
        sponsorName,
      } = sponsorRoomObject;
      const sponsorTextChannel = this.client.channels.cache.get(
        sponsorTextChannelId
      ) as TextChannel;
      const user = this.client.users.cache.get(newMember.id);
      const member = newMember.guild.member(user);

      const embed = new MessageEmbed()
        .setTitle(`${sponsorName} Waiting Room`)
        .setDescription(
          `<@${member.id}> is in the ${sponsorName} waiting room. Add a reaction for which booth to move them to.`
        );

      // Send message that user joined and add reaction
      const message = await sponsorTextChannel.send(embed);
      for (let i = 0; i < discussionRoomVoiceChannelIds.length; i++) {
        message.react(reactions[i]);
      }

      // Add the new waiting room meta object to use for later
      const meta: WaitingRoomMeta = {
        memberId: member.id,
        waitingRoomVoiceChannelId,
        discussionRoomVoiceChannelIds,
        messageId: message.id,
      };
      this.waitingRoomMeta.push(meta);
    }
  }

  /**
   * Checks that a member left a waiting room and removes the message from the
   * sponsor text channel and from the waiting room meta.
   *
   * @param newMember Information of member after they joined the new voice channel
   * @param oldMember Information of member before they left the old voice channel
   */
  private onLeaveWaitingRoom(
    oldMember: VoiceState,
    newMember: VoiceState
  ): void {
    // Make sure that the member changed channels
    if (oldMember.channelID === newMember.channelID) {
      return;
    }

    // Attempt to find the sponsor room object
    const sponsorRoomObject = sponsorRooms.find(
      (candidate) => candidate.waitingRoomVoiceChannelId == oldMember.channelID
    );

    // Check that the member left a sponsor waiting room
    if (sponsorRoomObject) {
      const { sponsorTextChannelId } = sponsorRoomObject;
      const sponsorTextChannel = this.client.channels.cache.get(
        sponsorTextChannelId
      ) as TextChannel;
      const user = this.client.users.cache.get(newMember.id);
      const member = newMember.guild.member(user);

      // Find the appropriate waiting room meta
      const meta = this.waitingRoomMeta.find(
        (meta) =>
          meta.memberId == member.id &&
          meta.waitingRoomVoiceChannelId == oldMember.channelID
      );

      // Delete message and remove from waiting room meta
      if (meta) {
        sponsorTextChannel.messages.cache.get(meta.messageId)?.delete();
        const index = this.waitingRoomMeta.indexOf(meta);
        this.waitingRoomMeta.splice(index, 1);
      }
    }
  }

  /**
   * Verifies that a waiting room message was reacted to and finds the waiting
   * room meta to move hacker into appropriate voice channel.
   *
   * @param r Message reaction object
   * @param user User to make the reaction
   */
  private onWaitingRoomMessageReact(
    r: MessageReaction,
    user: User | PartialUser
  ): void {
    // Make sure this was not from a bot
    if (user.bot) {
      return;
    }

    // Make sure appropriate emoji was given
    const index = reactions.indexOf(r.emoji.name);
    if (index == -1) {
      return;
    }

    // Get waiting room meta
    const meta = this.waitingRoomMeta.find(
      (meta) => meta.messageId == r.message.id
    );

    // Check that the meta exists and is not given an emoji that will overflow array
    if (meta && index <= meta.discussionRoomVoiceChannelIds.length) {
      const guild = this.client.guilds.cache.get('725834706263867502');
      const member = guild.members.cache.get(meta.memberId);

      // Move hacker to discussion room if they are still in the waiting room
      if (member.voice.channelID === meta.waitingRoomVoiceChannelId) {
        member.voice.setChannel(meta.discussionRoomVoiceChannelIds[index]);
      }
    }
  }

  private onGuildMemberJoin(member: GuildMember): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const axios = require('axios');
    axios
      .get(`${process.env.OURBOROS_DISCORD_DATA}`, {
        params: {
          discord_id: member.id,
          request_user: process.env.REG_USERNAME,
          request_pass: process.env.REG_PASSWORD,
        },
      })
      .then((response) => {
        // Unregistered role
        member.roles.add('796165808950476800');
        // Check to see if the user has checked in already
        if (response.data === 'no_app') {
          console.log(`'${member.id}' did not have an application linked yet.`);
          // Links
          const checkInLink = `https://register.hacklahoma.org/accounts/discord/${member.id}/`;
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
            .setDescription(
              `Hey <@${member.id}>, we're excited to have you here!`
            )
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
          member.send(embed);
          console.log(`Sending message to '${member.id}'.`);
        } else {
          console.log(`'${member.id}' has application linked already.`);
          const name: string = response.data['name'];

          this.checkMemberIn(
            response.data['discord_id'],
            name,
            response.data['team_name']
          );
          // Craft embed message and send
          const embed = new MessageEmbed()
            .setAuthor(
              'Hacklahoma',
              'https://hacklahoma.org/static/media/logo2021.2851f7a5.png',
              'https://2021.hacklahoma.org'
            )
            .setColor('#fe8826')
            .setTitle('Welcome Back to Hacklahoma 2021!')
            .setDescription(
              `Hey ${name}, we've managed to obtain your application!`
            )
            .setFooter('Happy hacking!');
          member.send(embed);
          console.log(`Sending message to '${member.id}'.`);
        }
      });
  }

  /**
   * Checks to see if a team exists on the guild and then create
   * the team
   *
   * @param guild The guild that the team is being checked
   * @param member The guild member that is having the role added
   * @param team_name The Team name of the team
   */
  private addTeam(guild: Guild, member: GuildMember, team_name: string): void {
    console.log(`Adding team to '${member.id}'.`);
    const role: Role = guild.roles.cache.find(
      (role) => role.name === team_name
    );

    if (!role) {
      guild.roles
        .create({
          data: {
            name: team_name,
            color: '#919191',
          },
          reason: 'Adding team.',
        })
        .then((role) => {
          member.roles.add(role).catch(console.error);
        })
        .catch(console.error);
    } else {
      member.roles.add(role).catch(console.error);
    }
  }

  /**
   * Retrieves the list of members through a Promise for a Discord Guild. Will need
   * to callback by ".then((members) => {})" in order to obtain the members.
   */
  getMemberList(): Promise<Collection<string, GuildMember>> {
    const guild: Guild = this.client.guilds.cache.get('725834706263867502');
    return guild.members.fetch();
  }

  /**
   * Finds a discord member and then add's hacker role, change its name, and add
   * it's team.
   */
  checkMemberIn(
    discord_id: string,
    name: string,
    team_name?: string
  ): Promise<Collection<string, GuildMember>> {
    console.log(
      `Checking '${discord_id}' in with name '${name}' and team_name '${team_name}.'`
    );

    const guild: Guild = this.client.guilds.cache.get('725834706263867502');
    const members = guild.members.fetch();

    // Find the member based off of the discord id
    members
      .then((members) => {
        const member: GuildMember = members.find(
          (member) => member.user.id === discord_id
        );
        if (member) {
          // Check the lenght of the name
          if (name.length > 32) {
            const splitName = name.split(' ');
            const len = splitName.length;

            // Check to see if the First and Last name is still greater than 32
            if (splitName[0].length + splitName[len - 1].length > 31) {
              name = `${splitName[0]} ${splitName[len - 1].charAt(0)}.`;
            } else {
              name = `${splitName[0]} ${splitName[len - 1]}`;
            }
          } else if (name.length < 2) {
            name = 'Error';
          }

          console.log(`Setting nickname for '${discord_id}' to '${name}'.`);
          //Set the nick name of the member
          member.setNickname(name);

          // Add the hacker role to the member
          if (!member.roles.cache.has('725846354223693895')) {
            console.log(`Adding Hacker role to '${discord_id}'.`);
            member.roles.add('725846354223693895').catch(console.error);
            member.roles.remove('796165808950476800').catch(console.error);
          }

          console.log(`Checking Team for '${discord_id}'.`);
          // Add team name to the member
          if (team_name) {
            this.addTeam(guild, member, team_name);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });

    return members;
  }

  /**
   * Listen to the discord server
   */
  listen(): void {
    this.client.on('error', (error) => {
      this.handleError(error);
    });

    this.client.on('message', (message) => {
      this.onCommand(message);
      this.moderateMessage(message);
    });

    this.client.on('messageUpdate', (oldMessage, newMessage) => {
      this.moderateMessage(newMessage);
    });

    this.client.on('voiceStateUpdate', async (oldMember, newMember) => {
      await this.onJoinWaitingRoom(oldMember, newMember);
      await this.onLeaveWaitingRoom(oldMember, newMember);
    });

    this.client.on('messageReactionAdd', (r, user) => {
      this.onWaitingRoomMessageReact(r, user);
    });

    this.client.on('guildMemberAdd', (member: GuildMember) => {
      this.onGuildMemberJoin(member);
    });
  }
}
