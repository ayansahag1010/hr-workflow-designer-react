import type { Node } from '@xyflow/react';

// ─── Node Types ──────────────────────────────────────────────────────────────

export type WorkflowNodeType =
  | 'start'
  | 'task'
  | 'approval'
  | 'automated'
  | 'end';

// ─── Node Data (carried inside React Flow nodes) ────────────────────────────

export interface BaseNodeData {
  label: string;
  type: WorkflowNodeType;
  isValid?: boolean;
  validationErrors?: string[];
  [key: string]: unknown;
}

export interface StartNodeData extends BaseNodeData {
  type: 'start';
  workflowName?: string;
  description?: string;
  triggerType?: 'manual' | 'scheduled' | 'event';
}

export interface TaskNodeData extends BaseNodeData {
  type: 'task';
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  customFields?: CustomField[];
}

export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  title: string;
  approverRole?: string;
  autoApproveThreshold?: number;
  escalationTimeout?: number;
  requireComment?: boolean;
}

export interface AutomatedNodeData extends BaseNodeData {
  type: 'automated';
  title: string;
  actionId?: string;
  actionConfig?: Record<string, string>;
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  status?: 'completed' | 'cancelled' | 'failed';
  notifyOnComplete?: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── React Flow Custom Node Types ───────────────────────────────────────────

export type StartNode = Node<StartNodeData, 'start'>;
export type TaskNode = Node<TaskNodeData, 'task'>;
export type ApprovalNode = Node<ApprovalNodeData, 'approval'>;
export type AutomatedNode = Node<AutomatedNodeData, 'automated'>;
export type EndNode = Node<EndNodeData, 'end'>;

export type WorkflowNode =
  | StartNode
  | TaskNode
  | ApprovalNode
  | AutomatedNode
  | EndNode;

// ─── Custom Fields (Task node dynamic key-value) ────────────────────────────

export interface CustomField {
  id: string;
  key: string;
  value: string;
}

// ─── Automation Action (from mock API) ──────────────────────────────────────

export interface AutomationAction {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: AutomationField[];
}

export interface AutomationField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'boolean';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
  autoFixable?: boolean;
}

// ─── Simulation ─────────────────────────────────────────────────────────────

export type SimulationLogLevel = 'info' | 'success' | 'warning' | 'error';

export interface SimulationLog {
  timestamp: number;
  level: SimulationLogLevel;
  nodeId?: string;
  nodeType?: WorkflowNodeType;
  message: string;
}

export interface SimulationResult {
  success: boolean;
  logs: SimulationLog[];
  duration: number;
  nodesExecuted: number;
}

// ─── Serialized Workflow ────────────────────────────────────────────────────

export interface SerializedWorkflow {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

export interface SerializedNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

// ─── Node Palette Item ──────────────────────────────────────────────────────

export interface NodePaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string; // lucide icon name
}
