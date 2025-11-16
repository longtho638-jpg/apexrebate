import { seedToolsMarketplace } from './seed-complete';

async function runFullSeed() {
  await seedToolsMarketplace();
  process.exit(0);
}

runFullSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
