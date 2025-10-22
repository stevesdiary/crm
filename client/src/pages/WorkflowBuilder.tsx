import React, { useState, useEffect } from 'react';

interface Trigger {
  event: string;
  entity: string;
  label: string;
}

interface Action {
  type: string;
  label: string;
  params: string[];
}

interface Workflow {
  id?: string;
  name: string;
  description?: string;
  trigger: {
    event: string;
    entity: string;
    conditions?: any[];
  };
  actions: Array<{
    type: string;
    params: Record<string, any>;
  }>;
  isActive: boolean;
}

interface WorkflowExecution {
  id: string;
  status: string;
  result?: any;
  error?: string;
  executedAt: string;
}

export const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [activeTab, setActiveTab] = useState('workflows');

  const [workflowForm, setWorkflowForm] = useState<Workflow>({
    name: '',
    description: '',
    trigger: { event: '', entity: '' },
    actions: [],
    isActive: true,
  });

  useEffect(() => {
    fetchWorkflows();
    fetchTriggers();
    fetchActions();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/v1/workflows', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const fetchTriggers = async () => {
    try {
      const response = await fetch('/api/v1/workflows/triggers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTriggers(data);
      }
    } catch (error) {
      console.error('Failed to fetch triggers:', error);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/v1/workflows/actions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActions(data);
      }
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    }
  };

  const fetchExecutions = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/workflows/${workflowId}/executions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExecutions(data);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
  };

  const saveWorkflow = async () => {
    try {
      const url = selectedWorkflow ? `/api/v1/workflows/${selectedWorkflow.id}` : '/api/v1/workflows';
      const method = selectedWorkflow ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workflowForm),
      });

      if (response.ok) {
        setShowBuilder(false);
        setSelectedWorkflow(null);
        setWorkflowForm({
          name: '',
          description: '',
          trigger: { event: '', entity: '' },
          actions: [],
          isActive: true,
        });
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const testWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/workflows/${workflowId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ testData: 'sample' }),
      });

      if (response.ok) {
        alert('Workflow test completed successfully!');
        fetchExecutions(workflowId);
      }
    } catch (error) {
      console.error('Failed to test workflow:', error);
    }
  };

  const toggleWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/workflows/${workflowId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const addAction = () => {
    setWorkflowForm({
      ...workflowForm,
      actions: [...workflowForm.actions, { type: '', params: {} }]
    });
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...workflowForm.actions];
    if (field === 'type') {
      newActions[index] = { type: value, params: {} };
    } else {
      newActions[index].params[field] = value;
    }
    setWorkflowForm({ ...workflowForm, actions: newActions });
  };

  const removeAction = (index: number) => {
    const newActions = workflowForm.actions.filter((_, i) => i !== index);
    setWorkflowForm({ ...workflowForm, actions: newActions });
  };

  const editWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowForm(workflow);
    setShowBuilder(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workflow Automation</h1>
        <button
          onClick={() => setShowBuilder(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Workflow
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['workflows', 'executions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'workflows' && (
        <div className="grid gap-4">
          {workflows.map(workflow => (
            <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{workflow.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      workflow.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {workflow.description && (
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Trigger: {workflow.trigger.event}</span>
                    <span>Actions: {workflow.actions.length}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editWorkflow(workflow)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => testWorkflow(workflow.id!)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => toggleWorkflow(workflow.id!)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    {workflow.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => fetchExecutions(workflow.id!)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="space-y-4">
          {executions.map(execution => (
            <div key={execution.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                    execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {execution.status}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {new Date(execution.executedAt).toLocaleString()}
                  </span>
                </div>
                {execution.error && (
                  <span className="text-red-600 text-sm">{execution.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {selectedWorkflow ? 'Edit Workflow' : 'Create Workflow'}
              </h2>
              <button
                onClick={() => setShowBuilder(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Workflow Name"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              {/* Trigger */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">🎯 Trigger</h3>
                <select
                  value={workflowForm.trigger.event}
                  onChange={(e) => {
                    const trigger = triggers.find(t => t.event === e.target.value);
                    setWorkflowForm({
                      ...workflowForm,
                      trigger: { event: e.target.value, entity: trigger?.entity || '' }
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select Trigger</option>
                  {triggers.map(trigger => (
                    <option key={trigger.event} value={trigger.event}>
                      {trigger.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">⚡ Actions</h3>
                  <button
                    onClick={addAction}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Add Action
                  </button>
                </div>

                <div className="space-y-3">
                  {workflowForm.actions.map((action, index) => (
                    <div key={index} className="border border-gray-100 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, 'type', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="">Select Action</option>
                          {actions.map(actionType => (
                            <option key={actionType.type} value={actionType.type}>
                              {actionType.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeAction(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>

                      {action.type && (
                        <div className="grid grid-cols-2 gap-2">
                          {actions.find(a => a.type === action.type)?.params.map(param => (
                            <input
                              key={param}
                              type="text"
                              placeholder={param}
                              value={action.params[param] || ''}
                              onChange={(e) => updateAction(index, param, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWorkflow}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};