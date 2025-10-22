import React, { useState, useEffect } from 'react';

interface Opportunity {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  expectedCloseDate?: string;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  };
  owner: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export const OpportunityManagement: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    stage: 'prospecting',
    expectedCloseDate: '',
    contactId: '',
  });

  const stages = [
    'prospecting',
    'qualification',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
  ];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/v1/opportunities', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const result = await response.json();
        setOpportunities(result.data || result);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          amount: '',
          currency: 'USD',
          stage: 'prospecting',
          expectedCloseDate: '',
          contactId: '',
        });
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Failed to create opportunity:', error);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      prospecting: 'bg-blue-100 text-blue-800',
      qualification: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Opportunity Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Opportunity
        </button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {stages.map(stage => {
          const stageOpps = opportunities.filter(opp => opp.stage === stage);
          const stageValue = stageOpps.reduce((sum, opp) => sum + opp.amount, 0);
          
          return (
            <div key={stage} className="bg-white p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 capitalize mb-2">
                {stage.replace('_', ' ')}
              </h3>
              <p className="text-sm text-gray-600">{stageOpps.length} deals</p>
              <p className="text-lg font-bold text-blue-600">
                ${stageValue.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Create New Opportunity</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Opportunity Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>
                    {stage.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                type="date"
                placeholder="Expected Close Date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Contact ID"
                required
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Create Opportunity
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

      {/* Opportunities Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stage</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Close Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {opportunities.map(opportunity => (
              <tr key={opportunity.id}>
                <td className="px-4 py-3 text-sm font-medium">{opportunity.name}</td>
                <td className="px-4 py-3 text-sm">
                  {opportunity.contact.firstName} {opportunity.contact.lastName}
                </td>
                <td className="px-4 py-3 text-sm">
                  {opportunity.currency} {opportunity.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                    {opportunity.stage.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {opportunity.expectedCloseDate 
                    ? new Date(opportunity.expectedCloseDate).toLocaleDateString()
                    : '-'
                  }
                </td>
                <td className="px-4 py-3 text-sm">{opportunity.owner.fullName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};