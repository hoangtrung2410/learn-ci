export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  email: string;
}

export interface PaginationDto {
  search?: string;
  limit?: number;
  offset?: number;
}
