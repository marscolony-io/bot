import { CLNY, GM, MarsColonyNFT } from '../values';
import { footer } from './footer';

export const CONTRACT_TEXT = `
CONTRACTS:

Land Plots MC ERC721:
\`${MarsColonyNFT}\`

CLNY Token ERC20:
\`${CLNY}\`

Game Manager:
\`${GM}\`

Harmony explorer: https://explorer\\.harmony\\.one/

${footer}
`.trim();
