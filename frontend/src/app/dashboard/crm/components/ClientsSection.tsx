"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Loader, Search } from 'lucide-react';
import { Client } from '../../../../api/types';
import Pagination from '../../../../components/shared/Pagination';

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
    onEdit?: (client: Client) => void;
    onDelete?: (clientId: number) => void;
    searchPlaceholder?: string;
    filters: Filter[];
    emptyState: EmptyState;
    clients?: Client[];
    loading?: boolean;
}

const ClientsSection: React.FC<ClientsSectionProps> = ({
    title,
    addButtonText,
    onAdd,
    onEdit,
    onDelete,
    searchPlaceholder,
    filters,
    emptyState,
    clients,
    loading = false
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    const filteredClients = useMemo(() => {
        if (!clients) return [];
        let filtered = clients;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply other filters here if needed
        return filtered;
    }, [clients, searchTerm]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };
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

            {searchPlaceholder && (
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md hover:shadow-lg transition-shadow duration-200"
                        />
                    </div>
                </div>
            )}

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
                loading ? (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-12 text-center">
                        <Loader className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading clients...</h3>
                        <p className="text-gray-600">Please wait while we fetch your clients.</p>
                    </div>
                ) : (
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
                )
            ) : (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Projects
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-blue-600">
                                                {client.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {client.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {client.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    client.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {client.projects_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(client)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(client.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredClients.length}
                    />
                </div>
            )}
        </div>
    );
};

export default ClientsSection;
