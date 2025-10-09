"use client";

import React from 'react';
import { Target, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Project, Milestone, Sprint, Task } from '@/features/shared/types/common';
import Card from '@/features/shared/components/ui/Card';
import Button from '@/features/shared/components/ui/Button';

interface ProjectDashboardProps {
  project: Project;
  milestones: Milestone[];
  sprints: Sprint[];
  tasks: Task[];
  onNavigate: (section: string) => void;
  activeTab: string;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  milestones,
  sprints,
  tasks,
  onNavigate,
  activeTab
}) => {
  const navigationItems = [
    { key: 'overview', label: 'Overview', active: activeTab === 'overview' },
    { key: 'milestones', label: 'Milestones', active: activeTab === 'milestones' },
    { key: 'backlog', label: 'Backlog', active: activeTab === 'backlog' },
    { key: 'sprints', label: 'Sprints', active: activeTab === 'sprints' },
    { key: 'documents', label: 'Documents', active: activeTab === 'documents' },
    { key: 'completed', label: 'Completed Tasks', active: activeTab === 'completed' }
  ];

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const activeSprints = sprints.filter(s => s.status === 'active').length;

  const overdueTasks = tasks.filter(task => {
    if (!task.end_date) return false;
    return new Date(task.end_date) < new Date() && task.status !== 'done';
  }).length;

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatus = () => {
    if (overdueTasks > 0) return { status: 'At Risk', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (project.progress >= 75) return { status: 'On Track', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (project.progress >= 50) return { status: 'Good Progress', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
    return { status: 'Needs Attention', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  item.active
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Progress Visualization */}
      <Card className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-50 rounded-full mb-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getProgressColor(project.progress)}`}>
                {project.progress}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Progress</h2>
          <p className="text-gray-600">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {completedMilestones}/{milestones.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <Target className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => onNavigate('milestones')}
          >
            View Milestones
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => onNavigate('backlog')}
          >
            View Tasks
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Sprints</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {activeSprints}
              </p>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
            </div>
            <Clock className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => onNavigate('sprints')}
          >
            View Sprints
          </Button>
        </Card>
      </div>

      {/* Project Health Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Health</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${healthStatus.color}`}>
            <HealthIcon className="h-4 w-4 mr-1" />
            {healthStatus.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {completedMilestones}/{milestones.length}
            </div>
            <div className="text-sm text-gray-600">Milestones</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {overdueTasks}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {activeSprints}
            </div>
            <div className="text-sm text-gray-600">Active Sprints</div>
          </div>
        </div>

        {overdueTasks > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                {overdueTasks} task{overdueTasks !== 1 ? 's are' : ' is'} overdue. Consider adjusting timelines or priorities.
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDashboard;