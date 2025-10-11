"use client";

import React, { useMemo, useState } from 'react';
import ProjectTable from './table/ProjectTable';
import Loading from '@/components/shared/loading';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/api/types';

interface ProjectSectionProps {
    title?: string;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ title = "Projects" }) => {
    const [page, setPage] = useState(1);
    const { projects, loading, error, addProject, editProject, removeProject } = useProjects();

    const itemsPerPage = 10;
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const visibleProjects = projects.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleNewProject = () => {
        // TODO: Open modal
        console.log("New project");
    };

    const handleEdit = (project: Project) => {
        // TODO: Open edit modal
        console.log("Edit project", project);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this project?")) {
            removeProject(id);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <ProjectTable
                projects={visibleProjects}
                currentPage={page}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onNewProject={handleNewProject}
            />
        </div>
    );
};

export default ProjectSection;