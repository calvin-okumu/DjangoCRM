"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Search, Loader, Edit, Trash2, MoreHorizontal } from 'lucide-react';

interface EmptyState {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
}

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignee?: string;
    story_points?: number;
    sprint_id?: number;
    created_at: string;
}

interface KanbanViewProps {
    title: string;
    addButtonText: string;
    onAdd: () => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: number) => void;
    onAssignToSprint?: (task: Task) => void;
    onStatusChange?: (taskId: number, newStatus: string) => void;
    searchPlaceholder: string;
    emptyState: EmptyState;
    tasks?: Task[];
    loading?: boolean;
}

const KanbanView: React.FC<KanbanViewProps> = ({
    title,
    addButtonText,
    onAdd,
    onEdit,
    onDelete,
    onAssignToSprint,
    onStatusChange,
    searchPlaceholder,
    emptyState,
    tasks,
    loading = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        if (!searchTerm) return tasks;

        return tasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, searchTerm]);

    const columns = [
        { id: 'backlog', title: 'Backlog', color: 'bg-gray-100' },
        { id: 'todo', title: 'To Do', color: 'bg-blue-100' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100' },
        { id: 'review', title: 'Review', color: 'bg-purple-100' },
        { id: 'done', title: 'Done', color: 'bg-green-100' }
    ];

    const getTasksByStatus = (status: string) => {
        return filteredTasks.filter(task => task.status === status);
    };

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        e.dataTransfer.setData('text/plain', task.id.toString());
    };

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        if (onStatusChange) {
            onStatusChange(taskId, newStatus);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200"
                    />
                </div>
            </div>

            {(tasks || []).length === 0 ? (
                loading ? (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
                        <Loader className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading tasks...</h3>
                        <p className="text-gray-600">Please wait while we fetch your tasks.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className={`${column.color} rounded-lg p-4 min-h-[600px]`}
                            onDrop={(e) => handleDrop(e, column.id)}
                            onDragOver={handleDragOver}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                                <span className="bg-white bg-opacity-50 text-gray-700 text-sm px-2 py-1 rounded-full">
                                    {getTasksByStatus(column.id).length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {getTasksByStatus(column.id).map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                            <div className="flex items-center gap-1">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(task)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(task.id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {onAssignToSprint && (
                                                    <button
                                                        onClick={() => onAssignToSprint(task)}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="Assign to Sprint"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {task.description && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    task.priority === 'low' ? 'bg-green-100 text-green-800' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                {task.story_points && (
                                                    <span className="text-xs text-gray-500">
                                                        {task.story_points} pts
                                                    </span>
                                                )}
                                            </div>
                                            {task.assignee && (
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {task.assignee.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KanbanView;
