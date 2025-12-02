/**
 * Date utility functions
 */
export class DateHelper {
  /**
   * Get start and end of today
   */
  static getToday(): { start: Date; end: Date } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Get start and end of this week
   */
  static getThisWeek(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Get start and end of this month
   */
  static getThisMonth(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return { start, end };
  }

  /**
   * Get last N days
   */
  static getLastNDays(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  /**
   * Format date to ISO string
   */
  static toISOString(date: Date | string): string {
    return new Date(date).toISOString();
  }

  /**
   * Check if date is valid
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Parse date from string
   */
  static parseDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return this.isValidDate(date) ? date : null;
  }

  /**
   * Get date range from period string
   */
  static getDateRangeFromPeriod(
    period: 'today' | 'week' | 'month' | 'last30days' | 'last90days',
  ): { start: Date; end: Date } {
    switch (period) {
      case 'today':
        return this.getToday();
      case 'week':
        return this.getThisWeek();
      case 'month':
        return this.getThisMonth();
      case 'last30days':
        return this.getLastNDays(30);
      case 'last90days':
        return this.getLastNDays(90);
      default:
        return this.getLastNDays(30);
    }
  }
}
