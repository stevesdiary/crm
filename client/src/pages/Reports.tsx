import React, { useState, useEffect } from 'react';

interface ReportData {
  salesMetrics: {
    totalRevenue: number;
    totalOpportunities: number;
    conversionRate: number;
    averageDealSize: number;
  };
  leadMetrics: {
    totalLeads: number;
    qualifiedLeads: number;
    leadSources: Array<{ source: string; count: number }>;
  };
  activityMetrics: {
    totalTasks: number;
    completedTasks: number;
    openTickets: number;
    resolvedTickets: number;
  };
}

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    salesMetrics: {
      totalRevenue: 0,
      totalOpportunities: 0,
      conversionRate: 0,
      averageDealSize: 0,
    },
    leadMetrics: {
      totalLeads: 0,
      qualifiedLeads: 0,
      leadSources: [],
    },
    activityMetrics: {
      totalTasks: 0,
      completedTasks: 0,
      openTickets: 0,
      resolvedTickets: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const [opportunities, leads, tasks, tickets] = await Promise.all([
        fetch('/api/v1/opportunities', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/leads', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/tasks', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/tickets', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      ]);

      const [opportunitiesData, leadsData, tasksData, ticketsData] = await Promise.all([
        opportunities.ok ? opportunities.json() : { data: [] },
        leads.ok ? leads.json() : { data: [] },
        tasks.ok ? tasks.json() : { data: [] },
        tickets.ok ? tickets.json() : { data: [] },
      ]);

      // Calculate sales metrics
      const opps = opportunitiesData.data || [];
      const totalRevenue = opps.reduce((sum: number, opp: any) => sum + parseFloat(opp.amount || 0), 0);
      const wonOpps = opps.filter((opp: any) => opp.stage === 'closed_won');
      const conversionRate = opps.length > 0 ? (wonOpps.length / opps.length) * 100 : 0;
      const averageDealSize = wonOpps.length > 0 ? totalRevenue / wonOpps.length : 0;

      // Calculate lead metrics
      const leadsArray = leadsData.data || [];
      const qualifiedLeads = leadsArray.filter((lead: any) => lead.status === 'qualified').length;
      
      // Group leads by source
      const sourceMap = new Map();
      leadsArray.forEach((lead: any) => {
        sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1);
      });
      const leadSources = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));

      // Calculate activity metrics
      const tasksArray = tasksData.data || [];
      const ticketsArray = ticketsData.data || [];
      const completedTasks = tasksArray.filter((task: any) => task.status === 'completed').length;
      const openTickets = ticketsArray.filter((ticket: any) => ticket.status === 'open').length;
      const resolvedTickets = ticketsArray.filter((ticket: any) => ticket.status === 'resolved').length;

      setReportData({
        salesMetrics: {
          totalRevenue,
          totalOpportunities: opps.length,
          conversionRate,
          averageDealSize,
        },
        leadMetrics: {
          totalLeads: leadsArray.length,
          qualifiedLeads,
          leadSources,
        },
        activityMetrics: {
          totalTasks: tasksArray.length,
          completedTasks,
          openTickets,
          resolvedTickets,
        },
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading reports...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${reportData.salesMetrics.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.salesMetrics.totalOpportunities}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.salesMetrics.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${reportData.salesMetrics.averageDealSize.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Lead Generation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Lead Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Leads</span>
                <span className="font-semibold">{reportData.leadMetrics.totalLeads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Qualified Leads</span>
                <span className="font-semibold">{reportData.leadMetrics.qualifiedLeads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Qualification Rate</span>
                <span className="font-semibold">
                  {reportData.leadMetrics.totalLeads > 0 
                    ? ((reportData.leadMetrics.qualifiedLeads / reportData.leadMetrics.totalLeads) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Lead Sources</h3>
            <div className="space-y-3">
              {reportData.leadMetrics.leadSources.map(({ source, count }) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{source.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / Math.max(...reportData.leadMetrics.leadSources.map(s => s.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.activityMetrics.totalTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✔️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.activityMetrics.completedTasks}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.activityMetrics.openTickets}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Tickets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.activityMetrics.resolvedTickets}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};