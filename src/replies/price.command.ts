import axios from 'axios';
import Web3 from 'web3';
import { NFT } from '../values';
import { footer } from './footer';
import NFTKeys from './NFTKEYS.json';
import { AbiItem } from 'web3-utils';

const web3 = new Web3('https://api.harmony.one');
const nftkeys = new web3.eth.Contract(NFTKeys.abi as AbiItem[], NFT);

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

  try {
    const [_mcData] = await Promise.all([
      nftkeys.methods.numTokenListings(NFT).call(),
    ]);
    // const supply = (_supply * 10 ** -18).toFixed(3);
    // lastMcSupply = Math.max(lastMcSupply, _MCSupply); // sometimes we get old data

    console.log(_mcData);

    return `
View current prices on: https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83

${footer}
    `.trim();
  } catch (error) {
    console.log(error);
    return `
View current prices on: https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83
    
Error fetching NFT floor

${footer}
    `;
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
