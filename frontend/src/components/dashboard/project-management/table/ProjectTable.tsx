"use client";

import type { Project } from '@/api/types';
import Pagination from '@/components/shared/Pagination';
import Loader from '@/components/shared/Loader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import ProjectModal from '../ProjectModal';
import { useProjects } from '@/hooks/useProjects';
import { Edit, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

const ProjectTable: React.FC = () => {
    const [page, setPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { projects, loading, error, addProject, editProject, removeProject } = useProjects();

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const visibleProjects = filteredProjects.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleNewProject = () => {
        setModalMode('add');
        setSelectedProject(null);
        setModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setModalMode('edit');
        setSelectedProject(project);
        setModalOpen(true);
    };

    const handleSaveProject = async (data: any) => {
        try {
            if (modalMode === 'add') {
                await addProject(data);
            } else if (selectedProject) {
                await editProject(selectedProject.id, data);
            }
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving project:', error);
            // TODO: Show error message
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this project?")) {
            removeProject(id);
        }
    };

    const headers = ["Name", "Client", "Status", "Priority", "Start Date", "End Date", "Budget", "Progress", "Milestones", "Actions"];

    const rows = visibleProjects.map(p => [
        p.name,
        p.client_name,
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === "active"
                ? "bg-green-100 text-green-800"
                : p.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : p.status === "on-hold"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}
        >
            {p.status}
        </span>,
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${p.priority === "high"
                ? "bg-red-100 text-red-800"
                : p.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
        >
            {p.priority}
        </span>,
        new Date(p.start_date).toLocaleDateString(),
        new Date(p.end_date).toLocaleDateString(),
        p.budget ? `$${p.budget}` : "-",
        `${p.progress}%`,
        p.milestones_count,
        <div className="flex gap-2">
            <Button onClick={() => handleEdit(p)} variant="outline" size="sm">
                <Edit className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleDelete(p.id)} variant="danger" size="sm">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    ]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button onClick={handleNewProject} variant="primary" size="md" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </div>
                <Table headers={headers} rows={rows} />
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredProjects.length}
                />
            </div>
            <ProjectModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                mode={modalMode}
                project={selectedProject || undefined}
                onSave={handleSaveProject}
            />
        </>
    );
};

export default ProjectTable;
