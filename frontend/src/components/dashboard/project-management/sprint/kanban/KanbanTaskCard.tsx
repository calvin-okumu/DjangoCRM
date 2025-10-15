import React from 'react';
import Card from '@/components/ui/Card';
import type { Task } from '@/api/types';

interface KanbanTaskCardProps {
    task: Task;
    onClick: () => void;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
    const styles: Record<string, string> = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[priority] || styles.medium}`}>
            {priority}
        </span>
    );
};

export default function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
    return (
        <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
            <div className="p-3">
                <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                <div className="flex justify-between items-center">
                    <PriorityBadge priority={task.priority} />
                    <div className="text-xs text-gray-500">
                        {task.assignee && <span>Assigned to: {task.assignee}</span>}
                        {task.estimated_hours && <span className="ml-2">{task.estimated_hours}h</span>}
                    </div>
                </div>
            </div>
        </Card>
    );
}