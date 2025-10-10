"use client";

import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import FormFieldComponent, { FormField } from "./FormField";

type FormDataValue = string | string[] | boolean;

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FormField[];
    onSubmit: (data: Record<string, FormDataValue>) => void;
    submitButtonText: string;
    initialData?: Record<string, FormDataValue>;
}

const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    title,
    fields,
    onSubmit,
    submitButtonText,
    initialData,
}) => {
    const defaultData = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || (field.type === "multiselect" ? [] : field.type === "boolean" ? false : "");
        return acc;
    }, {} as Record<string, FormDataValue>);

    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        const newInitialData = initialData || fields.reduce((acc, field) => {
            acc[field.name] = field.defaultValue || (field.type === "multiselect" ? [] : field.type === "boolean" ? false : "");
            return acc;
        }, {} as Record<string, FormDataValue>);
        setFormData(newInitialData);
    }, [fields, initialData]);

    const handleChange = (name: string, value: FormDataValue) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/70 z-40 transition-opacity animate-fadeIn" />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b pb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map((field) => (
                                <FormFieldComponent
                                    key={field.name}
                                    {...field}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
                            >
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.25s ease-out forwards;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default BaseModal;