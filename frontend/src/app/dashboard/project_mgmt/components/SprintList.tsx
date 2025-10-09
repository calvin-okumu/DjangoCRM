"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Loader, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../../../components/shared/Pagination';

interface EmptyState {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
}

interface Sprint {
    id: number;
    name: string;
    status: string;
    start_date?: string;
    end_date?: string;
    milestone: number;
    milestone_name?: string;
    progress: number;
    tasks_count: number;
    created_at: string;
}

interface SprintListProps {
    title: string;
    addButtonText: string;
    onAdd: () => void;
    onEdit?: (sprint: Sprint) => void;
    onDelete?: (sprintId: number) => void;
    searchPlaceholder: string;
    emptyState: EmptyState;
    sprints?: Sprint[];
    loading?: boolean;
}

const SprintList: React.FC<SprintListProps> = ({
    title,
    addButtonText,
    onAdd,
    onEdit,
    onDelete,
    searchPlaceholder,
    emptyState,
    sprints,
    loading = false
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    const filteredSprints = useMemo(() => {
        if (!sprints) return [];
        if (!searchTerm) return sprints;

        return sprints.filter(sprint =>
            sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sprint.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sprint.milestone_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sprints, searchTerm]);

    const totalPages = Math.ceil(filteredSprints.length / itemsPerPage);
    const paginatedSprints = filteredSprints.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    return (
        <div>
            {title && (
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
            )}

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

            {(sprints || []).length === 0 ? (
                loading ? (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
                        <Loader className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading sprints...</h3>
                        <p className="text-gray-600">Please wait while we fetch your sprints.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
                        <emptyState.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
                        <p className="text-gray-600 mb-6">
                            {emptyState.description}
                        </p>
                        <button
                            onClick={onAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            {emptyState.buttonText}
                        </button>
                    </div>
                )
            ) : (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tasks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Milestone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedSprints.map((sprint) => (
                                    <tr key={sprint.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {sprint.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                sprint.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                                                sprint.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                                                sprint.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {sprint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${sprint.progress}%` }}
                                                    ></div>
                                                </div>
                                                {sprint.progress}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {sprint.tasks_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {sprint.milestone_name || `Milestone ${sprint.milestone}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(sprint)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(sprint.id)}
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
                        totalItems={filteredSprints.length}
                    />
                </div>
            )}
        </div>
    );
};

export default SprintList;
