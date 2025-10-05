// Export types
export type { LoginResponse, SignupResponse, Client, UserTenant, Project, Milestone, Sprint, Task } from './types';

// Export auth functions
export { login, signup } from './auth';

// Export CRM functions
export { getClients, createClient, updateClient, deleteClient, getUserTenants } from './crm';

// Export Project Management functions
export {
  getProjects,
  getProject,
  createProject,
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  createTaskInSprint,
  assignTaskToSprint,
  unassignTaskFromSprint,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from './project_mgmt';

// Export API base URL
export const API_BASE = "http://127.0.0.1:8000/api";