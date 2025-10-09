"use client";

import type { Client } from "@/api";
import AddClientModal from "@/features/crm/components/AddClientModal";
import ClientsSection from "@/features/crm/components/ClientsSection";
import MetricsBar from "@/features/crm/components/MetricsBar";
import { useClients } from "@/features/crm/hooks/useClients";
import { CheckCircle, Clock, Eye, Users } from "lucide-react";
import { useState } from "react";
import ToastContainer from "@/features/shared/components/ui/ToastContainer";
import type { ToastMessage } from "@/features/shared/components/ui/Toast";

export default function ClientsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const { clients, currentTenant, error, loading, addClient, editClient, removeClient, setError } = useClients();

    const addToast = (type: "success" | "error", message: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // --- Derived Metrics ---
    const total = clients.length;
    const active = clients.filter(c => c.status === "active").length;
    const prospects = clients.filter(c => c.status === "prospect").length;
    const recent = clients.filter(
        c => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const metrics = [
        { title: "Total Clients", value: total, label: "All clients", icon: Users },
        { title: "Active Clients", value: active, label: "Revenue generating", icon: CheckCircle },
        { title: "Prospects", value: prospects, label: "Potential clients", icon: Eye },
        { title: "Recent (30d)", value: recent, label: `New in 30 days`, icon: Clock },
    ];

    const filters = [
        {
            options: [
                { value: "all", label: "All Time" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 90 days" },
            ],
        },
        {
            options: [
                { value: "all", label: "All Stages" },
                { value: "prospect", label: "Prospect" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
            ],
        },
    ];

    const emptyState = {
        icon: Users,
        title: "No Clients Found",
        description: "Start building your client list by adding your first client.",
        buttonText: "+ Add Client",
    };

    // --- Handlers ---
    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Delete this client?")) {
            try {
                await removeClient(id);
                addToast("success", "Client deleted successfully!");
            } catch (err) {
                addToast("error", err instanceof Error ? err.message : "Failed to delete client");
            }
        }
    };

    const handleSubmit = async (formData: Record<string, string>) => {
        if (!currentTenant) return setError("No tenant found. Contact support.");

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            status: formData.status,
            tenant: currentTenant.tenant,
        };

        try {
            if (editingClient) {
                await editClient(editingClient.id, payload);
                addToast("success", "Client updated successfully!");
            } else {
                await addClient(payload);
                addToast("success", "Client created successfully!");
            }
            setIsModalOpen(false);
            setEditingClient(null);
        } catch (err) {
            addToast("error", err instanceof Error ? err.message : "Failed to save client");
        }
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-6 py-10">
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
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Search clients..."
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
                    { name: "name", label: "Client Name", type: "text", required: true, defaultValue: editingClient?.name },
                    { name: "email", label: "Email", type: "text", required: true, defaultValue: editingClient?.email },
                    { name: "phone", label: "Phone", type: "text", defaultValue: editingClient?.phone },
                    {
                        name: "status",
                        label: "Status",
                        type: "select",
                        options: [
                            { value: "prospect", label: "Prospect" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                        ],
                        defaultValue: editingClient?.status ?? "prospect",
                    },
                ]}
                onSubmit={handleSubmit}
                submitButtonText={editingClient ? "Update" : "+ Add Client"}
            />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}
