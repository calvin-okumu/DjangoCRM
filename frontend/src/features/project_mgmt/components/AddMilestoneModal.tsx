"use client";

import React from "react";
import BaseModal from "../../shared/components/ui/BaseModal";
import type { FormField } from "../../shared/components/ui/FormField";
import type { User } from "@/api";

type MilestoneCreateData = {
    name: string;
    description?: string;
    status: string;
    planned_start?: string;
    actual_start?: string;
    due_date?: string;
    assignee?: number;
    project: number;
};

interface AddMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MilestoneCreateData) => void;
    projectId: number;
    allUsers: User[];
    editingMilestone?: Milestone | null;
}

const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    projectId,
    allUsers,
    editingMilestone,
}) => {
    const fields: FormField[] = [
        {
            name: "name",
            label: "Milestone Name",
            type: "text",
            required: true,
            placeholder: "Enter milestone name",
            defaultValue: editingMilestone?.name || "",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter milestone description",
            defaultValue: editingMilestone?.description || "",
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "planning", label: "Planning" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
            ],
            defaultValue: editingMilestone?.status || "planning",
        },
        {
            name: "planned_start",
            label: "Planned Start Date",
            type: "date",
            placeholder: "Select planned start date",
            defaultValue: editingMilestone?.planned_start ? editingMilestone.planned_start.split('T')[0] : "",
        },
        {
            name: "due_date",
            label: "Due Date",
            type: "date",
            placeholder: "Select due date",
            defaultValue: editingMilestone?.due_date ? editingMilestone.due_date.split('T')[0] : "",
        },
        {
            name: "assignee",
            label: "Assignee",
            type: "select",
            placeholder: "Select assignee (optional)",
            options: [
                { value: "", label: "Unassigned" },
                ...allUsers.map((user: User) => ({
                    value: user.id.toString(),
                    label: `${user.first_name} ${user.last_name}`
                }))
            ],
            defaultValue: editingMilestone?.assignee?.toString() || "",
        },
    ];

    const handleSubmit = (data: Record<string, unknown>) => {
        // Construct milestone data with proper typing
        const milestoneData: MilestoneCreateData = {
            name: data.name as string,
            status: data.status as string,
            project: projectId,
            description: (data.description as string) || undefined,
            planned_start: (data.planned_start as string) || undefined,
            due_date: (data.due_date as string) || undefined,
            assignee: data.assignee ? parseInt(data.assignee as string) : undefined,
        };
        onSubmit(milestoneData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingMilestone ? "Edit Milestone" : "Add New Milestone"}
            fields={fields}
            onSubmit={handleSubmit}
            submitButtonText={editingMilestone ? "Update Milestone" : "Create Milestone"}
        />
    );
};

export default AddMilestoneModal;