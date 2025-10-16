"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Task } from '@/api/types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onStatusChange?: (taskId: number, newStatus: string) => void;
    onDelete?: (taskId: number) => void;
}

export default function TaskModal({ isOpen, onClose, task, onStatusChange, onDelete }: TaskModalProps) {
    const getNextStatus = (currentStatus: string) => {
        const statusFlow = {
            'todo': 'in_progress',
            'in_progress': 'review',
            'review': 'testing',
            'testing': 'done',
            'done': 'completed'
        };
        return statusFlow[currentStatus as keyof typeof statusFlow];
    };

    const getButtonText = (currentStatus: string) => {
        const buttonTexts = {
            'todo': 'Move to In Progress',
            'in_progress': 'Move to Review',
            'review': 'Move to Testing',
            'testing': 'Mark as Done',
            'done': 'Move to Completed'
        };
        return buttonTexts[currentStatus as keyof typeof buttonTexts];
    };

    const handleStatusChange = () => {
        const nextStatus = getNextStatus(task.status);
        if (nextStatus && onStatusChange) {
            onStatusChange(task.id, nextStatus);
            onClose();
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(task.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="md">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{task.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="mt-1 text-sm text-gray-900">{task.status}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <p className="mt-1 text-sm text-gray-900">{task.priority || 'Medium'}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                    <p className="mt-1 text-sm text-gray-900">{task.assignee || 'Unassigned'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <p className="mt-1 text-sm text-gray-900">{task.start_date || 'Not set'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <p className="mt-1 text-sm text-gray-900">{task.end_date || 'Not set'}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                    <p className="mt-1 text-sm text-gray-900">{task.estimated_hours || 'Not set'}</p>
                </div>
                 <div className="flex justify-end space-x-3 pt-4">
                     {task.status === 'completed' ? (
                         <Button onClick={handleDelete} variant="danger">
                             Delete Task
                         </Button>
                     ) : (
                         getNextStatus(task.status) && (
                             <Button onClick={handleStatusChange} variant="primary">
                                 {getButtonText(task.status)}
                             </Button>
                         )
                     )}
                     <Button onClick={onClose} variant="outline">
                         Close
                     </Button>
                 </div>
            </div>
        </Modal>
    );
}