
import axiosInstance from './axiosInstance';
import { Token } from '../types';

const API_ENDPOINT = '/tokens';

export interface CreateTokenPayload {
  name: string;
  token: string;
}

export interface UpdateTokenPayload {
  name: string;
  token: string;
}

export const tokenService = {
  getAll: async () => 
    await axiosInstance.get<Token[]>(API_ENDPOINT).then((response) => response.data),

  create: async (data: CreateTokenPayload) => 
    await axiosInstance.post<Token>(API_ENDPOINT, data).then((response) => response.data),

  update: async (id: number | string, data: UpdateTokenPayload) => 
    await axiosInstance.put<Token>(`${API_ENDPOINT}/${id}`, data).then((response) => response.data),

  delete: async (id: number | string) => 
    await axiosInstance.delete<void>(`${API_ENDPOINT}/${id}`).then((response) => response.data),
};
