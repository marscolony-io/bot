import Web3 from 'web3';
import {
  CLNY as CLNYAddress,
  CLNY_LIQUIDITY,
  CLNY_LIQUIDITY_BUFFER,
  CLNY_TREASURY,
  GM,
} from '../values';
import CLNY from '../resources/CLNY.json' assert {type: 'json'};
import { AbiItem } from 'web3-utils';
import { escapeDot, numberWithCommas } from '../utils/utils';
import { numMinutesCache } from './price.command';
import GameManager from '../resources/GameManager.json' assert {type: 'json'};
import { minNumPlots, maxNumPlots, batchSizePlots } from '../utils/constants';
import { AttributeData } from '../types';

const web3 = new Web3('https://api.harmony.one');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], CLNYAddress);

const factor = 1e-18;

const gm = new web3.eth.Contract(GameManager.abi as AbiItem[], GM);

let totalClnyBurned = 0;

// calculate total CLNY burned
// atm only through upgrades
(async () => {
  while (true) {
    let totalClnyBurnedTemp = 0;

    const batchSize = batchSizePlots * 1; // should be divisible by 21000

    for (
      let currIdx = minNumPlots;
      currIdx < maxNumPlots;
      currIdx += batchSize
    ) {
      try {
        const nftDataAll: AttributeData[] = await gm.methods
          .getAttributesMany(
            Array.from({ length: batchSize }, (_, i) => i + currIdx)
          )
          .call();

        for (const nftData of nftDataAll) {
          const { baseStation, transport, robotAssembly, powerProduction } =
            nftData;

          if (baseStation > 0) {
            // not sure why === 1 doesn't work
            totalClnyBurnedTemp += 30;
          }

          if (transport > 0) {
            totalClnyBurnedTemp += 120; // level 1
            if (transport > 1) {
              totalClnyBurnedTemp += 270; // level 2
              if (transport > 2) {
                totalClnyBurnedTemp += 480; // level 3
              }
            }
          }

          if (robotAssembly > 0) {
            totalClnyBurnedTemp += 120; // level 1
            if (robotAssembly > 1) {
              totalClnyBurnedTemp += 270; // level 2
              if (robotAssembly > 2) {
                totalClnyBurnedTemp += 480; // level 3
              }
            }
          }

          if (powerProduction > 0) {
            totalClnyBurnedTemp += 120; // level 1
            if (powerProduction > 1) {
              totalClnyBurnedTemp += 270; // level 2
              if (powerProduction > 2) {
                totalClnyBurnedTemp += 480; // level 3
              }
            }
          }
        }
      } catch (error) {
        console.log('getting burned stats error', error);
        currIdx -= batchSize;
        continue;
      }
    }

    totalClnyBurned = totalClnyBurnedTemp;

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * 60 * numMinutesCache)
    );
  }
})();

export const getCLNYStats = async (footer?: any): Promise<string> => {
  try {
    const clnyTotalSupply = (await clny.methods.totalSupply().call()) * factor;

    const clnyTreasury =
      (await clny.methods.balanceOf(CLNY_TREASURY).call()) * factor;

    let clnyLiquidity =
      (await clny.methods.balanceOf(CLNY_LIQUIDITY).call()) * factor;

    clnyLiquidity +=
      (await clny.methods.balanceOf(CLNY_LIQUIDITY_BUFFER).call()) * factor;

    const circulatingClny = clnyTotalSupply - clnyTreasury - clnyLiquidity;

    return (
      `
Current total supply of CLNY \\(excluding burned CLNY\\): **${numberWithCommas(
        escapeDot(clnyTotalSupply.toFixed(0))
      )}**
Circulating CLNY: **${numberWithCommas(escapeDot(circulatingClny.toFixed(0)))}**
CLNY Treasury: **${numberWithCommas(escapeDot(clnyTreasury.toFixed(0)))}**
CLNY Liquidity: **${numberWithCommas(escapeDot(clnyLiquidity.toFixed(0)))}**
    ` +
      (totalClnyBurned > 0
        ? `
CLNY burned through land upgrades: **${numberWithCommas(
            escapeDot(totalClnyBurned.toFixed(0))
          )}**`
        : '') +
      (footer
        ? `
${footer}
`
        : '')
    ).trim();
  } catch (error) {
    console.log(error);
    return 'Fetching CLNY statistics...\n\n' + footer;
  }
};
