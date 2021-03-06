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
  {
    sponsorTextChannelId: '801930465552105513',
    waitingRoomVoiceChannelId: '801928250074202153',
    discussionRoomVoiceChannelIds: [
      '801928285473996820',
      '801928323072131103',
      '801928349848961044',
    ],
    sponsorName: 'Paycom',
  },
  {
    sponsorTextChannelId: '801931772656746497',
    waitingRoomVoiceChannelId: '801932628369997865',
    discussionRoomVoiceChannelIds: [
      '801932690974179329',
      '801933156877991997',
      '801933173654814720',
    ],
    sponsorName: 'Flywheel Energy',
  },
  {
    sponsorTextChannelId: '803390046672650310',
    waitingRoomVoiceChannelId: '803389032137621504',
    discussionRoomVoiceChannelIds: [
      '803389119517950002',
      '803389430064611359',
      '803389449080668191',
    ],
    sponsorName: 'Clevyr',
  },
  {
    sponsorTextChannelId: '803390087206273066',
    waitingRoomVoiceChannelId: '802736714480091147',
    discussionRoomVoiceChannelIds: ['802736996354359306'],
    sponsorName: 'MLH',
  },
];

export default sponsorRooms;
