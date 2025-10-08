"use client";

import React from "react";
import KanbanColumn from "./KanbanColumn";
import type { Task } from "@/api";

interface KanbanBoardProps {
    tasksByStatus: {
        to_do: Task[];
        in_progress: Task[];
        in_review: Task[];
        done: Task[];
    };
    onStatusChange?: (taskId: number, newStatus: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasksByStatus, onStatusChange }) => {
    const columns = [
        { key: "to_do", label: "To Do", color: "bg-gray-100" },
        { key: "in_progress", label: "In Progress", color: "bg-blue-100" },
        { key: "in_review", label: "In Review", color: "bg-yellow-100" },
        { key: "done", label: "Done", color: "bg-green-100" }
    ] as const;

    return (
        <main className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {columns.map(({ key, label, color }) => (
                    <KanbanColumn
                        key={key}
                        title={label}
                        tasks={tasksByStatus[key as keyof typeof tasksByStatus]}
                        color={color}
                        onStatusChange={onStatusChange}
                    />
                ))}
            </div>
        </main>
    );
};

export default KanbanBoard;