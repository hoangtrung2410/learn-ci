/**
 * Metrics calculation utilities
 */
export class MetricsHelper {
  /**
   * Calculate average from an array of numbers
   */
  static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(2));
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Number(((part / total) * 100).toFixed(2));
  }

  /**
   * Calculate improvement percentage
   */
  static calculateImprovement(baseline: number, target: number): number {
    if (baseline === 0) return 0;
    return Number((((baseline - target) / baseline) * 100).toFixed(2));
  }

  /**
   * Calculate median
   */
  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Convert seconds to human readable format
   */
  static formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get time range for last N days
   */
  static getLastNDays(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
  }

  /**
   * Group data by date
   */
  static groupByDate<T extends { createdAt: Date }>(
    data: T[],
    format: 'day' | 'week' | 'month' = 'day',
  ): Map<string, T[]> {
    const grouped = new Map<string, T[]>();

    data.forEach((item) => {
      let key: string;
      const date = new Date(item.createdAt);

      switch (format) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    return grouped;
  }
}
