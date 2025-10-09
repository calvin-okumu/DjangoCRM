"use client";

import { Plus } from "lucide-react";
import React from "react";
import BaseModal from "../../shared/components/ui/BaseModal";
import type { FormField } from "../../shared/components/ui/FormField";

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FormField[];
    onSubmit: (data: Record<string, any>) => void;
    submitButtonText: string;
    onAddClient?: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
    isOpen,
    onClose,
    title,
    fields,
    onSubmit,
    submitButtonText,
    onAddClient,
}) => {
    // Add the "Add new client" button to the client field if onAddClient is provided
    const enhancedFields = fields.map(field => {
        if (field.name === "client" && onAddClient) {
            return {
                ...field,
                label: (
                    <span>
                        {field.label}{" "}
                        <button
                            type="button"
                            onClick={onAddClient}
                            className="text-blue-600 hover:text-blue-800 text-sm ml-2 inline-flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add new client
                        </button>
                    </span>
                ) as any, // TypeScript workaround for JSX in label
            };
        }
        return field;
    });

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            fields={enhancedFields}
            onSubmit={onSubmit}
            submitButtonText={submitButtonText}
        />
    );
};

export default AddProjectModal;
