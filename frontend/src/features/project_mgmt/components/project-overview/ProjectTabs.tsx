"use client";

import React from "react";

interface ProjectTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = ["Overview", "Milestones", "Sprints", "Backlog", "Documents", "Completed"];

    return (
        <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-8 flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            tab === activeTab
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default ProjectTabs;