import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const trends = [
      {
        metric: '工作流成功率',
        current: 87.5,
        previous: 85.2,
        change: 2.3,
        trend: 'up'
      },
      {
        metric: '平均执行时间',
        current: 115,
        previous: 128,
        change: -10.2,
        trend: 'down'
      },
      {
        metric: '错误恢复率',
        current: 92.1,
        previous: 88.7,
        change: 3.4,
        trend: 'up'
      },
      {
        metric: '系统可用性',
        current: 99.8,
        previous: 99.5,
        change: 0.3,
        trend: 'stable'
      },
      {
        metric: '资源利用率',
        current: 68.4,
        previous: 72.1,
        change: -5.1,
        trend: 'down'
      },
      {
        metric: '自动化覆盖率',
        current: 94.2,
        previous: 91.8,
        change: 2.4,
        trend: 'up'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Failed to get performance trends:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}