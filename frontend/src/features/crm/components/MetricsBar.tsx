"use client";

import React from "react";

interface Metric {
    title: string;
    value: number;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const MetricCard: React.FC<Metric> = ({ title, value, label, icon: Icon }) => (
    <div className="bg-white rounded-lg border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
            </div>
            <Icon className="h-8 w-8 text-gray-400" />
        </div>
    </div>
);

const MetricsBar: React.FC<{ metrics: Metric[] }> = ({ metrics }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, i) => (
            <MetricCard key={i} {...m} />
        ))}
    </div>
);

export default MetricsBar;
