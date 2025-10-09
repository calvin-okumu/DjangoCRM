"use client";

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Target, Users } from 'lucide-react';
import MetricsBar from '../components/MetricsBar';
import ClientsSection from '../components/ClientsSection';
import AddClientModal from '../components/AddClientModal';

export default function SalesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const metrics = [
        {
            title: "Total Revenue",
            value: 0,
            label: "All time sales",
            icon: DollarSign,
            color: "border-green-200",
        },
        {
            title: "Deals Closed",
            value: 0,
            label: "Won opportunities",
            icon: Target,
            color: "border-blue-200",
        },
        {
            title: "Conversion Rate",
            value: 0,
            label: "Lead to customer",
            icon: TrendingUp,
            color: "border-purple-200",
        },
        {
            title: "Active Deals",
            value: 0,
            label: "In pipeline",
            icon: Users,
            color: "border-orange-200",
        },
    ];

    const filters = [
        {
            options: [
                { value: "all", label: "All Deals" },
                { value: "open", label: "Open" },
                { value: "won", label: "Won" },
                { value: "lost", label: "Lost" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Stages" },
                { value: "prospecting", label: "Prospecting" },
                { value: "qualification", label: "Qualification" },
                { value: "proposal", label: "Proposal" },
                { value: "negotiation", label: "Negotiation" },
                { value: "closed", label: "Closed" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Time" },
                { value: "this_month", label: "This Month" },
                { value: "this_quarter", label: "This Quarter" },
                { value: "this_year", label: "This Year" },
            ],
            defaultValue: "all",
        },
    ];

    const emptyState = {
        icon: DollarSign,
        title: "No Sales Deals Found",
        description: "You haven't created any sales deals yet. Start tracking your sales pipeline by creating your first deal.",
        buttonText: "+ Create Your First Deal",
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <MetricsBar metrics={metrics} />
            <ClientsSection
                title="Sales Pipeline"
                addButtonText="Add Deal"
                onAdd={() => setIsModalOpen(true)}
                filters={filters}
                emptyState={emptyState}
            />
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Deal"
                fields={[
                    {
                        name: "dealName",
                        label: "Deal Name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "dealValue",
                        label: "Deal Value",
                        type: "text",
                        placeholder: "e.g. $10,000",
                        required: true,
                    },
                    {
                        name: "stage",
                        label: "Sales Stage",
                        type: "select",
                        options: [
                            { value: "prospecting", label: "Prospecting" },
                            { value: "qualification", label: "Qualification" },
                            { value: "proposal", label: "Proposal" },
                            { value: "negotiation", label: "Negotiation" },
                            { value: "closed_won", label: "Closed Won" },
                            { value: "closed_lost", label: "Closed Lost" },
                        ],
                        defaultValue: "prospecting",
                    },
                    {
                        name: "probability",
                        label: "Win Probability (%)",
                        type: "text",
                        placeholder: "e.g. 75",
                    },
                    {
                        name: "expectedCloseDate",
                        label: "Expected Close Date",
                        type: "text",
                        placeholder: "YYYY-MM-DD",
                    },
                    {
                        name: "contactName",
                        label: "Contact Name",
                        type: "text",
                        placeholder: "Primary contact for this deal",
                    },
                    {
                        name: "companyName",
                        label: "Company Name",
                        type: "text",
                        placeholder: "Company associated with the deal",
                    },
                    {
                        name: "notes",
                        label: "Deal Notes",
                        type: "textarea",
                        placeholder: "Additional details about this sales opportunity...",
                    },
                ]}
                onSubmit={(data: Record<string, string>) => console.log("Creating deal:", data)}
                submitButtonText="Create Deal"
            />
        </div>
    );
}