import { price } from "../replies/price.command";
import { getStats } from "../replies/stats.command";

(async () => {

  const stats = await price();

  console.log({ stats });

})();
