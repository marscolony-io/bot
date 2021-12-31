import Web3 from 'web3';
import { TESTNET_CLNY, TESTNET_NFT } from '../values';
import CLNY from './CLNY.json';
import MC from './MC.json';
import { AbiItem } from 'web3-utils';

const web3 = new Web3('https://api.s0.b.hmny.io');

const clny = new web3.eth.Contract(CLNY.abi as AbiItem[], TESTNET_CLNY);
const mc = new web3.eth.Contract(MC.abi as AbiItem[], TESTNET_NFT);

// TODO caching

export const getStats = async (): Promise<string> => {
  const [_supply, _MCSupply] = await Promise.all([
    clny.methods.totalSupply().call(),
    mc.methods.totalSupply().call(),
  ]);
  const supply = (_supply * 10 ** -18).toFixed(3);
  return `
TESTNET current supply: ${supply.replace(/\./g, '\\.')} CLNY
\`${_MCSupply}\` lands already minted
  `.trim();
};
