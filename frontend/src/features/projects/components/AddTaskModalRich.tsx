"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader, Bold, Italic, Underline, Upload, X } from 'lucide-react';
import Modal from '@/features/shared/components/ui/Modal';
import Button from '@/features/shared/components/ui/Button';
import { Milestone, Sprint } from '@/features/shared/types/common';

interface AddTaskModalRichProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  loading?: boolean;
  milestones?: Milestone[];
  sprints?: Sprint[];
  initialData?: Partial<TaskFormData>;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  milestone_id: number;
  sprint_id?: number;
  assignee?: number;
  story_points?: number;
  estimated_hours?: number;
  start_date?: string;
  end_date?: string;
  attachments?: File[];
}

const AddTaskModalRich: React.FC<AddTaskModalRichProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
  milestones = [],
  sprints = [],
  initialData
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    milestone_id: 0,
    sprint_id: undefined,
    assignee: undefined,
    story_points: undefined,
    estimated_hours: undefined,
    start_date: undefined,
    end_date: undefined,
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        milestone_id: 0,
        sprint_id: undefined,
        assignee: undefined,
        story_points: undefined,
        estimated_hours: undefined,
        start_date: undefined,
        end_date: undefined,
        attachments: []
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    const textarea = document.getElementById('description') as HTMLTextAreaElement;
    if (textarea) {
      handleInputChange('description', textarea.value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.milestone_id) {
      newErrors.milestone_id = 'Milestone is required';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  // Filter sprints based on selected milestone
  const availableSprints = sprints.filter(sprint =>
    !formData.milestone_id || sprint.milestone === formData.milestone_id
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="xl">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description with Rich Text */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="border border-gray-300 rounded-lg">
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-1 hover:bg-gray-200 rounded"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-1 hover:bg-gray-200 rounded"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => formatText('underline')}
                className="p-1 hover:bg-gray-200 rounded"
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </button>
            </div>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border-0 focus:ring-0 focus:outline-none resize-none"
              placeholder="Enter task description with rich text formatting"
            />
          </div>
        </div>

        {/* Priority, Milestone, Sprint Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as TaskFormData['priority'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="milestone" className="block text-sm font-medium text-gray-700 mb-2">
              Milestone *
            </label>
            <select
              id="milestone"
              value={formData.milestone_id || ''}
              onChange={(e) => {
                const milestoneId = parseInt(e.target.value);
                handleInputChange('milestone_id', milestoneId);
                // Reset sprint if milestone changes
                if (formData.sprint_id) {
                  const selectedSprint = sprints.find(s => s.id === formData.sprint_id);
                  if (selectedSprint && selectedSprint.milestone !== milestoneId) {
                    handleInputChange('sprint_id', undefined);
                  }
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.milestone_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Milestone</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </option>
              ))}
            </select>
            {errors.milestone_id && <p className="mt-1 text-sm text-red-600">{errors.milestone_id}</p>}
          </div>

          <div>
            <label htmlFor="sprint" className="block text-sm font-medium text-gray-700 mb-2">
              Sprint (Optional)
            </label>
            <select
              id="sprint"
              value={formData.sprint_id || ''}
              onChange={(e) => handleInputChange('sprint_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.milestone_id}
            >
              <option value="">No Sprint</option>
              {availableSprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Story Points, Estimated Hours, Assignee Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="story_points" className="block text-sm font-medium text-gray-700 mb-2">
              Story Points
            </label>
            <input
              type="number"
              id="story_points"
              value={formData.story_points || ''}
              onChange={(e) => handleInputChange('story_points', e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimated_hours"
              value={formData.estimated_hours || ''}
              onChange={(e) => handleInputChange('estimated_hours', e.target.value ? parseFloat(e.target.value) : undefined)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <input
              type="number"
              id="assignee"
              value={formData.assignee?.toString() ?? ''}
              onChange={(e) => handleInputChange('assignee', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Assignee ID"
            />
          </div>
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              value={formData.start_date || ''}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              value={formData.end_date || ''}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="attachments"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </label>
            </div>

            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddTaskModalRich;