export const runtime = 'nodejs'

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlLength = process.env.DATABASE_URL?.length || 0;
    
    let prismaImportSuccess = false;
    let prismaClientType = 'unknown';
    try {
      const { PrismaClient } = await import('@prisma/client');
      prismaImportSuccess = true;
      prismaClientType = typeof PrismaClient;
    } catch (e: any) {
      return NextResponse.json({
        error: 'Failed to import PrismaClient',
        message: e.message,
        hasDbUrl,
        dbUrlLength
      });
    }
    
    let dbImportSuccess = false;
    let prismaInstance: any = null;
    try {
      const { prisma } = await import('@/lib/db');
      dbImportSuccess = true;
      prismaInstance = prisma;
    } catch (e: any) {
      return NextResponse.json({
        error: 'Failed to import db module',
        message: e.message,
        hasDbUrl,
        dbUrlLength,
        prismaImportSuccess,
        prismaClientType
      });
    }
    
    const prismaType = typeof prismaInstance;
    const hasPrismaCount = typeof prismaInstance?.user?.count === 'function';
    
    let querySuccess = false;
    let userCount = 0;
    let queryError = null;
    try {
      userCount = await prismaInstance.user.count();
      querySuccess = true;
    } catch (e: any) {
      queryError = e.message;
    }
    
    return NextResponse.json({
      success: querySuccess,
      diagnostics: {
        hasDbUrl,
        dbUrlLength,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
        prismaImportSuccess,
        prismaClientType,
        dbImportSuccess,
        prismaType,
        hasPrismaCount,
        querySuccess,
        userCount,
        queryError
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed',
      message: error.message
    }, { status: 500 });
  }
}
