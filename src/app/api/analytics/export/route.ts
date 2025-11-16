import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để xuất dữ liệu' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const period = searchParams.get('period') || '6m'
    const type = searchParams.get('type') || 'full'

    // Get user's data
    const user = await db.users.findUnique({
      where: { id: session.user.id },
      include: {
        payouts: {
          where: { status: 'PROCESSED' },
          orderBy: { createdAt: 'asc' }
        },
        referredUsers: {
          include: {
            payouts: {
              where: { status: 'PROCESSED' }
            }
          }
        },
        user_achievements: {
          include: {
            achievements: true
          }
        },
        user_activities: {
          orderBy: { createdAt: 'desc' },
          take: 200
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng' } },
        { status: 404 }
      )
    }

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(0)
    }

    // Filter data by period
    const filteredPayouts = user.payouts.filter(payout => 
      new Date(payout.createdAt) >= startDate
    )

    const filteredReferrals = user.referredUsers.filter(referral => 
      new Date(referral.createdAt) >= startDate
    )

    const filteredActivities = user.user_activities.filter(activity => 
      new Date(activity.createdAt) >= startDate
    )

    let content = ''
    let contentType = ''
    let filename = ''

    if (format === 'csv') {
      content = generateCSV(user, filteredPayouts, filteredReferrals, filteredActivities, type)
      contentType = 'text/csv'
      filename = `apexrebate-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
    } else if (format === 'json') {
      content = generateJSON(user, filteredPayouts, filteredReferrals, filteredActivities, type)
      contentType = 'application/json'
      filename = `apexrebate-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`
    } else if (format === 'pdf') {
      // For PDF, we'll return a placeholder since PDF generation requires additional libraries
      content = generatePDFReport(user, filteredPayouts, filteredReferrals, type)
      contentType = 'application/pdf'
      filename = `apexrebate-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FORMAT', message: 'Định dạng không được hỗ trợ' } },
        { status: 400 }
      )
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi server nội bộ' } },
      { status: 500 }
    )
  }
}

function generateCSV(user: any, payouts: any[], referrals: any[], activities: any[], type: string): string {
  let csv = ''

  if (type === 'full' || type === 'payouts') {
    csv += '=== BÁO CÁO HOÀN PHÍ ===\n'
    csv += 'Ngày,Sàn giao dịch,Khối lượng,Hoàn phí,Trạng thái\n'
    payouts.forEach(payout => {
      csv += `${payout.createdAt},${payout.broker},${payout.tradingVolume},${payout.amount},${payout.status}\n`
    })
    csv += '\n'
  }

  if (type === 'full' || type === 'referrals') {
    csv += '=== BÁO CÁO GIỚI THIỆU ===\n'
    csv += 'Người được giới thiệu,Email,Ngày tham gia,Tổng hoàn phí,Số lần hoàn phí\n'
    referrals.forEach(referral => {
      const totalPayouts = referral.payouts.reduce((sum: number, p: any) => sum + p.amount, 0)
      csv += `"${referral.name || 'Anonymous'}","${referral.email}","${referral.createdAt}",${totalPayouts},${referral.payouts.length}\n`
    })
    csv += '\n'
  }

  if (type === 'full' || type === 'achievements') {
    csv += '=== BÁO CÁO THÀNH TỰCH ===\n'
    csv += 'Thành tựh,Loại,Điểm,Ngày mở khóa\n'
    user.user_achievements.forEach((ua: any) => {
      csv += `"${ua.achievements.title}","${ua.achievements.category}",${ua.achievements.points},"${ua.unlockedAt}"\n`
    })
    csv += '\n'
  }

  if (type === 'full' || type === 'summary') {
    csv += '=== TÓM TẮT HIỆU SUẤT ===\n'
    csv += 'Chỉ số,Giá trị\n'
    csv += `Tổng hoàn phí,${payouts.reduce((sum, p) => sum + p.amount, 0)}\n`
    csv += `Khối lượng giao dịch,${payouts.reduce((sum, p) => sum + (p.tradingVolume || 0), 0)}\n`
    csv += `Số người giới thiệu,${referrals.length}\n`
    csv += `Số thành tựh,${user.user_achievements.length}\n`
    csv += `Điểm hiện tại,${user.points}\n`
    csv += `Hạng hiện tại,${user.tier}\n`
    csv += `Chuỗi hoạt động,${user.streak}\n`
    csv += '\n'
  }

  return csv
}

