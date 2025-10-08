"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getMilestones, getProject, getSprints, getTasks, getUser, getUsers, createMilestone, updateMilestone, deleteMilestone, createSprint, updateSprint, deleteSprint, getUserTenants } from "@/api";
import LoadingSpinner from "@/features/shared/components/ui/LoadingSpinner";
import type { Milestone, Project, Sprint, Task, User } from "@/api";
import ProjectHeader from "./project-overview/ProjectHeader";
import ProjectTabs from "./project-overview/ProjectTabs";
import OverviewContent from "./project-overview/OverviewContent";
import MilestonesContent from "./project-overview/MilestonesContent";
import SprintsContent from "./project-overview/SprintsContent";
import BacklogContent from "./project-overview/BacklogContent";
import AddMilestoneModal from "./AddMilestoneModal";
import AddSprintModal from "./AddSprintModal";

type MilestoneCreateData = {
    name: string;
    description?: string;
    status: string;
    planned_start?: string;
    actual_start?: string;
    due_date?: string;
    assignee?: number;
    project: number;
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

interface ProjectOverviewProps {
    projectId: number;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectId }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [owner, setOwner] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [tenantMembers, setTenantMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
    const [activeTab, setActiveTab] = useState("Overview");
    const [milestonePage, setMilestonePage] = useState(1);
    const [sprintPage, setSprintPage] = useState(1);
    const [taskPage, setTaskPage] = useState(1);
    const itemsPerPage = 10;

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    // -------------------------------------------------------------------------
    // Milestone Management
    // -------------------------------------------------------------------------
    const handleAddMilestone = async (milestoneData: MilestoneCreateData) => {
        if (!token) {
            setError("Missing authentication token.");
            return;
        }

        try {
            const newMilestone = await createMilestone(token, milestoneData);
            setMilestones(prev => [...prev, newMilestone]);
            setIsMilestoneModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create milestone");
        }
    };

    const handleEditMilestone = async (milestoneData: MilestoneCreateData) => {
        if (!token || !editingMilestone) {
            setError("Missing authentication token or milestone to edit.");
            return;
        }

        try {
            const updatedMilestone = await updateMilestone(token, editingMilestone.id, milestoneData);
            setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? updatedMilestone : m));
            setIsMilestoneModalOpen(false);
            setEditingMilestone(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update milestone");
        }
    };

    const handleDeleteMilestone = async (milestoneId: number) => {
        if (!token) {
            setError("Missing authentication token.");
            return;
        }

        if (!confirm("Are you sure you want to delete this milestone?")) {
            return;
        }

        try {
            await deleteMilestone(token, milestoneId);
            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete milestone");
        }
    };

    const handleOpenEditModal = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setIsMilestoneModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsMilestoneModalOpen(false);
        setEditingMilestone(null);
        setIsSprintModalOpen(false);
        setEditingSprint(null);
    };

    const handleEditSprint = async (sprintData: {
        name: string;
        status: string;
        start_date?: string;
        end_date?: string;
        milestone: number;
    }) => {
        if (!token || !editingSprint) {
            setError("Missing authentication token or sprint to edit.");
            return;
        }

        try {
            const updatedSprint = await updateSprint(token, editingSprint.id, sprintData);
            setSprints(prev => prev.map(s => s.id === editingSprint.id ? updatedSprint : s));
            setIsSprintModalOpen(false);
            setEditingSprint(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update sprint");
        }
    };

    const handleDeleteSprint = async (sprintId: number) => {
        if (!token) {
            setError("Missing authentication token.");
            return;
        }

        if (!confirm("Are you sure you want to delete this sprint?")) {
            return;
        }

        try {
            await deleteSprint(token, sprintId);
            setSprints(prev => prev.filter(s => s.id !== sprintId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete sprint");
        }
    };

    const handleOpenEditSprintModal = (sprint: Sprint) => {
        setEditingSprint(sprint);
        setIsSprintModalOpen(true);
    };

    const handleAddSprint = async (sprintData: {
        name: string;
        status: string;
        start_date?: string;
        end_date?: string;
        milestone: number;
    }) => {
        if (!token) {
            setError("Missing authentication token.");
            return;
        }

        try {
            const newSprint = await createSprint(token, sprintData);
            setSprints(prev => [...prev, newSprint]);
            setIsSprintModalOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create sprint");
        }
    };



    // -------------------------------------------------------------------------
    // Fetch Data
    // -------------------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError("Missing authentication token.");
                setLoading(false);
                return;
            }
            try {
                const [projectData, milestonesData, sprintsData, tasksData] = await Promise.all([
                    getProject(token, projectId),
                    getMilestones(token, projectId),
                    getSprints(token, projectId),
                    getTasks(token),
                ]);

                setProject(projectData);
                setMilestones(milestonesData);
                setSprints(sprintsData);

                // Filter tasks to only show those belonging to milestones in this project
                const projectMilestoneIds = new Set(milestonesData.map(m => m.id));
                const projectTasks = tasksData.filter(task => projectMilestoneIds.has(task.milestone));
                setTasks(projectTasks);

                // Fetch tenant information and filter users to tenant members
                const [usersData, userTenantsData] = await Promise.all([
                    getUsers(token),
                    getUserTenants(token)
                ]);

                setAllUsers(usersData);

                // Get current user's tenant (owner tenant or first tenant)
                const currentUserTenant = userTenantsData.find((t) => t.is_owner) || userTenantsData[0];
                if (currentUserTenant) {
                    // Filter users to only show tenant members
                    const tenantMemberIds = new Set(userTenantsData
                        .filter(ut => ut.tenant === currentUserTenant.tenant)
                        .map(ut => ut.user)
                    );
                    const tenantMembersData = usersData.filter(user => tenantMemberIds.has(user.id));
                    setTenantMembers(tenantMembersData);
                } else {
                    // Fallback: show all users if no tenant info
                    setTenantMembers(usersData);
                }

                // Fetch owner data (first team member) and team members
                if (projectData.team_members && projectData.team_members.length > 0) {
                    try {
                        const ownerData = await getUser(token, projectData.team_members[0]);
                        setOwner(ownerData);


                    } catch (err) {
                        console.warn('Failed to fetch user data:', err);
                        setOwner(null);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load project data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId, token]);

    // -------------------------------------------------------------------------
    // Derived Data
    // -------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-700">
                <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-lg font-medium">Error loading project</p>
                <p className="text-sm text-gray-500">{error}</p>
            </div>
        );
    }

    // Pagination calculations
    const totalMilestonePages = Math.ceil(milestones.length / itemsPerPage);
    const totalSprintPages = Math.ceil(sprints.length / itemsPerPage);
    const totalTaskPages = Math.ceil(tasks.length / itemsPerPage);



    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50">
            <ProjectHeader project={project} owner={owner} />

            <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
                {activeTab === "Overview" && (
                    <OverviewContent
                        project={project}
                        milestones={milestones}
                        sprints={sprints}
                        tasks={tasks}
                        allUsers={allUsers}
                    />
                )}

                {activeTab === "Milestones" && (
                    <MilestonesContent
                        milestones={milestones}
                        allUsers={allUsers}
                        loading={loading}
                        onAddMilestone={() => setIsMilestoneModalOpen(true)}
                        onEditMilestone={handleOpenEditModal}
                        onDeleteMilestone={handleDeleteMilestone}
                        milestonePage={milestonePage}
                        totalMilestonePages={totalMilestonePages}
                        onMilestonePageChange={setMilestonePage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === "Sprints" && (
                    <SprintsContent
                        sprints={sprints}
                        projectId={projectId}
                        loading={loading}
                        onAddSprint={() => setIsSprintModalOpen(true)}
                        onEditSprint={handleOpenEditSprintModal}
                        onDeleteSprint={handleDeleteSprint}
                        sprintPage={sprintPage}
                        totalSprintPages={totalSprintPages}
                        onSprintPageChange={setSprintPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {activeTab === "Backlog" && (
                    <BacklogContent
                        tasks={tasks}
                        allUsers={allUsers}
                        taskPage={taskPage}
                        totalTaskPages={totalTaskPages}
                        onTaskPageChange={setTaskPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </main>

            {/* Add Milestone Modal - only show on Milestones tab */}
            {activeTab === "Milestones" && (
                <AddMilestoneModal
                    isOpen={isMilestoneModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={editingMilestone ? handleEditMilestone : handleAddMilestone}
                    projectId={projectId}
                    allUsers={tenantMembers}
                    editingMilestone={editingMilestone}
                />
            )}

            {/* Add Sprint Modal - only show on Sprints tab */}
            {activeTab === "Sprints" && (
                <AddSprintModal
                    isOpen={isSprintModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={editingSprint ? handleEditSprint : handleAddSprint}
                    milestones={milestones}
                    editingSprint={editingSprint}
                />
            )}
        </div>
    );
};

export default ProjectOverview;