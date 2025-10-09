"use client";

import React, { useState } from 'react';
import { Users, Target } from 'lucide-react';
import MetricsBar from '../components/MetricsBar';
import ClientsSection from '../components/ClientsSection';
import AddClientModal from '../components/AddClientModal';

export default function MarketingPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const metrics = [
        {
            title: "Client Persons",
            value: 0,
            label: "Individual contacts",
            icon: Users,
            color: "border-blue-200",
        },
        {
            title: "Competitors",
            value: 0,
            label: "Tracked competitors",
            icon: Target,
            color: "border-red-200",
        },
    ];

    const filters = [
        {
            options: [
                { value: "all", label: "All Segments" },
                { value: "active", label: "Active Only" },
                { value: "inactive", label: "Inactive" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Types" },
                { value: "demographic", label: "Demographic" },
                { value: "behavioral", label: "Behavioral" },
                { value: "firmographic", label: "Firmographic" },
                { value: "geographic", label: "Geographic" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Sizes" },
                { value: "small", label: "Small (< 100)" },
                { value: "medium", label: "Medium (100-1000)" },
                { value: "large", label: "Large (> 1000)" },
            ],
            defaultValue: "all",
        },
    ];

    const emptyState = {
        icon: Users,
        title: "No Audience Segments Found",
        description: "You haven't created any audience segments yet. Start building your target audiences by creating your first segment.",
        buttonText: "+ Create Your First Segment",
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <MetricsBar metrics={metrics} />
            <ClientsSection
                title="Audience Segments"
                addButtonText="Create Segment"
                onAdd={() => setIsModalOpen(true)}
                filters={filters}
                emptyState={emptyState}
            />
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Segment"
                fields={[
                    {
                        name: "segmentName",
                        label: "Segment Name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "segmentType",
                        label: "Segment Type",
                        type: "select",
                        options: [
                            { value: "demographic", label: "Demographic" },
                            { value: "behavioral", label: "Behavioral" },
                            { value: "firmographic", label: "Firmographic" },
                            { value: "geographic", label: "Geographic" },
                        ],
                        defaultValue: "demographic",
                    },
                    {
                        name: "description",
                        label: "Description",
                        type: "textarea",
                        placeholder: "Describe the criteria for this audience segment...",
                    },
                ]}
                onSubmit={(data: Record<string, string>) => console.log("Creating segment:", data)}
                submitButtonText="Create Segment"
            />
        </div>
    );
}