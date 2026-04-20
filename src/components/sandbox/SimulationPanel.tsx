import React, { useRef, useEffect } from 'react';
import type { SimulationLog, SimulationResult } from '@/types/workflow.types';
import { Terminal, Clock, Hash, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Props {
  result: SimulationResult | null;
  isRunning: boolean;
}

const LOG_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const LOG_PREFIX: Record<string, string> = {
  info: '→',
  success: '✓',
  warning: '⚠',
  error: '✗',
};

const SimulationPanel: React.FC<Props> = ({ result, isRunning }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  return (
    <div className="flex h-full flex-col">
      {/* Stats bar */}
      {result && !isRunning && (
        <div className="flex items-center gap-4 px-1 pb-3">
          <div className="flex items-center gap-1.5">
            {result.success ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={`text-[10px] font-bold ${
                result.success ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {result.success ? 'SUCCESS' : 'FAILED'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock className="h-3 w-3" /> {result.duration}ms
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Hash className="h-3 w-3" /> {result.nodesExecuted} nodes
          </div>
        </div>
      )}

      {/* Console */}
      <div className="flex-1 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
        {/* Console header */}
        <div className="flex items-center gap-2 border-b border-gray-700 px-3 py-1.5">
          <Terminal className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">
            Execution Logs
          </span>
          {isRunning && (
            <Loader2 className="ml-auto h-3 w-3 animate-spin text-blue-400" />
          )}
        </div>

        {/* Logs */}
        <div className="h-full overflow-y-auto p-3 font-mono text-xs leading-relaxed max-h-[200px]">
          {!result && !isRunning && (
            <p className="text-gray-500 italic">
              Click "Run Simulation" to execute the workflow...
            </p>
          )}

          {isRunning && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Simulating workflow execution...</span>
            </div>
          )}

          {result?.logs.map((log, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 ${LOG_COLORS[log.level]}`}
            >
              <span className="flex-shrink-0 w-3 text-center">
                {LOG_PREFIX[log.level]}
              </span>
              <span className="text-gray-500 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span>{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
