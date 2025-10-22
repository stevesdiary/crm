import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FileUploadProps {
  entityType?: string;
  entityId?: string;
  onUploadComplete?: () => void;
}

export default function FileUpload({ entityType, entityId, onUploadComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const queryClient = useQueryClient();

  const uploadFiles = useMutation({
    mutationFn: async (files: FileList) => {
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        if (entityType) formData.append('entityType', entityType);
        if (entityId) formData.append('entityId', entityId);

        const response = await fetch('/api/v1/files/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        return response.json();
      });

      return Promise.all(uploads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setSelectedFiles(null);
      onUploadComplete?.();
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      uploadFiles.mutate(selectedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <div className="text-lg font-medium text-gray-900">
              Drop files here or click to browse
            </div>
            <div className="text-sm text-gray-500">
              Maximum file size: 50MB
            </div>
          </div>
        </label>
      </div>

      {selectedFiles && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files:</h4>
          {Array.from(selectedFiles).map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploadFiles.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploadFiles.isPending ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}
    </div>
  );
}