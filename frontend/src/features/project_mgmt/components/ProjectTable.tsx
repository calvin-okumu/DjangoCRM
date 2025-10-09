"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/shared/Pagination";
import type { Project } from "@/api";

interface ProjectTableProps {
    projects: Project[];
    page: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onEdit: (project: Project) => void;
    onDelete: (id: number) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
    projects,
    page,
    totalPages,
    itemsPerPage,
    onPageChange,
    onEdit,
    onDelete,
}) => {
    const router = useRouter();
    const visible = projects.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                        {["Project", "Client", "Priority", "Status", "Budget", "Actions"].map(h => (
                            <th key={h} className="px-6 py-3 text-left font-medium">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                      {visible.map((project) => (
                          <tr
                              key={project.id}
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => router.push(`/dashboard/project_mgmt/project/${project.id}`)}
                          >
                              <td className="px-6 py-4 font-medium">{project.name}</td>
                             <td className="px-6 py-4">{project.client_name}</td>
                             <td className="px-6 py-4">
                                 <span
                                     className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                         project.priority === "high"
                                             ? "bg-red-100 text-red-800"
                                             : project.priority === "medium"
                                             ? "bg-yellow-100 text-yellow-800"
                                             : "bg-green-100 text-green-800"
                                     }`}
                                 >
                                     {project.priority}
                                 </span>
                             </td>
                             <td className="px-6 py-4">{project.status}</td>
                             <td className="px-6 py-4">${project.budget ?? "-"}</td>
                             <td className="px-6 py-4">
                                 <div className="flex gap-2">
                                     <button
                                         onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                                         className="text-blue-600 hover:text-blue-800"
                                     >
                                         <Edit className="h-5 w-5" />
                                     </button>
                                     <button
                                         onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                                         className="text-red-600 hover:text-red-800"
                                     >
                                         <Trash2 className="h-5 w-5" />
                                     </button>
                                 </div>
                             </td>
                         </tr>
                     ))}
                </tbody>
            </table>
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                totalItems={projects.length}
            />
        </div>
    );
};

export default ProjectTable;