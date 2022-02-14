import Web3 from 'web3';
import {
  CLNY,
  MarsColonyNFT,
  NFTKeysMarketplaceAddress,
  WONE_CONTRACT,
  CLNY_PAIR,
  USDC_CONTRACT,
  USDC_PAIR,
  GM,
} from '../values';
import NFTKeyMarketplaceABI from '../resources/NFTKeyMarketplaceABI.json'; // from https://nftkey.app/marketplace-contracts/, see BSC / FTM / AVAX explorer for ABI
import ClnyArtefact from '../resources/CLNY.json';
import GameManager from '../resources/GameManager.json';
import { AbiItem } from 'web3-utils';
import { escapeBrackets, escapeDot } from '../utils/utils';

const web3 = new Web3('https://api.harmony.one');
const nftkeysMarketplaceContract = new web3.eth.Contract(
  NFTKeyMarketplaceABI as AbiItem[],
  NFTKeysMarketplaceAddress
);

const CLNYTokenContract = new web3.eth.Contract(
  ClnyArtefact.abi as AbiItem[],
  CLNY
);

const WoneTokenContract = new web3.eth.Contract(
  ClnyArtefact.abi as AbiItem[], // ERC20
  WONE_CONTRACT
);

const UsdcTokenContract = new web3.eth.Contract(
  ClnyArtefact.abi as AbiItem[], // ERC20
  USDC_CONTRACT
);

const gm = new web3.eth.Contract(GameManager.abi as AbiItem[], GM);

interface Listing {
  tokenId: number;
  value: number;
  seller: string;
  expireTimestamp: number;
}

interface AttributeData {
  speed: number;
  earned: number;
  baseStation: number;
  transport: number;
  robotAssembly: number;
  powerProduction: number;
}

// global variables for caching
export let latestFloorPrice = 0;
export let numUnupgradedPlots = 0;
export let latestFloorPriceUpgraded = 0;
export let numUpgradedPlots = 0;
export let costBuyUpgradedInONE = 0;
export let costBuyFloorAndUpgradeInONE = 0;

let lowestUpgradedTokenId = 0;

let latestFloorPriceDateTime = new Date();
export let priceCLNYperONE = 0;
export let priceONEperUSD = 0;
export let priceCLNYperUSD = 0;

let currBlockNumCached = 0;
export let totalTransactionValueCached = 0;
export let numSoldCached = 0;

export const numMinutesCache = 1;
const batchSize = 20;
const divideConst = 1e18;
const listingsBatchSize = 1024;

interface PlotEarning {
  count: number;
  countListed: number;
  earningSpeed: number;
}

export let earningSpeedsArr: PlotEarning[] = [];

interface TokenBoughtListing {
  tokenId: string;
  value: string;
  seller: string;
  expireTimestamp: number;
}

