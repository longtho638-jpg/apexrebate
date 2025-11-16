import { seedToolsMarketplace } from './seed-complete';

export async function seedMaster() {
  console.log('🚀 Running simplified master seed (tools marketplace only)...');
  await seedToolsMarketplace();
  console.log('✅ Master seed completed');
}

seedMaster()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
