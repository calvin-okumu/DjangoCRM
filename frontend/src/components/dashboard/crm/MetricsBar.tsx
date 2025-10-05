"use client";

import React from 'react';

interface Metric {
    title: string;
    value: number;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const MetricCard: React.FC<Metric> = ({ title, value, label, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow duration-200 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <Icon className="h-8 w-8 text-gray-400" />
        </div>
    </div>
);

interface MetricsBarProps {
    metrics: Metric[];
}

const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
            ))}
        </div>
    );
};

export default MetricsBar;