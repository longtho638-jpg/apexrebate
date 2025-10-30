import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/lib/monitoring/performance';

export async function GET(request: NextRequest) {
  try {
    // Get performance metrics
    const summary = PerformanceMonitor.getPerformanceSummary();
    const grade = PerformanceMonitor.getPerformanceGrade();
    const isHealthy = PerformanceMonitor.isPerformanceHealthy();
    
    // Get detailed metrics for specific endpoints
    const detailedMetrics = {
      dashboard: PerformanceMonitor.getAverageResponseTime('dashboard'),
      calculator: PerformanceMonitor.getAverageResponseTime('calculator'),
      wallOfFame: PerformanceMonitor.getAverageResponseTime('wall-of-fame'),
      apexPro: PerformanceMonitor.getAverageResponseTime('apex-pro'),
      hangSoi: PerformanceMonitor.getAverageResponseTime('hang-soi')
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      grade,
      isHealthy,
      detailedMetrics,
      recommendations: getRecommendations(summary, grade)
    });

  } catch (error) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

function getRecommendations(summary: any, grade: string): string[] {
  const recommendations: string[] = [];
  
  if (summary.pageLoadTime > 2000) {
    recommendations.push('Consider optimizing images and lazy loading to improve page load time');
  }
  
  if (summary.apiResponseTime > 800) {
    recommendations.push('API response times are slow, consider implementing caching');
  }
  
  if (summary.memoryUsage > 80) {
    recommendations.push('Memory usage is high, consider optimizing component re-renders');
  }
  
  if (summary.errorRate > 3) {
    recommendations.push('Error rate is elevated, review error logs and implement better error handling');
  }
  
  if (grade === 'C' || grade === 'D' || grade === 'F') {
    recommendations.push('Overall performance needs improvement - consider a performance audit');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance is optimal - continue monitoring');
  }
  
  return recommendations;
}