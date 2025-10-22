import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Contacts', href: '/contacts', icon: '👥' },
    { name: 'Leads', href: '/leads', icon: '🎯' },
    { name: 'Opportunities', href: '/opportunities', icon: '💰' },
    { name: 'Tasks', href: '/tasks', icon: '✅' },
    { name: 'Tickets', href: '/tickets', icon: '🎫' },
    { name: 'Communications', href: '/communications', icon: '📞' },
    { name: 'Workflows', href: '/workflows', icon: '⚡' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Users', href: '/users', icon: '👤' },
    { name: 'Security', href: '/security', icon: '🔒' },
    { name: 'Audit Logs', href: '/audit', icon: '📄' },
    { name: 'GDPR', href: '/gdpr', icon: '🛡️' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-sm border-r border-gray-200 fixed lg:static inset-y-0 left-0 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out z-40`}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">CRM Platform</h1>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile */}
        {children}
      </div>
    </div>
  );
};