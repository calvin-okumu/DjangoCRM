"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import KanbanSection from './kanban/KanbanSection';

interface KanbanModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    sprintId: number;
}

export default function KanbanModal({ isOpen, onClose, projectId, sprintId }: KanbanModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Kanban Board" size="xl">
            <KanbanSection projectId={projectId} sprintId={sprintId} />
        </Modal>
    );
}