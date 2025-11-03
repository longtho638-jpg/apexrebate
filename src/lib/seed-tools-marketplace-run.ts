import { seedToolsMarketplace } from './seed-tools-marketplace'

async function main() {
  await seedToolsMarketplace()
}

main()
  .then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  })
