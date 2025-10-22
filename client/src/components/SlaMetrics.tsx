import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function SlaMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ['sla-metrics'],
    queryFn: () => fetch('/api/v1/tickets/sla/metrics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
        <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">SLA Breached</h3>
        <p className="text-2xl font-bold text-red-600">{metrics.breached}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Breach Rate</h3>
        <p className="text-2xl font-bold text-red-600">{metrics.breachRate.toFixed(1)}%</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Avg Response (min)</h3>
        <p className="text-2xl font-bold text-blue-600">{metrics.avgResponseTime}</p>
      </div>
    </div>
  );
}