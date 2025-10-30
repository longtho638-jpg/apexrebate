import { createSampleUser } from './seed-user.js';
import { seedToolsMarketplace } from './seed-tools.js';

async function runFullSeed() {
  await createSampleUser();
  await seedToolsMarketplace();
  process.exit(0);
}

runFullSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});