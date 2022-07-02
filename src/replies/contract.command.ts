import { CLNY, GM, MarsColonyNFT } from '../values';

export const CONTRACT_TEXT = (footer?: any) =>
  (
    `
CONTRACTS:

Harmony Land Plot NFT:
\`${MarsColonyNFT}\`

Hamony CLNY Token:
\`${CLNY}\`

Harmony Game Manager:
\`${GM}\`

Polygon: **soon**
` +
    (footer
      ? `
${footer}
`
      : '')
  ).trim();
