import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const performers = [
      {
        name: '系统健康检查',
        value: 98.5,
        change: 2.1,
        status: 'excellent'
      },
      {
        name: '数据备份工作流',
        value: 95.2,
        change: 1.8,
        status: 'excellent'
      },
      {
        name: '性能优化任务',
        value: 91.7,
        change: -0.5,
        status: 'good'
      },
      {
        name: '安全扫描流程',
        value: 89.3,
        change: 3.2,
        status: 'good'
      },
      {
        name: '日志清理任务',
        value: 87.8,
        change: -1.2,
        status: 'good'
      },
      {
        name: '缓存刷新流程',
        value: 82.4,
        change: -2.8,
        status: 'warning'
      },
      {
        name: '报告生成任务',
        value: 78.9,
        change: -4.1,
        status: 'warning'
      },
      {
        name: '邮件通知服务',
        value: 65.3,
        change: -8.7,
        status: 'critical'
      },
      {
        name: '数据库维护',
        value: 58.7,
        change: -6.2,
        status: 'critical'
      },
      {
        name: 'API监控检查',
        value: 94.1,
        change: 1.5,
        status: 'excellent'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: performers
    });
  } catch (error) {
    console.error('Failed to get top performers:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}