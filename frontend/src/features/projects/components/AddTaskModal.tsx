"use client";

import React from 'react';
import BaseModal from '@/features/shared/components/ui/BaseModal';
import { Milestone, Sprint, User } from '@/features/shared/types/common';
import type { FormField } from '@/features/shared/components/ui/FormField';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: TaskFormData) => void;
    loading?: boolean;
    milestones?: Milestone[];
    sprints?: Sprint[];
    tenantMembers?: User[];
    initialData?: Partial<TaskFormData>;
}

export interface TaskFormData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    milestone_id: number;
    sprint_id?: number;
    assignee?: number;
    estimated_hours?: number;
    start_date?: string;
    end_date?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
    isOpen,
    onClose,
    onSave,
    loading = false,
    milestones = [],
    sprints = [],
    tenantMembers = [],
    initialData
}) => {
    const fields: FormField[] = [
        {
            name: "title",
            label: "Title",
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
            name: "priority",
            label: "Priority",
            type: "select",
            required: true,
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
            ],
            defaultValue: "medium",
        },
        {
            name: "milestone_id",
            label: "Milestone",
            type: "select",
            required: true,
            options: [
                { value: "", label: "Select Milestone" },
                ...milestones.map((milestone) => ({
                    value: milestone.id.toString(),
                    label: milestone.name
                }))
            ],
        },
        {
            name: "sprint_id",
            label: "Sprint (Optional)",
            type: "select",
            options: [
                { value: "", label: "No Sprint" },
                ...sprints.map((sprint) => ({
                    value: sprint.id.toString(),
                    label: sprint.name
                }))
            ],
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
            name: "estimated_hours",
            label: "Estimated Hours",
            type: "number",
            placeholder: "0",
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
    ];

    const handleSubmit = (data: Record<string, unknown>) => {
        // Construct task data with proper typing
        const taskData: TaskFormData = {
            title: data.title as string,
            description: (data.description as string) || '',
            priority: data.priority as TaskFormData['priority'],
            milestone_id: parseInt(data.milestone_id as string),
            sprint_id: data.sprint_id ? parseInt(data.sprint_id as string) : undefined,
            assignee: data.assignee ? parseInt(data.assignee as string) : undefined,
            estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours as string) : undefined,
            start_date: (data.start_date as string) || undefined,
            end_date: (data.end_date as string) || undefined,
        };
        onSave(taskData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Task"
            fields={fields}
            onSubmit={handleSubmit}
            submitButtonText="Save Task"
            initialData={initialData}
        />
    );
};

export default AddTaskModal;
