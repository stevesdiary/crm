import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Integration {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  lastSync?: string;
  hasCredentials: boolean;
  createdAt: string;
}

export default function Integrations() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [credentials, setCredentials] = useState<any>({});
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => fetch('/api/v1/integrations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const { data: providers } = useQuery({
    queryKey: ['integration-providers'],
    queryFn: () => fetch('/api/v1/integrations/providers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
  });

  const createIntegration = useMutation({
    mutationFn: (data: any) => fetch('/api/v1/integrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setShowForm(false);
      setSelectedProvider(null);
      setCredentials({});
    }
  });

  const testIntegration = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/integrations/${id}/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    onSuccess: (data) => {
      alert(data.success ? data.message : `Test failed: ${data.message}`);
    }
  });

  const syncIntegration = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/integrations/${id}/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });

  const deleteIntegration = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/integrations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setCredentials({});
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIntegration.mutate({
      provider: selectedProvider.provider,
      name: selectedProvider.name,
      credentials,
      config: {}
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail': return '📧';
      case 'outlook': return '📮';
      case 'google_calendar': return '📅';
      case 'slack': return '💬';
      case 'zapier': return '⚡';
      default: return '🔗';
    }
  };

  if (isLoading) return <div className="p-6">Loading integrations...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Integrations</h1>
      </div>

      {/* Available Providers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers?.map((provider: any) => {
            const existing = integrations?.find((i: Integration) => i.provider === provider.provider);
            
            return (
              <div key={provider.provider} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{getProviderIcon(provider.provider)}</span>
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                  </div>
                </div>
                
                {existing ? (
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      existing.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {existing.isActive ? 'Connected' : 'Inactive'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleProviderSelect(provider)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Form */}
      {showForm && selectedProvider && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Setup {selectedProvider.name} Integration
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedProvider.fields.map((field: string) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type={field.toLowerCase().includes('secret') ? 'password' : 'text'}
                  value={credentials[field] || ''}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    [field]: e.target.value
                  })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={`Enter ${field}`}
                  required
                />
              </div>
            ))}

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
                disabled={createIntegration.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {createIntegration.isPending ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Integrations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Active Integrations</h2>
        
        {integrations?.length > 0 ? (
          <div className="space-y-4">
            {integrations.map((integration: Integration) => (
              <div key={integration.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getProviderIcon(integration.provider)}</span>
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          integration.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {integration.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {integration.lastSync && (
                          <span>Last sync: {new Date(integration.lastSync).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => testIntegration.mutate(integration.id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => syncIntegration.mutate(integration.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Sync
                    </button>
                    <button
                      onClick={() => deleteIntegration.mutate(integration.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No integrations configured yet
          </p>
        )}
      </div>
    </div>
  );
}