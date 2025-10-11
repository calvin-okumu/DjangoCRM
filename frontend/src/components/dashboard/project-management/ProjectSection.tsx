"use client";

import React from 'react';
import ProjectTable from '@/components/dashboard/project-management/table/ProjectTable';

interface ProjectSectionProps {
    title?: string;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ title = "Projects" }) => {
    return <ProjectTable />;
};

export default ProjectSection;
