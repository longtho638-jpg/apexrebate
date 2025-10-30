
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'test@apexrebate.com' } });
  console.log('Referral Code:', user?.referralCode);
  await prisma.$disconnect();
}
main().catch(console.error);

