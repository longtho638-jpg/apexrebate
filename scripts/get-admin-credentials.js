const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAdminCredentials() {
  try {
    console.log('🔍 Tìm kiếm admin users...\n');
    
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'CONCIERGE'] }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        password: true,
        createdAt: true,
        referralCode: true
      },
      orderBy: { createdAt: 'asc' }
    });

    if (adminUsers.length === 0) {
      console.log('❌ Không tìm thấy admin users');
      return;
    }

    console.log(`✅ Tìm thấy ${adminUsers.length} admin/concierge users:\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`[${index + 1}] ${user.name}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`    Has Password: ${user.password ? '✅ (hashed)' : '❌'}`);
      console.log(`    Referral Code: ${user.referralCode}`);
      console.log(`    Created: ${user.createdAt.toISOString().split('T')[0]}`);
      console.log('');
    });

    console.log('\n📝 Để reset password:');
    console.log(`1. Via API: POST https://apexrebate.com/api/auth/forgot-password`);
    console.log(`2. Via DB: UPDATE users SET password='$2a$12$NEW_HASH' WHERE email='${adminUsers[0].email}';`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getAdminCredentials();
