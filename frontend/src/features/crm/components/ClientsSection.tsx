"use client";

import type { Client } from "@/api/types";
import React, { useMemo, useState } from "react";
import {
    ClientsHeader,
    SearchBar,
    FiltersSection,
    EmptyState,
    ClientsTable,
} from "./clients-section";
import LoadingSpinner from "@/features/shared/components/ui/LoadingSpinner";

interface Filter {
    options: { value: string; label: string }[];
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
    onDelete?: (id: number) => void;
    searchPlaceholder?: string;
    filters: Filter[];
    emptyState: EmptyState;
    clients: Client[];
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
    loading = false,
}) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<string[]>(filters.map(() => "all"));
    const itemsPerPage = 10;

    const handleFilterChange = (index: number, value: string) => {
        const newFilters = [...selectedFilters];
        newFilters[index] = value;
        setSelectedFilters(newFilters);
    };

    const handleClearFilters = () => {
        setSelectedFilters(filters.map(() => "all"));
    };

    const filtered = useMemo(() => {
        if (!clients) return [];
        let filteredClients = clients.filter(c =>
            [c.name, c.email, c.phone ?? "", c.status]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        // Apply time filter (first filter)
        const timeFilter = selectedFilters[0];
        if (timeFilter !== "all") {
            const days = timeFilter === "30d" ? 30 : 90;
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            filteredClients = filteredClients.filter(c => new Date(c.created_at) >= cutoff);
        }

        // Apply status filter (second filter)
        const statusFilter = selectedFilters[1];
        if (statusFilter !== "all") {
            filteredClients = filteredClients.filter(c => c.status === statusFilter);
        }

        return filteredClients;
    }, [clients, search, selectedFilters]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const visible = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div>
            <ClientsHeader
                title={title}
                addButtonText={addButtonText}
                onAdd={onAdd}
            />

            {searchPlaceholder && (
                <SearchBar
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={setSearch}
                />
            )}

            <FiltersSection
                filters={filters}
                selectedValues={selectedFilters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            {loading ? (
                <LoadingSpinner size="lg" className="py-8" />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                    buttonText={emptyState.buttonText}
                    onAdd={onAdd}
                />
            ) : (
                <ClientsTable
                    clients={visible}
                    currentPage={page}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
};

export default ClientsSection;
