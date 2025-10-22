import React, { useState, useEffect } from 'react';
import { Plus, Check, X, RefreshCw, Trash2 } from 'lucide-react';

interface Integration {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  lastSync: string | null;
  hasCredentials: boolean;
}

interface Provider {
  provider: string;
  name: string;
  description: string;
  fields: string[];
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchIntegrations();
    fetchProviders();
  }, []);

  const fetchIntegrations = async () => {
    const response = await fetch('/api/v1/integrations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setIntegrations(data);
  };

  const fetchProviders = async () => {
    const response = await fetch('/api/v1/integrations/providers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setProviders(data);
  };

  const handleCreate = async () => {
    await fetch('/api/v1/integrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        provider: selectedProvider?.provider,
        name: formData.name,
        config: {},
        credentials: formData,
      }),
    });
    setShowModal(false);
    setFormData({});
    fetchIntegrations();
  };

  const handleTest = async (id: string) => {
    const response = await fetch(`/api/v1/integrations/${id}/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const result = await response.json();
    alert(result.message);
  };

  const handleSync = async (id: string) => {
    await fetch(`/api/v1/integrations/${id}/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchIntegrations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this integration?')) return;
    await fetch(`/api/v1/integrations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchIntegrations();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{integration.name}</h3>
                <p className="text-sm text-gray-600">{integration.provider}</p>
              </div>
              {integration.isActive ? (
                <Check className="text-green-600" size={20} />
              ) : (
                <X className="text-red-600" size={20} />
              )}
            </div>
            
            {integration.lastSync && (
              <p className="text-xs text-gray-500 mb-4">
                Last sync: {new Date(integration.lastSync).toLocaleString()}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleTest(integration.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
              >
                Test
              </button>
              <button
                onClick={() => handleSync(integration.id)}
                className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center gap-1"
              >
                <RefreshCw size={14} />
                Sync
              </button>
              <button
                onClick={() => handleDelete(integration.id)}
                className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add Integration</h3>
            
            {!selectedProvider ? (
              <div className="space-y-2">
                {providers.map((provider) => (
                  <button
                    key={provider.provider}
                    onClick={() => setSelectedProvider(provider)}
                    className="w-full text-left p-4 border rounded hover:bg-gray-50"
                  >
                    <div className="font-bold">{provider.name}</div>
                    <div className="text-sm text-gray-600">{provider.description}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Integration Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                
                {selectedProvider.fields.map((field) => (
                  <input
                    key={field}
                    type={field.includes('secret') || field.includes('token') ? 'password' : 'text'}
                    placeholder={field}
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                ))}

                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProvider(null);
                      setFormData({});
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
