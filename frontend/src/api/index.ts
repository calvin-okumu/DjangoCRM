// Export types
export type { LoginResponse, SignupResponse, Client, CreateClientData, UpdateClientData, UserTenant, Project } from './types';

// Export auth functions
export { login, signup } from './auth';

// Export CRM functions
export { getClients, createClient, updateClient, deleteClient, getUserTenants } from './crm';

// Export Project Management functions
export { getProjects, getProject, createProject } from './project_mgmt';

// Export API base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";