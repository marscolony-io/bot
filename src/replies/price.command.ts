import axios from 'axios';
import Web3 from 'web3';
import { MarsColonyNFT, NFTKeysMarketplaceAddress } from '../values';
import { footer } from './footer';
import NFTKeyMarketplaceABI from './NFTKeyMarketplaceABI.json'; // from https://nftkey.app/marketplace-contracts/, see BSC / FTM / AVAX explorer for ABI
import { AbiItem } from 'web3-utils';

const web3 = new Web3('https://api.harmony.one');
const nftkeysMarketplaceContract = new web3.eth.Contract(
  NFTKeyMarketplaceABI as AbiItem[],
  NFTKeysMarketplaceAddress
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

export const getPrice = async (): Promise<string> => {
  const USDC: [string, number] = [
    '0xbf255d8c30dbab84ea42110ea7dc870f01c0013a',
    1666600000,
  ];
  const CLNY: [string, number] = [
    '0xcd818813f038a4d1a27c84d24d74bbc21551fa83',
    1666600000,
  ];
  const pairData = ([ticker, chainId]: [string, number]) =>
    `https://api2.sushipro.io/?action=get_pair&chainID=${chainId}&pair=${ticker}`;

  const usdcData = await axios.get(pairData(USDC));
  const clnyData = await axios.get(pairData(CLNY));

  if (
    !usdcData.data?.[0]?.Token_1_reserve ||
    !clnyData.data?.[0]?.Token_1_reserve
  ) {
    return 'Error #1';
  }
  // console.log(harmonyData.data);
  // console.log(clnyData.data);

  const priceVal =
    clnyData.data[0].Token_2_reserve / clnyData.data[0].Token_1_reserve;
  const priceONE =
    usdcData.data[0].Token_1_reserve / usdcData.data[0].Token_2_reserve;
  const priceDollars = priceVal * priceONE;

  const currDateTime = new Date();
  let errorFetchingFloor = false;

  if (
    latestFloorPrice === 0 ||
    currDateTime.getTime() - latestFloorPriceDateTime.getTime() > 1000 * 60
    // 1min
  ) {
    try {
      const numListings = await nftkeysMarketplaceContract.methods
        .numTokenListings(MarsColonyNFT)
        .call();
      // const supply = (_supply * 10 ** -18).toFixed(3);
      // lastMcSupply = Math.max(lastMcSupply, _MCSupply); // sometimes we get old data

      const numListingsInt = parseInt(numListings);

      const batchSize = 20;
      let currBatchCount = 0;
      const divideConst = 1000000000000000000;
      let floorPrice = divideConst; // what to set as starting floor - max value possible?
      let startingIdx = 1 + currBatchCount * batchSize;

      while (startingIdx <= numListingsInt) {
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
      }

      latestFloorPriceDateTime = currDateTime;
      latestFloorPrice = floorPrice;
    } catch (error) {
      console.log(error);
      errorFetchingFloor = true;
    }
  }

  if (latestFloorPrice > 0) {
    return `
View current prices on: https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83

Latest floor price: ${latestFloorPrice} CLNY

Last updated: ${latestFloorPriceDateTime.toLocaleString()}

${footer}
    `.trim();
  } else {
    return `
View current prices on: https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83
    
Error fetching NFT floor

${footer}
    `.trim();
  }

  if (clnyData.status < 300) {
    return `
1 CLNY \\= \`${priceVal.toFixed(3)}\` ONE
1 ONE \\= \`${priceONE.toFixed(3)}\`$ \\(WONE\\-1USDC pair\\)
1 CLNY \\= \`${priceDollars.toFixed(3)}\`$

${footer}
      `.trim();
  } else {
    return 'Error #2';
  }
};
