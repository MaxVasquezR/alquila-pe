import { expireBoostedItems, syncPremiumExpiry } from "../src/lib/payments/fulfillment";

async function main() {
  const boosts = await expireBoostedItems();
  const premium = await syncPremiumExpiry();
  console.log(`Expired boosts: ${boosts}, premium: ${premium}`);
}

main().catch(console.error);
