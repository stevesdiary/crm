import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalContacts: number;
  totalLeads: number;
  totalOpportunities: number;
  totalRevenue: number;
  openTasks: number;
  openTickets: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalLeads: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    openTasks: 0,
    openTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch data from multiple endpoints
      const [contacts, leads, opportunities, tasks, tickets] = await Promise.all([
        fetch('/api/v1/contacts?limit=1', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/leads?limit=1', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/opportunities?limit=1', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/tasks?status=pending&limit=1', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/tickets?status=open&limit=1', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      ]);

      const [contactsData, leadsData, opportunitiesData, tasksData, ticketsData] = await Promise.all([
        contacts.ok ? contacts.json() : { meta: { total: 0 } },
        leads.ok ? leads.json() : { meta: { total: 0 } },
        opportunities.ok ? opportunities.json() : { meta: { total: 0 }, data: [] },
        tasks.ok ? tasks.json() : { meta: { total: 0 } },
        tickets.ok ? tickets.json() : { meta: { total: 0 } },
      ]);

      const totalRevenue = opportunitiesData.data?.reduce((sum: number, opp: any) => sum + parseFloat(opp.amount || 0), 0) || 0;

      setStats({
        totalContacts: contactsData.meta?.total || 0,
        totalLeads: leadsData.meta?.total || 0,
        totalOpportunities: opportunitiesData.meta?.total || 0,
        totalRevenue,
        openTasks: tasksData.meta?.total || 0,
        openTickets: ticketsData.meta?.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💵</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🎫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <span className="block text-2xl mb-2">➕</span>
            <span className="text-sm font-medium">Add Contact</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <span className="block text-2xl mb-2">🎯</span>
            <span className="text-sm font-medium">Create Lead</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <span className="block text-2xl mb-2">📋</span>
            <span className="text-sm font-medium">New Task</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50">
            <span className="block text-2xl mb-2">🎫</span>
            <span className="text-sm font-medium">Create Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};