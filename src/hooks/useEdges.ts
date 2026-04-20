/**
 * Re-export edge management hooks.
 * The core implementation lives in useWorkflow.ts for co-location
 * of tightly coupled node/edge state, but we export from here
 * to match the required architecture.
 */
export { useWorkflowEdges } from './useWorkflow';
