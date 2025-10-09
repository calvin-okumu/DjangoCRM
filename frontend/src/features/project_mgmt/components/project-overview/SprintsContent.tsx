"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Clock, Edit, Kanban, Plus, Trash2 } from "lucide-react";
import Button from "@/features/shared/components/ui/Button";
import Pagination from "@/components/shared/Pagination";
import type { Sprint } from "@/api";

interface SprintsContentProps {
    sprints: Sprint[];
    projectId: number;
    loading: boolean;
    onAddSprint: () => void;
    onEditSprint: (sprint: Sprint) => void;
    onDeleteSprint: (sprintId: number) => void;
    sprintPage: number;
    totalSprintPages: number;
    onSprintPageChange: (page: number) => void;
    itemsPerPage: number;
}

const SprintsContent: React.FC<SprintsContentProps> = ({
    sprints,
    projectId,
    loading,
    onAddSprint,
    onEditSprint,
    onDeleteSprint,
    sprintPage,
    totalSprintPages,
    onSprintPageChange,
    itemsPerPage,
}) => {
    const router = useRouter();

    const paginatedSprints = sprints.slice(
        (sprintPage - 1) * itemsPerPage,
        sprintPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sprints</h2>
                <Button onClick={onAddSprint} disabled={loading}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Sprint
                </Button>
            </div>

            {sprints.length > 0 ? (
                <div className="space-y-4">
                    {paginatedSprints.map(sprint => (
                        <div key={sprint.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            {/* Sprint Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{sprint.name}</h3>
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    sprint.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : sprint.status === "active"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : sprint.status === "planning"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {sprint.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Milestone: {sprint.milestone_name || "None"}</p>
                                            <p>Duration: {sprint.start_date && sprint.end_date
                                                ? `${new Date(sprint.start_date).toLocaleDateString()} - ${new Date(sprint.end_date).toLocaleDateString()}`
                                                : "No dates set"}</p>
                                            <p>Tasks: {sprint.tasks_count} | Progress: {sprint.progress}%</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                            onClick={() => router.push(`/dashboard/project_mgmt/project/${projectId}/sprint/${sprint.id}`)}
                                        >
                                            <Kanban className="h-4 w-4 mr-1" />
                                            Open Kanban
                                        </Button>
                                         <button
                                             className="text-blue-600 hover:text-blue-800 p-2"
                                             onClick={() => onEditSprint(sprint)}
                                         >
                                             <Edit className="h-5 w-5" />
                                         </button>
                                         <button
                                             className="text-red-600 hover:text-red-800 p-2"
                                             onClick={() => onDeleteSprint(sprint.id)}
                                         >
                                             <Trash2 className="h-5 w-5" />
                                         </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Pagination
                        currentPage={sprintPage}
                        totalPages={totalSprintPages}
                        onPageChange={onSprintPageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={sprints.length}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-lg shadow">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints yet</h3>
                    <p className="text-gray-600 mb-6">Create your first sprint to start organizing tasks.</p>
                    <Button onClick={onAddSprint} disabled={loading}>
                        <Plus className="h-5 w-5 mr-2" />
                        Create Sprint
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SprintsContent;