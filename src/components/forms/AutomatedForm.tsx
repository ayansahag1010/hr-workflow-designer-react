import React, { useEffect, useState } from 'react';
import type { AutomatedNodeData, AutomationAction } from '@/types/workflow.types';
import { getAutomations } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface Props {
  data: AutomatedNodeData;
  onChange: (updates: Partial<AutomatedNodeData>) => void;
}

const AutomatedForm: React.FC<Props> = ({ data, onChange }) => {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then((a) => {
      setActions(a);
      setLoading(false);
    });
  }, []);

  const selectedAction = actions.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    const newConfig: Record<string, string> = {};
    if (action) {
      action.fields.forEach((f) => {
        newConfig[f.name] = f.defaultValue || '';
      });
    }
    onChange({
      actionId,
      actionConfig: newConfig,
      title: action?.name || 'Automation',
      label: action?.name || 'Automation',
    });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    onChange({
      actionConfig: { ...(data.actionConfig || {}), [fieldName]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
        <span className="ml-2 text-sm text-gray-500">Loading actions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value, label: e.target.value || 'Automation' })}
          placeholder="Step name"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Select Action
        </label>
        <select
          value={data.actionId || ''}
          onChange={(e) => handleActionChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
        >
          <option value="">Choose an action...</option>
          {actions.map((action) => (
            <option key={action.id} value={action.id}>
              {action.name} — {action.category}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic fields based on selected action */}
      {selectedAction && (
        <div className="space-y-3">
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 mb-1">
              {selectedAction.category}
            </p>
            <p className="text-xs text-gray-600">{selectedAction.description}</p>
          </div>

          {selectedAction.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={data.actionConfig?.[field.name] || field.defaultValue || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'boolean' ? (
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={data.actionConfig?.[field.name] === 'true'}
                      onChange={(e) =>
                        handleFieldChange(field.name, String(e.target.checked))
                      }
                      className="peer sr-only"
                    />
                    <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-purple-200"></div>
                  </label>
                  <span className="text-xs text-gray-600">
                    {data.actionConfig?.[field.name] === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                  value={data.actionConfig?.[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomatedForm;
