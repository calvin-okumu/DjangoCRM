"use client";

import React, { useState } from 'react';
import { Users, CheckCircle, Eye, Clock } from 'lucide-react';
import MetricsBar from '../../../../components/dashboard/crm/MetricsBar';
import ClientsSection from '../../../../components/dashboard/crm/ClientsSection';
import AddClientModal from '../../../../components/dashboard/crm/AddClientModal';
import { useClients } from '../../../../hooks/useClients';
import { Client } from '../../../../api';

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const { clients, currentTenant, error, loading, addClient, editClient, removeClient, setError } = useClients();

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

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDeleteClient = async (clientId: number) => {
        if (!confirm("Are you sure you want to delete this client?")) return;
        await removeClient(clientId);
    };

    const handleSubmitClient = async (data: Record<string, string>) => {
        if (!currentTenant) {
            setError("No tenant found. Please contact support.");
            return;
        }

        const clientData = {
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            status: data.status,
            tenant: currentTenant.tenant
        };

        if (editingClient) {
            await editClient(editingClient.id, clientData);
        } else {
            await addClient(clientData);
        }

        // Close modal
        setIsModalOpen(false);
        setEditingClient(null);
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}
            <MetricsBar metrics={metrics} />
            <ClientsSection
                title="Clients"
                addButtonText="Add Client"
                onAdd={() => { setEditingClient(null); setIsModalOpen(true); }}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                filters={filters}
                emptyState={emptyState}
                clients={clients}
                loading={loading}
            />
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
                title={editingClient ? "Edit Client" : "Add New Client"}
                fields={[
                    {
                        name: "name",
                        label: "Client Name",
                        type: "text",
                        required: true,
                        defaultValue: editingClient?.name || "",
                    },
                    {
                        name: "email",
                        label: "Email",
                        type: "text",
                        required: true,
                        defaultValue: editingClient?.email || "",
                    },
                    {
                        name: "phone",
                        label: "Phone",
                        type: "text",
                        defaultValue: editingClient?.phone || "",
                    },
                    {
                        name: "status",
                        label: "Status",
                        type: "select",
                        options: [
                            { value: "prospect", label: "Prospect" },
                            { value: "active", label: "Active" },
                        ],
                        defaultValue: editingClient?.status || "prospect",
                    },
                ]}
                onSubmit={handleSubmitClient}
                submitButtonText={editingClient ? "Update Client" : "+ Add Client"}
            />
        </div>
    );
}