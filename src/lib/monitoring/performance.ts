// Performance monitoring utilities
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  errorRate: number;
  activeUsers: number;
  conversionRate: number;
}

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static startTime: number = Date.now();

  // Track API response time
  static trackApiResponse(endpoint: string, responseTime: number) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    this.metrics.get(endpoint)!.push(responseTime);
    
    // Keep only last 100 measurements
    const measurements = this.metrics.get(endpoint)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  // Track page load time
  static trackPageLoad(pageName: string, loadTime: number) {
    const key = `page_${pageName}`;
    this.trackApiResponse(key, loadTime);
  }

  // Get average response time for an endpoint
  static getAverageResponseTime(endpoint: string): number {
    const measurements = this.metrics.get(endpoint);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, val) => acc + val, 0);
    return sum / measurements.length;
  }

  // Get performance summary
  static getPerformanceSummary(): PerformanceMetrics {
    const apiMetrics = this.getAverageResponseTime('api_overall');
    const pageMetrics = this.getAverageResponseTime('page_overall');
    
    return {
      pageLoadTime: pageMetrics,
      apiResponseTime: apiMetrics,
      memoryUsage: this.getMemoryUsage(),
      errorRate: this.getErrorRate(),
      activeUsers: this.getActiveUsers(),
      conversionRate: this.getConversionRate()
    };
  }

  // Get memory usage (simplified)
  private static getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const memory = (performance as any).memory;
      if (memory) {
        return memory.usedJSHeapSize / 1024 / 1024; // MB
      }
    }
    return 0;
  }

  // Get error rate (mock implementation)
  private static getErrorRate(): number {
    // In a real implementation, this would track actual errors
    return Math.random() * 5; // 0-5% error rate
  }

  // Get active users (mock implementation)
  private static getActiveUsers(): number {
    // In a real implementation, this would come from analytics
    return Math.floor(Math.random() * 1000) + 100;
  }

  // Get conversion rate (mock implementation)
  private static getConversionRate(): number {
    // In a real implementation, this would track actual conversions
    return Math.random() * 20 + 5; // 5-25% conversion rate
  }

  // Log performance data
  static logPerformance() {
    const summary = this.getPerformanceSummary();
    console.log('Performance Summary:', {
      ...summary,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString()
    });
  }

  // Check if performance is within acceptable limits
  static isPerformanceHealthy(): boolean {
    const summary = this.getPerformanceSummary();
    
    return (
      summary.pageLoadTime < 3000 && // Page load under 3 seconds
      summary.apiResponseTime < 1000 && // API response under 1 second
      summary.memoryUsage < 100 && // Memory usage under 100MB
      summary.errorRate < 5 // Error rate under 5%
    );
  }

  // Get performance grade
  static getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const summary = this.getPerformanceSummary();
    
    let score = 0;
    if (summary.pageLoadTime < 1000) score += 25;
    else if (summary.pageLoadTime < 3000) score += 15;
    
    if (summary.apiResponseTime < 500) score += 25;
    else if (summary.apiResponseTime < 1000) score += 15;
    
    if (summary.memoryUsage < 50) score += 25;
    else if (summary.memoryUsage < 100) score += 15;
    
    if (summary.errorRate < 1) score += 25;
    else if (summary.errorRate < 5) score += 15;
    
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
}

// API wrapper to track response times
export function withPerformanceTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpointName: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const responseTime = Date.now() - startTime;
      
      PerformanceMonitor.trackApiResponse(endpointName, responseTime);
      PerformanceMonitor.trackApiResponse('api_overall', responseTime);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      PerformanceMonitor.trackApiResponse(`${endpointName}_error`, responseTime);
      
      throw error;
    }
  };
}

// Hook for tracking page performance
export function usePagePerformance(pageName: string) {
  if (typeof window !== 'undefined') {
    const startTime = Date.now();
    
    const trackLoad = () => {
      const loadTime = Date.now() - startTime;
      PerformanceMonitor.trackPageLoad(pageName, loadTime);
      PerformanceMonitor.trackPageLoad('page_overall', loadTime);
    };
    
    // Track when page loads
    if (document.readyState === 'complete') {
      trackLoad();
    } else {
      window.addEventListener('load', trackLoad);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('load', trackLoad);
    };
  }
}