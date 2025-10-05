
"use client";

import { Edit, Loader, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import Pagination from "@/components/shared/Pagination";

interface EmptyState {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
}

interface Project {
    id: number;
    name: string;
    client_name?: string;
    status: "planning" | "in_progress" | "completed" | string;
    priority: "low" | "medium" | "high" | string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    progress: number;
}

interface ProjectsSectionProps {
    title: string;
    addButtonText: string;
    onAdd: () => void;
    onEdit?: (project: Project) => void;
    onDelete?: (projectId: number) => void;
    searchPlaceholder: string;
    emptyState: EmptyState;
    projects?: Project[];
    loading?: boolean;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
    title,
    addButtonText,
    onAdd,
    onEdit,
    onDelete,
    searchPlaceholder,
    emptyState,
    projects = [],
    loading = false,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 10;

    // --- Derived Data ---
    const filteredProjects = useMemo(() => {
        if (!projects.length) return [];
        if (!searchTerm.trim()) return projects;

        return projects.filter(
            (p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Handlers ---
    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // --- Helper: Status Badge ---
    const getStatusBadge = (status: string) => {
        const base = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case "planning":
                return `${base} bg-blue-100 text-blue-800`;
            case "in_progress":
                return `${base} bg-yellow-100 text-yellow-800`;
            case "completed":
                return `${base} bg-green-100 text-green-800`;
            default:
                return `${base} bg-gray-100 text-gray-800`;
        }
    };

    // --- Helper: Priority Badge ---
    const getPriorityBadge = (priority: string) => {
        const base = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
        switch (priority) {
            case "low":
                return `${base} bg-green-100 text-green-800`;
            case "medium":
                return `${base} bg-yellow-100 text-yellow-800`;
            case "high":
                return `${base} bg-red-100 text-red-800`;
            default:
                return `${base} bg-purple-100 text-purple-800`;
        }
    };

    // --- Render Logic ---
    const EmptyStateView = () => (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
            <emptyState.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
            <p className="text-gray-600 mb-6">{emptyState.description}</p>
            <button
                onClick={onAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow duration-200"
            >
                {emptyState.buttonText}
            </button>
        </div>
    );

    const LoadingStateView = () => (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
            <Loader className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading projects...</h3>
            <p className="text-gray-600">Please wait while we fetch your projects.</p>
        </div>
    );

    const TableView = () => (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "Name",
                                "Client",
                                "Status",
                                "Priority",
                                "Start Date",
                                "End Date",
                                "Budget",
                                "Progress",
                                "Actions",
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedProjects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Link
                                        href={`/dashboard/project_mgmt/project/${project.id}`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        {project.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {project.client_name ?? "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getStatusBadge(project.status)}>
                                        {project.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getPriorityBadge(project.priority)}>
                                        {project.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.start_date
                                        ? new Date(project.start_date).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.end_date
                                        ? new Date(project.end_date).toLocaleDateString()
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.budget ? `$${project.budget.toLocaleString()}` : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.progress}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(project)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(project.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredProjects.length}
            />
        </div>
    );

    // --- Render ---
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <button
                    onClick={onAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                    <Plus className="h-5 w-5" />
                    {addButtonText}
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200"
                    />
                </div>
            </div>

            {loading ? (
                <LoadingStateView />
            ) : projects.length === 0 ? (
                <EmptyStateView />
            ) : filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                    No projects match “{searchTerm}”.
                </div>
            ) : (
                <TableView />
            )}
        </div>
    );
};

export default ProjectsSection;
