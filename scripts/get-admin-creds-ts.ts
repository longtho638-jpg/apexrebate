import { db } from '../src/lib/db';

async function main() {
  console.log('🔍 Tìm kiếm admin users...\n');
  
  const adminUsers = await db.users.findMany({
    where: {
      role: { in: ['ADMIN', 'CONCIERGE'] }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      referralCode: true,
      createdAt: true
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
    console.log(`    Referral Code: ${user.referralCode}`);
    console.log(`    Created: ${user.createdAt.toISOString().split('T')[0]}`);
    console.log('');
  });

  console.log('\n📝 Để reset password:');
  console.log(`POST https://apexrebate.com/api/auth/forgot-password`);
  console.log(`Body: { "email": "${adminUsers[0].email}" }`);
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
