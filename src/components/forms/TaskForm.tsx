import React from 'react';
import type { TaskNodeData, CustomField } from '@/types/workflow.types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: TaskNodeData;
  onChange: (updates: Partial<TaskNodeData>) => void;
}

const TaskForm: React.FC<Props> = ({ data, onChange }) => {
  const addCustomField = () => {
    const newField: CustomField = { id: uuidv4(), key: '', value: '' };
    onChange({ customFields: [...(data.customFields || []), newField] });
  };

  const updateCustomField = (id: string, key: string, value: string) => {
    const updated = (data.customFields || []).map((f) =>
      f.id === id ? { ...f, key, value } : f
    );
    onChange({ customFields: updated });
  };

  const removeCustomField = (id: string) => {
    onChange({ customFields: (data.customFields || []).filter((f) => f.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value, label: e.target.value || 'New Task' })}
          placeholder="e.g., Collect Documents"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the task..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Assignee
        </label>
        <input
          type="text"
          value={data.assignee || ''}
          onChange={(e) => onChange({ assignee: e.target.value })}
          placeholder="e.g., John Doe"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={data.dueDate || ''}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Priority
          </label>
          <select
            value={data.priority || 'medium'}
            onChange={(e) =>
              onChange({
                priority: e.target.value as 'low' | 'medium' | 'high' | 'critical',
              })
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Dynamic Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700">
            Custom Fields
          </label>
          <button
            onClick={addCustomField}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Plus className="h-3 w-3" /> Add Field
          </button>
        </div>
        <div className="space-y-2">
          {(data.customFields || []).map((field) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                value={field.key}
                onChange={(e) =>
                  updateCustomField(field.id, e.target.value, field.value)
                }
                placeholder="Key"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:bg-white"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) =>
                  updateCustomField(field.id, field.key, e.target.value)
                }
                placeholder="Value"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:bg-white"
              />
              <button
                onClick={() => removeCustomField(field.id)}
                className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
