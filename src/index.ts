import { Context, Telegraf } from 'telegraf';
import { discordBotInit } from './discordBotInit';
import { CONTRACT_TEXT } from './replies/contract.command';
import { getPrice } from './replies/price.command';
import { RESOURCES_TEXT } from './replies/resources.command';
import { getStats } from './replies/stats.command';
import { TELEGRAM_BOT_TOKEN } from './secrets';
import { telegramFooter } from './telegram/telegramFooter';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.command(['contract', 'contracts'], (ctx: Context) => {
  ctx.telegram.sendMessage(ctx.chat?.id ?? 0, CONTRACT_TEXT(telegramFooter), {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
  });
});

bot.command(['stat', 'stats'], async (ctx: Context) => {
  ctx.telegram.sendMessage(ctx.chat?.id ?? 0, await getStats(telegramFooter), {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
  });
});

bot.command(
  ['price', 'chart', 'nft', 'floor', 'floorprice'],
  async (ctx: Context) => {
    ctx.telegram.sendMessage(
      ctx.chat?.id ?? 0,
      await getPrice(telegramFooter),
      {
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }
    );
  }
);

bot.command(
  ['website', 'wp', 'whitepaper', 'roadmap', 'tokenomics', 'progress'],
  (ctx: Context) => {
    ctx.telegram.sendMessage(
      ctx.chat?.id ?? 0,
      RESOURCES_TEXT(telegramFooter),
      {
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }
    );
  }
);

bot.launch();
discordBotInit();
