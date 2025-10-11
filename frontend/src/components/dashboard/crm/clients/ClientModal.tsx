"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Client, CreateClientData, UpdateClientData } from '@/api/types';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    client?: Client;
    onSave: (data: CreateClientData | UpdateClientData) => void;
}

export default function ClientModal({ isOpen, onClose, mode, client, onSave }: ClientModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'active' as 'active' | 'inactive' | 'prospect',
    });

    useEffect(() => {
        if (mode === 'edit' && client) {
            setFormData({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                status: client.status as 'active' | 'inactive' | 'prospect',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                status: 'active',
            });
        }
    }, [mode, client, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return;

        const data = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            status: formData.status,
        };

        onSave(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add Client' : 'Edit Client'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="prospect">Prospect</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        {mode === 'add' ? 'Add Client' : 'Update Client'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

