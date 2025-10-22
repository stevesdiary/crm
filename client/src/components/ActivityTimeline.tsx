import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  createdAt: string;
  creator: {
    fullName: string;
  };
}

interface ActivityTimelineProps {
  entityType?: string;
  entityId?: string;
}

export default function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', entityType, entityId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (entityType) params.append('entityType', entityType);
      if (entityId) params.append('entityId', entityId);
      
      return fetch(`/api/v1/tasks/activities?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json());
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'task_updated':
        return '✏️';
      case 'contact_created':
        return '👤';
      case 'opportunity_created':
        return '💰';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'bg-blue-100 text-blue-800';
      case 'task_updated':
        return 'bg-green-100 text-green-800';
      case 'contact_created':
        return 'bg-purple-100 text-purple-800';
      case 'opportunity_created':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Timeline</h3>
      <div className="space-y-4">
        {activities?.map((activity: Activity) => (
          <div key={activity.id} className="flex space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {activity.subject}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
              {activity.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                by {activity.creator.fullName}
              </p>
            </div>
          </div>
        ))}
        {!activities?.length && (
          <p className="text-gray-500 text-center py-4">No activities yet</p>
        )}
      </div>
    </div>
  );
}