import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ContactsList from './pages/ContactsList';
import ContactDetail from './pages/ContactDetail';
import ContactImport from './pages/ContactImport';
import TasksList from './pages/TasksList';
import TicketsList from './pages/TicketsList';
import CustomerPortal from './pages/CustomerPortal';
import Dashboard from './pages/Dashboard';
import Communications from './pages/Communications';
import Workflows from './pages/Workflows';
import Documents from './pages/Documents';
import Integrations from './pages/Integrations';
import Webhooks from './pages/Webhooks';
import AuditLogs from './pages/AuditLogs';
import GdprCompliance from './pages/GdprCompliance';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/portal" element={<CustomerPortal />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="contacts" element={<ContactsList />} />
              <Route path="contacts/:id" element={<ContactDetail />} />
              <Route path="contacts/import" element={<ContactImport />} />
              <Route path="tasks" element={<TasksList />} />
              <Route path="tickets" element={<TicketsList />} />
              <Route path="communications" element={<Communications />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="documents" element={<Documents />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="webhooks" element={<Webhooks />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="gdpr" element={<GdprCompliance />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;