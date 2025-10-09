"use client";

import React from "react";
import { Edit, Plus, Target, Trash2 } from "lucide-react";
import Button from "@/features/shared/components/ui/Button";
import Pagination from "@/components/shared/Pagination";
import type { Milestone, User } from "@/api";

interface MilestonesContentProps {
    milestones: Milestone[];
    allUsers: User[];
    loading: boolean;
    onAddMilestone: () => void;
    onEditMilestone: (milestone: Milestone) => void;
    onDeleteMilestone: (milestoneId: number) => void;
    milestonePage: number;
    totalMilestonePages: number;
    onMilestonePageChange: (page: number) => void;
    itemsPerPage: number;
}

const MilestonesContent: React.FC<MilestonesContentProps> = ({
    milestones,
    allUsers,
    loading,
    onAddMilestone,
    onEditMilestone,
    onDeleteMilestone,
    milestonePage,
    totalMilestonePages,
    onMilestonePageChange,
    itemsPerPage,
}) => {
    const paginatedMilestones = milestones.slice(
        (milestonePage - 1) * itemsPerPage,
        milestonePage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Milestones</h2>
                <Button onClick={onAddMilestone} disabled={loading}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Milestone
                </Button>
            </div>

            {milestones.length > 0 ? (
                <>
                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    {["Name", "Description", "Status", "Assignee", "Planned Start", "Due Date", "Progress", "Created", "Actions"].map(h => (
                                        <th key={h} className="px-6 py-3 text-left font-medium">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {paginatedMilestones.map(milestone => {
                                    const assigneeUser = allUsers.find(u => u.id === milestone.assignee);
                                    return (
                                        <tr key={milestone.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{milestone.name}</td>
                                            <td className="px-6 py-4 max-w-xs truncate">{milestone.description || "-"}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        milestone.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : milestone.status === "active"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : milestone.status === "planning"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {milestone.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assigneeUser ? `${assigneeUser.first_name} ${assigneeUser.last_name}` : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {milestone.planned_start ? new Date(milestone.planned_start).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="px-6 py-4">{milestone.progress}%</td>
                                            <td className="px-6 py-4">{new Date(milestone.created_at).toLocaleDateString()}</td>
                                             <td className="px-6 py-4">
                                                 <div className="flex gap-2">
                                                     <button
                                                         onClick={() => onEditMilestone(milestone)}
                                                         className="text-blue-600 hover:text-blue-800"
                                                     >
                                                         <Edit className="h-5 w-5" />
                                                     </button>
                                                     <button
                                                         onClick={() => onDeleteMilestone(milestone.id)}
                                                         className="text-red-600 hover:text-red-800"
                                                     >
                                                         <Trash2 className="h-5 w-5" />
                                                     </button>
                                                 </div>
                                             </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={milestonePage}
                        totalPages={totalMilestonePages}
                        onPageChange={onMilestonePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={milestones.length}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-lg shadow">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
                    <p className="text-gray-600 mb-6">Create your first milestone to start tracking project progress.</p>
                    <Button onClick={onAddMilestone} disabled={loading}>
                        <Plus className="h-5 w-5 mr-2" />
                        Create Milestone
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MilestonesContent;