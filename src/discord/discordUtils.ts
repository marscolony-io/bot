import { Client } from 'discordx';

export const displayCostInONEClient = (
  client: Client,
  cost: number,
  activity: string,
  nickname: string
) => {
  if (client.user && cost !== 0) {
    client.user.setActivity(activity, {
      type: 'WATCHING',
    });
    client.guilds.cache.map((guild) => guild.me?.setNickname(nickname));
  }
};
