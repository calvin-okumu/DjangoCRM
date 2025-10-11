"use client";

import ProjectSection from "@/components/dashboard/project-management/ProjectSection";

export default function ProjectManagementPage() {
    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Project Management</h1>
            <ProjectSection />
        </div>
    );
}