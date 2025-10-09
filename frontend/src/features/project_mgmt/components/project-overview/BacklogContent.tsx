"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import type { Task, User } from "@/api";

interface BacklogContentProps {
    tasks: Task[];
    allUsers: User[];
    taskPage: number;
    totalTaskPages: number;
    onTaskPageChange: (page: number) => void;
    itemsPerPage: number;
}

const BacklogContent: React.FC<BacklogContentProps> = ({
    tasks,
    allUsers,
    taskPage,
    totalTaskPages,
    onTaskPageChange,
    itemsPerPage,
}) => {
    const paginatedTasks = tasks.slice(
        (taskPage - 1) * itemsPerPage,
        taskPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Backlog</h2>
                <p className="text-sm text-gray-600">Tasks are managed from sprint Kanban boards</p>
            </div>

            {tasks.length > 0 ? (
                <>
                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    {["Title", "Milestone", "Sprint", "Status", "Assignee", "Priority", "Created"].map(h => (
                                        <th key={h} className="px-6 py-3 text-left font-medium">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {paginatedTasks.map(task => {
                                    const taskAssignee = allUsers.find(u => u.id === task.assignee);
                                    return (
                                        <tr key={task.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{task.title}</td>
                                            <td className="px-6 py-4">{task.milestone_name}</td>
                                            <td className="px-6 py-4">{task.sprint_name || "-"}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        task.status === "done"
                                                            ? "bg-green-100 text-green-800"
                                                            : task.status === "in_progress"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : task.status === "in_review"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {task.status === "todo" ? "To Do" :
                                                     task.status === "in_progress" ? "In Progress" :
                                                     task.status === "in_review" ? "In Review" : "Done"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{taskAssignee ? `${taskAssignee.first_name} ${taskAssignee.last_name}` : "-"}</td>
                                            <td className="px-6 py-4">{task.priority}</td>
                                            <td className="px-6 py-4">{new Date(task.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={taskPage}
                        totalPages={totalTaskPages}
                        onPageChange={onTaskPageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={tasks.length}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-lg shadow">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-600 mb-6">Tasks are created within sprint Kanban boards.</p>
                </div>
            )}
        </div>
    );
};

export default BacklogContent;