"use client";

import { getSprint, getTasks, createTask, getSprints, assignTaskToSprint } from '@/api/project_mgmt';
import { getUserTenants } from '@/api/crm';
import type { Sprint, Task, UserTenant } from '@/api/types';
import Loader from '@/components/shared/Loader';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import KanbanBoard from './KanbanBoard';
import KanbanHeader from './KanbanHeader';
import TaskModal from './TaskModal';
import BacklogModal from '../../backlog/BacklogModal';

interface KanbanSectionProps {
    projectId: number;
    sprintId: number;
    onBack?: () => void;
}

export default function KanbanSection({ projectId, sprintId, onBack }: KanbanSectionProps) {
    const router = useRouter();
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createModalMode, setCreateModalMode] = useState<'add' | 'edit'>('add');
    const [createSelectedTask, setCreateSelectedTask] = useState<Task | null>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [users, setUsers] = useState<UserTenant[]>([]);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        console.log('Token:', token ? 'present' : 'missing');
        if (!token) {
            setError('No access token found. Redirecting to login...');
            setLoading(false);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
            return;
        }

        try {
            const [sprintData, tasksData] = await Promise.all([
                getSprint(token, sprintId),
                getTasks(token, undefined, sprintId)
            ]);
            setSprint(sprintData);
            setTasks(tasksData);
            console.log('Fetched sprint and tasks successfully');
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data. Please check your connection or try again.');
        } finally {
            setLoading(false);
        }
    }, [sprintId]);

    useEffect(() => {
        console.log('KanbanSection useEffect, sprintId:', sprintId);
        if (sprintId) {
            fetchData();
        }
    }, [sprintId, fetchData]);

    useEffect(() => {
        const fetchModalData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const [sprintsData, usersData, backlogData] = await Promise.all([
                    getSprints(token, projectId),
                    getUserTenants(token),
                    getTasks(token, undefined, undefined, projectId, true) // backlog=true
                ]);
                setSprints(sprintsData);
                setUsers(usersData);
                setBacklogTasks(backlogData);
            } catch (err) {
                console.error('Failed to fetch modal data:', err);
            }
        };
        fetchModalData();
    }, [projectId]);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push(`/dashboard/project-management/${projectId}/sprint`);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleCreateTask = () => {
        setCreateModalMode('add');
        setCreateSelectedTask(null);
        setCreateModalOpen(true);
    };

    const handleAddTask = () => {
        setSelectedTasks([]);
        setAddModalOpen(true);
    };

    const handleTaskSelection = (taskId: number, checked: boolean) => {
        if (checked) {
            setSelectedTasks(prev => [...prev, taskId]);
        } else {
            setSelectedTasks(prev => prev.filter(id => id !== taskId));
        }
    };

    const handleAddSelectedTasks = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            await Promise.all(
                selectedTasks.map(taskId => assignTaskToSprint(token, sprintId, taskId))
            );
            setAddModalOpen(false);
            // Refetch tasks
            fetchData();
        } catch (error) {
            console.error('Error adding tasks:', error);
            // TODO: Show error message
        }
    };

    const handleSaveTask = async (data: {
        title: string;
        description?: string;
        status: string;
        milestone: number;
        sprint?: number;
        assignee?: number;
        start_date?: string;
        end_date?: string;
        estimated_hours?: number;
    }) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // Ensure sprint is set to current sprintId
            const taskData = { ...data, sprint: sprintId };
            await createTask(token, taskData);
            setCreateModalOpen(false);
            // Refetch tasks
            fetchData();
        } catch (error) {
            console.error('Error saving task:', error);
            // TODO: Show error message
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <KanbanHeader sprint={{ id: 0, name: 'Error', status: 'planned', progress: 0, tasks_count: 0, created_at: '', milestone: 0, milestone_name: '' }} onBack={handleBack} />
                    <div className="text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                setSprint(null);
                                setTasks([]);
                                fetchData();
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!sprint) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <KanbanHeader sprint={{ id: 0, name: 'Not Found', status: 'planned', progress: 0, tasks_count: 0, created_at: '', milestone: 0, milestone_name: '' }} onBack={handleBack} />
                    <div className="text-center">Sprint not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <KanbanHeader sprint={sprint} onBack={handleBack} />
                <div className="flex gap-2 mb-4">
                    <Button className='bg-green-600 hover:bg-green-400' onClick={handleAddTask}>Add Task</Button>
                    <Button onClick={handleCreateTask}>Create Task</Button>
                </div>
                <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
                {selectedTask && (
                    <TaskModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        task={selectedTask}
                    />
                )}
                <BacklogModal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    mode={createModalMode}
                    task={createSelectedTask || undefined}
                    sprints={sprints}
                    assignees={users}
                    onSave={handleSaveTask}
                />
                {addModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setAddModalOpen(false)}></div>
                        <div className="relative z-10 bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6">
                            <button
                                onClick={() => setAddModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tasks from Backlog</h3>
                            <div className="max-h-96 overflow-y-auto">
                                {backlogTasks.length === 0 ? (
                                    <p className="text-gray-500">No backlog tasks available.</p>
                                ) : (
                                    backlogTasks.map(task => (
                                        <div key={task.id} className="flex items-center space-x-3 p-3 border-b">
                                            <input
                                                type="checkbox"
                                                checked={selectedTasks.includes(task.id)}
                                                onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <div>
                                                <p className="font-medium">{task.title}</p>
                                                <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <Button onClick={() => setAddModalOpen(false)} variant="outline">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddSelectedTasks} variant="primary">
                                    Add Selected ({selectedTasks.length})
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
