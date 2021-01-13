type SponsorRoom = {
  sponsorTextChannelId: string;
  waitingRoomVoiceChannelId: string;
  // Max number of voice channels is 3
  discussionRoomVoiceChannelIds: string[];
  sponsorName: string;
};

const sponsorRooms: SponsorRoom[] = [
  {
    sponsorTextChannelId: '792455754665820160',
    waitingRoomVoiceChannelId: '792451825152163841',
    discussionRoomVoiceChannelIds: [
      '792454086434881586',
      '792513489457381427',
      '792513517361561640',
    ],
    sponsorName: 'Tailwind',
  },
];

export default sponsorRooms;
