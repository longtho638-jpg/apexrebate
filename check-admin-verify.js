const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking admin user...\n');
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@apexrebate.com' }
  });
  
  if (!admin) {
    console.log('❌ Admin user NOT found! Creating now...\n');
    const hash = await bcrypt.hash('admin123', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@apexrebate.com',
        name: 'Admin',
        password: hash,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    });
    console.log('✅ Admin created:', newAdmin.email);
  } else {
    console.log('✅ Admin found:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Password hash:', admin.password.substring(0, 20) + '...\n');
    
    const valid = await bcrypt.compare('admin123', admin.password);
    console.log('🔐 Password "admin123" test:', valid ? '✅ VALID' : '❌ INVALID');
    
    if (!valid) {
      console.log('\n⚠️  Resetting password to "admin123"...');
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash }
      });
      console.log('✅ Password reset complete!');
    }
  }
  
  console.log('\n🎯 Login credentials:');
  console.log('   Email: admin@apexrebate.com');
  console.log('   Password: admin123\n');
  
  await prisma.$disconnect();
}

main().catch(console.error);
