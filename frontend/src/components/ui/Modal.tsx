
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred background */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal content */}
            <div
                className={`relative z-10 bg-white rounded-2xl shadow-lg w-full ${sizeClasses[size]} p-6`}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                {children}
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
