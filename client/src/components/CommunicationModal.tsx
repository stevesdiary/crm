import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CommunicationModalProps {
  contactId: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  onClose: () => void;
}

export default function CommunicationModal({ 
  contactId, 
  contactName, 
  contactEmail, 
  contactPhone, 
  onClose 
}: CommunicationModalProps) {
  const [activeTab, setActiveTab] = useState('email');
  const [emailData, setEmailData] = useState({ subject: '', content: '' });
  const [smsData, setSmsData] = useState({ content: '' });
  const [callData, setCallData] = useState({ 
    direction: 'outbound', 
    duration: 0, 
    notes: '' 
  });

  const queryClient = useQueryClient();

  const sendEmail = useMutation({
    mutationFn: (data: any) => fetch('/api/v1/communications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      onClose();
    }
  });

  const sendSMS = useMutation({
    mutationFn: (data: any) => fetch('/api/v1/communications/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      onClose();
    }
  });

  const logCall = useMutation({
    mutationFn: (data: any) => fetch('/api/v1/communications/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'email') {
      sendEmail.mutate({ contactId, ...emailData });
    } else if (activeTab === 'sms') {
      sendSMS.mutate({ contactId, ...smsData });
    } else if (activeTab === 'call') {
      logCall.mutate({ contactId, ...callData });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Contact {contactName}</h2>
        
        <div className="flex space-x-1 mb-4">
          {['email', 'sms', 'call'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium rounded ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'email' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="email"
                  value={contactEmail || ''}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={emailData.content}
                  onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  required
                />
              </div>
            </>
          )}

          {activeTab === 'sms' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="tel"
                  value={contactPhone || ''}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={smsData.content}
                  onChange={(e) => setSmsData({ ...smsData, content: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  maxLength={160}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {smsData.content.length}/160 characters
                </p>
              </div>
            </>
          )}

          {activeTab === 'call' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Direction</label>
                <select
                  value={callData.direction}
                  onChange={(e) => setCallData({ ...callData, direction: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={callData.duration}
                  onChange={(e) => setCallData({ ...callData, duration: parseInt(e.target.value) * 60 })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={callData.notes}
                  onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendEmail.isPending || sendSMS.isPending || logCall.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {activeTab === 'call' ? 'Log Call' : `Send ${activeTab.toUpperCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}