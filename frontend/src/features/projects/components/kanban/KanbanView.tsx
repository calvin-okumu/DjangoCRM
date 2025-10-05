"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Loader, Target, User, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task } from '@/features/shared/types/common';
import Button from '@/features/shared/components/ui/Button';

interface KanbanViewProps {
  title: string;
  addButtonText: string;
  onAdd: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  onAssignToSprint?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
  searchPlaceholder?: string;
  emptyState: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
  };
  tasks?: Task[];
  loading?: boolean;
  milestones?: { id: number; name: string }[];
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
  loading = false,
  milestones = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');

  // Include all tasks for Kanban view (backlog through completed)
  const kanbanTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!kanbanTasks) return [];

    let filtered = kanbanTasks;

    // Apply milestone filter
    if (milestoneFilter !== 'all') {
      filtered = filtered.filter(task => task.milestone?.toString() === milestoneFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.milestone_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [kanbanTasks, searchTerm, milestoneFilter]);

  // For card view, we don't group by status - just use all filtered tasks
  const cardTasks = useMemo(() => {
    return filteredTasks;
  }, [filteredTasks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (taskId: number, direction: 'left' | 'right') => {
    const task = filteredTasks.find(t => t.id === taskId);
    if (!task || !onStatusChange) return;

    const statusOrder = ['backlog', 'to_do', 'in_progress', 'in_review', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);

    let newIndex: number;
    if (direction === 'right' && currentIndex < statusOrder.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'left' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return; // Can't move further
    }

    const newStatus = statusOrder[newIndex];
    onStatusChange(taskId, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800';
      case 'to_do': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button onClick={onAdd}>
          <Plus className="h-5 w-5 mr-2" />
          {addButtonText}
        </Button>
      </div>

      {(searchPlaceholder || milestones) && (
        <div className="flex flex-wrap gap-4 mb-6">
          {searchPlaceholder && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            </div>
          )}

          {milestones && milestones.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Milestone:</span>
              <select
                value={milestoneFilter}
                onChange={(e) => setMilestoneFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <option value="all">All Milestones</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id.toString()}>
                    {milestone.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {(kanbanTasks || []).length === 0 ? (
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
            <Button onClick={onAdd}>
              {emptyState.buttonText}
            </Button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cardTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex-1 pr-2">
                  {task.title}
                </h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {task.description}
                </p>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {task.assignee || 'Unassigned'}
                  </div>
                  {task.end_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(task.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {task.priority && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Priority:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      task.priority === 'low' ? 'bg-green-100 text-green-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                )}

                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                </div>
              </div>

              {task.milestone_name && (
                <div className="text-sm text-gray-500 mb-4">
                  Milestone: {task.milestone_name}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  {onAssignToSprint && (
                    <button
                      onClick={() => onAssignToSprint(task)}
                      className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="Assign to Sprint"
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(task)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {onStatusChange && (
                  <div className="flex space-x-1">
                    {task.status !== 'backlog' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'left')}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Move to previous status"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                    {task.status !== 'done' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'right')}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Move to next status"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {cardTasks.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <div className="text-lg mb-2">No tasks found</div>
              <div className="text-sm">Try adjusting your search or add a new task.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KanbanView;