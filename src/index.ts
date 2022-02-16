import { Context, Telegraf } from 'telegraf';
import { discordBotInit } from './discordBotInit';
import { CONTRACT_TEXT } from './replies/contract.command';
import { getLiquidityMiningStats } from './replies/liquiditymining.command';
import { getPrice } from './replies/price.command';
import { RESOURCES_TEXT } from './replies/resources.command';
import { getCLNYStats } from './replies/stats.command';
import { TELEGRAM_BOT_TOKEN } from './secrets';
import { answerClosure } from './telegram/answerClosure';
import { telegramFooter } from './telegram/telegramFooter';
import { removeTripleLinebreaks } from './utils/utils';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const contractAnswer = answerClosure();
bot.command(['contract', 'contracts'], (ctx: Context) => {
  contractAnswer(ctx, CONTRACT_TEXT(telegramFooter));
});

const statsAnswer = answerClosure();
bot.command(['stat', 'stats'], async (ctx: Context) => {
  statsAnswer(ctx, removeTripleLinebreaks(await getCLNYStats(telegramFooter)));
});

const priceAnswer = answerClosure();
bot.command(
  ['price', 'chart', 'nft', 'floor', 'floorprice'],
  async (ctx: Context) => {
    priceAnswer(ctx, removeTripleLinebreaks(await getPrice(telegramFooter)));
  }
);

const wpAnswer = answerClosure();
bot.command(
  ['website', 'wp', 'whitepaper', 'roadmap', 'tokenomics', 'progress'],
  (ctx: Context) => {
    wpAnswer(ctx, RESOURCES_TEXT(telegramFooter));
  }
);

const liquidityMiningAnswer = answerClosure();
bot.command(
  ['lp', 'lm', 'liquiditymining', 'liquidityprovision'],
  async (ctx: Context) => {
    liquidityMiningAnswer(
      ctx,
      '*Liquidity Mining Stats*\n\n' + removeTripleLinebreaks(await getLiquidityMiningStats(telegramFooter))
    );
  }
);

bot.launch();
discordBotInit();
