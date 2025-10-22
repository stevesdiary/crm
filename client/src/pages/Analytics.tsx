import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30days');

  const { data: detailedMetrics } = useQuery({
    queryKey: ['detailed-analytics', dateRange],
    queryFn: () => Promise.all([
      fetch('/api/v1/analytics/kpis', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()),
      fetch('/api/v1/analytics/activities', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()),
      fetch('/api/v1/analytics/lead-conversion', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json())
    ]).then(([kpis, activities, conversion]) => ({ kpis, activities, conversion }))
  });

  if (!detailedMetrics) return <div className="p-6">Loading analytics...</div>;

  const { kpis, activities, conversion } = detailedMetrics;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">${kpis.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-semibold text-green-600">{kpis.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opportunities Won</span>
              <span className="font-semibold">{kpis.wonOpportunities}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Funnel</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Leads</span>
              <span className="font-semibold">{conversion.totalLeads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualified</span>
              <span className="font-semibold text-blue-600">{conversion.qualifiedLeads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Converted</span>
              <span className="font-semibold text-green-600">{conversion.convertedLeads}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Activities</span>
              <span className="font-semibold">{activities.recentActivities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Tasks</span>
              <span className="font-semibold text-yellow-600">
                {activities.taskStats.pending || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Open Tickets</span>
              <span className="font-semibold text-red-600">
                {activities.ticketStats.open || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(activities.activityByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(activities.activityByType))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Rates</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Lead Qualification</span>
                <span className="text-sm font-medium">{conversion.qualificationRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${conversion.qualificationRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Lead to Opportunity</span>
                <span className="text-sm font-medium">{conversion.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${conversion.conversionRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Opportunity Win Rate</span>
                <span className="text-sm font-medium">{kpis.winRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${kpis.winRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}