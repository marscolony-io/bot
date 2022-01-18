export const RESOURCES_TEXT = (footer?: any) =>
  (
    `
[🔭 Website](https://marscolony\\.io/)
[🌍 Whitepaper](https://people\\.marscolony\\.io/t/introduction\\-a\\-settlement\\-of\\-land/12)
[🪐 Roadmap](https://people\\.marscolony\\.io/t/colony\\-road\\-map\\-progress/17)
[🧑‍🚀 Tokenomics](https://people\\.marscolony\\.io/t/colony\\-tokenomic/53)
` +
    (footer
      ? `
${footer}
`
      : '')
  ).trim();
