import { Client, ColorResolvable, MessageEmbed } from 'discord.js';
import { getPrice, numMinutesCache } from '../replies/price.command';
import { getStats } from '../replies/stats.command';
import {
  DISCORD_REALTIME_CHANNEL_ID,
  DISCORD_REALTIME_CHANNEL_WEBHOOK_ID,
  DISCORD_REALTIME_CHANNEL_WEBHOOK_TOKEN,
} from '../secrets';

export const updateRealtimeChannelPriceData = async (discordClient: Client) => {
  try {
    const realtimeChannel = discordClient.channels.cache.get(
      DISCORD_REALTIME_CHANNEL_ID
    );
    if (realtimeChannel) {
      const webhook = await realtimeChannel.client.fetchWebhook(
        DISCORD_REALTIME_CHANNEL_WEBHOOK_ID,
        DISCORD_REALTIME_CHANNEL_WEBHOOK_TOKEN
      );

      const username = 'MarsColony Data';
      const avatarUrl =
        'https://aws1.discourse-cdn.com/standard17/uploads/marscolony/original/1X/73f77e8e1a03287b99217692129344d4441f8bf3.png';

      interface SectionData {
        colour: ColorResolvable;
        authorIconUrl: string;
        authorName: string;
      }

      // all colours taken from sampling each image (in authorIconUrl) with https://imagecolorpicker.com/en
      const sectionsData: SectionData[] = [
        {
          colour: '#3ddacf',
          authorIconUrl:
            'https://s2.coinmarketcap.com/static/img/coins/200x200/3945.png',
          authorName: 'Token Prices',
        },
        {
          colour: '#be744b',
          authorIconUrl:
            'https://solarsystem.nasa.gov/internal_resources/3841/',
          authorName: 'Floor Plot Data',
        },
        {
          colour: '#dddc45',
          authorIconUrl: 'https://meta.marscolony.io/1.png',
          authorName: 'Floor Plot Buying Comparison',
        },
        {
          colour: '#ffffff',
          authorIconUrl:
            'https://dashboard-assets.dappradar.com/document/6406/nftkey-dapp-marketplaces-ethereum-logo-166x166_50ad814bfd3ab7dcdd1bba4090f83a15.png',
          authorName: 'Transactions Data',
        },
        {
          colour: '#e42d06',
          authorIconUrl:
            'https://aws1.discourse-cdn.com/standard17/uploads/marscolony/original/1X/73f77e8e1a03287b99217692129344d4441f8bf3.png',
          authorName: 'CLNY Statistics',
        },
      ];

      const priceData = await getPrice();
      const statsData = await getStats();
      const priceMessage = await webhook.send({
        username: username,
        avatarURL: avatarUrl,
        embeds: [
          new MessageEmbed()
            .setDescription(priceData.split('\n\n')[0])
            .setAuthor({
              name: sectionsData[0].authorName,
              iconURL: sectionsData[0].authorIconUrl,
            })
            .setColor(sectionsData[0].colour),
          new MessageEmbed()
            .setDescription('Fetching plots data...')
            .setAuthor({
              name: sectionsData[1].authorName,
              iconURL: sectionsData[1].authorIconUrl,
            })
            .setColor(sectionsData[1].colour),
          new MessageEmbed()
            .setDescription('Fetching plot comparison data...')
            .setAuthor({
              name: sectionsData[2].authorName,
              iconURL: sectionsData[2].authorIconUrl,
            })
            .setColor(sectionsData[2].colour),
          new MessageEmbed()
            .setDescription('Fetching transactions data...')
            .setAuthor({
              name: sectionsData[3].authorName,
              iconURL: sectionsData[3].authorIconUrl,
            })
            .setColor(sectionsData[3].colour),
          new MessageEmbed()
            .setDescription(statsData)
            .setAuthor({
              name: sectionsData[4].authorName,
              iconURL: sectionsData[4].authorIconUrl,
            })
            .setColor(sectionsData[4].colour),
        ],
      });
      const priceMessageId = priceMessage.id;

      (async () => {
        while (true) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * 60 * numMinutesCache)
          );

          try {
            const priceData = await getPrice();
            const statsData = await getStats();
            const sections = priceData.split('\n\n').concat(statsData);

            // price data
            if (sections.length > 0) {
              try {
                await webhook.editMessage(priceMessageId, {
                  embeds: sections.map((s, idx) => {
                    const idxToUse = idx < sectionsData.length ? idx : 0;
                    const { colour, authorName, authorIconUrl } =
                      sectionsData[idxToUse];

                    return new MessageEmbed()
                      .setDescription(s)
                      .setAuthor({ name: authorName, iconURL: authorIconUrl })
                      .setColor(colour); // should only have as many sections as sectionsData
                  }),
                });
              } catch (webhookErr) {
                console.log('webhook edit message error');
                console.log(webhookErr);
              }
            }
          } catch (err) {
            console.log('probably getPrice() error');
            console.log(err);
          }
        }
      })();
    }
  } catch (err) {
    console.log('webhook error');
    console.log(err);
  }
};
