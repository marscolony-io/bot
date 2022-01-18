import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { getPrice } from '../replies/price.command';
import { RESOURCES_TEXT } from '../replies/resources.command';
import { getStats } from '../replies/stats.command';

@Discord()
export abstract class AppDiscord {
  // We can use member decorators
  // because we decorated the class with @Discord
  @Slash('stats', { description: 'Get stats' })
  async stats(interaction: CommandInteraction) {
    // hack to get around discord default 3s timeout: https://discordjs.guide/interactions/replying-to-slash-commands.html#deferred-responses
    await interaction.deferReply();
    await interaction.editReply(await getStats());
  }

  @Slash('price', { description: 'Get prices' })
  async price(interaction: CommandInteraction) {
    await interaction.deferReply();
    await interaction.editReply(await getPrice());
  }

  @Slash('wp', { description: 'View whitepaper and related resources' })
  wp(interaction: CommandInteraction) {
    interaction.reply(RESOURCES_TEXT());
  }
}
