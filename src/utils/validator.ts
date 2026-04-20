import type { Edge } from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowNodeData,
  ValidationIssue,
} from '@/types/workflow.types';
import {
  detectCycles,
  findDisconnectedNodes,
  findDeadEnds,
  findUnreachableNodes,
} from './graphUtils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Comprehensive workflow validation system.
 * Checks structural integrity, connectivity, and node-specific rules.
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    issues.push({
      id: uuidv4(),
      severity: 'error',
      message: 'Workflow is empty. Add at least a Start and End node.',
      suggestion: 'Drag a Start node and an End node onto the canvas.',
    });
    return issues;
  }

  // ── Start node checks ───────────────────────────────────────────────────
  const startNodes = nodes.filter(
    (n) => (n.data as WorkflowNodeData).type === 'start'
  );
  if (startNodes.length === 0) {
    issues.push({
      id: uuidv4(),
      severity: 'error',
      message: 'Missing Start node. Every workflow must begin with a Start node.',
      suggestion: 'Add a Start node from the sidebar.',
      autoFixable: false,
    });
  } else if (startNodes.length > 1) {
    startNodes.forEach((n) => {
      issues.push({
        id: uuidv4(),
        nodeId: n.id,
        severity: 'error',
        message: `Multiple Start nodes detected. Only one is allowed.`,
        suggestion: 'Remove extra Start nodes — keep only one.',
        autoFixable: false,
      });
    });
  }

  // ── End node checks ──────────────────────────────────────────────────────
  const endNodes = nodes.filter(
    (n) => (n.data as WorkflowNodeData).type === 'end'
  );
  if (endNodes.length === 0) {
    issues.push({
      id: uuidv4(),
      severity: 'error',
      message: 'Missing End node. Every workflow must have at least one End node.',
      suggestion: 'Add an End node from the sidebar.',
      autoFixable: false,
    });
  }

  // ── Cycle detection ───────────────────────────────────────────────────────
  const cycleNodeIds = detectCycles(nodes, edges);
  if (cycleNodeIds.length > 0) {
    cycleNodeIds.forEach((nodeId) => {
      issues.push({
        id: uuidv4(),
        nodeId,
        severity: 'error',
        message: `Node is part of a cycle. Workflows must be acyclic (DAG).`,
        suggestion: 'Remove one of the edges creating the loop.',
      });
    });
  }

  // ── Disconnected nodes ────────────────────────────────────────────────────
  const disconnected = findDisconnectedNodes(nodes, edges);
  disconnected.forEach((nodeId) => {
    issues.push({
      id: uuidv4(),
      nodeId,
      severity: 'warning',
      message: `Node "${getNodeLabel(nodes, nodeId)}" has no connections.`,
      suggestion: 'Connect this node to the workflow or remove it.',
      autoFixable: true,
    });
  });

  // ── Dead ends (non-End nodes with no outgoing edges) ──────────────────────
  const deadEnds = findDeadEnds(nodes, edges);
  deadEnds.forEach((nodeId) => {
    // Skip if already flagged as disconnected
    if (disconnected.includes(nodeId)) return;
    issues.push({
      id: uuidv4(),
      nodeId,
      severity: 'warning',
      message: `Node "${getNodeLabel(nodes, nodeId)}" has no outgoing connections (dead end).`,
      suggestion: 'Connect this node to the next step or to an End node.',
    });
  });

  // ── Unreachable nodes ─────────────────────────────────────────────────────
  const unreachable = findUnreachableNodes(nodes, edges);
  unreachable.forEach((nodeId) => {
    if (disconnected.includes(nodeId)) return;
    issues.push({
      id: uuidv4(),
      nodeId,
      severity: 'warning',
      message: `Node "${getNodeLabel(nodes, nodeId)}" is unreachable from any other node.`,
      suggestion: 'Connect an incoming edge from a previous step.',
    });
  });

  // ── Node-level validation ─────────────────────────────────────────────────
  nodes.forEach((node) => {
    const data = node.data as WorkflowNodeData;

    if (data.type === 'task') {
      if (!data.title || data.title.trim() === '') {
        issues.push({
          id: uuidv4(),
          nodeId: node.id,
          severity: 'error',
          message: 'Task node is missing a required Title.',
          suggestion: 'Select the node and set a Title in the form panel.',
        });
      }
    }

    if (data.type === 'approval') {
      if (!data.title || data.title.trim() === '') {
        issues.push({
          id: uuidv4(),
          nodeId: node.id,
          severity: 'error',
          message: 'Approval node is missing a required Title.',
          suggestion: 'Select the node and set a Title in the form panel.',
        });
      }
    }

    if (data.type === 'automated') {
      if (!data.actionId) {
        issues.push({
          id: uuidv4(),
          nodeId: node.id,
          severity: 'warning',
          message: 'Automated node has no action selected.',
          suggestion: 'Select the node and choose an automation action.',
        });
      }
    }
  });

  return issues;
}

/**
 * Collect validation errors per-node for visual highlighting.
 */
export function getNodeValidationMap(
  issues: ValidationIssue[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  issues.forEach((issue) => {
    if (issue.nodeId) {
      const existing = map.get(issue.nodeId) || [];
      existing.push(issue.message);
      map.set(issue.nodeId, existing);
    }
  });
  return map;
}

function getNodeLabel(
  nodes: WorkflowNode[],
  nodeId: string
): string {
  const node = nodes.find((n) => n.id === nodeId);
  return node ? (node.data as WorkflowNodeData).label : nodeId;
}
