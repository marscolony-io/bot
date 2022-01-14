import Web3 from 'web3';
import { NFT } from '../values';
import NFTKeysABI from './NFTKEYS.json';
import { AbiItem } from 'web3-utils';
import { footer } from './footer';

const web3 = new Web3('https://api.harmony.one');
const nftkeys = new web3.eth.Contract(NFTKeysABI.abi as AbiItem[], NFT);

// TODO caching
// let lastMcSupply: number = 0;

export const getNFTStats = async (): Promise<string> => {
    try {
        const [_mcData] = await Promise.all([
            nftkeys.methods.numTokenListings(NFT).call(),
        ]);
        // const supply = (_supply * 10 ** -18).toFixed(3);
        // lastMcSupply = Math.max(lastMcSupply, _MCSupply); // sometimes we get old data

        console.log(_mcData);

        return `
${footer}
    `.trim();
    } catch (error) {
        console.log(error);
        return `${footer}
        Error`;
    }
};
