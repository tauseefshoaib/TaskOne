import { apiClient } from './apiClient';
import type { User } from '../types';

export async function fetchUsers(page: number, limit = 5): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users', {
    params: {
      _page: page,
      _limit: limit,
    },
  });

  return response.data;
}
