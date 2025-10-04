import { Project } from './types';
import { API_BASE } from './index';

export async function getProjects(token: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch projects");
  }

  return data;
}

export async function getProject(token: string, id: number): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch project");
  }

  return data;
}

export async function createProject(token: string, projectData: {
  name: string;
  client: number;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget?: string;
  tags?: string;
  team_members?: number[];
  access_groups?: number[];
}): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });

  console.log('Response status:', response.status, response.statusText);

  const data = await response.json();

  if (!response.ok) {
    console.error('Create project failed:', data);
    throw new Error(data.error || `Failed to create project: ${response.status} ${response.statusText}`);
  }

  return data;
}