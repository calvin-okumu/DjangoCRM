"use client";

import React from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Project } from "@/api/types";
import Button from "@/components/ui/Button";
import Pagination from "@/components/shared/Pagination";

interface ProjectTableProps {
    projects: Project[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onEdit?: (project: Project) => void;
    onDelete?: (id: number) => void;
    onNewProject?: () => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
    projects,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onEdit,
    onDelete,
    onNewProject,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={onNewProject} variant="primary" size="md" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    + New Project
                </Button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                        {["Name", "Client", "Status", "Priority", "Start Date", "End Date", "Budget", "Progress", "Milestones", "Created", "Actions"].map(h => (
                            <th key={h} className="px-6 py-3 text-left font-medium">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                    {projects.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{p.name}</td>
                            <td className="px-6 py-4">{p.client_name}</td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        p.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : p.status === "completed"
                                            ? "bg-blue-100 text-blue-800"
                                            : p.status === "on-hold"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {p.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        p.priority === "high"
                                            ? "bg-red-100 text-red-800"
                                            : p.priority === "medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    {p.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4">{new Date(p.start_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{new Date(p.end_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{p.budget ? `$${p.budget}` : "-"}</td>
                            <td className="px-6 py-4">{p.progress}%</td>
                            <td className="px-6 py-4">{p.milestones_count}</td>
                            <td className="px-6 py-4">{new Date(p.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <Button onClick={() => onEdit(p)} variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button onClick={() => onDelete(p.id)} variant="danger" size="sm">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                totalItems={projects.length}
            />
        </div>
    );
};

export default ProjectTable;