import { NextRequest, NextResponse } from 'next/server'
import { securityScanner } from '@/lib/security-scanner'

export async function POST(request: NextRequest) {
  try {
    // 启动安全扫描
    const result = await securityScanner.performSecurityScan()
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Security scan API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Security scan failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取安全报告
    const report = await securityScanner.getSecurityReport()
    const status = securityScanner.getStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        report,
        status
      }
    })
  } catch (error) {
    console.error('Security status API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get security status'
    }, { status: 500 })
  }
}