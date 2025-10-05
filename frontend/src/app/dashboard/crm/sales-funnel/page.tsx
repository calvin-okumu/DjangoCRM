"use client";

import React, { useState } from 'react';
import { Funnel, Users, Target, CheckCircle } from 'lucide-react';
import MetricsBar from '../components/MetricsBar';
import ClientsSection from '../components/ClientsSection';
import AddClientModal from '../components/AddClientModal';

export default function SalesFunnelPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const metrics = [
        {
            title: "Leads",
            value: 0,
            label: "Top of funnel",
            icon: Users,
            color: "border-blue-200",
        },
        {
            title: "Qualified Prospects",
            value: 0,
            label: "Qualified leads",
            icon: Target,
            color: "border-yellow-200",
        },
        {
            title: "Opportunities",
            value: 0,
            label: "Sales opportunities",
            icon: Funnel,
            color: "border-purple-200",
        },
        {
            title: "Closed Deals",
            value: 0,
            label: "Won customers",
            icon: CheckCircle,
            color: "border-green-200",
        },
    ];

    const filters = [
        {
            options: [
                { value: "all", label: "All Stages" },
                { value: "leads", label: "Leads" },
                { value: "prospects", label: "Prospects" },
                { value: "opportunities", label: "Opportunities" },
                { value: "customers", label: "Customers" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Sources" },
                { value: "inbound", label: "Inbound" },
                { value: "outbound", label: "Outbound" },
                { value: "referrals", label: "Referrals" },
                { value: "marketing", label: "Marketing" },
            ],
            defaultValue: "all",
        },
        {
            options: [
                { value: "all", label: "All Time" },
                { value: "this_month", label: "This Month" },
                { value: "last_30_days", label: "Last 30 Days" },
                { value: "last_90_days", label: "Last 90 Days" },
            ],
            defaultValue: "all",
        },
    ];

    const emptyState = {
        icon: Funnel,
        title: "Sales Funnel is Empty",
        description: "Your sales funnel hasn't been populated yet. Start by adding leads and tracking their progress through your sales process.",
        buttonText: "+ Add Your First Lead",
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <MetricsBar metrics={metrics} />
            <ClientsSection
                title="Sales Funnel"
                addButtonText="Add Lead"
                onAdd={() => setIsModalOpen(true)}
                filters={filters}
                emptyState={emptyState}
            />
            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Lead"
                fields={[
                    {
                        name: "leadName",
                        label: "Lead Name",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "leadSource",
                        label: "Lead Source",
                        type: "select",
                        options: [
                            { value: "website", label: "Website" },
                            { value: "social_media", label: "Social Media" },
                            { value: "referral", label: "Referral" },
                            { value: "cold_outreach", label: "Cold Outreach" },
                            { value: "trade_show", label: "Trade Show" },
                            { value: "advertising", label: "Advertising" },
                        ],
                        defaultValue: "website",
                    },
                    {
                        name: "contactInfo",
                        label: "Contact Information",
                        type: "text",
                        placeholder: "Email or phone number",
                        required: true,
                    },
                    {
                        name: "company",
                        label: "Company",
                        type: "text",
                        placeholder: "Company name (if applicable)",
                    },
                    {
                        name: "estimatedValue",
                        label: "Estimated Deal Value",
                        type: "text",
                        placeholder: "e.g. $25,000",
                    },
                    {
                        name: "currentStage",
                        label: "Current Stage",
                        type: "select",
                        options: [
                            { value: "lead", label: "Lead" },
                            { value: "qualified_prospect", label: "Qualified Prospect" },
                            { value: "opportunity", label: "Opportunity" },
                            { value: "negotiation", label: "Negotiation" },
                            { value: "closed_won", label: "Closed Won" },
                        ],
                        defaultValue: "lead",
                    },
                    {
                        name: "priority",
                        label: "Priority Level",
                        type: "select",
                        options: [
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" },
                            { value: "urgent", label: "Urgent" },
                        ],
                        defaultValue: "medium",
                    },
                    {
                        name: "notes",
                        label: "Lead Notes",
                        type: "textarea",
                        placeholder: "Additional information about this lead...",
                    },
                ]}
                onSubmit={(data: Record<string, string>) => console.log("Adding lead:", data)}
                submitButtonText="Add Lead"
            />
        </div>
    );
}