"use client";

import React from "react";

interface SummaryCardProps {
    title: string;
    count: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    linkText?: string;
    actionButton?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    count,
    subtitle,
    icon: Icon,
    color,
    linkText,
    actionButton,
}) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-${color}-500`}>
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
                {actionButton}
                <Icon className={`h-8 w-8 text-${color}-500`} />
            </div>
        </div>
        {linkText && (
            <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                {linkText} →
            </button>
        )}
    </div>
);

export default SummaryCard;