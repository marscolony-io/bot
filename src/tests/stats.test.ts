import { getStats } from "../replies/stats.command";

(async () => {

  const stats = await getStats();

  console.log({ stats });

})();
