import React from 'react';

interface ActivityMetricsProps {
  data: {
    recentActivities: number;
    activityByType: Record<string, number>;
    taskStats: Record<string, number>;
    ticketStats: Record<string, number>;
  };
}

export default function ActivityMetrics({ data }: ActivityMetricsProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return '📋';
      case 'contact_created': return '👤';
      case 'opportunity_created': return '💰';
      case 'ticket_created': return '🎫';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{data.recentActivities}</p>
          <p className="text-sm text-gray-600">Recent Activities</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {Object.values(data.taskStats).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Tasks</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Activity Types</h4>
          {Object.entries(data.activityByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between py-1">
              <span className="flex items-center text-sm">
                <span className="mr-2">{getActivityIcon(type)}</span>
                {type.replace('_', ' ')}
              </span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Task Status</h4>
          {Object.entries(data.taskStats).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between py-1">
              <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}