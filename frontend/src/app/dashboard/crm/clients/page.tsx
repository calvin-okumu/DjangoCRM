"use client";

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Eye, Clock } from 'lucide-react';
import MetricsBar from '../../../../components/dashboard/crm/MetricsBar';
import ClientsSection from '../../../../components/dashboard/crm/ClientsSection';
import AddClientModal from '../../../../components/dashboard/crm/AddClientModal';
import { getClients, Client } from '../../../../api/api';

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchClients = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await getClients(token);
                    setClients(data);
                } catch (error) {
                    console.error('Failed to fetch clients:', error);
                }
            }
        };
        fetchClients();
    }, []);

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const prospects = clients.filter(c => c.status === 'prospect').length;
    const recentClients = clients.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

    const metrics = [
        {
            title: "Total Clients",
            value: totalClients,
            label: "All clients",
            icon: Users,
            color: "border-gray-200",
        },
        {
            title: "Active Clients",
            value: activeClients,
            label: "Revenue generating",
            icon: CheckCircle,
            color: "border-green-200",
        },
        {
            title: "Prospects",
            value: prospects,
            label: "Potential clients",
            icon: Eye,
            color: "border-blue-200",
        },
        {
            title: "Recent (30d)",
            value: recentClients,
            label: `New additions: ${recentClients}`,
            icon: Clock,
            color: "border-orange-200",
        },
    ];

    const filters = [
        {
            options: [
                { value: "all", label: "All Time" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 90 days" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Stages" },
                { value: "prospect", label: "Prospect" },
                { value: "active", label: "Active" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Industries" },
                { value: "technology", label: "Technology" },
                { value: "finance", label: "Finance" },
            ],
            defaultValue: "all",
        },
    ];

    const emptyState = {
        icon: Users,
        title: "No Clients Found",
        description: "You haven't added any clients yet. Start building your client list by adding your first client.",
        buttonText: "+ Add Your First Client",
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <MetricsBar metrics={metrics} />
            <ClientsSection
                title="Clients"
                addButtonText="Add Client"
                onAdd={() => setIsModalOpen(true)}
                filters={filters}
                emptyState={emptyState}
                clients={clients}
            />
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Client"
                fields={[
                    {
                        name: "clientName",
                        label: "Client Name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "entityType",
                        label: "Entity Type",
                        type: "select",
                        options: [
                            { value: "Company", label: "Company" },
                            { value: "Individual", label: "Individual" },
                        ],
                        defaultValue: "Company",
                    },
                    {
                        name: "lifecycleStage",
                        label: "Lifecycle Stage",
                        type: "select",
                        options: [
                            { value: "Prospect", label: "Prospect" },
                            { value: "Active", label: "Active" },
                            { value: "Inactive", label: "Inactive" },
                        ],
                        defaultValue: "Prospect",
                    },
                    {
                        name: "industry",
                        label: "Industry",
                        type: "select",
                        options: [
                            { value: "", label: "Select industry" },
                            { value: "Technology", label: "Technology" },
                            { value: "Finance", label: "Finance" },
                            { value: "Healthcare", label: "Healthcare" },
                        ],
                    },
                    {
                        name: "website",
                        label: "Website",
                        type: "url",
                        placeholder: "https://example.com",
                    },
                    {
                        name: "description",
                        label: "Description",
                        type: "textarea",
                        placeholder: "Brief description of the client…",
                    },
                ]}
                onSubmit={(data) => console.log("Adding client:", data)}
                submitButtonText="+ Add Client"
            />
        </div>
    );
}