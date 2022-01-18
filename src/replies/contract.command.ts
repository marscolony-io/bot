import { CLNY, GM, MarsColonyNFT } from '../values';

export const CONTRACT_TEXT = (footer?: any) =>
  (
    `
CONTRACTS:

Land Plots MC ERC721:
\`${MarsColonyNFT}\`

CLNY Token ERC20:
\`${CLNY}\`

Game Manager:
\`${GM}\`

Harmony explorer: https://explorer\\.harmony\\.one/
` +
    (footer
      ? `
${footer}
`
      : '')
  ).trim();
