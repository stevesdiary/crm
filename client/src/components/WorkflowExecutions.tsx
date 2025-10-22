import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface WorkflowExecutionsProps {
  workflowId: string;
}

interface Execution {
  id: string;
  status: string;
  entityType: string;
  entityId: string;
  result?: any;
  error?: string;
  executedAt: string;
}

export default function WorkflowExecutions({ workflowId }: WorkflowExecutionsProps) {
  const { data: executions, isLoading } = useQuery({
    queryKey: ['workflow-executions', workflowId],
    queryFn: () => fetch(`/api/v1/workflows/${workflowId}/executions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Loading executions...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Execution History</h3>
      
      {executions?.length > 0 ? (
        <div className="space-y-3">
          {executions.map((execution: Execution) => (
            <div key={execution.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {execution.entityType} #{execution.entityId.slice(-8)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(execution.executedAt).toLocaleString()}
                </span>
              </div>
              
              {execution.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  Error: {execution.error}
                </div>
              )}
              
              {execution.result && (
                <div className="mt-2 p-2 bg-gray-50 border rounded text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(execution.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No executions found for this workflow
        </p>
      )}
    </div>
  );
}