"use client";

import OverviewSection from '@/components/dashboard/project-management/project-overview/OverviewSection';
import { useProject } from '@/context/ProjectContext';

export default function ProjectPage() {
    const { project, activeTab, onTabChange } = useProject();

    if (!project) return null;

    return <OverviewSection project={project} activeTab={activeTab} onTabChange={onTabChange} />;
}