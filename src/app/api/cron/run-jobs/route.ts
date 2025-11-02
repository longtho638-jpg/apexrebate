import { NextRequest, NextResponse } from 'next/server'
import { CronJobs } from '@/lib/cron-jobs'

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting cron jobs execution...')
    
    // Run all cron jobs
    await CronJobs.runAllJobs()

    return NextResponse.json({
      success: true,
      message: 'All cron jobs executed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Cron job execution error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute cron jobs',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Allow GET for testing (returns status)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'ApexRebate Cron Jobs',
    status: 'active',
    timestamp: new Date().toISOString()
  })
}
