import { Client, TextChannel } from 'discord.js';
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
  waitingRoomMeta: WaitingRoomMeta[];

  // Make a bot with a client and a collection of commands
  constructor() {
    this.client = new Client();
    this.commands = [];
    this.prefix = process.env.PREFIX;
    this.waitingRoomMeta = [];

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
   * Checks that a member joined a waiting room and sends a message to the sponsor
   * text channel and adds information to the waiting room meta to use for later.
   *
   * @param newMember Information of member after they joined the new voice channel
   */
  private async onJoinWaitingRoom(newMember): Promise<void> {
    // Attempt to find the sponsor room object
    const sponsorRoomObject = sponsorRooms.find(
      (candidate) => candidate.waitingRoomVoiceChannelId == newMember.channelID
    );

    // Check that the member did join a sponsor waiting room
    if (sponsorRoomObject) {
      const {
        sponsorTextChannelId,
        waitingRoomVoiceChannelId,
        discussionRoomVoiceChannelId,
        sponsorName,
      } = sponsorRoomObject;
      const sponsorTextChannel = this.client.channels.cache.get(
        sponsorTextChannelId
      ) as TextChannel;
      const user = this.client.users.cache.get(newMember.id);
      const member = newMember.guild.member(user);

      // Send message that user joined and add reaction
      const message = await sponsorTextChannel.send(
        `${member.nickname} is in the ${sponsorName} waiting room. Add a reaction when you are ready to accept them.`
      );
      message.react('🚪');

      // Add the new waiting room meta object to use for later
      const meta: WaitingRoomMeta = {
        subject: 'waiting room',
        memberId: member.id,
        waitingRoomVoiceChannelId,
        discussionRoomVoiceChannelId,
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
  private onLeaveWaitingRoom(oldMember, newMember): void {
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
   * Listen to the discord server
   */
  listen(): void {
    // Wait for a message to be sent by a user
    this.client.on('message', (message) => {
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
      await this.onJoinWaitingRoom(newMember);
      await this.onLeaveWaitingRoom(oldMember, newMember);
    });

    this.client.on('messageReactionAdd', (r, user) => {
      if (user.bot) {
        return;
      }

      const meta = this.waitingRoomMeta.find(
        (meta) => meta.messageId == r.message.id
      );

      if (meta) {
        const guild = this.client.guilds.cache.get('725834706263867502');
        const member = guild.members.cache.get(meta.memberId);
        // Move hacker to discussion room if they are still in the waiting room
        if (member.voice.channelID === meta.waitingRoomVoiceChannelId) {
          member.voice.setChannel(meta.discussionRoomVoiceChannelId);
        }
      }
    });

    // this.client.on('messageReactionRemove', (r) => {
    //   const meta = this.waitingRoomMeta.find(
    //     (meta) => meta.messageId == r.message.id
    //   );

    //   if (meta) {
    //     const guild = this.client.guilds.cache.get('725834706263867502');
    //     const member = guild.members.cache.get(meta.memberId);
    //     // Move hacker to discussion room if they are still in the waiting room
    //     if (member.voice.channelID === meta.discussionRoomVoiceChannelId) {
    //       member.voice.kick();
    //     }
    //   }
    // });
  }
}
