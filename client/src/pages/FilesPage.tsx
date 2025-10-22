import React, { useState, useEffect } from 'react';
import { Upload, Download, Share2, Trash2, Clock, FileText } from 'lucide-react';

interface Document {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  version: number;
  createdAt: string;
  uploader: { fullName: string };
  versions?: Document[];
}

interface FileShare {
  id: string;
  token: string;
  expiresAt: string;
  isActive: boolean;
  accessCount: number;
  creator: { fullName: string };
  url?: string;
}

export default function FilesPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareModal, setShareModal] = useState<{ show: boolean; docId: string | null }>({ show: false, docId: null });
  const [shares, setShares] = useState<FileShare[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const response = await fetch('/api/v1/files', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    setDocuments(data);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    await fetch('/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });

    setSelectedFile(null);
    setUploading(false);
    fetchDocuments();
  };

  const handleDownload = async (docId: string) => {
    const response = await fetch(`/api/v1/files/${docId}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'file';
    a.click();
  };

  const handleCreateShare = async (docId: string, expiresIn: number) => {
    const response = await fetch(`/api/v1/files/${docId}/share?expiresIn=${expiresIn}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const share = await response.json();
    alert(`Share link created: ${share.url}`);
    setShareModal({ show: false, docId: null });
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this file?')) return;
    
    await fetch(`/api/v1/files/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchDocuments();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">File Management</h1>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-center">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="font-medium">{doc.originalName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(doc.size)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">v{doc.version}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.uploader.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => setShareModal({ show: true, docId: doc.id })}
                        className="text-green-600 hover:text-green-800"
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {shareModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Create Share Link</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleCreateShare(shareModal.docId!, 3600)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Clock size={16} className="inline mr-2" />
                1 Hour
              </button>
              <button
                onClick={() => handleCreateShare(shareModal.docId!, 86400)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Clock size={16} className="inline mr-2" />
                24 Hours
              </button>
              <button
                onClick={() => handleCreateShare(shareModal.docId!, 604800)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Clock size={16} className="inline mr-2" />
                7 Days
              </button>
              <button
                onClick={() => setShareModal({ show: false, docId: null })}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
