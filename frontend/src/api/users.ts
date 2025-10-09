import { User, UserTenant } from './types';
import { API_BASE } from './index';

export async function getUsers(token: string): Promise<User[]> {
  const url = `${API_BASE}/members/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  let data: UserTenant[];
  try {
    data = await response.json();
  } catch {
    throw new Error(`Members endpoint not available at ${url}: ${response.status} ${response.statusText}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch members from ${url}: ${response.status} ${response.statusText}`);
  }

  // Transform UserTenant[] to User[]
  return data.map((ut: UserTenant) => ({
    id: ut.user,
    email: ut.user_email,
    first_name: ut.user_first_name,
    last_name: ut.user_last_name,
    is_active: true, // Assume active since they're members
    date_joined: '', // Not available in UserTenant
  }));
}

export async function getUser(token: string, id: number): Promise<User> {
  // Since backend doesn't have /users/{id}, fetch all members and find the one
  const users = await getUsers(token);
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  return user;
}