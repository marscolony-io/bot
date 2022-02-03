import Web3 from 'web3';
import {
  CLNY as CLNYAddress,
  CLNY_LIQUIDITY,
  CLNY_LIQUIDITY_BUFFER,
  CLNY_TREASURY,
} from '../values';
import CLNY from '../resources/CLNY.json';
import { AbiItem } from 'web3-utils';
import { escapeDot, numberWithCommas } from '../utils/utils';

const web3 = new Web3('https://api.harmony.one');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], CLNYAddress);

const factor = 1e-18;

export const getCLNYStats = async (footer?: any): Promise<string> => {
  try {
    const clnyTotalSupply = (await clny.methods.totalSupply().call()) * factor;

    const clnyTreasury =
      (await clny.methods.balanceOf(CLNY_TREASURY).call()) * factor;

    let clnyLiquidity =
      (await clny.methods.balanceOf(CLNY_LIQUIDITY).call()) * factor;

    clnyLiquidity +=
      (await clny.methods.balanceOf(CLNY_LIQUIDITY_BUFFER).call()) *
      factor;

    const circulatingClny =
      clnyTotalSupply -
      clnyTreasury -
      clnyLiquidity;

    return (
      `
Current total supply of CLNY: **${numberWithCommas(
        escapeDot(clnyTotalSupply.toFixed(3))
      )}**
Circulating CLNY: **${numberWithCommas(escapeDot(circulatingClny.toFixed(3)))}**
CLNY Treasury: **${numberWithCommas(escapeDot(clnyTreasury.toFixed(3)))}**
CLNY Liquidity: **${numberWithCommas(escapeDot(clnyLiquidity.toFixed(3)))}**
    ` +
      (footer
        ? `
${footer}
`
        : '')
    ).trim();
  } catch (error) {
    console.log(error);
    return 'Loading CLNY statistics...\n\n' + footer;
  }
};
