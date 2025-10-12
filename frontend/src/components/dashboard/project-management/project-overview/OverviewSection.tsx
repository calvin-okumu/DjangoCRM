import React from 'react';
import ProjectProgress from './ProjectProgress';
import MetricsGrid from './MetricsGrid';
import ProjectTimeline from './ProjectTimeline';
import ProjectHealth from './ProjectHealth';
import ProjectInformation from './ProjectInformation';
import type { Project } from '@/api/types';

interface OverviewSectionProps {
    project: Project;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function OverviewSection({ project, activeTab, onTabChange }: OverviewSectionProps) {
    return (
        <div className="space-y-6">
            <MetricsGrid
                milestonesCount={project.milestones_count}
                tasksCount={0} // Placeholder
                sprintsCount={0} // Placeholder
                teamMembersCount={project.team_members.length}
                onTabChange={onTabChange}
            />
            <ProjectProgress progress={project.progress} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProjectTimeline milestonesCount={project.milestones_count} />
                <ProjectInformation project={project} />
            </div>
            <ProjectHealth project={project} />
        </div>
    );
}
