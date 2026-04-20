import type { Edge } from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowNodeData,
} from '@/types/workflow.types';

/**
 * Build an adjacency list from nodes and edges.
 */
export function buildAdjacencyList(
  nodes: WorkflowNode[],
  edges: Edge[]
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    const list = adj.get(e.source);
    if (list) list.push(e.target);
  });
  return adj;
}

/**
 * Detect cycles using DFS coloring.
 * Returns the list of node IDs that participate in a cycle.
 */
export function detectCycles(
  nodes: WorkflowNode[],
  edges: Edge[]
): string[] {
  const adj = buildAdjacencyList(nodes, edges);
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map<string, number>();
  const cycleNodes = new Set<string>();

  nodes.forEach((n) => color.set(n.id, WHITE));

  function dfs(nodeId: string, path: string[]): boolean {
    color.set(nodeId, GRAY);
    path.push(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (color.get(neighbor) === GRAY) {
        // Found a cycle — mark all nodes in the cycle
        const cycleStart = path.indexOf(neighbor);
        for (let i = cycleStart; i < path.length; i++) {
          cycleNodes.add(path[i]);
        }
        cycleNodes.add(neighbor);
        return true;
      }
      if (color.get(neighbor) === WHITE) {
        dfs(neighbor, path);
      }
    }

    path.pop();
    color.set(nodeId, BLACK);
    return false;
  }

  nodes.forEach((n) => {
    if (color.get(n.id) === WHITE) {
      dfs(n.id, []);
    }
  });

  return Array.from(cycleNodes);
}

/**
 * Find disconnected nodes (nodes with no incoming and no outgoing edges).
 */
export function findDisconnectedNodes(
  nodes: WorkflowNode[],
  edges: Edge[]
): string[] {
  const connectedNodeIds = new Set<string>();
  edges.forEach((e) => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  return nodes
    .filter((n) => !connectedNodeIds.has(n.id))
    .map((n) => n.id);
}

/**
 * Find nodes with no outgoing edges (dead ends), excluding End nodes.
 */
export function findDeadEnds(
  nodes: WorkflowNode[],
  edges: Edge[]
): string[] {
  const nodesWithOutgoing = new Set(edges.map((e) => e.source));

  return nodes
    .filter(
      (n) =>
        (n.data as WorkflowNodeData).type !== 'end' &&
        !nodesWithOutgoing.has(n.id)
    )
    .map((n) => n.id);
}

/**
 * Find nodes with no incoming edges (unreachable), excluding Start nodes.
 */
export function findUnreachableNodes(
  nodes: WorkflowNode[],
  edges: Edge[]
): string[] {
  const nodesWithIncoming = new Set(edges.map((e) => e.target));

  return nodes
    .filter(
      (n) =>
        (n.data as WorkflowNodeData).type !== 'start' &&
        !nodesWithIncoming.has(n.id)
    )
    .map((n) => n.id);
}

/**
 * Topologically sort the graph. Returns null if cycle detected.
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  edges: Edge[]
): string[] | null {
  const adj = buildAdjacencyList(nodes, edges);
  const inDegree = new Map<string, number>();

  nodes.forEach((n) => inDegree.set(n.id, 0));
  edges.forEach((e) => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return result.length === nodes.length ? result : null;
}
