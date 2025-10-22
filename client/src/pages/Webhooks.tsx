import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
  deliveries: any[];
}

export default function Webhooks() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: []
  });
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => fetch('/api/v1/webhooks', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const { data: availableEvents } = useQuery({
    queryKey: ['webhook-events'],
    queryFn: () => fetch('/api/v1/webhooks/events', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const createWebhook = useMutation({
    mutationFn: (data: any) => fetch('/api/v1/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowForm(false);
      setFormData({ name: '', url: '', events: [] });
    }
  });

  const toggleWebhook = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/v1/webhooks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const deleteWebhook = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/webhooks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const handleEventToggle = (event: string) => {
    const newEvents = formData.events.includes(event)
      ? formData.events.filter(e => e !== event)
      : [...formData.events, event];
    setFormData({ ...formData, events: newEvents });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWebhook.mutate(formData);
  };

  if (isLoading) return <div className="p-6">Loading webhooks...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Create Webhook</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="https://your-app.com/webhook"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Events</label>
              <div className="space-y-2">
                {availableEvents?.map((event: any) => (
                  <label key={event.event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event.event)}
                      onChange={() => handleEventToggle(event.event)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>{event.event}</strong> - {event.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createWebhook.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {createWebhook.isPending ? 'Creating...' : 'Create Webhook'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {webhooks?.map((webhook: Webhook) => (
          <div key={webhook.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  {webhook.name}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    webhook.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </span>
                </h3>
                <p className="text-gray-600 text-sm mt-1">{webhook.url}</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleWebhook.mutate({ id: webhook.id, isActive: webhook.isActive })}
                  className={`px-3 py-1 text-sm rounded ${
                    webhook.isActive
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {webhook.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => deleteWebhook.mutate(webhook.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Events</h4>
                <div className="space-y-1">
                  {webhook.events.map((event: string) => (
                    <span key={event} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Deliveries</h4>
                {webhook.deliveries?.length > 0 ? (
                  <div className="space-y-1">
                    {webhook.deliveries.slice(0, 3).map((delivery: any) => (
                      <div key={delivery.id} className="flex justify-between text-xs">
                        <span>{delivery.event}</span>
                        <span className={`px-1 rounded ${
                          delivery.status === 'success' ? 'bg-green-100 text-green-800' :
                          delivery.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {delivery.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No deliveries yet</p>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Created: {new Date(webhook.createdAt).toLocaleDateString()}
              {webhook.lastTriggered && (
                <span className="ml-4">
                  Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}

        {!webhooks?.length && (
          <div className="text-center py-12 text-gray-500">
            <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
            <p className="mb-4">Create your first webhook to receive real-time notifications</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Webhook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}