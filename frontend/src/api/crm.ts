import { Client, UserTenant } from './types';
import { API_BASE } from './index';

export async function getClients(token: string): Promise<Client[]> {
  const response = await fetch(`${API_BASE}/clients/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch clients");
  }

  return data;
}

export async function createClient(token: string, clientData: { name: string; email: string; phone?: string; status: string; tenant: number }): Promise<Client> {
  const response = await fetch(`${API_BASE}/clients/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create client");
  }

  return data;
}

export async function updateClient(token: string, clientId: number, clientData: Partial<{ name: string; email: string; phone?: string; status: string; tenant: number }>): Promise<Client> {
  const response = await fetch(`${API_BASE}/clients/${clientId}/`, {
    method: "PUT",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update client");
  }

  return data;
}

export async function deleteClient(token: string, clientId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/clients/${clientId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete client");
  }
}

export async function getUserTenants(token: string): Promise<UserTenant[]> {
  const response = await fetch(`${API_BASE}/members/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user tenants");
  }

  return data;
}

