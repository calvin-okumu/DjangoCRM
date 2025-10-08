"use client";

import React from "react";

interface Filter {
    options: { value: string; label: string }[];
}

interface FiltersSectionProps {
    filters: Filter[];
    selectedValues: string[];
    onChange: (index: number, value: string) => void;
    onClear: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ filters, selectedValues, onChange, onClear }) => {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
            {filters.map((f, i) => (
                <select
                    key={i}
                    value={selectedValues[i]}
                    onChange={(e) => onChange(i, e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    {f.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ))}
            <button
                onClick={onClear}
                className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
                Clear Filters
            </button>
        </div>
    );
};

export default FiltersSection;