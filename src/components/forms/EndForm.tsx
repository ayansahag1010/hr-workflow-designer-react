import React from 'react';
import type { EndNodeData } from '@/types/workflow.types';

interface Props {
  data: EndNodeData;
  onChange: (updates: Partial<EndNodeData>) => void;
}

const EndForm: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Completion Status
        </label>
        <select
          value={data.status || 'completed'}
          onChange={(e) =>
            onChange({
              status: e.target.value as 'completed' | 'cancelled' | 'failed',
              label: `End (${e.target.value})`,
            })
          }
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
        >
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={data.notifyOnComplete ?? true}
            onChange={(e) => onChange({ notifyOnComplete: e.target.checked })}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-rose-200"></div>
        </label>
        <span className="text-xs font-medium text-gray-700">
          Notify on completion
        </span>
      </div>

      <div className="rounded-lg bg-rose-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 mb-1">
          Info
        </p>
        <p className="text-xs text-gray-600">
          The End node marks the termination point of the workflow.
          Configure the final status and notification preferences.
        </p>
      </div>
    </div>
  );
};

export default EndForm;
