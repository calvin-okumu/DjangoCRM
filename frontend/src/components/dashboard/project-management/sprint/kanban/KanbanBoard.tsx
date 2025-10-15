import React from 'react';
import KanbanColumn from './KanbanColumn';
import type { Task } from '@/api/types';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
    const columns = [
        { id: 'todo', title: 'To Do', status: 'todo' },
        { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
        { id: 'review', title: 'Review', status: 'review' },
        { id: 'done', title: 'Done', status: 'done' }
    ];

    const tasksByStatus = columns.reduce((acc, column) => {
        acc[column.id] = tasks.filter(task => task.status === column.status);
        return acc;
    }, {} as Record<string, Task[]>);

    return (
        <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map(column => (
                <KanbanColumn
                    key={column.id}
                    title={column.title}
                    tasks={tasksByStatus[column.id]}
                    status={column.status}
                    onTaskClick={onTaskClick}
                />
            ))}
        </div>
    );
}