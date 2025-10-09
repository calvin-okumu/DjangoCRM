"use client";

import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import ProjectsSection from '../components/ProjectsSection';
import AddProjectModal from '../components/AddProjectModal';
import { getProjects, createProject, getClients } from '../../../../api';
import { Project, Client } from '../../../../api/types';



export default function ProjectPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectFields, setProjectFields] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const authToken = localStorage.getItem('access_token');
                if (authToken) {
                    const [projectsData, clientsData] = await Promise.all([
                        getProjects(authToken).catch(() => []), // Fallback to empty array if fails
                        getClients(authToken).catch(() => [
                            { id: 1, name: "Client A", email: "", phone: "", status: "active", tenant: 1, tenant_name: "", projects_count: "0", created_at: "", updated_at: "" },
                            { id: 2, name: "Client B", email: "", phone: "", status: "active", tenant: 1, tenant_name: "", projects_count: "0", created_at: "", updated_at: "" }
                        ]) // Mock clients if fails
                    ]);
                    setProjects(projectsData);
                    setClients(clientsData);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fields = [
            {
                name: "name",
                label: "Project Name",
                type: "text" as const,
                required: true,
                placeholder: "Enter project name"
            },
            {
                name: "client",
                label: "Client",
                type: "select" as const,
                required: true,
                options: clients.map(client => ({ value: client.id.toString(), label: client.name }))
            },
            {
                name: "status",
                label: "Status",
                type: "select" as const,
                defaultValue: "planning",
                options: [
                    { value: "planning", label: "Planning" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "on_hold", label: "On Hold" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" }
                ]
            },
            {
                name: "priority",
                label: "Priority",
                type: "select" as const,
                defaultValue: "medium",
                options: [
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" }
                ]
            },
            {
                name: "budget",
                label: "Budget",
                type: "number" as const,
                placeholder: "0.00"
            },
            {
                name: "startDate",
                label: "Start Date",
                type: "date" as const,
                required: true
            },
            {
                name: "endDate",
                label: "End Date",
                type: "date" as const,
                required: true
            },
            {
                name: "description",
                label: "Description",
                type: "textarea" as const,
                placeholder: "Project description"
            },
            {
                name: "restrictAccess",
                label: "Restrict Access",
                type: "boolean" as const
            },
            {
                name: "teamMembers",
                label: "Project Team Members",
                type: "multiselect" as const,
                // required: true, // TODO: Enable when users exist
                defaultValue: [],
                options: [
                    { value: "1", label: "Clinton Okumu" },
                    { value: "2", label: "User 1" },
                    { value: "3", label: "User 2" }
                ]
            },
            {
                name: "allowedGroups",
                label: "Allowed Groups",
                type: "multiselect" as const,
                options: [
                    { value: "1", label: "API Control Administrators" },
                    { value: "2", label: "Business Strategy Administrators" },
                    { value: "3", label: "Client Management Administrators" },
                    { value: "4", label: "Contact Management Administrators" }
                ]
            }
        ];
        setProjectFields(fields);
    }, [clients]);

    const handleAddProject = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddClient = () => {
        // TODO: Open add client modal
        console.log('Add new client clicked');
    };
    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (projectId: number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        // TODO: Implement delete API call
        console.log('Delete project:', projectId);
        // For now, just remove from local state
        setProjects(projects.filter(p => p.id !== projectId));
    };

    const getDefaultValue = (fieldName: string, project: Project) => {
        switch (fieldName) {
            case 'name': return project.name;
            case 'client': return project.client?.toString();
            case 'status': return project.status;
            case 'priority': return project.priority;
            case 'budget': return project.budget?.toString();
            case 'startDate': return project.start_date;
            case 'endDate': return project.end_date;
            case 'description': return project.tags; // Backend uses tags for description
            default: return undefined;
        }
    };

    const handleSubmitProject = async (data: Record<string, string | string[] | boolean>) => {
        try {
            const authToken = localStorage.getItem('access_token');
            if (!authToken) {
                alert('Please login first to create a project.');
                return;
            }
            console.log('Using token:', authToken);
            const projectData = {
                name: String(data.name || ''),
                client: parseInt(String(data.client || '0')),
                status: String(data.status || 'planning'),
                priority: String(data.priority || 'medium'),
                start_date: String(data.startDate || ''),
                end_date: String(data.endDate || ''),
                budget: data.budget ? String(data.budget) : undefined,
                tags: String(data.description || ''), // Backend uses tags instead of description
                team_members: Array.isArray(data.teamMembers) && data.teamMembers.length > 0 ? data.teamMembers.map((id: unknown) => parseInt(String(id))) : [], // Empty array if none
                access_groups: Array.isArray(data.allowedGroups) && data.allowedGroups.length > 0 ? data.allowedGroups.map((id: unknown) => parseInt(String(id))) : [], // Empty array if none
            };

            if (editingProject) {
                // TODO: Implement update API call
                console.log('Update project:', editingProject.id, projectData);
                // For now, just update local state
                setProjects(projects.map(p =>
                    p.id === editingProject.id
                        ? { ...p, ...projectData, client_name: clients.find(c => c.id === parseInt(data.client))?.name }
                        : p
                ));
            } else {
                const newProject = await createProject(authToken, projectData);
                setProjects([...projects, newProject]);
            }
        } catch (error) {
            console.error('Failed to create project:', error);
            if (error instanceof Error && error.message.includes('403')) {
                alert('You do not have permission to create projects. Please contact an administrator.');
            } else {
                alert('Failed to create project. Please try again.');
            }
        }
    };



    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <ProjectsSection
                title="Projects"
                addButtonText="New Project"
                onAdd={() => { setEditingProject(null); handleAddProject(); }}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                searchPlaceholder="Search projects..."
                emptyState={{
                    icon: Folder,
                    title: "No projects found",
                    description: "Start by creating your first project.",
                    buttonText: "+ Create Project"
                }}
                projects={projects}
                loading={loading}
            />
            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => { handleCloseModal(); setEditingProject(null); }}
                title={editingProject ? "Edit Project" : "Create New Project"}
                fields={projectFields.map(field => ({
                    ...field,
                    defaultValue: editingProject ? getDefaultValue(field.name, editingProject) : field.defaultValue
                }))}
                onSubmit={handleSubmitProject}
                submitButtonText={editingProject ? "Update Project" : "Create Project"}
                onAddClient={handleAddClient}
            />
        </div>
    );
}
