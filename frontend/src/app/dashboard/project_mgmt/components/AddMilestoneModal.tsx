"use client";

import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

type FormDataValue = string | string[] | boolean;

interface FormField {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "textarea" | "select" | "multiselect" | "boolean";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: FormDataValue;
}

interface AddMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FormField[];
    onSubmit: (data: Record<string, FormDataValue>) => void;
    submitButtonText: string;
    editingMilestone?: Record<string, FormDataValue>;
}

const AddMilestoneModal = ({
    isOpen,
    onClose,
    title,
    fields,
    onSubmit,
    submitButtonText,
    editingMilestone,
}: AddMilestoneModalProps) => {
    const initialData = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || (field.type === "multiselect" ? [] : field.type === "boolean" ? false : "");
        return acc;
    }, {} as Record<string, FormDataValue>);

    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        if (editingMilestone) {
            const newInitialData = fields.reduce((acc, field) => {
                acc[field.name] = editingMilestone[field.name] || field.defaultValue || (field.type === "multiselect" ? [] : field.type === "boolean" ? false : "");
                return acc;
            }, {} as Record<string, FormDataValue>);
            setFormData(newInitialData);
        } else {
            const newInitialData = fields.reduce((acc, field) => {
                acc[field.name] = field.defaultValue || (field.type === "multiselect" ? [] : field.type === "boolean" ? false : "");
                return acc;
            }, {} as Record<string, FormDataValue>);
            setFormData(newInitialData);
        }
    }, [fields, editingMilestone]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleMultiSelectChange = (name: string, values: string[]) => {
        setFormData({
            ...formData,
            [name]: values,
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-fadeIn" />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
                                <div
                                    key={field.name}
                                    className={field.type === "textarea" || field.name === "description" ? "md:col-span-2" : ""}
                                >
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label}{" "}
                                        {field.required && (
                                            <span className="text-red-500">*</span>
                                        )}
                                    </label>
                                    {field.type === "textarea" ? (
                                        <textarea
                                            name={field.name}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            value={formData[field.name] as string}
                                            onChange={handleChange}
                                        />
                                    ) : field.type === "select" ? (
                                        <select
                                            name={field.name}
                                            required={field.required}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            value={formData[field.name] as string}
                                            onChange={handleChange}
                                        >
                                            {field.options?.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === "multiselect" ? (
                                        <div className="relative">
                                            <select
                                                multiple
                                                name={field.name}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                value={formData[field.name] as string}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                    handleMultiSelectChange(field.name, selected);
                                                }}
                                            >
                                                {field.options?.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                             <div className="mt-2 text-xs text-gray-500">
                                                 Selected: {(formData[field.name] as string[]).join(", ")}
                                             </div>
                                        </div>
                                    ) : field.type === "boolean" ? (
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name={field.name}
                                                 checked={formData[field.name] as boolean}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            {field.label}
                                        </label>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            value={formData[field.name] as string}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
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

export default AddMilestoneModal;