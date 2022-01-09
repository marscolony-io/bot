import { Context, Telegraf } from "telegraf";
import { CONTRACT_TEXT } from "./replies/contract.command";
import { price } from "./replies/price.command";
import { getStats } from "./replies/stats.command";
import { BOT_TOKEN } from "./secrets";


const bot = new Telegraf(BOT_TOKEN);

bot.command(['contract', 'contracts'], (ctx: Context) => {
  ctx.telegram.sendMessage(
    ctx.chat?.id ?? 0,
    CONTRACT_TEXT,
    { parse_mode: 'MarkdownV2', disable_web_page_preview: true },
  );
});

bot.command(['stat', 'stats'], async (ctx: Context) => {
  ctx.telegram.sendMessage(
    ctx.chat?.id ?? 0,
    await getStats(),
    { parse_mode: 'MarkdownV2', disable_web_page_preview: true },
  );
});

bot.command(['price', 'chart'], async (ctx: Context) => {
  ctx.telegram.sendMessage(
    ctx.chat?.id ?? 0,
    await price(),
    { parse_mode: 'MarkdownV2', disable_web_page_preview: true },
  );
});

bot.launch();
