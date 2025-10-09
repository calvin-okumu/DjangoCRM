"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface FormField {
    name: string;
    label: string;
    type: "text" | "url" | "textarea" | "select";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: string;
}

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FormField[];
    onSubmit: (data: Record<string, string>) => void;
    submitButtonText: string;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
    isOpen,
    onClose,
    title,
    fields,
    onSubmit,
    submitButtonText,
}) => {
    const [formData, setFormData] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData(Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? ""])));
    }, [fields]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b pb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map(f => (
                                <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {f.label} {f.required && <span className="text-red-500">*</span>}
                                    </label>

                                    {f.type === "textarea" ? (
                                        <textarea
                                            name={f.name}
                                            required={f.required}
                                            placeholder={f.placeholder}
                                            rows={4}
                                            className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                            value={formData[f.name]}
                                            onChange={handleChange}
                                        />
                                    ) : f.type === "select" ? (
                                        <select
                                            name={f.name}
                                            required={f.required}
                                            value={formData[f.name]}
                                            onChange={handleChange}
                                            className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                        >
                                            {f.options?.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={f.type}
                                            name={f.name}
                                            required={f.required}
                                            placeholder={f.placeholder}
                                            className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                                            value={formData[f.name]}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddClientModal;
