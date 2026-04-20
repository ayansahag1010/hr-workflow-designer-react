import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType,
  ValidationIssue,
  SimulationResult,
} from '@/types/workflow.types';

import Sidebar from '@/components/canvas/Sidebar';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import NodeRenderer from '@/components/canvas/NodeRenderer';
import ValidationPanel from '@/components/sandbox/ValidationPanel';
import SimulationPanel from '@/components/sandbox/SimulationPanel';

import { useWorkflowNodes, useWorkflowEdges, useUndoRedo } from '@/hooks/useWorkflow';
import { validateWorkflow, getNodeValidationMap } from '@/utils/validator';
import { serializeWorkflow, deserializeWorkflow, exportWorkflowJSON, importWorkflowJSON } from '@/utils/serializer';
import { simulateWorkflow } from '@/services/api';

import {
  Undo2,
  Redo2,
  Download,
  Upload,
  PlayCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Workflow,
} from 'lucide-react';

type BottomTab = 'validation' | 'simulation';

function AppInner() {
  const {
    nodes,
    setNodes,
    onNodesChange,
    addNode,
    updateNodeData,
    deleteNode,
    setValidationState,
  } = useWorkflowNodes();

  const {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    deleteEdgesForNode,
  } = useWorkflowEdges();

  const { saveSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo(
    nodes,
    edges,
    setNodes as (nodes: WorkflowNode[]) => void,
    setEdges
  );

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>('validation');
  const [bottomOpen, setBottomOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  const lastValidationRef = useRef<string>('');

  // ── Live validation ──────────────────────────────────────────────────────
  useEffect(() => {
    const issues = validateWorkflow(nodes, edges);
    const map = getNodeValidationMap(issues);

    // Serialize the map to compare — only update if validation actually changed
    const serialized = JSON.stringify(Array.from(map.entries()));
    if (serialized !== lastValidationRef.current) {
      lastValidationRef.current = serialized;
      setValidationIssues(issues);
      setValidationState(map);
    } else {
      // Even if node validation didn't change, issues list might need fresh UUIDs for display
      setValidationIssues(issues);
    }
  }, [nodes, edges, setValidationState]);

  // Keep selected node data in sync
  const selectedNodeIdRef = useRef<string | null>(null);
  selectedNodeIdRef.current = selectedNode?.id ?? null;

  useEffect(() => {
    if (selectedNodeIdRef.current) {
      const updated = nodes.find((n) => n.id === selectedNodeIdRef.current);
      if (updated) {
        setSelectedNode(updated);
      } else {
        setSelectedNode(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // ── Node actions ─────────────────────────────────────────────────────────
  const handleAddNode = useCallback(
    (type: WorkflowNodeType, position: { x: number; y: number }) => {
      addNode(type, position);
    },
    [addNode]
  );

  const handleNodeClick = useCallback(
    (node: WorkflowNode) => {
      setSelectedNode(node || null);
    },
    []
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNodeData>) => {
      saveSnapshot();
      updateNodeData(nodeId, updates);
    },
    [updateNodeData, saveSnapshot]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      saveSnapshot();
      deleteNode(nodeId);
      deleteEdgesForNode(nodeId);
      setSelectedNode(null);
    },
    [deleteNode, deleteEdgesForNode, saveSnapshot]
  );

  // ── Simulation ───────────────────────────────────────────────────────────
  const handleSimulate = useCallback(async () => {
    setIsSimulating(true);
    setBottomOpen(true);
    setBottomTab('simulation');
    setSimulationResult(null);

    try {
      const workflow = serializeWorkflow(nodes, edges, 'HR Workflow');
      const result = await simulateWorkflow(workflow);
      setSimulationResult(result);
    } catch {
      setSimulationResult({
        success: false,
        logs: [
          {
            timestamp: Date.now(),
            level: 'error',
            message: 'Simulation failed unexpectedly.',
          },
        ],
        duration: 0,
        nodesExecuted: 0,
      });
    } finally {
      setIsSimulating(false);
    }
  }, [nodes, edges]);

  // ── Export / Import ──────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const workflow = serializeWorkflow(nodes, edges, 'HR Workflow');
    exportWorkflowJSON(workflow);
  }, [nodes, edges]);

  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const workflow = await importWorkflowJSON(file);
        saveSnapshot();
        const deserialized = deserializeWorkflow(workflow);
        setNodes(deserialized.nodes as WorkflowNode[]);
        setEdges(deserialized.edges);
        setSelectedNode(null);
        setTimeout(() => fitView({ padding: 0.2 }), 100);
      } catch (err) {
        console.error('Import failed:', err);
      }
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [saveSnapshot, setNodes, setEdges, fitView]
  );

  // ── Auto-fix ─────────────────────────────────────────────────────────────
  const handleAutoFix = useCallback(
    (issue: ValidationIssue) => {
      if (issue.autoFixable && issue.nodeId) {
        // Auto-fix: remove disconnected node
        saveSnapshot();
        deleteNode(issue.nodeId);
        deleteEdgesForNode(issue.nodeId);
        if (selectedNode?.id === issue.nodeId) {
          setSelectedNode(null);
        }
      }
    },
    [deleteNode, deleteEdgesForNode, saveSnapshot, selectedNode]
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const errorCount = validationIssues.filter((i) => i.severity === 'error').length;
  const warningCount = validationIssues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 font-sans">
      {/* ─── Top Header ─────────────────────────────────────────────────── */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
            <Workflow className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              HR Workflow Designer
            </h1>
            <p className="text-[10px] text-gray-400">
              Visual workflow builder
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          <button
            onClick={handleExport}
            title="Export JSON"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          <button
            onClick={handleSimulate}
            disabled={isSimulating || errorCount > 0}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Canvas */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onAddNode={handleAddNode}
              onNodeClick={handleNodeClick}
              onSaveSnapshot={saveSnapshot}
            />
          </div>

          {/* ─── Bottom Panel ───────────────────────────────────────────── */}
          <div
            className={`flex-shrink-0 border-t border-gray-200 bg-white transition-all duration-300 ${
              bottomOpen ? 'h-[260px]' : 'h-10'
            }`}
          >
            {/* Tab bar */}
            <div className="flex h-10 items-center justify-between border-b border-gray-100 px-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setBottomTab('validation');
                    setBottomOpen(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    bottomTab === 'validation' && bottomOpen
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Validation
                  {errorCount > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {errorCount}
                    </span>
                  )}
                  {warningCount > 0 && errorCount === 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-white">
                      {warningCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setBottomTab('simulation');
                    setBottomOpen(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    bottomTab === 'simulation' && bottomOpen
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Simulation
                </button>
              </div>
              <button
                onClick={() => setBottomOpen(!bottomOpen)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                {bottomOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Panel content */}
            {bottomOpen && (
              <div className="h-[calc(100%-40px)] overflow-hidden p-4">
                {bottomTab === 'validation' ? (
                  <ValidationPanel
                    issues={validationIssues}
                    onAutoFix={handleAutoFix}
                  />
                ) : (
                  <SimulationPanel
                    result={simulationResult}
                    isRunning={isSimulating}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <NodeRenderer
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
};

export default App;
