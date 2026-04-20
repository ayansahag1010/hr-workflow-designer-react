import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ApprovalNode as ApprovalNodeType } from '@/types/workflow.types';
import { ShieldCheck } from 'lucide-react';

const ApprovalNode: React.FC<NodeProps<ApprovalNodeType>> = ({ data, selected }) => {
  return (
    <div
      className={`
        group relative min-w-[200px] rounded-xl border-2 bg-white shadow-lg transition-all duration-200
        hover:shadow-xl hover:-translate-y-0.5
        ${data.isValid === false
          ? 'border-red-500 shadow-red-100'
          : selected
            ? 'border-amber-500 shadow-amber-100 ring-2 ring-amber-200'
            : 'border-amber-300 hover:border-amber-400'
        }
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-white !bg-amber-500 !shadow-md"
      />

      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">Approval</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">
          {data.title || 'Pending Approval'}
        </p>
        {data.approverRole && (
          <p className="mt-1 text-[10px] text-gray-500 truncate">
            🛡️ {data.approverRole}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {data.autoApproveThreshold !== undefined && data.autoApproveThreshold > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Auto ≤ ${data.autoApproveThreshold}
            </span>
          )}
          {data.requireComment && (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500">
              💬 Required
            </span>
          )}
        </div>
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
        className="!h-3 !w-3 !border-2 !border-white !bg-amber-500 !shadow-md"
      />
    </div>
  );
};

export default memo(ApprovalNode);
