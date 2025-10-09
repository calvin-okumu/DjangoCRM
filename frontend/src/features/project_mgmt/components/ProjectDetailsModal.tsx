"use client";

import React from "react";
import { X } from "lucide-react";
import type { Project, Milestone, Sprint, Task } from "@/api";

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    milestones: Milestone[];
    sprints: Sprint[];
    tasks: Task[];
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
    isOpen,
    onClose,
    project,
    milestones,
    sprints,
    tasks,
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-fadeIn" />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b pb-3">
                        <h3 className="text-2xl font-semibold text-gray-900">{project.name} Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Project Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Client</p>
                                <p className="font-medium">{project.client_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{project.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Priority</p>
                                <p className="font-medium">{project.priority}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="font-medium">${project.budget ?? "Not set"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Start Date</p>
                                <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">End Date</p>
                                <p className="font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Progress</p>
                                <p className="font-medium">{project.progress}%</p>
                            </div>
                        </div>

                        {/* Milestones */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Milestones ({milestones.length})</h4>
                            {milestones.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {milestones.map((milestone) => (
                                        <div key={milestone.id} className="bg-gray-50 rounded-lg p-4 border">
                                            <h5 className="font-medium text-gray-900">{milestone.name}</h5>
                                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                            <div className="flex items-center mt-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    milestone.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {milestone.status}
                                                </span>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Due: {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : "No due date"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No milestones yet</p>
                            )}
                        </div>

                        {/* Sprints */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Sprints ({sprints.length})</h4>
                            {sprints.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sprints.map((sprint) => (
                                        <div key={sprint.id} className="bg-gray-50 rounded-lg p-4 border">
                                            <h5 className="font-medium text-gray-900">{sprint.name}</h5>
                                            <div className="flex items-center mt-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    sprint.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                                }`}>
                                                    {sprint.status}
                                                </span>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    {sprint.start_date && sprint.end_date ? `${new Date(sprint.start_date).toLocaleDateString()} - ${new Date(sprint.end_date).toLocaleDateString()}` : "No dates"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No sprints yet</p>
                            )}
                        </div>

                        {/* Tasks */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Tasks ({tasks.length})</h4>
                            {tasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="bg-gray-50 rounded-lg p-4 border">
                                            <h5 className="font-medium text-gray-900">{task.title}</h5>
                                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            <div className="flex items-center mt-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    task.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {task.status}
                                                </span>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Priority: {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No tasks yet</p>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.25s ease-out forwards;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default ProjectDetailsModal;