// cache every numMinutesCache in background (not upon query)
(async () => {
  while (true) {
    try {
      const maxNum = 21000;
      const minNum = 1;
      const batchSize = 100;

      for (let currIdx = minNum; currIdx < maxNum; currIdx += batchSize) {
        const nftDataAll: AttributeData[] = await gm.methods
          .getAttributesMany(
            Array.from({ length: batchSize }, (_, i) => i + currIdx)
          )
          .call();

        for (const nftData of nftDataAll) {
          const earningSpeed = nftData.speed;

          const idx = earningSpeedsArr.findIndex(
            (e) => e.earningSpeed === earningSpeed
          );
          if (idx > -1) {
            earningSpeedsArr[idx] = {
              ...earningSpeedsArr[idx],
              count: earningSpeedsArr[idx].count + 1,
            };
          } else {
            earningSpeedsArr.push({
              earningSpeed: earningSpeed,
              count: 1,
              countListed: 0,
            });
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    try {
      const numListings: number = await nftkeysMarketplaceContract.methods
        .numTokenListings(MarsColonyNFT)
        .call();

      let currBatchCount = 0;
      let floorPrice = Number.MAX_VALUE;
      let floorPriceUpgraded = Number.MAX_VALUE;
      let startingIdx = 1 + currBatchCount * batchSize;

      let numUpgradedPlotsTemp = 0;
      let numUnupgradedPlotsTemp = 0;

      const earningSpeedsArrTemp: PlotEarning[] = [];

      while (startingIdx <= numListings) {
        try {
          const tokenListings: Listing[] =
            await nftkeysMarketplaceContract.methods
              .getTokenListings(MarsColonyNFT, startingIdx, batchSize)
              .call();

          // value 0 = not listed
          const tokenListingsListed = tokenListings.filter(
            (t) => t.value / divideConst !== 0
          );

          const nftData: AttributeData[] = await gm.methods
            .getAttributesMany(tokenListingsListed.map((t) => t.tokenId))
            .call();

          for (const idx in tokenListingsListed) {
            const y = tokenListingsListed[idx];
            const price = y.value / divideConst;
            const earningSpeed = nftData[idx].speed;

            if (price !== 0) {
              const idx = earningSpeedsArrTemp.findIndex(
                (e) => e.earningSpeed === earningSpeed
              );
              if (idx > -1) {
                earningSpeedsArrTemp[idx] = {
                  ...earningSpeedsArrTemp[idx],
                  countListed: earningSpeedsArrTemp[idx].count + 1,
                };
              } else {
                earningSpeedsArrTemp.push({
                  earningSpeed: earningSpeed,
                  count: 0,
                  countListed: 1,
                });
              }

              if (earningSpeed > 1) {
                numUpgradedPlotsTemp++;
                if (price < floorPriceUpgraded) {
                  floorPriceUpgraded = price;
                  lowestUpgradedTokenId = y.tokenId;
                }
              } else {
                numUnupgradedPlotsTemp++;
                if (price < floorPrice) {
                  floorPrice = price;
                }
              }
            }
          }

          currBatchCount++;
          startingIdx = 1 + currBatchCount * batchSize;
        } catch (error) {
          console.log(error);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // wait before retry if looping through listings fails
          continue;
        }
      }

      latestFloorPriceDateTime = new Date();
      latestFloorPrice = floorPrice;
      latestFloorPriceUpgraded = floorPriceUpgraded;

      numUpgradedPlots = numUpgradedPlotsTemp;
      numUnupgradedPlots = numUnupgradedPlotsTemp;

      costBuyUpgradedInONE = latestFloorPriceUpgraded;
      costBuyFloorAndUpgradeInONE = latestFloorPrice + 30 * priceCLNYperONE;

      earningSpeedsArr = earningSpeedsArrTemp;
    } catch (error) {
      // should not have error unless numTokenListings has error
      // any getTokenListings errors should be caught within inner try/catch
      console.log('nft pricing error', error);
    }

    try {
      const clnyInLiquidity =
        (await CLNYTokenContract.methods.balanceOf(CLNY_PAIR).call()) * 1e-18;
      const oneInLiquidity =
        (await WoneTokenContract.methods.balanceOf(CLNY_PAIR).call()) * 1e-18;
      const usdcInUsdcLiquidity =
        (await UsdcTokenContract.methods.balanceOf(USDC_PAIR).call()) * 1e-6;
      const oneInUsdcLiquidity =
        (await WoneTokenContract.methods.balanceOf(USDC_PAIR).call()) * 1e-18;

      priceCLNYperONE = oneInLiquidity / clnyInLiquidity;
      priceONEperUSD = usdcInUsdcLiquidity / oneInUsdcLiquidity;
      priceCLNYperUSD = priceCLNYperONE * priceONEperUSD;
    } catch (error) {
      console.log('pricing error', error);
    }

    // getting total sales
    const latestBlockNum = await web3.eth.getBlockNumber();

    // let currBlockNum = 20758264; // https://nftkey.app/marketplace-contracts/ -> Harmony Blockchain -> Transaction Hash -> Block Number
    // let currBlockNum = 21413624; // through testing of very first transaction

    // for caching purposes
    // TODO store this in db / json file
    let currBlockNum = 22170360;
    let totalTransactionValue = 16946838.806685008;
    let numSold = 6581;

    while (currBlockNum < latestBlockNum) {
      const toBlock = Math.min(
        currBlockNum + listingsBatchSize - 1,
        latestBlockNum
      );

      const events = await nftkeysMarketplaceContract.getPastEvents(
        'TokenBought',
        {
          fromBlock: currBlockNum,
          toBlock: toBlock,
          address: NFTKeysMarketplaceAddress,
          filter: {
            erc721Address: MarsColonyNFT,
          },
        }
      );

      if (events && events.length > 0) {
        const tokensBoughtData = events.map(
          (e) => e.returnValues.listing as TokenBoughtListing
        );
        const tokensPricesBought = tokensBoughtData.map((t) => {
          const tokenId = Number(t.tokenId);
          if (tokenId > 21000 || tokenId < 1) {
            console.log('ERROR:', t.tokenId, Number(t.value) / divideConst);
            return 0;
          }
          return Number(t.value) / divideConst;
        });

        for (const t of tokensPricesBought) {
          if (t > 0) {
            numSold++;
            totalTransactionValue += t;
          }
        }
      }

      currBlockNum = toBlock + 1;
    }

    currBlockNumCached = currBlockNum;
    totalTransactionValueCached = totalTransactionValue;
    numSoldCached = numSold;

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * 60 * numMinutesCache)
    );
  }
})();

export const getPrice = async (
  footer?: any,
  includeDexscreener?: boolean
): Promise<string> => {
  try {
    const priceResponse = `
1 CLNY \\= **${escapeDot(priceCLNYperONE.toFixed(3))}** ONE
1 ONE \\= **$${escapeDot(priceONEperUSD.toFixed(3))}** (WONE\\-1USDC pair)
1 CLNY \\= **$${escapeDot(priceCLNYperUSD.toFixed(3))}**
    `.trim();

    let cheaperStatement = '';
    if (costBuyUpgradedInONE < costBuyFloorAndUpgradeInONE) {
      cheaperStatement = `It is currently cheaper to buy an upgraded plot (**${escapeDot(
        costBuyUpgradedInONE.toFixed(3)
      )}** ONE) than to buy the cheapest plot and upgrade (**${escapeDot(
        costBuyFloorAndUpgradeInONE.toFixed(3)
      )}** ONE)`;
    } else if (costBuyUpgradedInONE > costBuyFloorAndUpgradeInONE) {
      cheaperStatement = `It is currently cheaper to buy the cheapest plot and upgrade (**${escapeDot(
        costBuyFloorAndUpgradeInONE.toFixed(3)
      )}** ONE) than to buy an upgraded plot (**${escapeDot(
        costBuyUpgradedInONE.toFixed(3)
      )}** ONE)`;
    }

    const latestCachedDataToShowInMinutes = 5;
    let floorResponse = '';
    if (
      latestFloorPrice > 0 &&
      new Date().getTime() - latestFloorPriceDateTime.getTime() <
        1000 * 60 * latestCachedDataToShowInMinutes
    ) {
      floorResponse = `Plot floor price: **${latestFloorPrice.toFixed(
        0
      )}** ONE ($${(priceONEperUSD * latestFloorPrice).toFixed(0)}, ${escapeDot(
        (latestFloorPrice / priceCLNYperONE).toFixed(3)
      )} CLNY)`;

      if (latestFloorPriceUpgraded > 0 && lowestUpgradedTokenId !== 0) {
        floorResponse += `
Upgraded Plot floor price: **${latestFloorPriceUpgraded.toFixed(
          0
        )}** ONE (id ${lowestUpgradedTokenId}, $${(
          priceONEperUSD * latestFloorPriceUpgraded
        ).toFixed(0)}, ${escapeDot(
          (latestFloorPriceUpgraded / priceCLNYperONE).toFixed(3)
        )} CLNY)
**${
          numUnupgradedPlots + numUpgradedPlots
        }** total plots available, **${numUpgradedPlots}** of them upgraded`;

        if (cheaperStatement !== '') {
          floorResponse += `

${cheaperStatement}`;
        }
      }
    } else {
      floorResponse = 'Error fetching NFT floor price';
    }

    let totalTransactionsResponse = '';
    if (
      currBlockNumCached > 0 &&
      totalTransactionValueCached > 0 &&
      numSoldCached > 0
    ) {
      totalTransactionsResponse = `Total Volume Traded: **${escapeDot(
        (totalTransactionValueCached / 1e6).toFixed(1)
      )}m** ONE
Total Sold: **${numSoldCached}**
        `;
    }

    let earningSpeedResponse = ``;
    if (
      earningSpeedsArr.length > 0 &&
      earningSpeedsArr.every((e) => e.count > 0)
    ) {
      earningSpeedResponse = earningSpeedsArr
        .sort((a, b) => a.earningSpeed - b.earningSpeed)
        .map(
          (e) =>
            `**${e.earningSpeed}** CLNY/day: **${e.count}** plots${
              e.countListed > 0 ? ` (**${e.countListed}** for sale)` : ''
            }`
        )
        .join('\n');
    }

    const response = escapeBrackets(
      `
${priceResponse}

${floorResponse}

${earningSpeedResponse}

${totalTransactionsResponse}` +
        (footer
          ? `
${footer}
`
          : '')
    ).trim();

    if (includeDexscreener) {
      return (
        `[Dexscreener](https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83)` +
        '\n' +
        response
      );
    } else {
      return response;
    }
  } catch {
    return 'Error\n\n' + footer;
  }
};
