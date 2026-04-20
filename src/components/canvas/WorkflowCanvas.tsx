import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { WorkflowNode, WorkflowNodeData, WorkflowNodeType } from '@/types/workflow.types';

import StartNodeComponent from '@/components/nodes/StartNode';
import TaskNodeComponent from '@/components/nodes/TaskNode';
import ApprovalNodeComponent from '@/components/nodes/ApprovalNode';
import AutomatedNodeComponent from '@/components/nodes/AutomatedNode';
import EndNodeComponent from '@/components/nodes/EndNode';

const nodeTypes = {
  start: StartNodeComponent,
  task: TaskNodeComponent,
  approval: ApprovalNodeComponent,
  automated: AutomatedNodeComponent,
  end: EndNodeComponent,
};

const MINIMAP_COLORS: Record<string, string> = {
  start: '#10b981',
  task: '#3b82f6',
  approval: '#f59e0b',
  automated: '#8b5cf6',
  end: '#ef4444',
};

interface Props {
  nodes: WorkflowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: (connection: Connection) => void;
  onAddNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  onNodeClick: (node: WorkflowNode) => void;
  onSaveSnapshot: () => void;
}

const WorkflowCanvas: React.FC<Props> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onNodeClick,
  onSaveSnapshot,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onSaveSnapshot();
      onAddNode(type, position);
    },
    [screenToFlowPosition, onAddNode, onSaveSnapshot]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: WorkflowNode) => {
      onNodeClick(node);
    },
    [onNodeClick]
  );

  const handlePaneClick = useCallback(() => {
    onNodeClick(null as unknown as WorkflowNode);
  }, [onNodeClick]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow<WorkflowNode, Edge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => {
          onSaveSnapshot();
          onConnect(params);
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }}
        className="bg-gray-50"
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={['Delete', 'Backspace']}
        onNodesDelete={() => onSaveSnapshot()}
        onEdgesDelete={() => onSaveSnapshot()}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d1d5db"
        />
        <Controls
          className="!border !border-gray-200 !rounded-xl !shadow-lg [&>button]:!border-gray-200 [&>button]:!bg-white [&>button]:!text-gray-600 [&>button:hover]:!bg-gray-50"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as WorkflowNodeData;
            return MINIMAP_COLORS[data?.type] || '#94a3b8';
          }}
          nodeStrokeWidth={3}
          className="!border !border-gray-200 !rounded-xl !shadow-lg !bg-white"
          maskColor="rgba(0,0,0,0.08)"
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
