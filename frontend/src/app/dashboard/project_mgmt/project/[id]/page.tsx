"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, getTasks, createTask, updateTask, deleteTask, assignTaskToSprint, updateSprint, updateMilestone, getUserTenants } from '../../../../../api';
import { Project, Milestone, Sprint, Task, UserTenant, User } from '../../../../../features/shared/types/common';
import { KanbanView, MilestoneList, AddMilestoneModal, SprintList, AddSprintModal, AddTaskModal } from '../../../../../features/projects';
import BacklogView from '../../components/BacklogView';
import { TaskFormData } from '../../../../../features/projects/components/AddTaskModal';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [project, setProject] = useState<Project | null>(null);

    // Progress calculation functions
    const calculateSprintProgress = useCallback((sprintId: number, tasks: Task[]): number => {
        const sprintTasks = tasks.filter(t => t.sprint === sprintId);
        if (sprintTasks.length === 0) return 0;
        const completedTasks = sprintTasks.filter(t => t.status === 'done').length;
        return Math.round((completedTasks / sprintTasks.length) * 100);
    }, []);

    const calculateMilestoneProgress = useCallback((milestoneId: number, sprints: Sprint[], tasks: Task[]): number => {
        const milestoneSprints = sprints.filter(s => s.milestone === milestoneId);
        if (milestoneSprints.length === 0) return 0;

        // Calculate weighted progress based on sprint progress
        const totalProgress = milestoneSprints.reduce((sum, sprint) => {
            return sum + calculateSprintProgress(sprint.id, tasks);
        }, 0);

        return Math.round(totalProgress / milestoneSprints.length);
    }, [calculateSprintProgress]);

    const calculateProjectProgress = useMemo(() => {
        return (milestones: Milestone[], sprints: Sprint[], tasks: Task[]): number => {
            if (milestones.length === 0) return 0;

            // Calculate weighted progress based on milestone progress
            const totalProgress = milestones.reduce((sum, milestone) => {
                return sum + calculateMilestoneProgress(milestone.id, sprints, tasks);
            }, 0);

            return Math.round(totalProgress / milestones.length);
        };
    }, [calculateMilestoneProgress]);

    // Completion check functions
    const isSprintCompleted = (sprintId: number, tasks: Task[]): boolean => {
        const sprintTasks = tasks.filter(t => t.sprint === sprintId);
        return sprintTasks.length > 0 && sprintTasks.every(t => t.status === 'done');
    };

    const isMilestoneCompleted = (milestoneId: number, sprints: Sprint[]): boolean => {
        const milestoneSprints = sprints.filter(s => s.milestone === milestoneId);
        return milestoneSprints.length > 0 && milestoneSprints.every(s => s.status === 'completed');
    };
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [milestonesLoading, setMilestonesLoading] = useState(false);
    const [milestonesFetched, setMilestonesFetched] = useState(false);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [sprintsLoading, setSprintsLoading] = useState(false);
    const [sprintsFetched, setSprintsFetched] = useState(false);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [tenantMembers, setTenantMembers] = useState<User[]>([]);

    const [totalTasksCount, setTotalTasksCount] = useState(0);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [, setCompletedTasksLoading] = useState(false);

    const fetchMilestones = useCallback(async () => {
        if (!project) return;

        setMilestonesLoading(true);
        try {
            const stored = localStorage.getItem(`milestones_${project.id}`);
            if (stored) {
                setMilestones(JSON.parse(stored));
            } else {
                setMilestones([]);
            }
        } catch (error) {
            console.error('Failed to load milestones:', error);
            setMilestones([]);
        } finally {
            setMilestonesLoading(false);
        }
    }, [project]);

    const fetchSprints = useCallback(async () => {
        if (!project) return;

        setSprintsLoading(true);
        try {
            const stored = localStorage.getItem(`sprints_${project.id}`);
            if (stored) {
                setSprints(JSON.parse(stored));
            } else {
                setSprints([]);
            }
        } catch (error) {
            console.error('Failed to load sprints:', error);
            setSprints([]);
        } finally {
            setSprintsLoading(false);
        }
    }, [project]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (token && id) {
                    const data = await getProject(token, parseInt(id));
                    setProject(data);

                    // Fetch total task count
                    const tasksData = await getTasks(token, undefined, undefined);
                    setTotalTasksCount(tasksData.length);

                    // Fetch tenant members
                    try {
                        const userTenants = await getUserTenants(token);
                        // Map UserTenant[] to User[] for the modal
                        const users = userTenants.filter(ut => ut.is_approved).map(ut => ({
                            id: ut.user,
                            first_name: ut.user_first_name,
                            last_name: ut.user_last_name,
                            email: ut.user_email
                        }));
                        setTenantMembers(users);
                    } catch (error) {
                        console.error('Failed to fetch tenant members:', error);
                        setTenantMembers([]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch project:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'milestones' && project && !milestonesFetched) {
            fetchMilestones();
            setMilestonesFetched(true);
        }
    }, [activeTab, project, milestonesFetched, fetchMilestones]);

    useEffect(() => {
        if (activeTab === 'sprints' && project && !sprintsFetched) {
            fetchSprints();
            setSprintsFetched(true);
        }
    }, [activeTab, project, sprintsFetched, fetchSprints]);

    const fetchTasks = useCallback(async () => {
        if (!project) return;

        setTasksLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                // For backlog, get tasks that are not assigned to any sprint
                // This represents the product backlog - items ready to be planned into sprints
                const data = await getTasks(token, undefined, undefined);
                // Filter to only show tasks not assigned to any sprint (true backlog)
                const backlogTasks = data.filter(task => !task.sprint && task.status !== 'done');
                setTasks(backlogTasks);

                // Also store all tasks for progress calculation
                setAllTasks(data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setTasksLoading(false);
        }
    }, [project]);

    const fetchCompletedTasks = useCallback(async () => {
        if (!project) return;

        setCompletedTasksLoading(true);
        try {
            // First check localStorage for mock completed tasks
            const localCompleted = localStorage.getItem(`completed_tasks_${project.id}`);
            let completedTasks: Task[] = [];
            if (localCompleted) {
                completedTasks = JSON.parse(localCompleted);
            }

            // Also fetch from API for real completed tasks
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await getTasks(token, undefined, undefined);
                // Filter to only show completed tasks from API
                const apiCompleted = data.filter(task => task.status === 'done');
                // Merge with local completed tasks, avoiding duplicates
                const allCompleted = [...completedTasks];
                apiCompleted.forEach(apiTask => {
                    if (!allCompleted.find(localTask => localTask.id === apiTask.id)) {
                        allCompleted.push(apiTask);
                    }
                });
                setCompletedTasks(allCompleted);
            } else {
                setCompletedTasks(completedTasks);
            }
        } catch (error) {
            console.error('Failed to fetch completed tasks:', error);
            // Fallback to localStorage only
            const localCompleted = localStorage.getItem(`completed_tasks_${project.id}`);
            if (localCompleted) {
                setCompletedTasks(JSON.parse(localCompleted));
            }
        } finally {
            setCompletedTasksLoading(false);
        }
    }, [project]);

    useEffect(() => {
        if (activeTab === 'completed' && project) {
            fetchCompletedTasks();
        }
    }, [activeTab, project, fetchCompletedTasks]);

    useEffect(() => {
        if (activeTab === 'backlog' && project) {
            fetchTasks();
        }
    }, [activeTab, project, fetchTasks]);

    useEffect(() => {
        if (activeTab === 'completed' && project) {
            fetchCompletedTasks();
        }
    }, [activeTab, project, fetchCompletedTasks]);

    // Update milestone and sprint progress when tasks change
    useEffect(() => {
        if (milestones.length > 0) {
            const updatedMilestones = milestones.map(milestone => ({
                ...milestone,
                progress: calculateMilestoneProgress(milestone.id, sprints, allTasks)
            }));

            // Only update if progress actually changed
            setMilestones(prevMilestones => {
                const hasChanged = updatedMilestones.some((updated, index) =>
                    prevMilestones[index]?.progress !== updated.progress
                );
                if (hasChanged) {
                    localStorage.setItem(`milestones_${project.id}`, JSON.stringify(updatedMilestones));
                    return updatedMilestones;
                }
                return prevMilestones;
            });
        }

        if (sprints.length > 0) {
            const updatedSprints = sprints.map(sprint => ({
                ...sprint,
                progress: calculateSprintProgress(sprint.id, allTasks)
            }));

            // Only update if progress actually changed
            setSprints(prevSprints => {
                const hasChanged = updatedSprints.some((updated, index) =>
                    prevSprints[index]?.progress !== updated.progress
                );
                if (hasChanged) {
                    localStorage.setItem(`sprints_${project.id}`, JSON.stringify(updatedSprints));
                    return updatedSprints;
                }
                return prevSprints;
            });
        }
    }, [allTasks, sprints, project, milestones, calculateMilestoneProgress, calculateSprintProgress]);

    const handleAddMilestone = () => {
        setEditingMilestone(null);
        setIsMilestoneModalOpen(true);
    };

    const handleEditMilestone = (milestone: Milestone) => {
        setEditingMilestone(milestone);
        setIsMilestoneModalOpen(true);
    };

    const handleDeleteMilestone = async (milestoneId: number) => {
        if (!confirm("Are you sure you want to delete this milestone?")) return;
        // TODO: Implement delete API call
        console.log('Delete milestone:', milestoneId);
        // For now, just remove from local state
        const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
        setMilestones(updatedMilestones);
        localStorage.setItem(`milestones_${project.id}`, JSON.stringify(updatedMilestones));
    };

    const handleSubmitMilestone = async (data: Record<string, string>) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token || !project) return;

            const milestoneData = {
                name: data.name,
                description: data.description || undefined,
                status: data.status,
                planned_start: data.planned_start || undefined,
                actual_start: data.actual_start || undefined,
                due_date: data.due_date || undefined,
                assignee: data.assignee ? parseInt(data.assignee) : undefined,
                project: project.id,
            };

            if (editingMilestone) {
                // TODO: Implement update API call
                console.log('Update milestone:', editingMilestone.id, milestoneData);
                // For now, just update local state
                const updatedMilestones = milestones.map(m =>
                    m.id === editingMilestone.id
                        ? { ...m, ...milestoneData }
                        : m
                );
                setMilestones(updatedMilestones);
                localStorage.setItem(`milestones_${project.id}`, JSON.stringify(updatedMilestones));
            } else {
                // TODO: Implement create API call
                console.log('Create milestone:', milestoneData);
                // For now, add to local state with mock data
                const newMilestone: Milestone = {
                    id: Date.now(), // Mock ID
                    ...milestoneData,
                    progress: 0,
                    project_name: project.name,
                    sprints_count: 0,
                    created_at: new Date().toISOString(),
                };
                const updatedMilestones = [...milestones, newMilestone];
                setMilestones(updatedMilestones);
                localStorage.setItem(`milestones_${project.id}`, JSON.stringify(updatedMilestones));
            }
        } catch (error) {
            console.error('Failed to save milestone:', error);
        }

        setIsMilestoneModalOpen(false);
        setEditingMilestone(null);
    };

    const handleAddSprint = () => {
        setEditingSprint(null);
        setIsSprintModalOpen(true);
    };

    const handleEditSprint = (sprint: Sprint) => {
        setEditingSprint(sprint);
        setIsSprintModalOpen(true);
    };

    const handleDeleteSprint = async (sprintId: number) => {
        if (!confirm("Are you sure you want to delete this sprint?")) return;
        // TODO: Implement delete API call
        console.log('Delete sprint:', sprintId);
        // For now, just remove from local state
        const updatedSprints = sprints.filter(s => s.id !== sprintId);
        setSprints(updatedSprints);
    };

    const handleOpenKanban = (sprint: Sprint) => {
        // Navigate to sprint detail kanban view
        router.push(`/dashboard/project_mgmt/project/${id}/sprint/${sprint.id}`);
    };

    const handleSubmitSprint = async (data: Record<string, string>) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token || !project) return;

            const sprintData = {
                name: data.name,
                status: data.status,
                start_date: data.start_date || undefined,
                end_date: data.end_date || undefined,
                milestone: parseInt(data.milestone),
            };

            if (editingSprint) {
                // TODO: Implement update API call
                console.log('Update sprint:', editingSprint.id, sprintData);
                // For now, just update local state
                const updatedSprints = sprints.map(s =>
                    s.id === editingSprint.id
                        ? { ...s, ...sprintData }
                        : s
                );
                setSprints(updatedSprints);
                localStorage.setItem(`sprints_${project.id}`, JSON.stringify(updatedSprints));
            } else {
                // TODO: Implement create API call
                console.log('Create sprint:', sprintData);
                // For now, add to local state with mock data
                const milestoneObj = milestones.find(m => m.id === parseInt(data.milestone));
                const newSprint: Sprint = {
                    id: Date.now(), // Mock ID
                    ...sprintData,
                    milestone_name: milestoneObj?.name,
                    progress: 0,
                    tasks_count: 0,
                    created_at: new Date().toISOString(),
                };
                const updatedSprints = [...sprints, newSprint];
                setSprints(updatedSprints);
                localStorage.setItem(`sprints_${project.id}`, JSON.stringify(updatedSprints));

                // Switch to the appropriate tab based on sprint status
                if (sprintData.status === 'planned') {
                    setActiveTab('planning');
                } else if (sprintData.status === 'active') {
                    setActiveTab('active');
                } else if (sprintData.status === 'completed') {
                    setActiveTab('completed');
                } else if (sprintData.status === 'cancelled') {
                    setActiveTab('cancelled');
                }
            }
        } catch (error) {
            console.error('Failed to save sprint:', error);
            // Even if error, add mock for frontend functionality
            const sprintData = {
                name: data.name,
                status: data.status,
                start_date: data.start_date || undefined,
                end_date: data.end_date || undefined,
                milestone: parseInt(data.milestone),
            };
            const milestoneObj = milestones.find(m => m.id === parseInt(data.milestone));
            const newSprint: Sprint = {
                id: Date.now(),
                ...sprintData,
                milestone_name: milestoneObj?.name,
                progress: 0,
                tasks_count: 0,
                created_at: new Date().toISOString(),
            };
            const updatedSprints = [...sprints, newSprint];
            setSprints(updatedSprints);
            localStorage.setItem(`sprints_${project.id}`, JSON.stringify(updatedSprints));

            // Switch to the appropriate tab based on sprint status
            if (sprintData.status === 'planned') {
                setActiveTab('planning');
            } else if (sprintData.status === 'active') {
                setActiveTab('active');
            } else if (sprintData.status === 'completed') {
                setActiveTab('completed');
            } else if (sprintData.status === 'cancelled') {
                setActiveTab('cancelled');
            }
        }

        setIsSprintModalOpen(false);
        setEditingSprint(null);
    };

    const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await updateTask(token, taskId, { status: newStatus });
            const updatedAllTasks = allTasks.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus }
                    : task
            );
            setAllTasks(updatedAllTasks);

            // Also update backlog tasks if this task was in backlog
            const updatedTasks = tasks.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus }
                    : task
            );
            setTasks(updatedTasks);

            // Check if sprint is now completed
            const task = updatedAllTasks.find(t => t.id === taskId);
            if (task && task.sprint && isSprintCompleted(task.sprint, updatedAllTasks)) {
                await updateSprint(token, task.sprint, { status: 'completed' });
                const updatedSprints = sprints.map(s =>
                    s.id === task.sprint
                        ? { ...s, status: 'completed' }
                        : s
                );
                setSprints(updatedSprints);
                localStorage.setItem(`sprints_${project.id}`, JSON.stringify(updatedSprints));

                // Check if milestone is now completed
                const sprint = updatedSprints.find(s => s.id === task.sprint);
                if (sprint && isMilestoneCompleted(sprint.milestone, updatedSprints)) {
                    await updateMilestone(token, sprint.milestone, { status: 'completed' });
                    const updatedMilestones = milestones.map(m =>
                        m.id === sprint.milestone
                            ? { ...m, status: 'completed' }
                            : m
                    );
                    setMilestones(updatedMilestones);
                    localStorage.setItem(`milestones_${project.id}`, JSON.stringify(updatedMilestones));
                }
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await deleteTask(token, taskId);
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleAssignToSprint = async (task: Task) => {
        // Show available sprints in a prompt
        const sprintOptions = sprints.map(s => `${s.id}: ${s.name}`).join('\n');
        const sprintId = prompt(`Available sprints:\n${sprintOptions}\n\nEnter sprint ID to assign this task to:`);
        if (!sprintId) return;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            await assignTaskToSprint(token, parseInt(sprintId), task.id);
            // Refresh tasks to get updated data
            fetchTasks();
        } catch (error) {
            console.error('Failed to assign task to sprint:', error);
            alert('Failed to assign task to sprint. Please try again.');
        }
    };

    const handleSubmitTask = async (taskData: TaskFormData) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token || !project) return;

            const apiTaskData = {
                title: taskData.title,
                description: taskData.description,
                status: 'backlog', // New tasks start in backlog
                milestone: taskData.milestone_id,
                sprint: taskData.sprint_id,
                assignee: taskData.assignee,
                start_date: taskData.start_date,
                end_date: taskData.end_date,
                estimated_hours: taskData.estimated_hours,
            };

            if (editingTask) {
                await updateTask(token, editingTask.id, apiTaskData);
                setAllTasks(allTasks.map(task =>
                    task.id === editingTask.id
                        ? { ...task, ...apiTaskData }
                        : task
                ));
                setTasks(tasks.map(task =>
                    task.id === editingTask.id
                        ? { ...task, ...apiTaskData }
                        : task
                ));
            } else {
                const newTask = await createTask(token, apiTaskData);
                setAllTasks([...allTasks, newTask]);
                // Only add to tasks if it's a backlog task
                if (!newTask.sprint && newTask.status !== 'done') {
                    setTasks([...tasks, newTask]);
                }
            }
        } catch (error) {
            console.error('Failed to save task:', error);
        }

        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    // Calculate project progress based on milestone progress
    const projectProgress = calculateProjectProgress(milestones, sprints, allTasks);

    const milestoneFields = useMemo(() => [
        {
            name: "name",
            label: "Milestone Name",
            type: "text" as const,
            required: true,
            placeholder: "Enter milestone name"
        },
        {
            name: "description",
            label: "Description",
            type: "textarea" as const,
            placeholder: "Describe this milestone"
        },
        {
            name: "status",
            label: "Status",
            type: "select" as const,
            required: true,
            defaultValue: "planning",
            options: [
                { value: "planning", label: "Planning" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" }
            ]
        },
        {
            name: "planned_start",
            label: "Planned Start Date",
            type: "date" as const
        },
        {
            name: "actual_start",
            label: "Actual Start Date",
            type: "date" as const
        },
        {
            name: "due_date",
            label: "Due Date",
            type: "date" as const
        },
        {
            name: "assignee",
            label: "Assignee",
            type: "select" as const,
            options: [
                { value: "1", label: "User 1" },
                { value: "2", label: "User 2" }
            ]
        }
    ], []);

    const sprintFields = useMemo(() => [
        {
            name: "name",
            label: "Sprint Name",
            type: "text" as const,
            required: true,
            placeholder: "Enter sprint name"
        },
        {
            name: "status",
            label: "Status",
            type: "select" as const,
            required: true,
            defaultValue: "planned",
            options: [
                { value: "planned", label: "Planned" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" }
            ]
        },
        {
            name: "start_date",
            label: "Start Date",
            type: "date" as const
        },
        {
            name: "end_date",
            label: "End Date",
            type: "date" as const
        },
        {
            name: "milestone",
            label: "Milestone",
            type: "select" as const,
            required: true,
            options: milestones.map(milestone => ({
                value: milestone.id.toString(),
                label: milestone.name
            }))
        }
    ], [milestones]);

    if (loading) {
        return (
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center">Loading project...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center">Project not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-lg">
                                    {project.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                                <p className="text-gray-600">{project.client_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {project.status.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500">
                                Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            {project.budget && (
                                <span className="text-gray-500">
                                    Budget: ${project.budget}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Export Project
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Edit Project
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                     <nav className="flex">
                         <button
                             onClick={() => setActiveTab('overview')}
                             className={`px-6 py-3 text-sm font-medium ${
                                 activeTab === 'overview'
                                     ? 'text-blue-600 border-b-2 border-blue-600'
                                     : 'text-gray-500 hover:text-gray-700'
                             }`}
                         >
                             Overview
                         </button>
                         <button
                             onClick={() => setActiveTab('milestones')}
                             className={`px-6 py-3 text-sm font-medium ${
                                 activeTab === 'milestones'
                                     ? 'text-blue-600 border-b-2 border-blue-600'
                                     : 'text-gray-500 hover:text-gray-700'
                             }`}
                         >
                             Milestones
                         </button>
                         <button
                             onClick={() => setActiveTab('backlog')}
                             className={`px-6 py-3 text-sm font-medium ${
                                 activeTab === 'backlog'
                                     ? 'text-blue-600 border-b-2 border-blue-600'
                                     : 'text-gray-500 hover:text-gray-700'
                             }`}
                         >
                             Backlog
                         </button>
                         <button
                             onClick={() => setActiveTab('sprints')}
                             className={`px-6 py-3 text-sm font-medium ${
                                 activeTab === 'sprints'
                                     ? 'text-blue-600 border-b-2 border-blue-600'
                                     : 'text-gray-500 hover:text-gray-700'
                             }`}
                         >
                             Sprints
                         </button>
                         <button
                             onClick={() => setActiveTab('documents')}
                             className={`px-6 py-3 text-sm font-medium ${
                                 activeTab === 'documents'
                                     ? 'text-blue-600 border-b-2 border-blue-600'
                                     : 'text-gray-500 hover:text-gray-700'
                             }`}
                         >
                             Documents
                         </button>
                         <button
                             onClick={() => setActiveTab('completed')}
                             className={`px-6 py-3 text-sm font-medium ${
                                 activeTab === 'completed'
                                     ? 'text-blue-600 border-b-2 border-blue-600'
                                     : 'text-gray-500 hover:text-gray-700'
                             }`}
                         >
                             Completed Tasks
                         </button>
                     </nav>
                 </div>

                 {/* Tab Content */}
                 <div className="p-6">
                     {activeTab === 'overview' && (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                             {/* Progress Section */}
                             <div className="md:col-span-2">
                                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
                                 <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                          <span className="text-sm font-medium text-gray-700">{projectProgress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                              className="bg-blue-600 h-2 rounded-full"
                                              style={{ width: `${projectProgress}%` }}
                                          ></div>
                                      </div>
                                 </div>
                             </div>

                             {/* Metrics */}
                             <div className="space-y-4">
                                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                                      <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
                                      <div className="text-sm text-gray-600">Milestones</div>
                                  </div>
                                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                                      <div className="text-2xl font-bold text-gray-900">{totalTasksCount}</div>
                                      <div className="text-sm text-gray-600">Tasks</div>
                                  </div>
                                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                                      <div className="text-2xl font-bold text-gray-900">{sprints.length}</div>
                                      <div className="text-sm text-gray-600">Sprints</div>
                                  </div>
                             </div>
                         </div>
                     )}

                     {activeTab === 'milestones' && (
                         <MilestoneList
                             title=""
                             addButtonText="Add Milestone"
                             onAdd={handleAddMilestone}
                             onEdit={handleEditMilestone}
                             onDelete={handleDeleteMilestone}
                             searchPlaceholder="Search milestones..."
                              emptyState={{
                                  icon: ({ className }) => <div className={`${className} text-4xl`}>🎯</div>,
                                  title: "No milestones found",
                                  description: "Start by creating your first milestone to break down your project.",
                                  buttonText: "+ Add Milestone"
                              }}
                             milestones={milestones}
                             loading={milestonesLoading}
                         />
                     )}

                        {activeTab === 'backlog' && (
                            <BacklogView
                                title=""
                                addButtonText="Add Task"
                                onAdd={handleAddTask}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onAssignToSprint={handleAssignToSprint}
                                searchPlaceholder="Search tasks..."
                                emptyState={{
                                    icon: ({ className }) => <div className={`${className} text-4xl`}>📋</div>,
                                    title: "No tasks in backlog",
                                    description: "All tasks are currently assigned to sprints or completed.",
                                    buttonText: "+ Add Task"
                                }}
                                tasks={tasks}
                                loading={tasksLoading}
                            />
                        )}

                      {activeTab === 'sprints' && (
                           <SprintList
                               title=""
                               addButtonText="Add Sprint"
                               onAdd={handleAddSprint}
                               onEdit={handleEditSprint}
                               onDelete={handleDeleteSprint}
                               onOpenKanban={handleOpenKanban}
                               searchPlaceholder="Search sprints..."
                               emptyState={{
                                   icon: ({ className }) => <div className={`${className} text-4xl`}>🏃‍♂️</div>,
                                   title: "No sprints found",
                                   description: "Start by creating your first sprint to organize your work.",
                                   buttonText: "+ Add Sprint"
                               }}
                               sprints={sprints}
                               loading={sprintsLoading}
                           />
                      )}

                     {activeTab === 'documents' && (
                         <div className="text-center py-12">
                             <div className="text-4xl mb-4">📄</div>
                             <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                             <p className="text-gray-600">Document management coming soon...</p>
                         </div>
                     )}

                       {activeTab === 'completed' && (
                           <div>
                               <div className="flex justify-between items-center mb-6">
                                   <h2 className="text-2xl font-bold text-gray-900">Completed Tasks</h2>
                               </div>

                               {completedTasks.length === 0 ? (
                                   <div className="text-center py-12">
                                       <div className="text-4xl mb-4">✅</div>
                                       <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Tasks</h3>
                                       <p className="text-gray-600">Tasks marked as done will appear here.</p>
                                   </div>
                               ) : (
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                       {completedTasks.map((task) => (
                                           <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                               <div className="flex items-start justify-between mb-3">
                                                   <h4 className="text-lg font-medium text-gray-900 flex-1 pr-2">
                                                       {task.title}
                                                   </h4>
                                                   <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                       Completed
                                                   </span>
                                               </div>

                                               {task.description && (
                                                   <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                       {task.description}
                                                   </p>
                                               )}

                                               <div className="space-y-2 text-sm text-gray-500">
                                                   <div className="flex justify-between">
                                                       <span>Priority:</span>
                                                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                           task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                           task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                           task.priority === 'low' ? 'bg-green-100 text-green-800' :
                                                           'bg-gray-100 text-gray-800'
                                                       }`}>
                                                           {task.priority || 'Medium'}
                                                       </span>
                                                   </div>
                                                   <div className="flex justify-between">
                                                       <span>Estimated Hours:</span>
                                                       <span>{task.estimated_hours || 0}h</span>
                                                   </div>
                                                   {task.sprint_name && (
                                                       <div className="flex justify-between">
                                                           <span>Sprint:</span>
                                                           <span>{task.sprint_name}</span>
                                                       </div>
                                                   )}
                                                   <div className="flex justify-between">
                                                       <span>Completed:</span>
                                                       <span>{task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'Recently'}</span>
                                                   </div>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                        )}

                      {activeTab === 'overview' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <h4 className="text-md font-semibold text-gray-900 mb-3">Project Details</h4>
                                 <div className="space-y-2">
                                     <div className="flex justify-between">
                                         <span className="text-sm text-gray-600">Priority:</span>
                                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                             project.priority === 'low' ? 'bg-green-100 text-green-800' :
                                             project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                             project.priority === 'high' ? 'bg-red-100 text-red-800' :
                                             'bg-purple-100 text-purple-800'
                                         }`}>
                                             {project.priority}
                                         </span>
                                     </div>
                                     <div className="flex justify-between">
                                         <span className="text-sm text-gray-600">Start Date:</span>
                                         <span className="text-sm text-gray-900">
                                             {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                                         </span>
                                     </div>
                                     <div className="flex justify-between">
                                         <span className="text-sm text-gray-600">End Date:</span>
                                         <span className="text-sm text-gray-900">
                                             {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                                         </span>
                                     </div>
                                     {project.tags && (
                                         <div className="flex justify-between">
                                             <span className="text-sm text-gray-600">Tags:</span>
                                             <span className="text-sm text-gray-900">{project.tags}</span>
                                         </div>
                                     )}
                                 </div>
                             </div>

                             <div>
                                 <h4 className="text-md font-semibold text-gray-900 mb-3">Team & Access</h4>
                                 <div className="space-y-2">
                                     <div className="flex justify-between">
                                         <span className="text-sm text-gray-600">Team Members:</span>
                                         <span className="text-sm text-gray-900">{project.team_members.length}</span>
                                     </div>
                                     <div className="flex justify-between">
                                         <span className="text-sm text-gray-600">Access Groups:</span>
                                         <span className="text-sm text-gray-900">{project.access_groups.length}</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    )}
                 </div>
              </div>

               <AddMilestoneModal
                   isOpen={isMilestoneModalOpen}
                   onClose={() => setIsMilestoneModalOpen(false)}
                   title={editingMilestone ? "Edit Milestone" : "Add Milestone"}
                   fields={milestoneFields}
                  onSubmit={handleSubmitMilestone}
                  submitButtonText={editingMilestone ? "Update Milestone" : "Add Milestone"}
                  editingMilestone={editingMilestone}
              />

                <AddSprintModal
                    isOpen={isSprintModalOpen}
                    onClose={() => setIsSprintModalOpen(false)}
                    title={editingSprint ? "Edit Sprint" : "Add Sprint"}
                    fields={sprintFields}
                   onSubmit={handleSubmitSprint}
                   submitButtonText={editingSprint ? "Update Sprint" : "Add Sprint"}
                   editingSprint={editingSprint}
                   milestones={milestones}
               />

                <AddTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSubmitTask}
                    milestones={milestones}
                    sprints={sprints}
                    tenantMembers={tenantMembers}
                    initialData={editingTask ? {
                        title: editingTask.title,
                        description: editingTask.description,
                        priority: editingTask.priority as 'low' | 'medium' | 'high' | 'urgent',
                        milestone_id: editingTask.milestone,
                        sprint_id: editingTask.sprint,
                        assignee: editingTask.assignee,
                        estimated_hours: editingTask.estimated_hours,
                        start_date: editingTask.start_date,
                        end_date: editingTask.end_date
                    } : undefined}
                />
          </div>
      );
  }