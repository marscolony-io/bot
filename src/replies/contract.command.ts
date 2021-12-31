import { TESTNET_CLNY, TESTNET_GM, TESTNET_NFT } from "../values";

export const CONTRACT_TEXT = `
CONTRACTS:

TESTNET NFT ERC721:
\`${TESTNET_NFT}\`

TESTNET CLNY ERC20:
\`${TESTNET_CLNY}\`

TESTNET Game Manager:
\`${TESTNET_GM}\`

TESTNET explorer: https://explorer\\.pops\\.one/
`.trim();