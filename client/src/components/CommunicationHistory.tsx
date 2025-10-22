import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface CommunicationHistoryProps {
  contactId: string;
}

interface Communication {
  id: string;
  type: string;
  direction: string;
  subject?: string;
  content?: string;
  duration?: number;
  status: string;
  createdAt: string;
  user: { fullName: string };
}

export default function CommunicationHistory({ contactId }: CommunicationHistoryProps) {
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', contactId],
    queryFn: () => fetch(`/api/v1/communications/contact/${contactId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const getIcon = (type: string, direction: string) => {
    if (type === 'email') return direction === 'outbound' ? '📧' : '📨';
    if (type === 'sms') return direction === 'outbound' ? '💬' : '📱';
    if (type === 'call') return direction === 'outbound' ? '📞' : '📲';
    return '💬';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div>Loading communications...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Communication History</h3>
      
      {communications?.length > 0 ? (
        <div className="space-y-3">
          {communications.map((comm: Communication) => (
            <div key={comm.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getIcon(comm.type, comm.direction)}</span>
                  <div>
                    <span className="font-medium capitalize">
                      {comm.type} - {comm.direction}
                    </span>
                    {comm.duration && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({formatDuration(comm.duration)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{new Date(comm.createdAt).toLocaleDateString()}</div>
                  <div>{comm.user.fullName}</div>
                </div>
              </div>
              
              {comm.subject && (
                <div className="font-medium text-gray-900 mb-1">
                  {comm.subject}
                </div>
              )}
              
              {comm.content && (
                <div className="text-gray-700 text-sm">
                  {comm.content}
                </div>
              )}
              
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  comm.status === 'sent' ? 'bg-green-100 text-green-800' :
                  comm.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {comm.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No communication history found
        </p>
      )}
    </div>
  );
}