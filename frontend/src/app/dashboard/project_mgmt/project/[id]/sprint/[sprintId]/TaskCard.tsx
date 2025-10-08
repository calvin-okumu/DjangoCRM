"use client";

import React from "react";
import type { Task } from "@/api";

interface TaskCardProps {
    task: Task;
    onStatusChange?: (taskId: number, newStatus: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
    const getNextStatus = (currentStatus: string) => {
        const statusFlow = {
            'to_do': 'in_progress',
            'in_progress': 'in_review',
            'in_review': 'done',
            'done': 'completed'
        };
        return statusFlow[currentStatus as keyof typeof statusFlow];
    };

    const getButtonText = (currentStatus: string) => {
        const buttonTexts = {
            'to_do': 'Move to Progress',
            'in_progress': 'Move to Review',
            'in_review': 'Mark as Done',
            'done': 'Mark as Completed'
        };
        return buttonTexts[currentStatus as keyof typeof buttonTexts];
    };

    const handleStatusChange = () => {
        const nextStatus = getNextStatus(task.status);
        if (nextStatus && onStatusChange) {
            onStatusChange(task.id, nextStatus);
        }
    };

    const canChangeStatus = task.status !== 'completed' && getNextStatus(task.status);

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h4 className="font-medium text-sm mb-2">{task.title}</h4>
            {task.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-3">{task.description}</p>
            )}
            <div className="space-y-2 text-xs text-gray-500 mb-3">
                <p>Milestone: {task.milestone_name}</p>
                 {task.assignee_name && <p>Assignee: {task.assignee_name}</p>}
                {task.estimated_hours && <p>Est. Hours: {task.estimated_hours}</p>}
                {task.start_date && <p>Start: {new Date(task.start_date).toLocaleDateString()}</p>}
                {task.end_date && <p>Due: {new Date(task.end_date).toLocaleDateString()}</p>}
            </div>
            {canChangeStatus && onStatusChange && (
                <button
                    onClick={handleStatusChange}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded transition-colors"
                >
                    {getButtonText(task.status)}
                </button>
            )}
        </div>
    );
};

export default TaskCard;