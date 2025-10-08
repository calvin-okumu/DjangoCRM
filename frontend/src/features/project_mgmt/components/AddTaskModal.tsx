"use client";

import React from "react";
import BaseModal from "../../shared/components/ui/BaseModal";
import type { FormField } from "../../shared/components/ui/FormField";
import type { User } from "@/api";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskCreateData) => void;
    tenantMembers: User[];
    defaultSprintId?: number;
}

type TaskCreateData = {
    title: string;
    description?: string;
    status: string;
    assignee?: number;
    start_date?: string;
    end_date?: string;
    estimated_hours?: number;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    tenantMembers,
    defaultSprintId,
}) => {
    const fields: FormField[] = [
        {
            name: "title",
            label: "Task Title",
            type: "text",
            required: true,
            placeholder: "Enter task title",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter task description",
        },

        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "to_do", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "in_review", label: "In Review" },
                { value: "done", label: "Done" },
            ],
            defaultValue: "to_do",
        },
        {
            name: "assignee",
            label: "Assignee",
            type: "select",
            placeholder: "Select assignee (optional)",
            options: [
                { value: "", label: "Unassigned" },
                ...tenantMembers.map((user: User) => ({
                    value: user.id.toString(),
                    label: `${user.first_name} ${user.last_name}`
                }))
            ],
        },
        {
            name: "start_date",
            label: "Start Date",
            type: "date",
            placeholder: "Select start date",
        },
        {
            name: "end_date",
            label: "End Date",
            type: "date",
            placeholder: "Select end date",
        },
        {
            name: "estimated_hours",
            label: "Estimated Hours",
            type: "number",
            placeholder: "Enter estimated hours",
        },
    ];

    const handleSubmit = (data: Record<string, unknown>) => {
        // Construct task data with proper typing
        const taskData: TaskCreateData = {
            title: data.title as string,
            status: data.status as string,
            description: (data.description as string) || undefined,
            assignee: data.assignee ? parseInt(data.assignee as string) : undefined,
            start_date: (data.start_date as string) || undefined,
            end_date: (data.end_date as string) || undefined,
            estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours as string) : undefined,
        };
        onSubmit(taskData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Task"
            fields={fields}
            onSubmit={handleSubmit}
            submitButtonText="Create Task"
        />
    );
};

export default AddTaskModal;