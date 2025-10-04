"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProject } from '../../../../../api';
import { Project } from '../../../../../api/types';

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

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
                        <a href="#" className="px-6 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                            Overview
                        </a>
                        <a href="#" className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Milestones
                        </a>
                        <a href="#" className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Backlog
                        </a>
                        <a href="#" className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Sprints
                        </a>
                        <a href="#" className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Documents
                        </a>
                        <a href="#" className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Completed Tasks
                        </a>
                    </nav>
                </div>

                {/* Overview Content */}
                <div className="p-6">
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

                    {/* Additional Details */}
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
                </div>
            </div>
        </div>
    );
}