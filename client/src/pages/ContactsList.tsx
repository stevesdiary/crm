import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contactsService } from '../services/contactsService';

const ContactsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', { search, page }],
    queryFn: () => contactsService.getContacts({ search, page, limit: 10 }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading contacts</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="flex gap-4">
          <Link
            to="/contacts/import"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Import
          </Link>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add Contact
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="bg-white shadow rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.data.map((contact: any) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/contacts/${contact.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {contact.firstName} {contact.lastName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {contact.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {contact.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/contacts/${contact.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {data?.data.length} of {data?.meta.total} contacts
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={data?.data.length < 10}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsList;