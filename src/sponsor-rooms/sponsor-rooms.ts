type SponsorRoom = {
  sponsorTextChannelId: string;
  waitingRoomVoiceChannelId: string;
  discussionRoomVoiceChannelId: string;
  sponsorName: string;
};

const sponsorRooms: SponsorRoom[] = [
  {
    sponsorTextChannelId: '792455754665820160',
    waitingRoomVoiceChannelId: '792451825152163841',
    discussionRoomVoiceChannelId: '792454086434881586',
    sponsorName: 'Tailwind',
  },
];

export default sponsorRooms;
