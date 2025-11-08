const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function reset() {
  const password = 'Admin@12345';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await db.users.update({
    where: { email: 'admin@apexrebate.com' },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Admin password reset');
  console.log('Email:', result.email);
  console.log('Password: Admin@12345');
  
  // Verify
  const verify = await bcrypt.compare(password, result.password);
  console.log('Verify:', verify ? '✅ Match' : '❌ No match');
  
  await db.$disconnect();
}

reset();
