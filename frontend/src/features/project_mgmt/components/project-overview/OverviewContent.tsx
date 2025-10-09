"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import SummaryCard from "./SummaryCard";
import StatItem from "./StatItem";
import type { Milestone, Sprint, Task, User, Project } from "@/api";

interface OverviewContentProps {
    project: Project;
    milestones: Milestone[];
    sprints: Sprint[];
    tasks: Task[];
    allUsers: User[];
}

const OverviewContent: React.FC<OverviewContentProps> = ({
    project,
    milestones,
    sprints,
    tasks,
    allUsers,
}) => {
    const completedMilestones = milestones.filter((m) => m.status === "completed").length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;
    const activeSprint = sprints.find((s) => s.status === "active");

    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter((t) => {
        if (t.status === "completed" || !t.end_date) return false;
        const endDate = new Date(t.end_date);
        endDate.setHours(0, 0, 0, 0);
        return endDate < today;
    }).length;

    // Calculate top workload
    const taskCounts: { [userId: number]: number } = {};
    tasks.forEach(task => {
        if (task.assignee) {
            taskCounts[task.assignee] = (taskCounts[task.assignee] || 0) + 1;
        }
    });
    const topWorkloadUserId = Object.keys(taskCounts).reduce((a, b) =>
        taskCounts[Number(a)] > taskCounts[Number(b)] ? a : b, Object.keys(taskCounts)[0]);
    const topWorkloadUser = allUsers.find(u => u.id === Number(topWorkloadUserId));
    const topWorkloadCount = topWorkloadUserId ? taskCounts[Number(topWorkloadUserId)] : 0;

    // Calculate project health
    const milestoneCompletionRate = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 100;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
    const hasOverdueTasks = overdueTasks > 0;
    const isOnTrack = milestoneCompletionRate >= 70 && taskCompletionRate >= 70 && !hasOverdueTasks;
    const isAtRisk = milestoneCompletionRate < 50 || taskCompletionRate < 50 || overdueTasks > totalTasks * 0.2;
    const projectHealth = isAtRisk ? "At Risk" : isOnTrack ? "On Track" : "Needs Attention";
    const healthColor = isAtRisk ? "red" : isOnTrack ? "green" : "yellow";

    return (
        <>
            {/* Progress */}
            <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6">Project Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatItem label="Overdue Tasks" value={overdueTasks} color="red" />
                    <StatItem
                        label="Top Workload"
                        value={`${topWorkloadCount} tasks`}
                        color="blue"
                        subtext={topWorkloadUser ? `${topWorkloadUser.first_name} ${topWorkloadUser.last_name}` : 'No assignee'}
                    />
                    <StatItem label="Completed Tasks" value={completedTasks} color="green" />
                </div>

                <div className="flex items-center justify-center gap-6">
                    <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="m18,2.0845 a15.9155,15.9155 0 0,1 0,31.831 a15.9155,15.9155 0 0,1 0,-31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${project.progress}, 100`}
                                className="text-blue-600"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{project.progress}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{project.progress}% Complete</p>
                        <p className="text-sm text-gray-600">
                            {completedTasks}/{totalTasks} Story Points
                        </p>
                    </div>
                </div>
            </section>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Milestones"
                    count={milestones.length}
                    subtitle={`${completedMilestones} Complete • ${(
                        (completedMilestones / milestones.length) *
                        100 || 0
                    ).toFixed(0)}% Done`}
                    icon={() => <div />} // Placeholder, will be replaced with actual icon
                    color="green"
                    linkText="View Milestones"
                />
                <SummaryCard
                    title="Tasks"
                    count={totalTasks}
                    subtitle={`${completedTasks} Done • ${project.progress}% Story Points`}
                    icon={() => <div />} // Placeholder
                    color="blue"
                    linkText="View Backlog"
                />
                <SummaryCard
                    title="Sprints"
                    count={sprints.length}
                    subtitle={activeSprint ? activeSprint.name : "No active sprint"}
                    icon={() => <div />} // Placeholder
                    color="orange"
                    linkText="View Sprints"
                />
            </section>

            {/* Project Health & Timeline */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Project Timeline</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View All →
                        </button>
                    </div>
                    <p className="text-gray-600 text-sm">Timeline visualization coming soon</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Project Health</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            healthColor === 'red' ? 'bg-red-100 text-red-800' :
                            healthColor === 'green' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {projectHealth}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-gray-600 text-sm">
                            {milestoneCompletionRate.toFixed(0)}% milestones complete, {taskCompletionRate.toFixed(0)}% tasks complete
                            {hasOverdueTasks && `, ${overdueTasks} overdue tasks`}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default OverviewContent;