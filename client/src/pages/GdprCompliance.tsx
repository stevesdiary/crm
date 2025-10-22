import React, { useState } from 'react';

export const GDPRCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [contactId, setContactId] = useState('');
  const [loading, setLoading] = useState(false);

  const exportUserData = async () => {
    if (!contactId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/gdpr/export/${contactId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${contactId}.json`;
        a.click();
        alert('Data exported successfully!');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setLoading(false);
    }
  };

  const anonymizeUserData = async () => {
    if (!contactId) return;
    if (!confirm('This will permanently anonymize all user data. This action cannot be undone.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/gdpr/anonymize/${contactId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        alert('User data anonymized successfully!');
        setContactId('');
      }
    } catch (error) {
      console.error('Failed to anonymize data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserData = async () => {
    if (!contactId) return;
    if (!confirm('This will permanently delete all user data. This action cannot be undone.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/gdpr/delete/${contactId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        alert('User data deleted successfully!');
        setContactId('');
      }
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">GDPR Compliance</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['export', 'anonymize', 'delete'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} Data
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact ID
          </label>
          <input
            type="text"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            placeholder="Enter contact ID"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {activeTab === 'export' && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📥 Export User Data</h3>
            <p className="text-gray-600 mb-4">
              Export all personal data associated with this contact in JSON format.
              This includes contact information, communication history, and related records.
            </p>
            <button
              onClick={exportUserData}
              disabled={!contactId || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        )}

        {activeTab === 'anonymize' && (
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🔒 Anonymize User Data</h3>
            <p className="text-gray-600 mb-4">
              Replace all personal identifiable information with anonymized data.
              This maintains data relationships while removing personal details.
            </p>
            <div className="bg-yellow-100 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ This action is irreversible. Personal data will be permanently anonymized.
              </p>
            </div>
            <button
              onClick={anonymizeUserData}
              disabled={!contactId || loading}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Anonymizing...' : 'Anonymize Data'}
            </button>
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🗑️ Delete User Data</h3>
            <p className="text-gray-600 mb-4">
              Permanently delete all data associated with this contact.
              This includes the contact record and all related data.
            </p>
            <div className="bg-red-100 p-3 rounded mb-4">
              <p className="text-sm text-red-800">
                ⚠️ This action is irreversible. All data will be permanently deleted.
              </p>
            </div>
            <button
              onClick={deleteUserData}
              disabled={!contactId || loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};