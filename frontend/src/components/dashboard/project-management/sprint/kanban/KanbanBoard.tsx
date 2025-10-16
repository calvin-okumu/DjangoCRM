import React from 'react';
import KanbanColumn from './KanbanColumn';
import type { Task } from '@/api/types';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onStatusChange: (taskId: number, newStatus: string) => void;
}

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
      const columns = [
           { id: 'to_do', title: 'To Do', status: 'to_do' },
           { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
           { id: 'review', title: 'Review', status: 'review' },
           { id: 'testing', title: 'Testing', status: 'testing' }
       ];

      const colorMap: Record<string, string> = {
           to_do: 'bg-gray-100',
           in_progress: 'bg-pink-100',
           review: 'bg-blue-100',
           testing: 'bg-green-100'
       };

      const tasksByStatus = columns.reduce((acc, column) => {
          acc[column.id] = tasks.filter(task => task.status === column.status);
          return acc;
      }, {} as Record<string, Task[]>);

      return (
           <div className="grid grid-cols-4 gap-6 pb-4">
              {columns.map(column => (
                  <KanbanColumn
                      key={column.id}
                      title={column.title}
                      tasks={tasksByStatus[column.id]}
                      status={column.status}
                      color={colorMap[column.status]}
                      onTaskClick={onTaskClick}
                      onStatusChange={onStatusChange}
                  />
              ))}
         </div>
     );
}