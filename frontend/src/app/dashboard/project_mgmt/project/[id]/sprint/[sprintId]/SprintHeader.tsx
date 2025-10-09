
"use client";

import type { Project, Sprint } from "@/api";
import Button from "@/features/shared/components/ui/Button";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

interface SprintHeaderProps {
    project: Project;
    sprint: Sprint;
    onAddTask: () => void;
}

const SprintHeader: React.FC<SprintHeaderProps> = ({ project, sprint, onAddTask }) => {
    const router = useRouter();

    // --- derived state ---
    const sprintDates = useMemo(() => {
        if (!sprint.start_date || !sprint.end_date) return "No dates set";
        const start = new Date(sprint.start_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
        const end = new Date(sprint.end_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
        return `${start} - ${end}`;
    }, [sprint.start_date, sprint.end_date]);

    const handleBack = () =>
        router.push(`/dashboard/project_mgmt/project/${project.id}`);

    // --- render ---
    return (
        <header className="bg-blue-600 text-white shadow-md px-8 py-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    <Button
                        aria-label="Back to project sprints"
                        onClick={handleBack}
                        className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    {/* Header Info */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {sprint.name} <span className="text-blue-200">– Kanban Board</span>
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {project.name} • {sprintDates}
                        </p>
                    </div>
                </div>

                {/* Add Task Button */}
                <Button
                    onClick={onAddTask}
                    className="bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Task
                </Button>
            </div>
        </header>
    );
};

export default SprintHeader;
