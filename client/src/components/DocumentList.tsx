import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DocumentListProps {
  entityType?: string;
  entityId?: string;
}

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

export default function DocumentList({ entityType, entityId }: DocumentListProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', entityType, entityId],
    queryFn: () => {
      const url = entityType && entityId 
        ? `/api/v1/files/entity/${entityType}/${entityId}`
        : '/api/v1/files';
      
      return fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json());
    }
  });

  const { data: versions } = useQuery({
    queryKey: ['document-versions', selectedDoc],
    queryFn: () => fetch(`/api/v1/files/${selectedDoc}/versions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
    enabled: !!selectedDoc
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => fetch(`/api/v1/files/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const uploadNewVersion = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/v1/files/${id}/version`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-versions'] });
    }
  });

  const handleDownload = (id: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/v1/files/${id}/download`;
    link.download = filename;
    link.click();
  };

  const handleNewVersion = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadNewVersion.mutate({ id, file });
      }
    };
    input.click();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) return <div>Loading documents...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Documents</h3>
      
      {documents?.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc: Document) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.originalName}</h4>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(doc.size)} • v{doc.version} • 
                      Uploaded by {doc.uploader.fullName} • 
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.originalName)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleNewVersion(doc.id)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    New Version
                  </button>
                  <button
                    onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Versions ({doc.versions?.length || 1})
                  </button>
                  <button
                    onClick={() => deleteDocument.mutate(doc.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedDoc === doc.id && versions && (
                <div className="mt-4 border-t pt-4">
                  <h5 className="font-medium mb-2">Version History</h5>
                  <div className="space-y-2">
                    {versions.map((version: Document) => (
                      <div key={version.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="text-sm">
                          <span className="font-medium">v{version.version}</span> • 
                          {formatFileSize(version.size)} • 
                          {version.uploader.fullName} • 
                          {new Date(version.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handleDownload(version.id, version.originalName)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No documents found
        </p>
      )}
    </div>
  );
}