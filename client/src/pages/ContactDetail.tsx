import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskAssignment from '../components/TaskAssignment';
import ActivityTimeline from '../components/ActivityTimeline';
import CommunicationModal from '../components/CommunicationModal';
import CommunicationHistory from '../components/CommunicationHistory';
import FileUpload from '../components/FileUpload';
import DocumentList from '../components/DocumentList';

interface ContactDetail {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  customFields?: any;
  createdAt: string;
  leads: Array<{ id: string; status: string; source: string }>;
  opportunities: Array<{ id: string; name: string; amount: number; stage: string }>;
  tickets: Array<{ id: string; subject: string; status: string }>;
}

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/v1/contacts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setContact(data);
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!contact) return <div>Contact not found</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.company && (
              <p className="text-gray-600 text-lg">{contact.company}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowCommModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Contact
            </button>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Assign Task
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit Contact
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {contact.email && (
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p className="font-medium">{contact.email}</p>
            </div>
          )}
          {contact.phone && (
            <div>
              <span className="text-sm text-gray-500">Phone:</span>
              <p className="font-medium">{contact.phone}</p>
            </div>
          )}
          {contact.address && (
            <div className="col-span-2">
              <span className="text-sm text-gray-500">Address:</span>
              <p className="font-medium">{contact.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'leads', 'opportunities', 'tickets', 'communications', 'documents', 'activities'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'leads' && contact.leads.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {contact.leads.length}
                  </span>
                )}
                {tab === 'opportunities' && contact.opportunities.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {contact.opportunities.length}
                  </span>
                )}
                {tab === 'tickets' && contact.tickets.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {contact.tickets.length}
                  </span>
                )}
                {tab === 'communications' && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    History
                  </span>
                )}
                {tab === 'documents' && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    Files
                  </span>
                )}
                {tab === 'activities' && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    Timeline
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Overview</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Leads</h4>
                  <p className="text-2xl font-bold text-blue-600">{contact.leads.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Opportunities</h4>
                  <p className="text-2xl font-bold text-green-600">{contact.opportunities.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900">Support Tickets</h4>
                  <p className="text-2xl font-bold text-yellow-600">{contact.tickets.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Leads</h3>
              {contact.leads.length > 0 ? (
                <div className="space-y-3">
                  {contact.leads.map((lead) => (
                    <div key={lead.id} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">Lead #{lead.id.slice(-8)}</span>
                          <span className="ml-2 text-sm text-gray-500">Source: {lead.source}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No leads found for this contact.</p>
              )}
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Opportunities</h3>
              {contact.opportunities.length > 0 ? (
                <div className="space-y-3">
                  {contact.opportunities.map((opp) => (
                    <div key={opp.id} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{opp.name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ${opp.amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {opp.stage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No opportunities found for this contact.</p>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Support Tickets</h3>
              {contact.tickets.length > 0 ? (
                <div className="space-y-3">
                  {contact.tickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{ticket.subject}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                          ticket.status === 'closed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No support tickets found for this contact.</p>
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <CommunicationHistory contactId={id!} />
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <FileUpload entityType="contact" entityId={id} />
              <DocumentList entityType="contact" entityId={id} />
            </div>
          )}

          {activeTab === 'activities' && (
            <ActivityTimeline entityType="contact" entityId={id} />
          )}
        </div>
      </div>

      {showTaskModal && (
        <TaskAssignment 
          onClose={() => setShowTaskModal(false)}
          relatedEntityType="contact"
          relatedEntityId={id}
        />
      )}

      {showCommModal && (
        <CommunicationModal
          contactId={id!}
          contactName={`${contact.firstName} ${contact.lastName}`}
          contactEmail={contact.email}
          contactPhone={contact.phone}
          onClose={() => setShowCommModal(false)}
        />
      )}
    </div>
  );
};