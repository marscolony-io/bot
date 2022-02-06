import 'reflect-metadata';
import { Intents, Interaction, Message } from 'discord.js';
import { Client } from 'discordx';
import { dirname, importx } from '@discordx/importer';
import {
  DISCORD_BOT_TOKEN,
  DISCORD_REALTIME_CHANNEL_ID,
  DISCORD_REALTIME_CHANNEL_WEBHOOK_ID,
  DISCORD_REALTIME_CHANNEL_WEBHOOK_TOKEN,
} from './secrets';
import { updateRealtimeChannelPriceData } from './discord/webhookdata';

const discordClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use global commands only, comment this line
  botGuilds: [
    (discordClient) => discordClient.guilds.cache.map((guild) => guild.id),
  ],
});

discordClient.once('ready', async () => {
  // make sure all guilds are in cache
  await discordClient.guilds.fetch();

  // // clear all guild commands
  // // useful when moving to global commands from guild commands
  // await discordClient.clearApplicationCommands(
  //   ...discordClient.guilds.cache.map((g) => g.id)
  // );

  // init all application commands
  await discordClient.initApplicationCommands({
    guild: { log: true },
    global: { log: true },
  });

  await discordClient.channels.fetch(DISCORD_REALTIME_CHANNEL_ID);

  await updateRealtimeChannelPriceData(discordClient);

  // init permissions; enabled log to see changes
  await discordClient.initApplicationPermissions(true);

  console.log('Discord bot started');
});

discordClient.on('interactionCreate', (interaction: Interaction) => {
  discordClient.executeInteraction(interaction);
});

discordClient.on('messageCreate', (message: Message) => {
  discordClient.executeCommand(message);
  const messageId = message.id;

  const deletePrevWebhookMsges = async () => {
    if (message.channelId === DISCORD_REALTIME_CHANNEL_ID) {
      const realtimeChannel = discordClient.channels.cache.get(
        DISCORD_REALTIME_CHANNEL_ID
      );
      if (realtimeChannel) {
        const webhook = await realtimeChannel.client.fetchWebhook(
          DISCORD_REALTIME_CHANNEL_WEBHOOK_ID,
          DISCORD_REALTIME_CHANNEL_WEBHOOK_TOKEN
        );

        // in realtime webhook (should have just 1 updated message), delete all except current message
        const msges = await message.channel.messages.fetch();
        for (const msgEntry of msges.entries()) {
          const [msgId, msg] = msgEntry;
          if (msgId !== messageId) {
            webhook.deleteMessage(msg);
          }
        }
      }
    }
  };
  deletePrevWebhookMsges();
});

export async function discordBotInit() {
  // with cjs
  // await importx(__dirname + '/{discord,replies}/**/*.{ts,js}');
  // with ems
  await importx(
    dirname(import.meta.url) + '/{discord,replies,resources,utils}/**/*.{ts,js}'
  );

  await discordClient.login(DISCORD_BOT_TOKEN);
}
