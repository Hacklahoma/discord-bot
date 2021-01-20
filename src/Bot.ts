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
  TextChannel,
  User,
  VoiceState,
} from 'discord.js';
import { CensorSensor } from 'censor-sensor';
import { flag, explicit } from './helpers/bad-words';
import { Command } from './abstracts/Command';
import { Test } from './commands/Test';
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
        sponsorTextChannel.messages.cache.get(meta.messageId).delete();
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

  /**
   * Retrieves the list of members through a Promise for a Discord Guild. Will need
   * to callback by ".then((members) => {})" in order to obtain the members.
   */
  getMemberList(): Promise<Collection<string, GuildMember>> {
    const guild: Guild = this.client.guilds.cache.get('725834706263867502');
    return guild.members.fetch();
  }

  /**
   * Retrieves a member from the Discord Guild.
   */
  getMember(discord_id: string): GuildMember {
    const guild: Guild = this.client.guilds.cache.get('725834706263867502');
    return guild.members.cache.get(discord_id);
  }

  /**
   * Listen to the discord server
   */
  listen(): void {
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
      member.send('hi');
    });
  }
}
