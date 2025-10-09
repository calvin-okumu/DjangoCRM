"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Loader, Edit, Trash2 } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';
import { Milestone } from '@/features/shared/types/common';

interface EmptyState {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
}

interface MilestoneListProps {
    title: string;
    addButtonText: string;
    onAdd: () => void;
    onEdit?: (milestone: Milestone) => void;
    onDelete?: (milestoneId: number) => void;
    searchPlaceholder: string;
    emptyState: EmptyState;
    milestones?: Milestone[];
    loading?: boolean;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
    title,
    addButtonText,
    onAdd,
    onEdit,
    onDelete,
    searchPlaceholder,
    emptyState,
    milestones,
    loading = false
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    const filteredMilestones = useMemo(() => {
        if (!milestones) return [];
        if (!searchTerm) return milestones;

        return milestones.filter(milestone =>
            milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            milestone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            milestone.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [milestones, searchTerm]);

    const totalPages = Math.ceil(filteredMilestones.length / itemsPerPage);
    const paginatedMilestones = filteredMilestones.slice(
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
            <div className="flex justify-between items-center mb-6">
                {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <Plus className="h-5 w-5" />
                        {addButtonText}
                    </button>
                )}
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

            {(milestones || []).length === 0 ? (
                loading ? (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
                        <Loader className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading milestones...</h3>
                        <p className="text-gray-600">Please wait while we fetch your milestones.</p>
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
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sprints
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedMilestones.map((milestone) => (
                                    <tr key={milestone.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {milestone.name}
                                            </div>
                                            {milestone.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {milestone.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                milestone.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                                                milestone.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                                                milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {milestone.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${milestone.progress}%` }}
                                                    ></div>
                                                </div>
                                                {milestone.progress}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {milestone.sprints_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(milestone)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(milestone.id)}
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
                        totalItems={filteredMilestones.length}
                    />
                </div>
            )}
        </div>
    );
};

export default MilestoneList;
