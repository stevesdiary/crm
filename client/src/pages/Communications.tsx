import React, { useState, useEffect } from 'react';

interface Communication {
  id: string;
  channel: 'email' | 'sms' | 'call';
  messages: any[];
  participants: string[];
}

export const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [communicationType, setCommunicationType] = useState('email');
  const [history, setHistory] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    content: '',
    contactId: '',
  });

  const [smsForm, setSmsForm] = useState({
    to: '',
    message: '',
    contactId: '',
  });

  const [callForm, setCallForm] = useState({
    contactId: '',
    direction: 'outbound' as 'inbound' | 'outbound',
    duration: '',
    notes: '',
    outcome: '',
  });

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/communications/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(emailForm),
      });

      if (response.ok) {
        setEmailForm({ to: '', subject: '', content: '', contactId: '' });
        alert('Email sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/communications/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(smsForm),
      });

      if (response.ok) {
        setSmsForm({ to: '', message: '', contactId: '' });
        alert('SMS sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
    } finally {
      setLoading(false);
    }
  };

  const logCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/communications/calls/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...callForm,
          duration: callForm.duration ? parseInt(callForm.duration) : undefined
        }),
      });

      if (response.ok) {
        setCallForm({ contactId: '', direction: 'outbound', duration: '', notes: '', outcome: '' });
        alert('Call logged successfully!');
      }
    } catch (error) {
      console.error('Failed to log call:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (contactId: string, type: string) => {
    try {
      const response = await fetch(`/api/v1/communications/${type}/history/${contactId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Communications</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['send', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'send' && (
        <div>
          {/* Communication Type Selector */}
          <div className="mb-6">
            <div className="flex gap-2">
              {['email', 'sms', 'call'].map(type => (
                <button
                  key={type}
                  onClick={() => setCommunicationType(type)}
                  className={`px-4 py-2 rounded text-sm capitalize ${
                    communicationType === type 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {type === 'email' && '📧'} 
                  {type === 'sms' && '💬'} 
                  {type === 'call' && '📞'} 
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Email Form */}
          {communicationType === 'email' && (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Send Email</h3>
              <form onSubmit={sendEmail} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="To Email"
                    required
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Contact ID (optional)"
                    value={emailForm.contactId}
                    onChange={(e) => setEmailForm({ ...emailForm, contactId: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <textarea
                  placeholder="Email content"
                  required
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={6}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </form>
            </div>
          )}

          {/* SMS Form */}
          {communicationType === 'sms' && (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Send SMS</h3>
              <form onSubmit={sendSms} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={smsForm.to}
                    onChange={(e) => setSmsForm({ ...smsForm, to: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Contact ID (optional)"
                    value={smsForm.contactId}
                    onChange={(e) => setSmsForm({ ...smsForm, contactId: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <textarea
                  placeholder="Message"
                  required
                  value={smsForm.message}
                  onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={4}
                  maxLength={160}
                />
                <div className="text-sm text-gray-500">
                  {smsForm.message.length}/160 characters
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send SMS'}
                </button>
              </form>
            </div>
          )}

          {/* Call Log Form */}
          {communicationType === 'call' && (
            <div className="bg-white p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Log Call</h3>
              <form onSubmit={logCall} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Contact ID"
                    required
                    value={callForm.contactId}
                    onChange={(e) => setCallForm({ ...callForm, contactId: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <select
                    value={callForm.direction}
                    onChange={(e) => setCallForm({ ...callForm, direction: e.target.value as 'inbound' | 'outbound' })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="outbound">Outbound Call</option>
                    <option value="inbound">Inbound Call</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Duration (seconds)"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Outcome"
                    value={callForm.outcome}
                    onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <textarea
                  placeholder="Call notes"
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Logging...' : 'Log Call'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Contact ID"
                className="px-3 py-2 border border-gray-300 rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const contactId = (e.target as HTMLInputElement).value;
                    if (contactId) fetchHistory(contactId, 'email');
                  }
                }}
              />
              <select
                onChange={(e) => {
                  const contactId = document.querySelector('input[placeholder="Enter Contact ID"]') as HTMLInputElement;
                  if (contactId?.value) fetchHistory(contactId.value, e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="email">Email History</option>
                <option value="sms">SMS History</option>
                <option value="calls">Call History</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {history.map(comm => (
              <div key={comm.id} className="bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {comm.channel === 'email' && '📧'}
                    {comm.channel === 'sms' && '💬'}
                    {comm.channel === 'call' && '📞'}
                  </span>
                  <span className="font-medium capitalize">{comm.channel}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {JSON.stringify(comm.messages, null, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};