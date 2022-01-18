import { getPrice } from '../replies/price.command';

(async () => {
  const stats = await getPrice();

  console.log({ stats });
})();
