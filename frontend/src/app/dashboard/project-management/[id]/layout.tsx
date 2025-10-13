"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectProvider } from '@/context/ProjectContext';
import ProjectLayout from '@/components/dashboard/project-management/ProjectLayout';
import { useProject } from '@/context/ProjectContext';
import Loader from '@/components/shared/Loader';

function ProjectLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { project, loading, error } = useProject();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (pathname.includes('/milestone')) {
            setActiveTab('milestones');
        } else if (pathname.includes('/sprint')) {
            setActiveTab('sprints');
        } else if (pathname.includes('/backlog')) {
            setActiveTab('backlog');
        } else {
            setActiveTab('overview');
        }
    }, [pathname]);

    if (loading) return <Loader />;
    if (error) return <div>{error}</div>;
    if (!project) return <div>Project not found</div>;

    return (
        <ProjectLayout
            project={project}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            projectId={project.id.toString()}
        >
            {children}
        </ProjectLayout>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProjectProvider>
            <ProjectLayoutWrapper>
                {children}
            </ProjectLayoutWrapper>
        </ProjectProvider>
    );
}