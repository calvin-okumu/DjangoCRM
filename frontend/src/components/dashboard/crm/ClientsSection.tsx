"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Client } from '../../../api/api';

interface FilterOption {
    value: string;
    label: string;
}

interface Filter {
    options: FilterOption[];
    defaultValue?: string;
}

interface EmptyState {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
}

interface ClientsSectionProps {
    title: string;
    addButtonText: string;
    onAdd: () => void;
    filters: Filter[];
    emptyState: EmptyState;
    clients?: Client[];
}

const ClientsSection: React.FC<ClientsSectionProps> = ({
    title,
    addButtonText,
    onAdd,
    filters,
    emptyState,
    clients
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <button
                    onClick={onAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                    <Plus className="h-5 w-5" />
                    {addButtonText}
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                {filters.map((filter, index) => (
                    <select
                        key={index}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-md hover:shadow-lg transition-shadow duration-200"
                        defaultValue={filter.defaultValue}
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ))}
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 shadow-md hover:shadow-lg transition-shadow duration-200">
                    Clear Filters
                </button>
            </div>

            {(clients || []).length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
                    <emptyState.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
                    <p className="text-gray-600 mb-6">
                        {emptyState.description}
                    </p>
                <button
                    onClick={onAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                        {emptyState.buttonText}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(clients || []).map((client) => (
                        <div key={client.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.name}</h3>
                            <p className="text-gray-600 mb-1">{client.email}</p>
                            {client.phone && <p className="text-gray-500 text-sm mb-2">{client.phone}</p>}
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                client.status === 'active' ? 'bg-green-100 text-green-800' :
                                client.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {client.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientsSection;