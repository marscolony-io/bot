import { Intents } from 'discord.js';
import { ArgsOf, Client, Discord, On } from 'discordx';
import {
  costBuyFloorAndUpgradeInONE,
  costBuyUpgradedInONE,
} from '../replies/price.command';
import { DISCORD_BOT_TOKEN } from '../secrets';
import { displayCostInONEClient } from './discordUtils';

// possible imports:
// costBuyUpgradedInONE
// costBuyFloorAndUpgradeInONE
// priceCLNYperONE
// priceONEperUSD
// priceCLNYperUSD

const cacheMinutes = 1;

const costBuyUpgradedInONEClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use global commands only, comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});
costBuyUpgradedInONEClient.once('ready', async () => {
  // make sure all guilds are in cache
  await costBuyUpgradedInONEClient.guilds.fetch();

  // sidebar bot - run every cacheMinutes
  setInterval(
    () =>
      displayCostInONEClient(
        costBuyUpgradedInONEClient,
        costBuyUpgradedInONE,
        'upgraded plot cost',
        `${costBuyUpgradedInONE.toFixed(0)} ONE`
      ),
    1000 * 60 * cacheMinutes
  );
});

const costBuyFloorAndUpgradeInONEClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use global commands only, comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
});
costBuyFloorAndUpgradeInONEClient.once('ready', async () => {
  // make sure all guilds are in cache
  await costBuyFloorAndUpgradeInONEClient.guilds.fetch();

  // sidebar bot - run every cacheMinutes
  setInterval(
    () =>
      displayCostInONEClient(
        costBuyFloorAndUpgradeInONEClient,
        costBuyFloorAndUpgradeInONE,
        'combined floor plot + upgrade cost',
        `${costBuyFloorAndUpgradeInONE.toFixed(0)} ONE`
      ),
    1000 * 60 * cacheMinutes
  );
});

export async function discordPriceBotsInit() {
  await costBuyUpgradedInONEClient.login(DISCORD_BOT_TOKEN);
  await costBuyFloorAndUpgradeInONEClient.login(DISCORD_BOT_TOKEN);
}
