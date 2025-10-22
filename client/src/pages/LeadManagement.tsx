import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  source: string;
  status: string;
  score?: number;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  owner: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

interface LeadSource {
  source: string;
  count: number;
}

export const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    source: '',
    status: '',
    minScore: '',
    maxScore: ''
  });
  const [formData, setFormData] = useState({
    contactId: '',
    source: '',
    status: 'new',
    score: '',
    notes: ''
  });
  const [convertData, setConvertData] = useState({
    opportunityName: '',
    amount: '',
    stage: 'prospecting',
    expectedCloseDate: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchSources();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams({
        ...filters,
        page: '1',
        limit: '20'
      });

      const response = await fetch(`/api/v1/leads?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const result = await response.json();
        setLeads(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/v1/leads/sources', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          score: formData.score ? parseInt(formData.score) : undefined
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ contactId: '', source: '', status: 'new', score: '', notes: '' });
        fetchLeads();
      }
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertForm) return;

    try {
      const response = await fetch(`/api/v1/leads/${showConvertForm}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...convertData,
          amount: parseFloat(convertData.amount)
        }),
      });

      if (response.ok) {
        setShowConvertForm(null);
        setConvertData({ opportunityName: '', amount: '', stage: 'prospecting', expectedCloseDate: '' });
        fetchLeads();
        alert('Lead converted to opportunity successfully!');
      }
    } catch (error) {
      console.error('Failed to convert lead:', error);
    }
  };

  const updateScore = async (leadId: string, score: number) => {
    try {
      await fetch(`/api/v1/leads/${leadId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score }),
      });
      fetchLeads();
    } catch (error) {
      console.error('Failed to update score:', error);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Lead
        </button>
      </div>

      {/* Lead Sources Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {sources.slice(0, 4).map(source => (
          <div key={source.source} className="bg-white p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 capitalize">{source.source.replace('_', ' ')}</h3>
            <p className="text-2xl font-bold text-blue-600">{source.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">All Sources</option>
            {sources.map(s => (
              <option key={s.source} value={s.source}>{s.source.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
          </select>
          <input
            type="number"
            placeholder="Min Score"
            value={filters.minScore}
            onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Max Score"
            value={filters.maxScore}
            onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Create New Lead</h3>
          <form onSubmit={handleCreateLead} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="cold_call">Cold Call</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
              </select>
              <input
                type="number"
                placeholder="Score (0-100)"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Contact ID (optional)"
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Create Lead
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Convert Form */}
      {showConvertForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-green-50">
          <h3 className="text-lg font-semibold mb-4">Convert Lead to Opportunity</h3>
          <form onSubmit={handleConvertLead} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Opportunity Name"
                required
                value={convertData.opportunityName}
                onChange={(e) => setConvertData({ ...convertData, opportunityName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                required
                value={convertData.amount}
                onChange={(e) => setConvertData({ ...convertData, amount: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <select
                value={convertData.stage}
                onChange={(e) => setConvertData({ ...convertData, stage: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
              </select>
              <input
                type="date"
                placeholder="Expected Close Date"
                value={convertData.expectedCloseDate}
                onChange={(e) => setConvertData({ ...convertData, expectedCloseDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Convert to Opportunity
              </button>
              <button
                type="button"
                onClick={() => setShowConvertForm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Source</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Score</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Owner</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map(lead => (
              <tr key={lead.id}>
                <td className="px-4 py-3 text-sm">
                  {lead.contact ? (
                    <div>
                      <div className="font-medium">{lead.contact.firstName} {lead.contact.lastName}</div>
                      <div className="text-gray-500">{lead.contact.email}</div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No contact</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm capitalize">{lead.source.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(lead.score)}`}>
                    {lead.score || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{lead.owner.fullName}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {lead.status !== 'converted' && lead.contact && (
                      <button
                        onClick={() => setShowConvertForm(lead.id)}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        Convert
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const newScore = prompt('Enter new score (0-100):', lead.score?.toString() || '0');
                        if (newScore && !isNaN(parseInt(newScore))) {
                          updateScore(lead.id, parseInt(newScore));
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Score
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};