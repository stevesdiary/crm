import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FileUpload from '../components/FileUpload';
import DocumentList from '../components/DocumentList';

export default function Documents() {
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({ mimeType: '' });

  const { data: stats } = useQuery({
    queryKey: ['document-stats'],
    queryFn: () => fetch('/api/v1/files', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(docs => {
      const totalSize = docs.reduce((sum: number, doc: any) => sum + doc.size, 0);
      const typeCount = docs.reduce((acc: any, doc: any) => {
        const type = doc.mimeType.split('/')[0];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        total: docs.length,
        totalSize,
        typeCount
      };
    })
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showUpload ? 'Hide Upload' : 'Upload Files'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Storage</h3>
            <p className="text-2xl font-bold text-blue-600">{formatFileSize(stats.totalSize)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Images</h3>
            <p className="text-2xl font-bold text-green-600">{stats.typeCount.image || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Documents</h3>
            <p className="text-2xl font-bold text-purple-600">
              {(stats.typeCount.application || 0) + (stats.typeCount.text || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {showUpload && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
          <FileUpload onUploadComplete={() => setShowUpload(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <select
            value={filters.mimeType}
            onChange={(e) => setFilters({ ...filters, mimeType: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All File Types</option>
            <option value="image">Images</option>
            <option value="application/pdf">PDF</option>
            <option value="application/msword">Word Documents</option>
            <option value="application/vnd.ms-excel">Excel Files</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow p-6">
        <DocumentList />
      </div>
    </div>
  );
}