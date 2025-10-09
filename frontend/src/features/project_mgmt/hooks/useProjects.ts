"use client";

import { useEffect, useState } from "react";
import { getProjects, createProject } from "@/api";
import type { Project } from "@/api/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const fetchProjects = async () => {
    if (!token) {
      setError("Authentication token not found.");
      return;
    }
    setLoading(true);
    try {
      const data = await getProjects(token);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData: {
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
    if (!token) return;
    try {
      const newProject = await createProject(token, projectData);
      setProjects((prev) => [...prev, newProject]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };





  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    addProject,
    refetch: fetchProjects,
  };
}
