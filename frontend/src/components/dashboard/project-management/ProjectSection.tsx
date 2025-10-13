"use client";

import React from 'react';
import ProjectTable from '@/components/dashboard/project-management/table/ProjectTable';
import { useProjects } from '@/hooks/useProjects';

interface ProjectSectionProps {
    title?: string;
}

export default function ProjectSection({ title = "Projects" }: ProjectSectionProps) {
    const { projects, loading, error, addProject, editProject, removeProject } = useProjects();

    return (
        <ProjectTable
            projects={projects}
            loading={loading}
            error={error}
            onAddProject={addProject}
            onEditProject={editProject}
            onDeleteProject={removeProject}
        />
    );
}
