"use client";

import React from "react";
import { Plus } from "lucide-react";
import Button from "../../../shared/components/ui/Button";

interface ClientsHeaderProps {
    title: string;
    addButtonText: string;
    onAdd: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ title, addButtonText, onAdd }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Button onClick={onAdd}>
                <Plus className="h-5 w-5 mr-2" />
                {addButtonText}
            </Button>
        </div>
    );
};

export default ClientsHeader;