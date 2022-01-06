import Web3 from 'web3';
import { CLNY as CLNYAddress, NFT } from '../values';
import CLNY from './CLNY.json';
import MC from './MC.json';
import { AbiItem } from 'web3-utils';

const web3 = new Web3('https://api.harmony.one');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], CLNYAddress);
const mc = new web3.eth.Contract(MC.abi as AbiItem[], NFT);

// TODO caching

export const getStats = async (): Promise<string> => {
  try {
    const [_supply, _MCSupply] = await Promise.all([
      clny.methods.totalSupply().call(),
      mc.methods.totalSupply().call(),
    ]);
    const supply = (_supply * 10 ** -18).toFixed(3);
    return `
  Current supply: \`${supply.replace(/\./g, '\\.')} CLNY\`
  \\(including 100 000 CLNY for initial liquidity\\)
  \`${_MCSupply}\` Land Plots already minted

  commands: /contract /stats
    `.trim();
  } catch (error) {
    console.log(error);
    return 'Error';
  }
};
