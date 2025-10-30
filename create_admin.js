
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: 'test@apexrebate.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Admin user created successfully');
  await prisma.$disconnect();
}
main().catch(console.error);

