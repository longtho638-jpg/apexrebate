import { NextRequest, NextResponse } from 'next/server'
import { marketingAutomation } from '@/lib/marketing-automation'
import { cronJobs } from '@/lib/cron-jobs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignType, userId, immediate } = body

    console.log(`📈 Marketing campaign requested: ${campaignType}`)

    let result

    switch (campaignType) {
      case 'welcome_series':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for welcome series' },
            { status: 400 }
          )
        }
        // Get user details
        const user = await db.users.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        })
        
        if (user) {
          await marketingAutomation.createWelcomeSeries(userId, user.email, user.name || 'Trader')
          result = { message: 'Welcome series created successfully' }
        }
        break

      case 're_engagement':
        await marketingAutomation.createReEngagementCampaign()
        result = { message: 'Re-engagement campaign created successfully' }
        break

      case 'educational':
        await marketingAutomation.createEducationalSeries()
        result = { message: 'Educational series created successfully' }
        break

      case 'referral':
        await marketingAutomation.createReferralCampaign()
        result = { message: 'Referral campaign created successfully' }
        break

      case 'milestone':
        await marketingAutomation.createMilestoneCampaigns()
        result = { message: 'Milestone campaigns created successfully' }
        break

      case 'all':
        if (immediate) {
          await marketingAutomation.runAutomatedCampaigns()
        } else {
          await cronJobs.runMarketingCampaigns()
        }
        result = { message: 'All marketing campaigns executed successfully' }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid campaign type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Marketing campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to execute marketing campaign' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Return campaign analytics or status
    const data = {
      availableCampaigns: [
        { type: 'welcome_series', name: 'Welcome Series', description: 'Send welcome emails to new users' },
        { type: 're_engagement', name: 'Re-engagement', description: 'Re-engage inactive users' },
        { type: 'educational', name: 'Educational Series', description: 'Send educational content' },
        { type: 'referral', name: 'Referral Campaign', description: 'Encourage referrals' },
        { type: 'milestone', name: 'Milestone Campaigns', description: 'Celebrate user milestones' }
      ],
      status: 'active',
      lastRun: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Marketing status error:', error)
    return NextResponse.json(
      { error: 'Failed to get marketing status' },
      { status: 500 }
    )
  }
}