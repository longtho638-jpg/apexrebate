#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    console.log('🔍 Checking admin user in database...\n');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@apexrebate.com' },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        password: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    if (!admin) {
      console.log('❌ Admin user NOT found in database');
      console.log('   Email: admin@apexrebate.com');
      console.log('\n💡 Run this to create admin user:');
      console.log('   node scripts/create-admin.js');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name || 'N/A');
    console.log('   Role:', admin.role);
    console.log('   Email Verified:', admin.emailVerified ? 'Yes' : 'No');
    console.log('   Created:', admin.createdAt.toISOString().split('T')[0]);
    console.log('   Password hash:', admin.password.substring(0, 30) + '...');
    console.log('');
    
    // Test password
    console.log('🔐 Testing password "admin123"...');
    const isValid = await bcrypt.compare('admin123', admin.password);
    
    if (isValid) {
      console.log('✅ Password "admin123" is VALID');
      console.log('');
      console.log('🎯 Admin login should work with:');
      console.log('   Email: admin@apexrebate.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('🌐 Test URLs:');
      console.log('   Local: http://localhost:3000/vi/auth/signin');
      console.log('   Production: https://apexrebate-1-40fla36ew-minh-longs-projects-f5c82c9b.vercel.app/vi/auth/signin');
    } else {
      console.log('❌ Password "admin123" is INVALID');
      console.log('');
      console.log('💡 Reset password:');
      console.log('   const bcrypt = require("bcryptjs");');
      console.log('   const hash = await bcrypt.hash("admin123", 10);');
      console.log('   // Update user with new hash');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
