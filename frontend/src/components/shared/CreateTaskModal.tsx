"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Task, Sprint, UserTenant } from '@/api/types';
import { useForm } from 'react-hook-form';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    task?: Task;
    sprints: Sprint[];
    assignees: UserTenant[];
    onSave: (data: {
        title: string;
        description?: string;
        status: string;
        milestone: number;
        sprint?: number;
        assignee?: number;
        start_date?: string;
        end_date?: string;
        estimated_hours?: number;
    }) => void;
    defaultSprintId?: number; // For pre-filling sprint in Kanban
}

type FormData = {
    title: string;
    description: string;
    status: string;
    priority: string;
    sprint: string;
    assignee: string;
    start_date: string;
    end_date: string;
    estimated_hours: string;
};

export default function CreateTaskModal({ isOpen, onClose, mode, task, sprints, assignees, onSave, defaultSprintId }: CreateTaskModalProps) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            title: '',
            description: '',
            status: 'to_do',
            priority: 'medium',
            sprint: defaultSprintId?.toString() || '',
            assignee: '',
            start_date: '',
            end_date: '',
            estimated_hours: '',
        }
    });
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');

    const watchedSprint = watch('sprint');

    useEffect(() => {
        if (watchedSprint) {
            const sprint = sprints.find(s => s.id.toString() === watchedSprint);
            if (sprint) {
                setMinDate(sprint.start_date || '');
                setMaxDate(sprint.end_date || '');
            }
        } else {
            setMinDate('');
            setMaxDate('');
        }
    }, [watchedSprint, sprints]);

    const onSubmit = (data: FormData) => {
        let milestoneId: number;
        if (data.sprint) {
            const sprint = sprints.find(s => s.id === parseInt(data.sprint));
            if (!sprint) return;
            milestoneId = sprint.milestone;
        } else {
            alert('Please select a sprint to assign the milestone.');
            return;
        }

        const saveData = {
            title: data.title,
            description: data.description || undefined,
            status: data.status,
            milestone: milestoneId,
            sprint: data.sprint ? parseInt(data.sprint) : undefined,
            assignee: data.assignee ? parseInt(data.assignee) : undefined,
            start_date: data.start_date || undefined,
            end_date: data.end_date || undefined,
            estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : undefined,
        };

        onSave(saveData);
    };

    useEffect(() => {
        if (mode === 'edit' && task) {
            setValue('title', task.title);
            setValue('description', task.description || '');
            setValue('status', task.status);
            setValue('priority', task.priority || 'medium');
            setValue('sprint', task.sprint?.toString() || '');
            setValue('assignee', task.assignee?.toString() || '');
            setValue('start_date', task.start_date || '');
            setValue('end_date', task.end_date || '');
            setValue('estimated_hours', task.estimated_hours?.toString() || '');
            const sprint = sprints.find(s => s.id === task.sprint);
            if (sprint) {
                setMinDate(sprint.start_date || '');
                setMaxDate(sprint.end_date || '');
            }
        } else {
            setValue('title', '');
            setValue('description', '');
            setValue('status', 'to_do');
            setValue('priority', 'medium');
            setValue('sprint', defaultSprintId?.toString() || '');
            setValue('assignee', '');
            setValue('start_date', '');
            setValue('end_date', '');
            setValue('estimated_hours', '');
            setMinDate('');
            setMaxDate('');
        }
    }, [mode, task, isOpen, sprints, defaultSprintId, setValue]);





    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add Task' : 'Edit Task'} size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                        type="text"
                        id="title"
                        {...register('title', { required: 'Title is required' })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        {...register('description')}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="status"
                            {...register('status')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="to_do">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="testing">Testing</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                            id="priority"
                            {...register('priority')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="sprint" className="block text-sm font-medium text-gray-700">Sprint</label>
                        <select
                            id="sprint"
                            {...register('sprint', { required: 'Sprint is required' })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                        <option value="">Select Sprint</option>
                        {sprints.map(sprint => (
                            <option key={sprint.id} value={sprint.id}>
                                {sprint.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
                        <select
                            id="assignee"
                            {...register('assignee')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                        <option value="">Select Assignee</option>
                        {assignees.map(user => (
                            <option key={user.user} value={user.user}>
                                {user.user_first_name} {user.user_last_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="start_date"
                            {...register('start_date', {
                                validate: value => {
                                    if (value && minDate && value < minDate) return 'Task start date cannot be before the sprint\'s start date.';
                                    return true;
                                }
                            })}
                            min={minDate}
                            max={maxDate}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.start_date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="end_date"
                            {...register('end_date', {
                                validate: value => {
                                    if (value && maxDate && value > maxDate) return 'Task end date cannot be after the sprint\'s end date.';
                                    return true;
                                }
                            })}
                            min={minDate}
                            max={maxDate}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.end_date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                    <input
                        type="number"
                        id="estimated_hours"
                        {...register('estimated_hours')}
                        min="0"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        {mode === 'add' ? 'Add Task' : 'Update Task'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};