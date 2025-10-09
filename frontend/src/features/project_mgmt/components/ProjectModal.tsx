"use client";

import React, { useEffect, useState } from "react";
import { getClients } from "@/api/crm";
import BaseModal from "../../shared/components/ui/BaseModal";
import type { FormField } from "../../shared/components/ui/FormField";
import type { Client } from "@/api";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (projectData: {
        name: string;
        client: number;
        status: string;
        priority: string;
        start_date: string;
        end_date: string;
        budget?: string;
        tags?: string;
        team_members?: number[];
        access_groups?: number[];
    }) => void;
    editingProject?: {
        name?: string;
        client?: number;
        status?: string;
        priority?: string;
        start_date?: string;
        end_date?: string;
        budget?: string;
        tags?: string;
    } | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingProject,
}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    useEffect(() => {
        if (isOpen && token) {
            setLoadingClients(true);
            getClients(token)
                .then(setClients)
                .catch(console.error)
                .finally(() => setLoadingClients(false));
        }
    }, [isOpen, token]);
    const fields: FormField[] = [
        {
            name: "name",
            label: "Project Name",
            type: "text",
            required: true,
            defaultValue: editingProject?.name || "",
        },
        {
            name: "client",
            label: "Client",
            type: "select",
            options: clients.map(client => ({ value: client.id.toString(), label: client.name })),
            required: true,
            defaultValue: editingProject?.client?.toString() || "",
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { value: "planning", label: "Planning" },
                { value: "active", label: "Active" },
                { value: "on_hold", label: "On Hold" },
                { value: "completed", label: "Completed" },
            ],
            defaultValue: editingProject?.status || "planning",
        },
        {
            name: "priority",
            label: "Priority",
            type: "select",
            options: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
            ],
            defaultValue: editingProject?.priority || "medium",
        },
        {
            name: "start_date",
            label: "Start Date",
            type: "date",
            required: true,
            defaultValue: editingProject?.start_date || "",
        },
        {
            name: "end_date",
            label: "End Date",
            type: "date",
            required: true,
            defaultValue: editingProject?.end_date || "",
        },
        {
            name: "budget",
            label: "Budget",
            type: "text",
            defaultValue: editingProject?.budget || "",
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            defaultValue: editingProject?.tags || "",
        },
    ];

    const handleSubmit = (data: Record<string, any>) => {
        if (!data.client || data.client === "") {
            alert("Please select a client.");
            return;
        }
        const clientId = parseInt(data.client);
        if (isNaN(clientId)) {
            alert("Invalid client selected.");
            return;
        }
        const projectData = {
            name: data.name,
            client: clientId,
            status: data.status,
            priority: data.priority,
            start_date: data.start_date,
            end_date: data.end_date,
            budget: data.budget || undefined,
            tags: data.description || undefined,
            team_members: [], // TODO
            access_groups: [], // TODO
        };
        onSubmit(projectData);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingProject ? "Edit Project" : "Add New Project"}
            fields={fields}
            onSubmit={handleSubmit}
            submitButtonText={editingProject ? "Update Project" : "Create Project"}
        />
    );
};

export default ProjectModal;