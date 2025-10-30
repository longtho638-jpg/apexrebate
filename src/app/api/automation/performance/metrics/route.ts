import { NextRequest, NextResponse } from 'next/server';
import { stepByStepAutomation } from '@/lib/automation/step-by-step-automation';
import { errorRecoverySystem } from '@/lib/automation/error-recovery-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // 获取系统状态
    const systemStatus = await stepByStepAutomation.getSystemStatus();
    const recoveryStatus = await errorRecoverySystem.getRecoveryStatus();
    const errorStats = await errorRecoverySystem.getErrorStatistics();
    
    // 模拟性能指标
    const metrics = {
      timestamp: new Date(),
      systemHealth: {
        cpu: 45 + Math.random() * 30,
        memory: 60 + Math.random() * 20,
        disk: 35 + Math.random() * 25,
        network: 25 + Math.random() * 40
      },
      workflowMetrics: {
        total: systemStatus.performance.totalExecutions || 150,
        successful: Math.floor((systemStatus.performance.successRate || 85) / 100 * 150),
        failed: Math.floor((100 - (systemStatus.performance.successRate || 85)) / 100 * 150),
        running: systemStatus.executions.running || 3,
        averageDuration: systemStatus.performance.averageExecutionTime || 120
      },
      errorMetrics: {
        total: errorStats.total || 25,
        critical: errorStats.bySeverity?.critical || 2,
        high: errorStats.bySeverity?.high || 5,
        medium: errorStats.bySeverity?.medium || 10,
        low: errorStats.bySeverity?.low || 8,
        autoResolved: errorStats.autoResolved || 18
      },
      recoveryMetrics: {
        active: recoveryStatus.active.count || 2,
        success: recoveryStatus.recent.success || 45,
        failed: recoveryStatus.recent.failed || 5,
        averageTime: recoveryStatus.recent.averageDuration || 180
      }
    };
    
    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}