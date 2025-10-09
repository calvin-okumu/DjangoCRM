"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { getSprint, getTasks, createTask, updateTask, getMilestones } from '../../../../../../../api';
import { Sprint, Task, Milestone } from '../../../../../../../features/shared/types/common';
import AddTaskModal from '../../../../../../../features/projects/components/AddTaskModal';
import { TaskFormData } from '../../../../../../../features/projects/components/AddTaskModal';

export default function SprintDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const sprintId = params.sprintId as string;

    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [taskToMove, setTaskToMove] = useState<Task | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');

    // Calculate sprint progress
    const calculateSprintProgress = useCallback((sprintTasks: Task[]): number => {
        if (sprintTasks.length === 0) return 0;
        const completedTasks = sprintTasks.filter(t => t.status === 'done').length;
        return Math.round((completedTasks / sprintTasks.length) * 100);
    }, []);

    // Check if sprint exists locally (for mock data)
    const getLocalSprint = useCallback((sprintId: string): Sprint | null => {
        try {
            const stored = localStorage.getItem(`sprints_${projectId}`);
            if (stored) {
                const sprints: Sprint[] = JSON.parse(stored);
                return sprints.find(s => s.id === parseInt(sprintId)) || null;
            }
        } catch (error) {
            console.error('Error reading local sprints:', error);
        }
        return null;
    }, [projectId]);

    useEffect(() => {
        const fetchSprintData = async () => {
            if (!projectId || !sprintId) return;

            setLoading(true);
            try {
                // First check if sprint exists locally (for mock data)
                const localSprint = getLocalSprint(sprintId);
                if (localSprint) {
                    setSprint(localSprint);
                    // For local sprints, show empty tasks array
                    setTasks([]);

                    // Fetch backlog tasks and milestones for local sprints too
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        const allTasks = await getTasks(token);
                        const backlog = allTasks.filter(task => !task.sprint && task.status !== 'done');
                        setBacklogTasks(backlog);

                        const milestonesData = await getMilestones(token, parseInt(projectId));
                        setMilestones(milestonesData);
                    }
                } else {
                    // Try to fetch from API
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        // Fetch sprint details
                        const sprintData = await getSprint(token, parseInt(sprintId));
                        setSprint(sprintData);

                    // Fetch tasks for this sprint
                    const tasksData = await getTasks(token, undefined, parseInt(sprintId));
                    setTasks(tasksData);

                    // Fetch backlog tasks for adding to sprint
                    const allTasks = await getTasks(token);
                    const backlog = allTasks.filter(task => !task.sprint && task.status !== 'done');
                    setBacklogTasks(backlog);

                    // Fetch milestones for task creation
                    const milestonesData = await getMilestones(token, parseInt(projectId));
                    setMilestones(milestonesData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch sprint data:', error);
                // If API fails and no local sprint exists, show error state
                if (!getLocalSprint(sprintId)) {
                    console.error('Sprint not found locally or on server');
                    setSprint(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSprintData();
    }, [projectId, sprintId, getLocalSprint]);

    // Update sprint progress when tasks change
    useEffect(() => {
        if (sprint && tasks.length >= 0) {
            const progress = calculateSprintProgress(tasks);
            if (sprint.progress !== progress) {
                setSprint({ ...sprint, progress });
            }
        }
    }, [tasks, sprint, calculateSprintProgress]);

    const handleBackToSprints = () => {
        router.push(`/dashboard/project_mgmt/project/${projectId}`);
    };

    const handleAddTaskToSprint = () => {
        setIsAddTaskModalOpen(true);
    };

    const handleCreateNewTask = () => {
        setIsTaskModalOpen(true);
    };

    const handleSaveNewTask = async (taskData: TaskFormData) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token || !sprint) return;

            // Create task with sprint assignment
            const newTaskData = {
                title: taskData.title,
                description: taskData.description || '',
                status: 'to_do',
                milestone: taskData.milestone_id,
                sprint: sprint.id, // Assign to current sprint
                assignee: taskData.assignee,
                start_date: taskData.start_date,
                end_date: taskData.end_date,
                estimated_hours: taskData.estimated_hours,
            };

            if (sprint.id >= 1000000000000) { // Mock sprint (Date.now() IDs are large)
                // For mock sprints, just add to local state
                const milestoneObj = milestones.find(m => m.id === newTaskData.milestone);
                const newTask: Task = {
                    id: Date.now(),
                    title: newTaskData.title,
                    description: newTaskData.description,
                    priority: taskData.priority, // Use original taskData priority
                    status: 'to_do',
                    sprint: sprint.id,
                    sprint_name: sprint.name,
                    milestone: newTaskData.milestone,
                    milestone_name: milestoneObj?.name || '',
                    assignee: newTaskData.assignee,
                    estimated_hours: newTaskData.estimated_hours,
                    start_date: newTaskData.start_date,
                    end_date: newTaskData.end_date,
                    progress: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                setTasks(prev => [...prev, newTask]);
            } else {
                // For real sprints, create via API
                const createdTask = await createTask(token, newTaskData);
                setTasks(prev => [...prev, createdTask]);
            }

            setIsTaskModalOpen(false);
        } catch (error) {
            console.error('Failed to create task:', error);
            alert('Failed to create task. Please try again.');
        }
    };

    const handleAssignTaskToSprint = async (task: Task) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token || !sprint) return;

            if (sprint.id >= 1000000000000) { // Mock sprint
                // Update task locally
                const updatedTask = {
                    ...task,
                    sprint: sprint.id,
                    sprint_name: sprint.name,
                    status: 'to_do' as const,
                    updated_at: new Date().toISOString()
                };
                setTasks(prev => [...prev, updatedTask]);
                // Remove from backlog
                setBacklogTasks(prev => prev.filter(t => t.id !== task.id));
            } else {
                // Update via API
                const updatedTask = await updateTask(token, task.id, {
                    ...task,
                    sprint: sprint.id,
                    status: 'to_do',
                });
                setTasks(prev => [...prev, updatedTask]);
                // Remove from backlog
                setBacklogTasks(prev => prev.filter(t => t.id !== task.id));
            }

            setIsAddTaskModalOpen(false);
        } catch (error) {
            console.error('Failed to assign task to sprint:', error);
            alert('Failed to assign task to sprint. Please try again.');
        }
    };

    const handleMoveTask = (task: Task, status: string) => {
        setTaskToMove(task);
        setNewStatus(status);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmMoveTask = async () => {
        if (!taskToMove || !newStatus) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token || !sprint) return;

            if (newStatus === 'done') {
                // Mark task as done and move to completed tasks
                if (sprint.id >= 1000000000000) { // Mock sprint
                    const completedTask = {
                        ...taskToMove,
                        status: 'done',
                        updated_at: new Date().toISOString()
                    };
                    // Store in project's completed tasks localStorage
                    const existingCompleted = localStorage.getItem(`completed_tasks_${projectId}`);
                    const completedTasks = existingCompleted ? JSON.parse(existingCompleted) : [];
                    const updatedCompleted = [...completedTasks.filter((t: Task) => t.id !== taskToMove.id), completedTask];
                    localStorage.setItem(`completed_tasks_${projectId}`, JSON.stringify(updatedCompleted));

                    // Remove from sprint tasks
                    setTasks(prev => prev.filter(t => t.id !== taskToMove.id));
                } else {
                    // Update via API
                    await updateTask(token, taskToMove.id, {
                        status: 'done',
                    });
                    // Remove from sprint tasks (API will handle the completed status)
                    setTasks(prev => prev.filter(t => t.id !== taskToMove.id));
                }
            } else {
                // Update task status within the sprint
                if (sprint.id >= 1000000000000) { // Mock sprint
                    const updatedTask = {
                        ...taskToMove,
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    };
                    setTasks(prev => prev.map(t => t.id === taskToMove.id ? updatedTask : t));
                } else {
                    // Update via API
                    const updatedTask = await updateTask(token, taskToMove.id, {
                        status: newStatus,
                    });
                    setTasks(prev => prev.map(t => t.id === taskToMove.id ? updatedTask : t));
                }
            }

            setIsConfirmModalOpen(false);
            setTaskToMove(null);
            setNewStatus('');
        } catch (error) {
            console.error('Failed to move task:', error);
            alert('Failed to move task. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading sprint details...</p>
                </div>
            </div>
        );
    }

    if (!sprint) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Sprint Not Found</h1>
                    <p className="text-gray-600 mb-4">The sprint you&apos;re looking for doesn&apos;t exist.</p>
                    <button
                        onClick={handleBackToSprints}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Sprints
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={handleBackToSprints}
                                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Sprints
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{sprint.name}</h1>
                                <p className="text-sm text-gray-600">Sprint Detail & Kanban Board</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                sprint.status === 'active' ? 'bg-green-100 text-green-800' :
                                sprint.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                                sprint.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {sprint.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sprint Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Information</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Project:</span>
                                    <span className="text-sm text-gray-900">Project Name</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Date Range:</span>
                                    <span className="text-sm text-gray-900">
                                        {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString() : 'Not set'} - {sprint.end_date ? new Date(sprint.end_date).toLocaleDateString() : 'Not set'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Owner:</span>
                                    <span className="text-sm text-gray-900">Clinton Okumu</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Goal</h2>
                            <p className="text-sm text-gray-600">
                                Complete user authentication and profile management features for the application.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                        <div className="text-sm text-gray-600">Total Tasks</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">0h</div>
                        <div className="text-sm text-gray-600">Total Logged Hours</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">{sprint.progress}%</div>
                        <div className="text-sm text-gray-600">Progress</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={handleAddTaskToSprint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <UserPlus className="h-5 w-5" />
                        Add Task to Sprint
                    </button>
                    <button
                        onClick={handleCreateNewTask}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Task
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Kanban Board</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
                        {/* To Do Column */}
                        <div className="border-r border-gray-200 last:border-r-0">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                                    To Do
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({tasks.filter(t => t.status === 'to_do').length})
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">Tasks planned but not started</p>
                            </div>
                            <div className="p-4 min-h-[400px] bg-gray-50">
                                {tasks.filter(t => t.status === 'to_do').map((task) => (
                                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
                                        <h5 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h5>
                                        {task.description && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>Priority: {task.priority || 'Medium'}</span>
                                            <span>{task.estimated_hours || 0}h</span>
                                        </div>
                                        <button
                                            onClick={() => handleMoveTask(task, 'in_progress')}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                                        >
                                            Move to Progress
                                        </button>
                                    </div>
                                ))}
                                {tasks.filter(t => t.status === 'to_do').length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No tasks in To Do
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* In Progress Column */}
                        <div className="border-r border-gray-200 last:border-r-0">
                            <div className="bg-orange-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                                    In Progress
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({tasks.filter(t => t.status === 'in_progress').length})
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">Tasks being actively worked on</p>
                            </div>
                            <div className="p-4 min-h-[400px] bg-orange-50">
                                {tasks.filter(t => t.status === 'in_progress').map((task) => (
                                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
                                        <h5 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h5>
                                        {task.description && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>Priority: {task.priority || 'Medium'}</span>
                                            <span>{task.estimated_hours || 0}h</span>
                                        </div>
                                        <button
                                            onClick={() => handleMoveTask(task, 'in_review')}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 px-2 rounded"
                                        >
                                            Move to Review
                                        </button>
                                    </div>
                                ))}
                                {tasks.filter(t => t.status === 'in_progress').length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No tasks in progress
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* In Review Column */}
                        <div className="border-r border-gray-200 last:border-r-0">
                            <div className="bg-cyan-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
                                    In Review
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({tasks.filter(t => t.status === 'in_review').length})
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">Tasks ready for QA/code review</p>
                            </div>
                            <div className="p-4 min-h-[400px] bg-cyan-50">
                                {tasks.filter(t => t.status === 'in_review').map((task) => (
                                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
                                        <h5 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h5>
                                        {task.description && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>Priority: {task.priority || 'Medium'}</span>
                                            <span>{task.estimated_hours || 0}h</span>
                                        </div>
                                        <button
                                            onClick={() => handleMoveTask(task, 'testing')}
                                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs py-1 px-2 rounded"
                                        >
                                            Move to Testing
                                        </button>
                                    </div>
                                ))}
                                {tasks.filter(t => t.status === 'in_review').length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No tasks in review
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Testing Column */}
                        <div>
                            <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                                    Testing
                                    <span className="ml-2 text-sm text-gray-500">
                                        ({tasks.filter(t => t.status === 'testing').length})
                                    </span>
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">Tasks under validation/testing</p>
                            </div>
                            <div className="p-4 min-h-[400px] bg-purple-50">
                                {tasks.filter(t => t.status === 'testing').map((task) => (
                                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
                                        <h5 className="font-medium text-gray-900 text-sm mb-2">{task.title}</h5>
                                        {task.description && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>Priority: {task.priority || 'Medium'}</span>
                                            <span>{task.estimated_hours || 0}h</span>
                                        </div>
                                        <button
                                            onClick={() => handleMoveTask(task, 'done')}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                                        >
                                            Mark as Done
                                        </button>
                                    </div>
                                ))}
                                {tasks.filter(t => t.status === 'testing').length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No tasks in testing
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveNewTask}
                milestones={milestones}
            />

            {/* Add Task to Sprint Modal */}
            {isAddTaskModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Add Task to Sprint</h3>
                            <button
                                onClick={() => setIsAddTaskModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            {backlogTasks.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">No tasks available in backlog</p>
                            ) : (
                                backlogTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                                            {task.description && (
                                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>Priority: {task.priority || 'Medium'}</span>
                                                <span>Est: {task.estimated_hours || 0}h</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAssignTaskToSprint(task)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                        >
                                            Add to Sprint
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmModalOpen && taskToMove && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {newStatus === 'done' ? 'Mark Task as Done?' : 'Move Task?'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {newStatus === 'done'
                                    ? `Are you sure you want to mark "${taskToMove.title}" as done? This will remove it from the sprint.`
                                    : `Move "${taskToMove.title}" to ${newStatus.replace('_', ' ')}?`
                                }
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmMoveTask}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg ${
                                        newStatus === 'done' ? 'bg-green-600 hover:bg-green-700' :
                                        newStatus === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700' :
                                        newStatus === 'in_review' ? 'bg-orange-600 hover:bg-orange-700' :
                                        'bg-cyan-600 hover:bg-cyan-700'
                                    }`}
                                >
                                    {newStatus === 'done' ? 'Mark as Done' : 'Move Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}