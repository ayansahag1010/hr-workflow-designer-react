import type { Edge } from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowNodeData,
  SerializedWorkflow,
  SerializedNode,
  SerializedEdge,
} from '@/types/workflow.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serializes the current React Flow graph into a portable JSON format.
 */
export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
  name: string = 'Untitled Workflow'
): SerializedWorkflow {
  const serializedNodes: SerializedNode[] = nodes.map((node) => ({
    id: node.id,
    type: (node.data as WorkflowNodeData).type,
    position: node.position,
    data: node.data as WorkflowNodeData,
  }));

  const serializedEdges: SerializedEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return {
    id: uuidv4(),
    name,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    nodes: serializedNodes,
    edges: serializedEdges,
  };
}

/**
 * Deserializes a saved workflow back into React Flow compatible nodes and edges.
 */
export function deserializeWorkflow(
  workflow: SerializedWorkflow
): { nodes: WorkflowNode[]; edges: Edge[] } {
  const nodes: WorkflowNode[] = workflow.nodes.map((sn) => ({
    id: sn.id,
    type: sn.type,
    position: sn.position,
    data: sn.data,
  }) as WorkflowNode);

  const edges: Edge[] = workflow.edges.map((se) => ({
    id: se.id,
    source: se.source,
    target: se.target,
    sourceHandle: se.sourceHandle,
    targetHandle: se.targetHandle,
  }));

  return { nodes, edges };
}

/**
 * Exports workflow as a downloadable JSON file.
 */
export function exportWorkflowJSON(workflow: SerializedWorkflow): void {
  const blob = new Blob([JSON.stringify(workflow, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workflow.name.replace(/\s+/g, '_').toLowerCase()}_workflow.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports a workflow from a JSON file.
 */
export function importWorkflowJSON(file: File): Promise<SerializedWorkflow> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string) as SerializedWorkflow;
        if (!workflow.nodes || !workflow.edges) {
          throw new Error('Invalid workflow format');
        }
        resolve(workflow);
      } catch (err) {
        reject(new Error('Failed to parse workflow file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
