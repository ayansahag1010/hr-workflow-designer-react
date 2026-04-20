import React from 'react';
import type { ApprovalNodeData } from '@/types/workflow.types';

interface Props {
  data: ApprovalNodeData;
  onChange: (updates: Partial<ApprovalNodeData>) => void;
}

const ApprovalForm: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value, label: e.target.value || 'Approval' })}
          placeholder="e.g., Manager Approval"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Approver Role
        </label>
        <select
          value={data.approverRole || ''}
          onChange={(e) => onChange({ approverRole: e.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
        >
          <option value="">Select role...</option>
          <option value="Direct Manager">Direct Manager</option>
          <option value="Department Head">Department Head</option>
          <option value="HR Manager">HR Manager</option>
          <option value="VP">VP</option>
          <option value="C-Level">C-Level</option>
          <option value="Finance">Finance</option>
          <option value="Legal">Legal</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Auto-Approve Threshold ($)
        </label>
        <input
          type="number"
          value={data.autoApproveThreshold || 0}
          onChange={(e) =>
            onChange({ autoApproveThreshold: Number(e.target.value) })
          }
          placeholder="0 = disabled"
          min={0}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
        />
        <p className="mt-1 text-[10px] text-gray-400">
          Items below this amount are auto-approved. Set to 0 to disable.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Escalation Timeout (hours)
        </label>
        <input
          type="number"
          value={data.escalationTimeout || 24}
          onChange={(e) =>
            onChange({ escalationTimeout: Number(e.target.value) })
          }
          min={1}
          max={168}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={data.requireComment || false}
            onChange={(e) => onChange({ requireComment: e.target.checked })}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-amber-200"></div>
        </label>
        <span className="text-xs font-medium text-gray-700">Require comment</span>
      </div>
    </div>
  );
};

export default ApprovalForm;
