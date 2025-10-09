"use client";

import React from "react";
import TaskCard from "./TaskCard";
import type { Task } from "@/api";

interface KanbanColumnProps {
    title: string;
    tasks: Task[];
    color: string;
    onStatusChange?: (taskId: number, newStatus: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tasks, color, onStatusChange }) => {
    return (
        <div className={`rounded-lg shadow p-4 min-h-[500px] ${color}`}>
            <h3 className="font-semibold mb-4 text-gray-900 flex items-center justify-between">
                {title}
                <span className="text-sm bg-white px-2 py-1 rounded-full">
                    {tasks.length}
                </span>
            </h3>
            <div className="space-y-3">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
                    ))
                ) : (
                    <div className="text-gray-500 text-sm text-center py-12">
                        No tasks in {title.toLowerCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;