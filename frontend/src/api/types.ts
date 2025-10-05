export interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  message: string;
}

export interface SignupResponse {
  token: string;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  tenant: string;
  message: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  tenant: number;
  tenant_name: string;
  projects_count: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  status: string;
  tenant: number;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  tenant?: number;
}

export interface UserTenant {
  id: number;
  user: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  tenant: number;
  tenant_name: string;
  is_owner: boolean;
  is_approved: boolean;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  client: number;
  client_name: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget?: string;
  description?: string;
  tags?: string;
  team_members: number[];
  access_groups: number[];
  progress: number;
  milestones_count: number;
  created_at: string;
  updated_at: string;
}