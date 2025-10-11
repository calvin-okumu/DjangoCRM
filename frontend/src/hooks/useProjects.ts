import { useCallback, useEffect, useState } from "react";
import { Project } from "../api/types";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
} from "../api/project_mgmt";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await getProjects(token);
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (data: {
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
  }) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      await createProject(token, data);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  const editProject = async (id: number, data: Partial<{
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
  }>) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      await updateProject(token, id, data);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (id: number) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      await deleteProject(token, id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    editProject,
    removeProject,
    refetch: fetchProjects,
    setError,
  };
}