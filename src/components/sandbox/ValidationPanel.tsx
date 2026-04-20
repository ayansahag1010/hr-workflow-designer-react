import React from 'react';
import type { ValidationIssue } from '@/types/workflow.types';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lightbulb,
  Wrench,
} from 'lucide-react';

interface Props {
  issues: ValidationIssue[];
  onAutoFix?: (issue: ValidationIssue) => void;
  onFocusNode?: (nodeId: string) => void;
}

const SEVERITY_CONFIG = {
  error: {
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
  },
  info: {
    icon: <Info className="h-3.5 w-3.5" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
};

const ValidationPanel: React.FC<Props> = ({ issues, onAutoFix, onFocusNode }) => {
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="flex h-full flex-col">
      {/* Header stats */}
      <div className="flex items-center gap-3 px-1 pb-3">
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              All checks passed
            </span>
          </div>
        ) : (
          <>
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
                <AlertCircle className="h-3 w-3" /> {errorCount} error{errorCount !== 1 ? 's' : ''}
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                <AlertTriangle className="h-3 w-3" /> {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {issues.map((issue) => {
          const config = SEVERITY_CONFIG[issue.severity];
          return (
            <div
              key={issue.id}
              className={`rounded-lg border p-2.5 ${config.bg} ${config.border} transition-all duration-150 hover:shadow-sm`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 flex-shrink-0 ${config.text}`}>
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium ${config.text}`}>
                    {issue.message}
                  </p>
                  {issue.suggestion && (
                    <div className="mt-1.5 flex items-start gap-1.5">
                      <Lightbulb className="h-3 w-3 flex-shrink-0 text-gray-400 mt-0.5" />
                      <p className="text-[10px] text-gray-500">
                        {issue.suggestion}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {issue.nodeId && onFocusNode && (
                      <button
                        onClick={() => onFocusNode(issue.nodeId!)}
                        className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 border border-gray-200"
                      >
                        Focus Node
                      </button>
                    )}
                    {issue.autoFixable && onAutoFix && (
                      <button
                        onClick={() => onAutoFix(issue)}
                        className="flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-50 border border-blue-200"
                      >
                        <Wrench className="h-2.5 w-2.5" /> Auto-fix
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ValidationPanel;
