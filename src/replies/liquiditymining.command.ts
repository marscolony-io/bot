import Web3 from 'web3';
import { CLNY_LiquidityMining } from '../values';
import LiquidityMining from '../resources/LiquidityMining.json' assert {type: 'json'};
import { AbiItem } from 'web3-utils';
import { escapeDot, numberWithCommas } from '../utils/utils';

const web3 = new Web3('https://api.harmony.one');

const clnyLiquidityMining = new web3.eth.Contract(
  LiquidityMining.abi as AbiItem[],
  CLNY_LiquidityMining
);

const factor = 1e-18;

export const getLiquidityMiningStats = async (
  footer?: any
): Promise<string> => {
  try {
    const apr = (await clnyLiquidityMining.methods.getAPR().call()) * 1e-16;

    const tvlInUSD =
      (await clnyLiquidityMining.methods.getDollarTVL().call()) * factor;

    const dailyCLNYRewards =
      (await clnyLiquidityMining.methods.getDailyClnyRewards().call()) * factor;

    const lockedSLP =
      (await clnyLiquidityMining.methods.getLockedSLP().call()) * factor;

    return (
      `
TVL \\= **$${numberWithCommas(
        escapeDot(tvlInUSD.toFixed(0))
      )}** \\= **${numberWithCommas(escapeDot(lockedSLP.toFixed(0)))} SLP**
APR \\= **${numberWithCommas(escapeDot(apr.toFixed(2)))}%**
Daily Rewards \\= **${numberWithCommas(
        escapeDot(dailyCLNYRewards.toFixed(0))
      )} CLNY**
    ` +
      (footer
        ? `
${footer}
`
        : '')
    ).trim();
  } catch (error) {
    console.log(error);
    return (
      'Fetching liquidity mining data...' + (footer ? '\n\n' + footer : '')
    );
  }
};
