import React from 'react';
import type { StartNodeData } from '@/types/workflow.types';

interface Props {
  data: StartNodeData;
  onChange: (updates: Partial<StartNodeData>) => void;
}

const StartForm: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Workflow Name
        </label>
        <input
          type="text"
          value={data.workflowName || ''}
          onChange={(e) => onChange({ workflowName: e.target.value, label: e.target.value || 'Start' })}
          placeholder="e.g., Employee Onboarding"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe this workflow..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Trigger Type
        </label>
        <select
          value={data.triggerType || 'manual'}
          onChange={(e) =>
            onChange({ triggerType: e.target.value as 'manual' | 'scheduled' | 'event' })
          }
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        >
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
          <option value="event">Event-based</option>
        </select>
      </div>
    </div>
  );
};

export default StartForm;
