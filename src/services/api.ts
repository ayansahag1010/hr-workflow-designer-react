/**
 * API layer — proxies to mock implementations.
 * In production, swap these to real HTTP calls.
 */
export { getAutomations, getAutomationById, simulateWorkflow } from './mockApi';
