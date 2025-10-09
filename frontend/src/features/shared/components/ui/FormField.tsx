"use client";

import React from "react";

export interface FormField {
    name: string;
    label: string | React.ReactNode;
    type: "text" | "number" | "date" | "textarea" | "select" | "multiselect" | "boolean";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: string | string[] | boolean;
}

type FormDataValue = string | string[] | boolean;

interface FormFieldProps extends FormField {
    value: FormDataValue;
    onChange: (name: string, value: FormDataValue) => void;
}

const FormFieldComponent: React.FC<FormFieldProps> = ({
    name,
    label,
    type,
    required,
    placeholder,
    options,
    value,
    onChange,
}) => {
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { value: val, type: inputType } = e.target;
        if (inputType === "checkbox") {
            onChange(name, (e.target as HTMLInputElement).checked);
        } else {
            onChange(name, val);
        }
    };

    const handleMultiSelectChange = (values: string[]) => {
        onChange(name, values);
    };

    return (
        <div className={type === "textarea" ? "md:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {typeof label === "string" ? (
                    <>
                        {label}{" "}
                        {required && (
                            <span className="text-red-500">*</span>
                        )}
                    </>
                ) : (
                    label
                )}
            </label>
            {type === "textarea" ? (
                <textarea
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={value as string}
                    onChange={handleChange}
                />
            ) : type === "select" ? (
                <select
                    name={name}
                    required={required}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={value as string}
                    onChange={handleChange}
                >
                    {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : type === "multiselect" ? (
                <div className="relative">
                    <select
                        multiple
                        name={name}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={value as string}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            handleMultiSelectChange(selected);
                        }}
                    >
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="mt-2 text-xs text-gray-500">
                                                Selected: {(value as string[]).join(", ")}
                    </div>
                </div>
            ) : type === "boolean" ? (
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        name={name}
                                                checked={value as boolean}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    {label}
                </label>
            ) : (
                <input
                    type={type}
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={value as string}
                    onChange={handleChange}
                />
            )}
        </div>
    );
};

export default FormFieldComponent;