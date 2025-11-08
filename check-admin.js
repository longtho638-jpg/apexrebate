const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function check() {
  const admin = await db.users.findUnique({
    where: { email: 'admin@apexrebate.com' },
    select: { 
      id: true,
      email: true,
      name: true,
      role: true,
      password: true
    }
  });
  console.log('Admin:', admin);
  await db.$disconnect();
}

check();
