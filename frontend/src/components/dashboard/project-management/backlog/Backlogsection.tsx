"use client";

import React, { useState, useEffect } from 'react';
import SearchInput from '@/components/shared/SearchInput';
import Button from '@/components/ui/Button';
import BacklogTable from './BacklogTable';
import CreateTaskModal from '@/components/shared/CreateTaskModal';
import { useTasks } from '@/hooks/useTasks';
import { getMilestones, getSprints } from '@/api/project_mgmt';
import { getUserTenants } from '@/api/crm';
import type { Task, Milestone, Sprint, UserTenant } from '@/api/types';
import { Plus } from 'lucide-react';

interface BacklogSectionProps {
    projectId: number;
}

export default function BacklogSection({ projectId }: BacklogSectionProps) {
    const { tasks, loading, error, addTask, editTask, removeTask } = useTasks(projectId, true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [users, setUsers] = useState<UserTenant[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const [milestonesData, sprintsData, usersData] = await Promise.all([
                    getMilestones(token, projectId),
                    getSprints(token, projectId),
                    getUserTenants(token)
                ]);
                setMilestones(milestonesData);
                setSprints(sprintsData);
                setUsers(usersData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchData();
    }, [projectId]);

    const handleAddTask = () => {
        setModalMode('add');
        setSelectedTask(null);
        setModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setModalMode('edit');
        setSelectedTask(task);
        setModalOpen(true);
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
        try {
            if (modalMode === 'add') {
                await addTask(data);
            } else if (selectedTask) {
                await editTask(selectedTask.id, data);
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving task:', error);
            // TODO: Show error message
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search tasks..."
                />
                <Button onClick={handleAddTask} variant="primary" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                </Button>
            </div>
            <BacklogTable
                tasks={tasks}
                loading={loading}
                error={error}
                onEditTask={handleEditTask}
                onDeleteTask={removeTask}
                onAddTask={handleAddTask}
                searchValue={searchValue}
            />
            <CreateTaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                task={selectedTask || undefined}
                sprints={sprints}
                assignees={users}
                onSave={handleSaveTask}
            />
        </div>
    );
};