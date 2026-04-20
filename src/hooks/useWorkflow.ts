import { useCallback, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  type Edge,
  type Connection,
  addEdge,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import type {
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '@/types/workflow.types';

const DEFAULT_DATA: Record<WorkflowNodeType, () => WorkflowNodeData> = {
  start: (): StartNodeData => ({
    label: 'Start',
    type: 'start',
    workflowName: '',
    description: '',
    triggerType: 'manual',
  }),
  task: (): TaskNodeData => ({
    label: 'New Task',
    type: 'task',
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    customFields: [],
  }),
  approval: (): ApprovalNodeData => ({
    label: 'Approval',
    type: 'approval',
    title: '',
    approverRole: '',
    autoApproveThreshold: 0,
    escalationTimeout: 24,
    requireComment: false,
  }),
  automated: (): AutomatedNodeData => ({
    label: 'Automation',
    type: 'automated',
    title: '',
    actionId: '',
    actionConfig: {},
  }),
  end: (): EndNodeData => ({
    label: 'End',
    type: 'end',
    status: 'completed',
    notifyOnComplete: true,
  }),
};

export function useWorkflowNodes() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);

  const addNode = useCallback(
    (type: WorkflowNodeType, position: { x: number; y: number }) => {
      const id = uuidv4();
      const data = DEFAULT_DATA[type]();
      const newNode = {
        id,
        type,
        position,
        data,
      } as WorkflowNode;
      setNodes((prev) => [...prev, newNode]);
      return id;
    },
    [setNodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<WorkflowNodeData>) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } } as WorkflowNode
            : node
        )
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    },
    [setNodes]
  );

  const setValidationState = useCallback(
    (validationMap: Map<string, string[]>) => {
      setNodes((prev) =>
        prev.map((node) => {
          const errors = validationMap.get(node.id);
          return {
            ...node,
            data: {
              ...node.data,
              isValid: !errors || errors.length === 0,
              validationErrors: errors || [],
            },
          } as WorkflowNode;
        })
      );
    },
    [setNodes]
  );

  return {
    nodes,
    setNodes,
    onNodesChange,
    addNode,
    updateNodeData,
    deleteNode,
    setValidationState,
  };
}

export function useWorkflowEdges() {
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((prev) =>
        addEdge(
          {
            ...connection,
            id: uuidv4(),
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          },
          prev
        )
      );
    },
    [setEdges]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  const deleteEdgesForNode = useCallback(
    (nodeId: string) => {
      setEdges((prev) =>
        prev.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setEdges]
  );

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    deleteEdge,
    deleteEdgesForNode,
  };
}

// ─── Undo/Redo Hook ─────────────────────────────────────────────────────────

interface HistoryState {
  nodes: WorkflowNode[];
  edges: Edge[];
}

export function useUndoRedo(
  nodes: WorkflowNode[],
  edges: Edge[],
  setNodes: (nodes: WorkflowNode[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  const past = useRef<HistoryState[]>([]);
  const future = useRef<HistoryState[]>([]);
  const isUndoRedoing = useRef(false);

  const saveSnapshot = useCallback(() => {
    if (isUndoRedoing.current) return;
    past.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    future.current = [];
    // Keep history bounded
    if (past.current.length > 50) past.current.shift();
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    isUndoRedoing.current = true;
    future.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    const prev = past.current.pop()!;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setTimeout(() => {
      isUndoRedoing.current = false;
    }, 0);
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    isUndoRedoing.current = true;
    past.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    const next = future.current.pop()!;
    setNodes(next.nodes);
    setEdges(next.edges);
    setTimeout(() => {
      isUndoRedoing.current = false;
    }, 0);
  }, [nodes, edges, setNodes, setEdges]);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { saveSnapshot, undo, redo, canUndo, canRedo };
}
