"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Loader, Edit, Trash2, FolderOpen } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';

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
    onOpenKanban?: (sprint: Sprint) => void;
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
    onOpenKanban,
    searchPlaceholder,
    emptyState,
    sprints,
    loading = false
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('active');
    const itemsPerPage = 10;

    const filteredSprints = useMemo(() => {
        if (!sprints) return [];

        let filtered = sprints;

        // Filter by active tab
        if (activeTab === 'active') {
            filtered = filtered.filter(sprint => sprint.status === 'active');
        } else if (activeTab === 'planning') {
            filtered = filtered.filter(sprint => sprint.status === 'planned');
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(sprint => sprint.status === 'completed');
        } else if (activeTab === 'cancelled') {
            filtered = filtered.filter(sprint => sprint.status === 'cancelled');
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(sprint =>
                sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sprint.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sprint.milestone_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [sprints, searchTerm, activeTab]);

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

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'active'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Active Sprints
                    </button>
                    <button
                        onClick={() => setActiveTab('planning')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'planning'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Planning Sprints
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'completed'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Completed Sprints
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'cancelled'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Cancelled Sprints
                    </button>
                </nav>
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
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {paginatedSprints.map((sprint) => (
                            <div key={sprint.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{sprint.name}</h3>
                                        <p className="text-sm text-gray-600">Project Name</p>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        sprint.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                                        sprint.status === 'active' ? 'bg-green-100 text-green-800' :
                                        sprint.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {sprint.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Date Range:</span>
                                        <span className="text-gray-900">
                                            {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString() : 'Not set'} - {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString() : 'Not set'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Owner:</span>
                                        <span className="text-gray-900">Clinton Okumu</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900">{sprint.tasks_count}</div>
                                        <div className="text-xs text-gray-600">Tasks</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900">0</div>
                                        <div className="text-xs text-gray-600">Story points</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900">0h</div>
                                        <div className="text-xs text-gray-600">Logged hours</div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="text-gray-900">{sprint.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${sprint.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Sprint Goal</h4>
                                    <p className="text-sm text-gray-600">Complete user authentication and profile management features.</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(sprint)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(sprint.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {onOpenKanban && (
                                        <button
                                            onClick={() => onOpenKanban(sprint)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                        >
                                            <FolderOpen className="h-4 w-4" />
                                            Open Kanban
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
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
