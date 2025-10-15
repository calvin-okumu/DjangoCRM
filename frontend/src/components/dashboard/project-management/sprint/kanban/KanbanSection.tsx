"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSprint, getTasks } from '@/api/project_mgmt';
import type { Sprint, Task } from '@/api/types';
import Loader from '@/components/shared/Loader';
import Button from '@/components/ui/Button';
import KanbanHeader from './KanbanHeader';
import KanbanBoard from './KanbanBoard';
import TaskModal from './TaskModal';

interface KanbanSectionProps {
    projectId: number;
    sprintId: number;
    isModal?: boolean;
}

export default function KanbanSection({ projectId, sprintId, isModal = false }: KanbanSectionProps) {
    const router = useRouter();
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleBack = () => {
        router.push(`/dashboard/project-management/${projectId}/sprint`);
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
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
                <KanbanHeader sprint={sprint} onBack={handleBack} isModal={isModal} />
                <div className="flex gap-2 mb-4">
                    <Button onClick={() => console.log('Add Task clicked')}>Add Task</Button>
                    <Button onClick={() => console.log('Create Task clicked')}>Create Task</Button>
                </div>
                <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
                {selectedTask && (
                    <TaskModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        task={selectedTask}
                    />
                )}
            </div>
        </div>
    );
}