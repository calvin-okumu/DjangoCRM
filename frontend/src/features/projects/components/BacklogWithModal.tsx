"use client";

import React, { useState } from 'react';
import BacklogView from './BacklogView';
import AddTaskModal, { TaskFormData } from './AddTaskModal';
import { Milestone, Sprint, Task } from '@/features/shared/types/common';

interface BacklogWithModalProps {
  title: string;
  addButtonText: string;
  searchPlaceholder: string;
  emptyState: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    buttonText: string;
  };
  tasks?: Task[];
  loading?: boolean;
  milestones?: Milestone[];
  sprints?: Sprint[];
  onSaveTask: (taskData: TaskFormData) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onAssignToSprint?: (task: Task) => void;
}

const BacklogWithModal: React.FC<BacklogWithModalProps> = ({
  title,
  addButtonText,
  searchPlaceholder,
  emptyState,
  tasks,
  loading,
  milestones = [],
  sprints = [],
  onSaveTask,
  onEditTask,
  onDeleteTask,
  onAssignToSprint
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: TaskFormData) => {
    onSaveTask(taskData);
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  // Convert task to form data for editing
  const getInitialData = (task: Task): Partial<TaskFormData> => ({
    title: task.title,
    description: task.description,
    priority: task.priority as TaskFormData['priority'],
    assignee: task.assignee,
    milestone_id: task.milestone,
    sprint_id: task.sprint,
  });

  return (
    <>
      <BacklogView
        title={title}
        addButtonText={addButtonText}
        onAdd={handleAddTask}
        onEdit={onEditTask ? handleEditTask : undefined}
        onDelete={onDeleteTask}
        onAssignToSprint={onAssignToSprint}
        searchPlaceholder={searchPlaceholder}
        emptyState={emptyState}
        tasks={tasks}
        loading={loading}
      />

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        milestones={milestones}
        sprints={sprints}
        initialData={editingTask ? getInitialData(editingTask) : undefined}
      />
    </>
  );
};

export default BacklogWithModal;