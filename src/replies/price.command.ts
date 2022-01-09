import axios from "axios";
import { footer } from "./footer";

export const price = async (): Promise<string> => {
  const USDC: [string, number] = ['0x0b09b42d6e4907b1f3d1e04e6851d1592afba965', 1];
  const CLNY: [string, number] = ['0xcd818813f038a4d1a27c84d24d74bbc21551fa83', 1666600000];
  const pairData = ([ticker, chainId]: [string, number]) =>
    `https://api2.sushipro.io/?action=get_pair&chainID=${chainId}&pair=${ticker}`;

  const harmonyData = await axios.get(pairData(USDC));
  const clnyData = await axios.get(pairData(CLNY));

  if (!harmonyData.data?.[0]?.Token_1_reserve || !clnyData.data?.[0]?.Token_1_reserve) {
    return 'Error #1';
  }
  // console.log(harmonyData.data);
  // console.log(clnyData.data);

  const priceVal = clnyData.data[0].Token_2_reserve / clnyData.data[0].Token_1_reserve;
  

  if (clnyData.status < 300) {
    return `
1 CLNY \\= \`${priceVal.toFixed(3)}\` ONE

${footer}
      `.trim();
  } else {
    return 'Error #2';
  }


}
