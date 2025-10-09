"use client";

import AddClientModal from "@/features/crm/components/AddClientModal";
import ClientsSection from "@/features/crm/components/ClientsSection";
import MetricsBar from "@/features/crm/components/MetricsBar";
import { Calendar, DollarSign, Mail, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function CampaignsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const metrics = [
        {
            title: "Total Campaigns",
            value: 0,
            label: "All campaigns created",
            icon: Mail,
            color: "border-purple-200",
        },
        {
            title: "Active Campaigns",
            value: 0,
            label: "Currently running",
            icon: TrendingUp,
            color: "border-green-200",
        },
        {
            title: "Budget Spent",
            value: 0,
            label: "Total expenditure",
            icon: DollarSign,
            color: "border-blue-200",
        },
        {
            title: "Campaign ROI",
            value: 0,
            label: "Return on investment",
            icon: Calendar,
            color: "border-orange-200",
        },
    ];

    const filters = [
        {
            options: [
                { value: "all", label: "All Campaigns" },
                { value: "active", label: "Active Only" },
                { value: "completed", label: "Completed" },
                { value: "draft", label: "Draft" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Types" },
                { value: "email", label: "Email Marketing" },
                { value: "social", label: "Social Media" },
                { value: "paid", label: "Paid Advertising" },
                { value: "content", label: "Content Marketing" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Time" },
                { value: "this_month", label: "This Month" },
                { value: "last_month", label: "Last Month" },
                { value: "this_quarter", label: "This Quarter" },
            ],
            defaultValue: "all",
        },
    ];

    const emptyState = {
        icon: Mail,
        title: "No Marketing Campaigns Found",
        description: "You haven't created any marketing campaigns yet. Start building your marketing strategy by creating your first campaign.",
        buttonText: "+ Create Your First Campaign",
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <MetricsBar metrics={metrics} />
            <ClientsSection
                title="Marketing Campaigns"
                addButtonText="Create Campaign"
                onAdd={() => setIsModalOpen(true)}
                filters={filters}
                emptyState={emptyState}
                clients={[]}
                loading={false}
            />
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Campaign"
                fields={[
                    {
                        name: "campaignName",
                        label: "Campaign Name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "campaignType",
                        label: "Campaign Type",
                        type: "select",
                        options: [
                            { value: "email", label: "Email Marketing" },
                            { value: "social", label: "Social Media" },
                            { value: "paid", label: "Paid Advertising" },
                            { value: "content", label: "Content Marketing" },
                            { value: "event", label: "Event Marketing" },
                        ],
                        defaultValue: "email",
                    },
                    {
                        name: "targetAudience",
                        label: "Target Audience",
                        type: "select",
                        options: [
                            { value: "all", label: "All Prospects" },
                            { value: "new_leads", label: "New Leads" },
                            { value: "existing_customers", label: "Existing Customers" },
                            { value: "inactive_users", label: "Inactive Users" },
                            { value: "vip_customers", label: "VIP Customers" },
                        ],
                        defaultValue: "all",
                    },
                    {
                        name: "budget",
                        label: "Budget",
                        type: "text",
                        placeholder: "e.g. $5,000",
                    },
                    {
                        name: "startDate",
                        label: "Start Date",
                        type: "text",
                        placeholder: "YYYY-MM-DD",
                    },
                    {
                        name: "endDate",
                        label: "End Date",
                        type: "text",
                        placeholder: "YYYY-MM-DD",
                    },
                    {
                        name: "goals",
                        label: "Campaign Goals",
                        type: "textarea",
                        placeholder: "Describe your campaign objectives and KPIs...",
                    },
                ]}
                onSubmit={(data: Record<string, string>) => console.log("Creating campaign:", data)}
                submitButtonText="Create Campaign"
            />
        </div>
    );
}
