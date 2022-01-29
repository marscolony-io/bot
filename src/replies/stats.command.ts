import Web3 from 'web3';
import { CLNY as CLNYAddress, CLNY_LIQUIDITY, CLNY_TREASURY } from '../values';
import CLNY from '../resources/CLNY.json';
// import MC from './MC.json';
import { AbiItem } from 'web3-utils';
import { escapeDot } from '../utils/utils';

const web3 = new Web3('https://api.harmony.one');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], CLNYAddress);
// const mc = new web3.eth.Contract(MC.abi as AbiItem[], MarsColonyNFT);

// TODO caching
// let lastMcSupply: number = 0;
export let clnyTotalSupply = 0;
export let clnyTreasury = 0;
export let clnyLiquidity = 0;
export let circulatingClny = 0;

const factor = 1e-18;

export const getCLNYStats = async (footer?: any): Promise<string> => {
  try {
    clnyTotalSupply = (await clny.methods.totalSupply().call()) * factor;

    clnyTreasury =
      (await clny.methods.balanceOf(CLNY_TREASURY).call()) * factor;

    clnyLiquidity =
      (await clny.methods.balanceOf(CLNY_LIQUIDITY).call()) * factor;

    circulatingClny = clnyTotalSupply - clnyTreasury - clnyLiquidity;

    return (
      `
Current supply of CLNY: **${escapeDot(clnyTotalSupply.toFixed(3))}**
Circulating CLNY supply: **${escapeDot(circulatingClny.toFixed(3))}**
CLNY Treasury: **${escapeDot(clnyTreasury.toFixed(3))}**
CLNY Liquidity: **${escapeDot(clnyLiquidity.toFixed(3))}**
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
