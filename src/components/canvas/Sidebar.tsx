import React from 'react';
import type { WorkflowNodeType } from '@/types/workflow.types';
import { Play, ClipboardList, ShieldCheck, Zap, CircleStop } from 'lucide-react';

interface NodePaletteConfig {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  hoverBorder: string;
}

const NODE_PALETTE: NodePaletteConfig[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Begin workflow',
    icon: <Play className="h-4.5 w-4.5 text-emerald-600" />,
    gradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Manual action',
    icon: <ClipboardList className="h-4.5 w-4.5 text-blue-600" />,
    gradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Require sign-off',
    icon: <ShieldCheck className="h-4.5 w-4.5 text-amber-600" />,
    gradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
  },
  {
    type: 'automated',
    label: 'Automation',
    description: 'Run action',
    icon: <Zap className="h-4.5 w-4.5 text-purple-600" />,
    gradient: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Terminate flow',
    icon: <CircleStop className="h-4.5 w-4.5 text-rose-600" />,
    gradient: 'from-rose-50 to-red-50',
    borderColor: 'border-rose-200',
    hoverBorder: 'hover:border-rose-400',
  },
];

const Sidebar: React.FC = () => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: WorkflowNodeType
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-4">
        <h2 className="text-sm font-bold text-gray-800">Node Palette</h2>
        <p className="mt-0.5 text-[10px] text-gray-400">Drag nodes to canvas</p>
      </div>

      {/* Nodes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {NODE_PALETTE.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className={`
              group flex items-center gap-3 rounded-xl border bg-gradient-to-r p-3
              ${item.gradient} ${item.borderColor} ${item.hoverBorder}
              cursor-grab transition-all duration-200
              hover:shadow-md hover:-translate-y-0.5
              active:cursor-grabbing active:scale-[0.97]
            `}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-500">Tip:</span> Drag a node onto the canvas, then click it to configure.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
