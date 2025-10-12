import { Project, Milestone, Sprint, Task } from './types';
import { API_BASE } from './index';

export async function getProjects(token: string, tenant?: number): Promise<Project[]> {
  const url = tenant ? `${API_BASE}/projects/?tenant=${tenant}` : `${API_BASE}/projects/`;
  const response = await fetch(url, {
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

export async function updateProject(token: string, id: number, projectData: Partial<{
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
}>): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}/`, {
    method: "PUT",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update project");
  }

  return data;
}

export async function deleteProject(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete project");
  }
}

// Milestone API functions
export async function getMilestones(token: string, projectId?: number, tenant?: number): Promise<Milestone[]> {
  let url = `${API_BASE}/milestones/`;
  const params = new URLSearchParams();
  if (projectId) params.append('project', projectId.toString());
  if (tenant) params.append('tenant', tenant.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch milestones");
  }

  return data;
}

export async function getMilestone(token: string, id: number): Promise<Milestone> {
  const response = await fetch(`${API_BASE}/milestones/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch milestone");
  }

  return data;
}

export async function createMilestone(token: string, milestoneData: {
  name: string;
  description?: string;
  status: string;
  progress: number;
  planned_start?: string;
  actual_start?: string;
  due_date?: string;
  assignee?: number;
  project: number;
  tenant: number;
}): Promise<Milestone> {
  const response = await fetch(`${API_BASE}/milestones/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(milestoneData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create milestone");
  }

  return data;
}

export async function updateMilestone(token: string, id: number, milestoneData: Partial<{
  name: string;
  description: string;
  status: string;
  progress: number;
  planned_start: string;
  actual_start: string;
  due_date: string;
  assignee: number;
  project: number;
}>): Promise<Milestone> {
  const response = await fetch(`${API_BASE}/milestones/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(milestoneData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update milestone");
  }

  return data;
}

export async function deleteMilestone(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/milestones/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete milestone");
  }
}

// Sprint API functions
export async function getSprints(token: string, projectId?: number): Promise<Sprint[]> {
  const url = projectId ? `${API_BASE}/sprints/?milestone__project=${projectId}` : `${API_BASE}/sprints/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch sprints");
  }

  return data;
}

export async function getSprint(token: string, id: number): Promise<Sprint> {
  const response = await fetch(`${API_BASE}/sprints/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch sprint");
  }

  return data;
}

export async function createSprint(token: string, sprintData: {
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  milestone: number;
}): Promise<Sprint> {
  const response = await fetch(`${API_BASE}/sprints/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sprintData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create sprint");
  }

  return data;
}

export async function updateSprint(token: string, id: number, sprintData: Partial<{
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  milestone: number;
}>): Promise<Sprint> {
  const response = await fetch(`${API_BASE}/sprints/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sprintData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update sprint");
  }

  return data;
}

export async function deleteSprint(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/sprints/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete sprint");
  }
}

// Sprint task management
export async function createTaskInSprint(token: string, sprintId: number, taskData: {
  title: string;
  description?: string;
  status: string;
  milestone: number;
  assignee?: number;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
}): Promise<Task> {
  const response = await fetch(`${API_BASE}/sprints/${sprintId}/create_task/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create task in sprint");
  }

  return data;
}

export async function assignTaskToSprint(token: string, sprintId: number, taskId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/sprints/${sprintId}/assign_task/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_id: taskId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to assign task to sprint");
  }

  return data;
}

export async function unassignTaskFromSprint(token: string, sprintId: number, taskId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/sprints/${sprintId}/unassign_task/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task_id: taskId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to unassign task from sprint");
  }

  return data;
}

// Task API functions
export async function getTasks(token: string, milestoneId?: number, sprintId?: number): Promise<Task[]> {
  let url = `${API_BASE}/tasks/`;
  const params = new URLSearchParams();

  if (milestoneId) params.append('milestone', milestoneId.toString());
  if (sprintId) params.append('sprint', sprintId.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch tasks");
  }

  return data;
}

export async function getTask(token: string, id: number): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch task");
  }

  return data;
}

export async function createTask(token: string, taskData: {
  title: string;
  description?: string;
  status: string;
  milestone: number;
  sprint?: number;
  assignee?: number;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
}): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create task");
  }

  return data;
}

export async function updateTask(token: string, id: number, taskData: Partial<{
  title: string;
  description: string;
  status: string;
  milestone: number;
  sprint: number;
  assignee: number;
  start_date: string;
  end_date: string;
  estimated_hours: number;
}>): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update task");
  }

  return data;
}

export async function deleteTask(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete task");
  }
}