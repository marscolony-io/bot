import Web3 from 'web3';
import { CLNY as CLNYAddress } from '../values';
import CLNY from '../resources/CLNY.json';
// import MC from './MC.json';
import { AbiItem } from 'web3-utils';
import { escapeDot } from '../utils/utils';

const web3 = new Web3('https://api.harmony.one');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], CLNYAddress);
// const mc = new web3.eth.Contract(MC.abi as AbiItem[], MarsColonyNFT);

// TODO caching
// let lastMcSupply: number = 0;

export const getStats = async (footer?: any): Promise<string> => {
  try {
    const [_supply] = await Promise.all([
      clny.methods.totalSupply().call(),
      // mc.methods.totalSupply().call(),
    ]);
    const supply = (_supply * 10 ** -18).toFixed(3);
    // lastMcSupply = Math.max(lastMcSupply, _MCSupply); // sometimes we get old data

    return (
      `
Current supply of CLNY: **${escapeDot(supply)}**
**100K** CLNY were minted for initial liquidity
    ` +
      (footer
        ? `
${footer}
`
        : '')
    ).trim();
  } catch (error) {
    console.log(error);
    return 'Error\n\n' + footer;
  }
};
