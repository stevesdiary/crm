import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import WorkflowBuilder from '../components/WorkflowBuilder';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: { event: string; entity: string };
  conditions: any[];
  actions: any[];
  createdAt: string;
}

export default function Workflows() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => fetch('/api/v1/workflows', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const toggleWorkflow = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/workflows/${id}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  const deleteWorkflow = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/workflows/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  const testWorkflow = useMutation({
    mutationFn: ({ id, testData }: { id: string; testData: any }) => 
      fetch(`/api/v1/workflows/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      }).then(res => res.json()),
    onSuccess: () => {
      alert('Workflow test completed successfully!');
    }
  });

  const handleEdit = (workflowId: string) => {
    setEditingWorkflow(workflowId);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingWorkflow(null);
  };

  if (isLoading) return <div className="p-6">Loading workflows...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <button
          onClick={() => setShowBuilder(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Workflow
        </button>
      </div>

      <div className="grid gap-6">
        {workflows?.map((workflow: Workflow) => (
          <div key={workflow.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  {workflow.name}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    workflow.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </h3>
                {workflow.description && (
                  <p className="text-gray-600 mt-1">{workflow.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleWorkflow.mutate(workflow.id)}
                  className={`px-3 py-1 text-sm rounded ${
                    workflow.isActive
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {workflow.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleEdit(workflow.id)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => testWorkflow.mutate({ 
                    id: workflow.id, 
                    testData: { id: 'test', name: 'Test Data' } 
                  })}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Test
                </button>
                <button
                  onClick={() => deleteWorkflow.mutate(workflow.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Trigger</h4>
                <div className="bg-blue-50 p-2 rounded">
                  <span className="capitalize">
                    {workflow.trigger.event?.replace('_', ' ')} on {workflow.trigger.entity}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Conditions ({workflow.conditions?.length || 0})
                </h4>
                <div className="bg-yellow-50 p-2 rounded">
                  {workflow.conditions?.length > 0 ? (
                    <div className="space-y-1">
                      {workflow.conditions.slice(0, 2).map((condition: any, index: number) => (
                        <div key={index} className="text-xs">
                          {condition.field} {condition.operator} {condition.value}
                        </div>
                      ))}
                      {workflow.conditions.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{workflow.conditions.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">No conditions</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Actions ({workflow.actions?.length || 0})
                </h4>
                <div className="bg-green-50 p-2 rounded">
                  {workflow.actions?.length > 0 ? (
                    <div className="space-y-1">
                      {workflow.actions.slice(0, 2).map((action: any, index: number) => (
                        <div key={index} className="text-xs capitalize">
                          {action.type?.replace('_', ' ')}
                        </div>
                      ))}
                      {workflow.actions.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{workflow.actions.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">No actions</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Created: {new Date(workflow.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {!workflows?.length && (
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="mb-4">Create your first workflow to automate your CRM processes</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Workflow
            </button>
          </div>
        )}
      </div>

      {showBuilder && (
        <WorkflowBuilder
          workflowId={editingWorkflow}
          onClose={handleCloseBuilder}
        />
      )}
    </div>
  );
}