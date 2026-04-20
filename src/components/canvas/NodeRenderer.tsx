import React from 'react';
import type { WorkflowNode, WorkflowNodeData } from '@/types/workflow.types';
import StartForm from '@/components/forms/StartForm';
import TaskForm from '@/components/forms/TaskForm';
import ApprovalForm from '@/components/forms/ApprovalForm';
import AutomatedForm from '@/components/forms/AutomatedForm';
import EndForm from '@/components/forms/EndForm';
import { X, Trash2, Play, ClipboardList, ShieldCheck, Zap, CircleStop } from 'lucide-react';

interface Props {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

const TYPE_CONFIG = {
  start: {
    icon: <Play className="h-4 w-4" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Start Node',
  },
  task: {
    icon: <ClipboardList className="h-4 w-4" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Task Node',
  },
  approval: {
    icon: <ShieldCheck className="h-4 w-4" />,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Approval Node',
  },
  automated: {
    icon: <Zap className="h-4 w-4" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: 'Automation Node',
  },
  end: {
    icon: <CircleStop className="h-4 w-4" />,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    label: 'End Node',
  },
};

const NodeRenderer: React.FC<Props> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose,
}) => {
  if (!selectedNode) {
    return (
      <aside className="flex h-full w-[320px] flex-col border-l border-gray-200 bg-white">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
              <ClipboardList className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No node selected</p>
            <p className="mt-1 text-xs text-gray-400">
              Click a node on the canvas to configure it
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const nodeData = selectedNode.data as WorkflowNodeData;
  const config = TYPE_CONFIG[nodeData.type];

  const handleChange = (updates: Partial<WorkflowNodeData>) => {
    onUpdateNode(selectedNode.id, updates);
  };

  const renderForm = () => {
    switch (nodeData.type) {
      case 'start':
        return <StartForm data={nodeData} onChange={handleChange} />;
      case 'task':
        return <TaskForm data={nodeData} onChange={handleChange} />;
      case 'approval':
        return <ApprovalForm data={nodeData} onChange={handleChange} />;
      case 'automated':
        return <AutomatedForm data={nodeData} onChange={handleChange} />;
      case 'end':
        return <EndForm data={nodeData} onChange={handleChange} />;
      default:
        return <p className="text-sm text-gray-500">Unknown node type</p>;
    }
  };

  return (
    <aside className="flex h-full w-[320px] flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bg} ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">{config.label}</h3>
            <p className="text-[10px] text-gray-400">
              ID: {selectedNode.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">{renderForm()}</div>

      {/* Footer Actions */}
      <div className="border-t border-gray-100 px-4 py-3">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Node
        </button>
      </div>
    </aside>
  );
};

export default NodeRenderer;
