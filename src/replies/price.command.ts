import axios from "axios";
import { footer } from "./footer";

export const price = async (): Promise<string> => {
  const USDC: [string, number] = ['0xbf255d8c30dbab84ea42110ea7dc870f01c0013a', 1666600000];
  const CLNY: [string, number] = ['0xcd818813f038a4d1a27c84d24d74bbc21551fa83', 1666600000];
  const pairData = ([ticker, chainId]: [string, number]) =>
    `https://api2.sushipro.io/?action=get_pair&chainID=${chainId}&pair=${ticker}`;

  const usdcData = await axios.get(pairData(USDC));
  const clnyData = await axios.get(pairData(CLNY));

  if (!usdcData.data?.[0]?.Token_1_reserve || !clnyData.data?.[0]?.Token_1_reserve) {
    return 'Error #1';
  }
  // console.log(harmonyData.data);
  // console.log(clnyData.data);

  const priceVal = clnyData.data[0].Token_2_reserve / clnyData.data[0].Token_1_reserve;
  const priceONE = usdcData.data[0].Token_1_reserve / usdcData.data[0].Token_2_reserve;
  const priceDollars = priceVal * priceONE;

  return 'https:\\/\\/dexscreener\\.com\\/harmony\\/0xcd818813f038a4d1a27c84d24d74bbc21551fa83';

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


}
