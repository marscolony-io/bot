// import axios from 'axios';
import Web3 from 'web3';
import {
  CLNY,
  MarsColonyNFT,
  NFTKeysMarketplaceAddress,
  WONE_CONTRACT,
  CLNY_PAIR,
  USDC_CONTRACT,
  USDC_PAIR,
} from '../values';
import NFTKeyMarketplaceABI from '../resources/NFTKeyMarketplaceABI.json'; // from https://nftkey.app/marketplace-contracts/, see BSC / FTM / AVAX explorer for ABI
import ClnyArtefact from '../resources/CLNY.json';
import { AbiItem } from 'web3-utils';
import { escapeDot } from '../utils/utils';

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

interface Listing {
  tokenId: number;
  value: number;
  seller: string;
  expireTimestamp: number;
}

// global variables for caching
let latestFloorPrice = 0;
let latestFloorPriceDateTime = new Date();

const numMinutesCache = 1;
const batchSize = 20;
const divideConst = 1e18;

// cache every numMinutesCache in background (not upon query)
(async () => {
  while (true) {
    try {
      const numListings = await nftkeysMarketplaceContract.methods
        .numTokenListings(MarsColonyNFT)
        .call();

      const numListingsInt = parseInt(numListings);

      let currBatchCount = 0;
      let floorPrice = Number.MAX_VALUE;
      let startingIdx = 1 + currBatchCount * batchSize;

      while (startingIdx <= numListingsInt) {
        try {
          const tokenListings: Listing[] =
            await nftkeysMarketplaceContract.methods
              .getTokenListings(MarsColonyNFT, startingIdx, batchSize)
              .call();

          for (const y of tokenListings) {
            const price = y.value / divideConst;
            if (price < floorPrice && price !== 0) {
              floorPrice = price;
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
    } catch (error) {
      // should not have error unless numTokenListings has error
      // any getTokenListings errors should be caught within inner try/catch
      console.log(error);
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * 60 * numMinutesCache)
    );
  }
})();

export const getPrice = async (footer?: any): Promise<string> => {
  try {
    const clnyInLiquidity =
      (await CLNYTokenContract.methods.balanceOf(CLNY_PAIR).call()) * 1e-18;
    const oneInLiquidity =
      (await WoneTokenContract.methods.balanceOf(CLNY_PAIR).call()) * 1e-18;
    const usdcInUsdcLiquidity =
      (await UsdcTokenContract.methods.balanceOf(USDC_PAIR).call()) * 1e-6;
    const oneInUsdcLiquidity =
      (await WoneTokenContract.methods.balanceOf(USDC_PAIR).call()) * 1e-18;

    const priceClny = oneInLiquidity / clnyInLiquidity;
    const priceOne = usdcInUsdcLiquidity / oneInUsdcLiquidity;
    const priceDollars = priceClny * priceOne;

    const priceResponse = `
1 CLNY \\= **${escapeDot(priceClny.toFixed(3))}** ONE
1 ONE \\= **$${escapeDot(priceOne.toFixed(3))}** \\(WONE\\-1USDC pair\\)
1 CLNY \\= **$${escapeDot(priceDollars.toFixed(3))}**
[Dexscreener](https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83)
    `.trim();

    const latestCachedDataToShowInMinutes = 15;
    let floorResponse = '';
    if (
      latestFloorPrice > 0 &&
      new Date().getTime() - latestFloorPriceDateTime.getTime() <
        1000 * 60 * latestCachedDataToShowInMinutes
    ) {
      floorResponse = `NFT floor price: **${latestFloorPrice.toFixed(
        0
      )}** ONE \\($${(priceOne * latestFloorPrice).toFixed(0)}\\)`;
    } else {
      floorResponse = 'Error fetching NFT floor price';
    }

    return (
      `
${priceResponse}

${floorResponse}
    ` +
      (footer
        ? `
${footer}
`
        : '')
    ).trim();
  } catch {
    return 'Error\n\n' + footer;
  }
};
