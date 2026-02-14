import { apiClient } from './apiClient';
import { toApiRequestError } from './apiError';
import type { User } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;

export type FetchUsersParams = {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
};

export type UsersPageResult = {
  users: User[];
  page: number;
  limit: number;
  hasMore: boolean;
};

export async function fetchUsers(
  params: FetchUsersParams = {},
): Promise<UsersPageResult> {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, signal } = params;

  try {
    const response = await apiClient.get<User[]>('/users', {
      params: {
        page,limit
      },
      signal,
    });

    return {
      users: response.data,
      page,
      limit,
      hasMore: response.data.length === limit,
    };
  } catch (error) {
    throw toApiRequestError(error, 'Failed to fetch users');
  }
}

export async function fetchUserById(
  userId: number,
  signal?: AbortSignal,
): Promise<User> {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`, { signal });
    return response.data;
  } catch (error) {
    throw toApiRequestError(error, 'Failed to fetch user details');
  }
}
