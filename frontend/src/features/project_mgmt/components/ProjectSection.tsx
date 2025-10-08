
"use client";

import MetricsBar from "@/features/crm/components/MetricsBar";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectModal from "./ProjectModal";
import ProjectTable from "./ProjectTable";
import type { Project } from "@/api";
import Button from "@/features/shared/components/ui/Button";
import ToastContainer from "@/features/shared/components/ui/ToastContainer";
import type { ToastMessage } from "@/features/shared/components/ui/Toast";
import LoadingSpinner from "@/features/shared/components/ui/LoadingSpinner";

const ProjectsSection: React.FC = () => {
    const { projects, loading, error, addProject, editProject, removeProject } = useProjects();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [page, setPage] = useState(1);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const itemsPerPage = 10;

    const addToast = (type: "success" | "error", message: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                await removeProject(id);
                addToast("success", "Project deleted successfully!");
            } catch (err) {
                addToast("error", err instanceof Error ? err.message : "Failed to delete project");
            }
        }
    };

    const totalPages = Math.ceil(projects.length / itemsPerPage);

    const metrics = [
        {
            title: "Total Projects",
            value: projects.length,
            label: "All active and completed",
            icon: Plus,
            color: "border-l-4 border-blue-600",
        },
    ];

    return (
        <section className="bg-gray-50 min-h-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800">Projects</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                </Button>
            </div>

            <MetricsBar metrics={metrics} />

            {loading && <LoadingSpinner size="lg" className="py-8" />}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500 mb-2">No projects found</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Create Project
                    </button>
                </div>
            )}

            {!loading && projects.length > 0 && (
                <ProjectTable
                    projects={projects}
                    page={page}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

             <ProjectModal
                 isOpen={isModalOpen}
                 onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
                 onSubmit={async (projectData) => {
                     try {
                         if (editingProject) {
                             await editProject(editingProject.id, projectData as any);
                             addToast("success", "Project updated successfully!");
                         } else {
                             await addProject(projectData);
                             addToast("success", "Project created successfully!");
                         }
                         setIsModalOpen(false);
                         setEditingProject(null);
                     } catch (err) {
                         addToast("error", err instanceof Error ? err.message : "Failed to save project");
                     }
                 }}
                 editingProject={editingProject}
             />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </section>
    );
};

export default ProjectsSection;
