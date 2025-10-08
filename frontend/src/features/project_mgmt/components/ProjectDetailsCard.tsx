"use client";

import React from "react";
import { CheckCircle, Clock, Target } from "lucide-react";
import Button from "../../shared/components/ui/Button";
import type { Project, Milestone, Sprint, Task } from "@/api";

interface ProjectDetailsCardProps {
    project: Project;
    milestones: Milestone[];
    sprints: Sprint[];
    tasks: Task[];
    onClose: () => void;
}

const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({
    project,
    milestones,
    sprints,
    tasks,
    onClose,
}) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{project.name}</p>
                </div>
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
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">${project.budget ?? "Not set"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="font-medium">{project.progress}%</p>
                </div>
            </div>

            {/* Milestones */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-500" />
                    Milestones ({milestones.length})
                </h4>
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
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-500" />
                    Sprints ({sprints.length})
                </h4>
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
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
                    Tasks ({tasks.length})
                </h4>
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

            <Button onClick={onClose} variant="outline" size="sm">
                Close Details
            </Button>
        </div>
    );
};

export default ProjectDetailsCard;