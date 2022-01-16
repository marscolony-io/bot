import { getPrice } from "../replies/price.command";
import { getStats } from "../replies/stats.command";

(async () => {

  const stats = await getPrice();

  console.log({ stats });

})();
