"use client";

import React from "react";

interface StatItemProps {
    label: string;
    value: string | number;
    color?: string;
    subtext?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color, subtext }) => (
    <div className="text-center">
        <div className={`text-3xl font-bold text-${color || "gray"}-600`}>{value}</div>
        <p className="text-sm text-gray-600">{label}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
);

export default StatItem;