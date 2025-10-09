"use client";

import React from "react";
import Button from "../../../shared/components/ui/Button";

interface EmptyStateProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
    onAdd: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, buttonText, onAdd }) => {
    return (
        <div className="p-12 text-center bg-white border rounded-lg shadow">
            <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <Button onClick={onAdd} size="lg">
                {buttonText}
            </Button>
        </div>
    );
};

export default EmptyState;