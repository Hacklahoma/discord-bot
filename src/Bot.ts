import {
  Client,
  Guild,
  GuildMember,
  Message,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import { Command } from './abstracts/Command';
import { Test } from './commands/Test';
import sponsorRooms from './sponsor-rooms';

type WaitingRoomMeta = {
  subject: 'waiting room';
  memberId: string;
  waitingRoomVoiceChannelId: string;
  discussionRoomVoiceChannelId: string;
  messageId: string;
};

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
  private importCommands() {
    this.commands.push(new Test());
  }

  // Log the bot into the server
  private async login() {
    await this.client.login(process.env.BOT_TOKEN);
    console.log(`Logged in as ${this.client.user.tag}`);
  }

  // Listen to the discord server
  async listen() {
    // Wait for a message to be sent by a user
    await this.client.on('message', (message) => {
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

    this.client.on('voiceStateUpdate', async (oldMember, newMember) => {
      // Check if user JOINS a waiting room and finds channel to notify
      let sponsorRoomObject = sponsorRooms.find(
        (candidate) =>
          candidate.waitingRoomVoiceChannelId == newMember.channelID
      );
      if (sponsorRoomObject) {
        const {
          sponsorTextChannelId,
          waitingRoomVoiceChannelId,
          discussionRoomVoiceChannelId,
        } = sponsorRoomObject;
        const sponsorTextChannel = this.client.channels.cache.get(
          sponsorTextChannelId
        ) as TextChannel;
        const user = this.client.users.cache.get(newMember.id);
        const member = newMember.guild.member(user);
        const devChannel = this.client.channels.cache.get(
          '792476640549797889'
        ) as TextChannel;

        // Send message that user joined and add reaction
        const message = await sponsorTextChannel.send(
          ':green_circle: ' +
            member.nickname +
            ' joined the Tailwind waiting room.'
        );
        message.react('🚪');

        // Send meta to dev channel to use for later
        const meta: WaitingRoomMeta = {
          subject: 'waiting room',
          memberId: member.id,
          waitingRoomVoiceChannelId,
          discussionRoomVoiceChannelId,
          messageId: message.id,
        };
        devChannel.send(JSON.stringify(meta));
      }

      // Check if user LEFT a waiting room and finds channel to notify
      sponsorRoomObject = sponsorRooms.find(
        (candidate) => candidate.sponsorTextChannelId == oldMember.channelID
      );
      if (sponsorRoomObject) {
        const { sponsorTextChannelId } = sponsorRoomObject;
        const sponsorChannel = this.client.channels.cache.get(
          sponsorTextChannelId
        ) as TextChannel;
        const user = this.client.users.cache.get(newMember.id);
        const member = newMember.guild.member(user);

        // Send message that user left
        sponsorChannel.send(
          ':red_circle: ' + member.nickname + ' left the Tailwind waiting room.'
        );
      }
    });

    this.client.on('messageReactionAdd', (r, user) => {
      if (user.bot) {
        return;
      }

      const devChannel = this.client.channels.cache.get(
        '792476640549797889'
      ) as TextChannel;
      const devMessage = devChannel.messages.cache.find((message) =>
        message.content.includes(r.message.id)
      );
      if (devMessage) {
        const guild = this.client.guilds.cache.get('725834706263867502');
        const meta: WaitingRoomMeta = JSON.parse(devMessage.content);
        const member = guild.members.cache.get(meta.memberId);
        // Move hacker to discussion room if they are still in the waiting room
        if (member.voice.channelID === meta.waitingRoomVoiceChannelId) {
          member.voice.setChannel(meta.discussionRoomVoiceChannelId);
        }
      }
    });

    this.client.on('messageReactionRemove', (r) => {
      const devChannel = this.client.channels.cache.get(
        '792476640549797889'
      ) as TextChannel;
      const devMessage = devChannel.messages.cache.find((message) =>
        message.content.includes(r.message.id)
      );
      if (devMessage) {
        const guild = this.client.guilds.cache.get('725834706263867502');
        const meta: WaitingRoomMeta = JSON.parse(devMessage.content);
        const member = guild.members.cache.get(meta.memberId);
        // Move hacker to discussion room if they are still in the waiting room
        if (member.voice.channelID === meta.discussionRoomVoiceChannelId) {
          member.voice.kick;
        }
      }
    });
  }
}
