import { Context, Telegraf } from 'telegraf';
import { CONTRACT_TEXT } from './replies/contract.command';
import { getPrice } from './replies/price.command';
import { RESOURCES_TEXT } from './replies/resources.command';
import { getStats } from './replies/stats.command';
import { BOT_TOKEN } from './secrets';

const bot = new Telegraf(BOT_TOKEN);

bot.command(['contract', 'contracts'], (ctx: Context) => {
  ctx.telegram.sendMessage(ctx.chat?.id ?? 0, CONTRACT_TEXT, {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
  });
});

bot.command(['stat', 'stats'], async (ctx: Context) => {
  ctx.telegram.sendMessage(ctx.chat?.id ?? 0, await getStats(), {
    parse_mode: 'MarkdownV2',
    disable_web_page_preview: true,
  });
});

bot.command(
  ['price', 'chart', 'nft', 'floor', 'floorprice'],
  async (ctx: Context) => {
    ctx.telegram.sendMessage(ctx.chat?.id ?? 0, await getPrice(), {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    });
  }
);

bot.command(
  ['website', 'wp', 'whitepaper', 'roadmap', 'tokenomics', 'progress'],
  (ctx: Context) => {
    ctx.telegram.sendMessage(ctx.chat?.id ?? 0, RESOURCES_TEXT, {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    });
  }
);

bot.launch();