function generateJSON(user: any, payouts: any[], referrals: any[], activities: any[], type: string): string {
  const report: any = {
    generatedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      points: user.points,
      streak: user.streak,
      totalSaved: user.totalSaved,
      referralCount: user.referralCount
    }
  }

  if (type === 'full' || type === 'payouts') {
    report.payouts = payouts.map(payout => ({
      date: payout.createdAt,
      broker: payout.broker,
      tradingVolume: payout.tradingVolume,
      amount: payout.amount,
      status: payout.status,
      feeRate: payout.feeRate
    }))
  }

  if (type === 'full' || type === 'referrals') {
    report.referrals = referrals.map(referral => ({
      name: referral.name,
      email: referral.email,
      joinedAt: referral.createdAt,
      totalPayouts: referral.payouts.reduce((sum: number, p: any) => sum + p.amount, 0),
      payoutCount: referral.payouts.length
    }))
  }

  if (type === 'full' || type === 'achievements') {
    report.achievements = user.user_achievements.map((ua: any) => ({
      title: ua.achievements.title,
      category: ua.achievements.category,
      points: ua.achievements.points,
      unlockedAt: ua.unlockedAt,
      progress: ua.progress
    }))
  }

  if (type === 'full' || type === 'summary') {
    report.summary = {
      totalPayouts: payouts.reduce((sum, p) => sum + p.amount, 0),
      totalTradingVolume: payouts.reduce((sum, p) => sum + (p.tradingVolume || 0), 0),
      totalReferrals: referrals.length,
      totalAchievements: user.user_achievements.length,
      averagePayout: payouts.length > 0 ? payouts.reduce((sum, p) => sum + p.amount, 0) / payouts.length : 0,
      bestBroker: getBestBroker(payouts),
      growthRate: calculateGrowthRate(payouts)
    }
  }

  return JSON.stringify(report, null, 2)
}

function generatePDFReport(user: any, payouts: any[], referrals: any[], type: string): string {
  // This is a placeholder for PDF generation
  // In a real implementation, you would use a library like jsPDF or Puppeteer
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ApexRebate Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ApexRebate Analytics Report</h1>
        <p>Generated for: ${user.email}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Summary</h2>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Payouts</td><td>$${payouts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</td></tr>
          <tr><td>Total Referrals</td><td>${referrals.length}</td></tr>
          <tr><td>Current Tier</td><td>${user.tier}</td></tr>
          <tr><td>Total Points</td><td>${user.points}</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2>Recent Payouts</h2>
        <table>
          <tr><th>Date</th><th>Broker</th><th>Amount</th></tr>
          ${payouts.slice(-10).map(p => 
            `<tr><td>${new Date(p.createdAt).toLocaleDateString()}</td><td>${p.broker}</td><td>$${p.amount.toFixed(2)}</td></tr>`
          ).join('')}
        </table>
      </div>
    </body>
    </html>
  `
  
  return html
}

function getBestBroker(payouts: any[]): string {
  const brokerStats = payouts.reduce((acc, payout) => {
    if (!acc[payout.broker]) acc[payout.broker] = 0
    acc[payout.broker] += payout.amount
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(brokerStats).reduce((best, [broker, amount]) => 
    (amount as number) > best.amount ? { broker, amount: amount as number } : best, 
    { broker: 'N/A', amount: 0 }
  ).broker
}

function calculateGrowthRate(payouts: any[]): number {
  if (payouts.length < 2) return 0
  
  const sortedPayouts = payouts.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  
  const firstHalf = sortedPayouts.slice(0, Math.floor(sortedPayouts.length / 2))
  const secondHalf = sortedPayouts.slice(Math.floor(sortedPayouts.length / 2))
  
  const firstTotal = firstHalf.reduce((sum, p) => sum + p.amount, 0)
  const secondTotal = secondHalf.reduce((sum, p) => sum + p.amount, 0)
  
  return firstTotal > 0 ? Math.round(((secondTotal - firstTotal) / firstTotal) * 100) : 0
}
