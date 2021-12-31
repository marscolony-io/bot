import Web3 from 'web3';
import { TESTNET_CLNY } from '../values';
import CLNY from './CLNY.json';
import { AbiItem } from 'web3-utils';

const web3 = new Web3('https://api.s0.b.hmny.io');

// TODO caching

export const getStats = async (): Promise<string> => {
  const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], TESTNET_CLNY);
  const _supply = await clny.methods.totalSupply().call();
  const supply = (_supply * 10 ** -18).toFixed(3);
  return `
TESTNET current supply: ${supply.replace(/\./g, '\\.')} CLNY

/stats command in development
  `.trim();
};
