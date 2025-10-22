import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkflowBuilderProps {
  workflowId?: string;
  onClose: () => void;
}

export default function WorkflowBuilder({ workflowId, onClose }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    trigger: { event: '', entity: '' },
    conditions: [],
    actions: [],
    isActive: true
  });

  const queryClient = useQueryClient();

  const { data: triggers } = useQuery({
    queryKey: ['workflow-triggers'],
    queryFn: () => fetch('/api/v1/workflows/triggers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const { data: actions } = useQuery({
    queryKey: ['workflow-actions'],
    queryFn: () => fetch('/api/v1/workflows/actions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const { data: existingWorkflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => fetch(`/api/v1/workflows/${workflowId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    enabled: !!workflowId
  });

  useEffect(() => {
    if (existingWorkflow) {
      setWorkflow(existingWorkflow);
    }
  }, [existingWorkflow]);

  const saveWorkflow = useMutation({
    mutationFn: (data: any) => {
      const url = workflowId ? `/api/v1/workflows/${workflowId}` : '/api/v1/workflows';
      const method = workflowId ? 'PATCH' : 'POST';
      
      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      onClose();
    }
  });

  const addCondition = () => {
    setWorkflow({
      ...workflow,
      conditions: [...workflow.conditions, { field: '', operator: 'equals', value: '' }]
    });
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...workflow.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setWorkflow({ ...workflow, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    setWorkflow({
      ...workflow,
      conditions: workflow.conditions.filter((_, i) => i !== index)
    });
  };

  const addAction = () => {
    setWorkflow({
      ...workflow,
      actions: [...workflow.actions, { type: '', params: {} }]
    });
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...workflow.actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setWorkflow({ ...workflow, actions: newActions });
  };

  const removeAction = (index: number) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveWorkflow.mutate(workflow);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">
          {workflowId ? 'Edit Workflow' : 'Create Workflow'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={workflow.description}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Trigger */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Trigger</h3>
            <select
              value={`${workflow.trigger.event}:${workflow.trigger.entity}`}
              onChange={(e) => {
                const [event, entity] = e.target.value.split(':');
                setWorkflow({ ...workflow, trigger: { event, entity } });
              }}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select a trigger...</option>
              {triggers?.map((trigger: any) => (
                <option key={`${trigger.event}:${trigger.entity}`} value={`${trigger.event}:${trigger.entity}`}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditions */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Conditions</h3>
              <button
                type="button"
                onClick={addCondition}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Condition
              </button>
            </div>
            {workflow.conditions.map((condition: any, index: number) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Field"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="less_than">Less Than</option>
                </select>
                <input
                  type="text"
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Actions</h3>
              <button
                type="button"
                onClick={addAction}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Action
              </button>
            </div>
            {workflow.actions.map((action: any, index: number) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, 'type', e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select action...</option>
                    {actions?.map((actionType: any) => (
                      <option key={actionType.type} value={actionType.type}>
                        {actionType.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
                {action.type && (
                  <div className="grid grid-cols-2 gap-2">
                    {actions?.find((a: any) => a.type === action.type)?.params.map((param: string) => (
                      <input
                        key={param}
                        type="text"
                        placeholder={param}
                        value={action.params[param] || ''}
                        onChange={(e) => updateAction(index, 'params', {
                          ...action.params,
                          [param]: e.target.value
                        })}
                        className="border rounded px-3 py-2"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveWorkflow.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saveWorkflow.isPending ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}