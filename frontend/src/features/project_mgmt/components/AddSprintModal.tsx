"use client";

import React from "react";
import BaseModal from "../../shared/components/ui/BaseModal";
import type { FormField } from "../../shared/components/ui/FormField";
import type { Milestone } from "@/api";

interface AddSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SprintCreateData) => void;
    milestones: Milestone[];
    editingSprint?: Sprint | null;
}

type SprintCreateData = {
    name: string;
    status: string;
    start_date?: string;
    end_date?: string;
    milestone: number;
};

const AddSprintModal: React.FC<AddSprintModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    milestones,
    editingSprint,
}) => {
    const fields: FormField[] = [
        {
            name: "name",
            label: "Sprint Name",
            type: "text",
            required: true,
            placeholder: "Enter sprint name",
        },
        {
            name: "milestone",
            label: "Milestone",
            type: "select",
            required: true,
            options: milestones.map(milestone => ({
                value: milestone.id.toString(),
                label: milestone.name,
            })),
            placeholder: "Select a milestone",
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "planned", label: "Planned" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "canceled", label: "Canceled" },
            ],
            defaultValue: "planned",
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
        // Construct sprint data with proper typing
        const sprintData: SprintCreateData = {
            name: data.name as string,
            status: data.status as string,
            milestone: parseInt(data.milestone as string),
            start_date: (data.start_date as string) || undefined,
            end_date: (data.end_date as string) || undefined,
        };
        onSubmit(sprintData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingSprint ? "Edit Sprint" : "Add New Sprint"}
            fields={fields}
            onSubmit={handleSubmit}
            submitButtonText={editingSprint ? "Update Sprint" : "Create Sprint"}
            initialData={editingSprint ? {
                name: editingSprint.name,
                milestone: editingSprint.milestone.toString(),
                status: editingSprint.status,
                start_date: editingSprint.start_date || "",
                end_date: editingSprint.end_date || "",
            } : undefined}
        />
    );
};

export default AddSprintModal;