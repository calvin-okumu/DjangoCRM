"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProject } from '@/api/project_mgmt';
import type { Project } from '@/api/types';
import Loader from '@/components/shared/Loader';
import ProjectHeader from '@/components/dashboard/project-management/project-overview/ProjectHeader';
import ProjectTabs from '@/components/dashboard/project-management/project-overview/ProjectTabs';
import OverviewSection from '@/components/dashboard/project-management/project-overview/OverviewSection';

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No access token');
        setLoading(false);
        return;
      }

      try {
        const data = await getProject(token, parseInt(id));
        setProject(data);
      } catch (err) {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!project) return <div>Project not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProjectHeader project={project} />
                <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
                {activeTab === 'overview' && <OverviewSection project={project} activeTab={activeTab} onTabChange={setActiveTab} />}
                {/* Add other tab contents here */}
            </div>
        </div>
    );
}