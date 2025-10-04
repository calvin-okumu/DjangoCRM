// Export types
export type { LoginResponse, SignupResponse, Client, UserTenant } from './types';

// Export auth functions
export { login, signup } from './auth';

// Export CRM functions
export { getClients, createClient, updateClient, deleteClient, getUserTenants } from './crm';

// Export Project Management functions
export { getProjects, getProject, createProject } from './project_mgmt';

// Export API base URL
export const API_BASE = "http://127.0.0.1:8000/api";