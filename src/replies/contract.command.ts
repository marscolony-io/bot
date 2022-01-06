import { TESTNET_CLNY, TESTNET_GM, TESTNET_NFT, CLNY, NFT, GM } from "../values";

export const CONTRACT_TEXT = `
CONTRACTS:

Land Plots MC ERC721:
\`${NFT}\`

CLNY Token ERC20:
\`${CLNY}\`

Game Manager:
\`${TESTNET_GM}\`

Harmony explorer: https://explorer\\.harmony\\.one/

commands: /contract /stats
`.trim();