import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StartNode as StartNodeType } from '@/types/workflow.types';
import { Play } from 'lucide-react';

const StartNode: React.FC<NodeProps<StartNodeType>> = ({ data, selected }) => {
  return (
    <div
      className={`
        group relative min-w-[180px] rounded-xl border-2 bg-white shadow-lg transition-all duration-200
        hover:shadow-xl hover:-translate-y-0.5
        ${data.isValid === false
          ? 'border-red-500 shadow-red-100'
          : selected
            ? 'border-emerald-500 shadow-emerald-100 ring-2 ring-emerald-200'
            : 'border-emerald-300 hover:border-emerald-400'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Play className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">Start</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium text-gray-700">
          {data.workflowName || 'Workflow Start'}
        </p>
        {data.triggerType && (
          <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            {data.triggerType}
          </span>
        )}
      </div>

      {/* Validation tooltip */}
      {data.isValid === false && data.validationErrors && (
        <div className="absolute -bottom-1 left-1/2 z-50 hidden -translate-x-1/2 translate-y-full group-hover:block">
          <div className="rounded-lg bg-red-600 px-3 py-2 text-xs text-white shadow-lg">
            {data.validationErrors.map((e, i) => (
              <div key={i}>• {e}</div>
            ))}
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500 !shadow-md"
      />
    </div>
  );
};

export default memo(StartNode);
