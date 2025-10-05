"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getProject, getMilestones, getSprints, getTasks } from '../../../../../api';
import { Project, Milestone, Sprint, Task } from '../../../../../api/types';
import MilestoneList from '../../components/MilestoneList';
import AddMilestoneModal from '../../components/AddMilestoneModal';
import SprintList from '../../components/SprintList';
import AddSprintModal from '../../components/AddSprintModal';

import BacklogWithModal from '../../../components/BacklogWithModal';
import { TaskFormData } from '../../../components/AddTaskModal';

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [milestonesLoading, setMilestonesLoading] = useState(false);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [sprintsLoading, setSprintsLoading] = useState(false);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const fetchMilestones = useCallback(async () => {
        if (!project) return;

        setMilestonesLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await getMilestones(token, project.id);
                setMilestones(data);
            }
        } catch (error) {
            console.error('Failed to fetch milestones:', error);
        } finally {
            setMilestonesLoading(false);
        }
    }, [project]);

    const fetchSprints = useCallback(async () => {
        if (!project) return;

        setSprintsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await getSprints(token, project.id);
                setSprints(data);
            }
        } catch (error) {
            console.error('Failed to fetch sprints:', error);
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
        if (activeTab === 'milestones' && project) {
            fetchMilestones();
        }
    }, [activeTab, project, fetchMilestones]);

    useEffect(() => {
        if (activeTab === 'sprints' && project) {
            fetchSprints();
        }
    }, [activeTab, project, fetchSprints]);

    const fetchTasks = useCallback(async () => {
        if (!project) return;

        setTasksLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const data = await getTasks(token, undefined, undefined); // Get all tasks for the project
                setTasks(data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setTasksLoading(false);
        }
    }, [project]);

    useEffect(() => {
        if (activeTab === 'backlog' && project) {
            fetchTasks();
        }
    }, [activeTab, project, fetchTasks]);

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
        setMilestones(milestones.filter(m => m.id !== milestoneId));
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
                setMilestones(milestones.map(m =>
                    m.id === editingMilestone.id
                        ? { ...m, ...milestoneData }
                        : m
                ));
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
                setMilestones([...milestones, newMilestone]);
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
        setSprints(sprints.filter(s => s.id !== sprintId));
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
                setSprints(sprints.map(s =>
                    s.id === editingSprint.id
                        ? { ...s, ...sprintData }
                        : s
                ));
            } else {
                // TODO: Implement create API call
                console.log('Create sprint:', sprintData);
                // For now, add to local state with mock data
                const newSprint: Sprint = {
                    id: Date.now(), // Mock ID
                    ...sprintData,
                    progress: 0,
                    tasks_count: 0,
                    created_at: new Date().toISOString(),
                };
                setSprints([...sprints, newSprint]);
            }
        } catch (error) {
            console.error('Failed to save sprint:', error);
        }

        setIsSprintModalOpen(false);
        setEditingSprint(null);
    };

    const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
        try {
            // TODO: Implement API call to update task status
            console.log('Update task status:', taskId, newStatus);

            // Update task status and cascade progress updates
            const { updateProgressHierarchy } = await import('@/lib/progressUtils');
            const {
                updatedTasks,
                updatedSprints,
                updatedMilestones,
                updatedProjects
            } = updateProgressHierarchy(
                taskId,
                newStatus,
                tasks,
                sprints,
                milestones,
                project ? [project] : []
            );

            // Update all state with new progress values
            setTasks(updatedTasks);
            setSprints(updatedSprints);
            setMilestones(updatedMilestones);
            if (project) {
                // Update project progress
                const updatedProject = updatedProjects.find(p => p.id === project.id);
                if (updatedProject) {
                    setProject(updatedProject);
                }
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const handleSaveTask = async (taskData: TaskFormData) => {
        try {
            // TODO: Implement API call to create task
            console.log('Create task:', taskData);

            // For now, add to local state
            const milestone = milestones.find(m => m.id === taskData.milestone_id);
            const sprint = taskData.sprint_id ? sprints.find(s => s.id === taskData.sprint_id) : undefined;

            const newTask = {
                id: Date.now(), // Temporary ID
                title: taskData.title,
                description: taskData.description,
                status: 'backlog',
                priority: taskData.priority,
                milestone: taskData.milestone_id,
                milestone_name: milestone?.name || '',
                sprint: taskData.sprint_id,
                sprint_name: sprint?.name,
                assignee: taskData.assignee,
                progress: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            setTasks([...tasks, newTask]);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

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
                                         <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                                     </div>
                                     <div className="w-full bg-gray-200 rounded-full h-2">
                                         <div
                                             className="bg-blue-600 h-2 rounded-full"
                                             style={{ width: `${project.progress}%` }}
                                         ></div>
                                     </div>
                                 </div>
                             </div>

                             {/* Metrics */}
                             <div className="space-y-4">
                                 <div className="bg-white border border-gray-200 rounded-lg p-4">
                                     <div className="text-2xl font-bold text-gray-900">{project.milestones_count}</div>
                                     <div className="text-sm text-gray-600">Milestones</div>
                                 </div>
                                 <div className="bg-white border border-gray-200 rounded-lg p-4">
                                     <div className="text-2xl font-bold text-gray-900">0</div>
                                     <div className="text-sm text-gray-600">Tasks</div>
                                 </div>
                                 <div className="bg-white border border-gray-200 rounded-lg p-4">
                                     <div className="text-2xl font-bold text-gray-900">0</div>
                                     <div className="text-sm text-gray-600">Story Points</div>
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
                            <BacklogWithModal
                                title=""
                                addButtonText="Add Task"
                                searchPlaceholder="Search tasks..."
                                emptyState={{
                                    icon: ({ className }) => <div className={`${className} text-4xl`}>📋</div>,
                                    title: "No tasks in backlog",
                                    description: "All tasks are currently assigned to sprints or completed.",
                                    buttonText: "+ Add Task"
                                }}
                                tasks={tasks}
                                loading={tasksLoading}
                                milestones={milestones}
                                sprints={sprints}
                                onSaveTask={handleSaveTask}
                                onEditTask={(task) => console.log('Edit task:', task)}
                                onDeleteTask={(taskId) => console.log('Delete task:', taskId)}
                                onAssignToSprint={(task) => console.log('Assign to sprint:', task)}
                            />
                        )}

                      {activeTab === 'sprints' && (
                          <SprintList
                              title=""
                              addButtonText="Add Sprint"
                              onAdd={handleAddSprint}
                              onEdit={handleEditSprint}
                              onDelete={handleDeleteSprint}
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
                         <div className="text-center py-12">
                             <div className="text-4xl mb-4">✅</div>
                             <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Tasks</h3>
                             <p className="text-gray-600">Completed tasks view coming soon...</p>
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
                  fields={[
                      {
                          name: "name",
                          label: "Milestone Name",
                          type: "text",
                          required: true,
                          placeholder: "Enter milestone name"
                      },
                      {
                          name: "description",
                          label: "Description",
                          type: "textarea",
                          placeholder: "Describe this milestone"
                      },
                      {
                          name: "status",
                          label: "Status",
                          type: "select",
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
                          type: "date"
                      },
                      {
                          name: "actual_start",
                          label: "Actual Start Date",
                          type: "date"
                      },
                      {
                          name: "due_date",
                          label: "Due Date",
                          type: "date"
                      },
                      {
                          name: "assignee",
                          label: "Assignee",
                          type: "select",
                          options: [
                              { value: "1", label: "User 1" },
                              { value: "2", label: "User 2" }
                          ]
                      }
                  ]}
                  onSubmit={handleSubmitMilestone}
                  submitButtonText={editingMilestone ? "Update Milestone" : "Add Milestone"}
                  editingMilestone={editingMilestone}
              />

              <AddSprintModal
                  isOpen={isSprintModalOpen}
                  onClose={() => setIsSprintModalOpen(false)}
                  title={editingSprint ? "Edit Sprint" : "Add Sprint"}
                  fields={[
                      {
                          name: "name",
                          label: "Sprint Name",
                          type: "text",
                          required: true,
                          placeholder: "Enter sprint name"
                      },
                      {
                          name: "status",
                          label: "Status",
                          type: "select",
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
                          type: "date"
                      },
                      {
                          name: "end_date",
                          label: "End Date",
                          type: "date"
                      },
                      {
                          name: "milestone",
                          label: "Milestone",
                          type: "select",
                          required: true,
                          options: milestones.map(milestone => ({
                              value: milestone.id.toString(),
                              label: milestone.name
                          }))
                      }
                  ]}
                  onSubmit={handleSubmitSprint}
                  submitButtonText={editingSprint ? "Update Sprint" : "Add Sprint"}
                  editingSprint={editingSprint}
                  milestones={milestones}
              />
          </div>
      );
  }