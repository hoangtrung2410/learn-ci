/**
 * Base Query DTO for pagination and filtering
 * Can be extended by specific modules
 */
export interface BaseQueryDto {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Standard paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Date range filter
 */
export interface DateRangeDto {
  start_date?: Date | string;
  end_date?: Date | string;
}

/**
 * Time period enum
 */
export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}
