"use client";

import React from "react";
import { Edit, FileText } from "lucide-react";
import Button from "@/features/shared/components/ui/Button";
import type { Project, User } from "@/api";

interface ProjectHeaderProps {
    project: Project;
    owner: User | null;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, owner }) => {
    const createdDate = new Date(project.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });

    return (
        <header className="bg-blue-600 text-white px-8 py-10 shadow-md">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                        {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        <p className="text-blue-100">by {owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${project.status === "planning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : project.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {project.status}
                        </span>
                        <p className="text-sm text-blue-100 mt-1">
                            Created {createdDate}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">${project.budget || "0"}</p>
                        <p className="text-sm text-blue-100">Budget</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white/10 text-white border-white/20">
                            <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="outline" className="bg-white/10 text-white border-white/20">
                            <FileText className="h-4 w-4 mr-2" /> Export
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ProjectHeader;