"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import type { Client } from "@/api/types";
import Pagination from "@/components/shared/Pagination";

interface ClientsTableProps {
    clients: Client[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onEdit?: (client: Client) => void;
    onDelete?: (id: number) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
    clients,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                        {["Name", "Email", "Phone", "Status", "Projects", "Created", "Actions"].map(h => (
                            <th key={h} className="px-6 py-3 text-left font-medium">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                    {clients.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{c.name}</td>
                            <td className="px-6 py-4">{c.email}</td>
                            <td className="px-6 py-4">{c.phone ?? "-"}</td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        c.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : c.status === "inactive"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">{c.projects_count}</td>
                            <td className="px-6 py-4">{new Date(c.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <button onClick={() => onEdit(c)} className="text-blue-600 hover:text-blue-800">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-800">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                totalItems={clients.length}
            />
        </div>
    );
};

export default ClientsTable;