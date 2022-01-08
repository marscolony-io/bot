import Web3 from 'web3';
import { CLNY as CLNYAddress, NFT } from '../values';
import CLNY from './CLNY.json';
import MC from './MC.json';
import { AbiItem } from 'web3-utils';

const web3 = new Web3('https://api.harmony.one');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], CLNYAddress);
const mc = new web3.eth.Contract(MC.abi as AbiItem[], NFT);

// TODO caching
let lastMcSupply: number = 0;

export const getStats = async (): Promise<string> => {
  try {
    const [_supply, _MCSupply] = await Promise.all([
      clny.methods.totalSupply().call(),
      mc.methods.totalSupply().call(),
    ]);
    const supply = (_supply * 10 ** -18).toFixed(3);
    lastMcSupply = Math.max(lastMcSupply, _MCSupply); // sometimew we get old data
    return `
Current supply: \`${supply.replace(/\./g, '\\.')} CLNY\`
\`100 000\` CLNY were minted for initial liquidity
\`${(lastMcSupply / 21000 * 100).toFixed(1)}\`% of Land Plots already minted
\`${21000 - lastMcSupply}\` Land Plots available

commands: /contract /stats
    `.trim();
  } catch (error) {
    console.log(error);
    return 'Error';
  }
};
