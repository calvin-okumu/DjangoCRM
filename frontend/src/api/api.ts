const API_BASE = "http://127.0.0.1:8000/api";

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  message: string;
}

export interface SignupResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  message: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function signup(
  username: string,
  email: string,
  password1: string,
  password2: string,
): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE}/signup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password1, password2 }),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = "Signup failed";
    if (typeof data === "object" && data !== null) {
      if (data.error) {
        errorMessage = data.error;
      } else {
        // Handle DRF field errors
        const errors = Object.values(data).flat() as string[];
        errorMessage = errors.join(" ");
      }
    }
    throw new Error(errorMessage);
  }

  return data;
}

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
