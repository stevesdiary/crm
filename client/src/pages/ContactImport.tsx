import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contactsService } from '../services/contactsService';

const ContactImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const importMutation = useMutation({
    mutationFn: contactsService.importContacts,
    onSuccess: (data) => {
      alert(`Successfully imported ${data.imported} contacts`);
      navigate('/contacts');
    },
    onError: (error) => {
      alert('Import failed: ' + error.message);
    },
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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      importMutation.mutate(file);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Import Contacts</h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV file with columns: firstName, lastName, email, phone, company
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div>
              <p className="text-green-600 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{file.size} bytes</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">
                Drag and drop your CSV file here, or click to select
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={!file || importMutation.isPending}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {importMutation.isPending ? 'Importing...' : 'Import Contacts'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">CSV Format Example:</h3>
        <pre className="text-sm text-gray-600">
{`firstName,lastName,email,phone,company
John,Doe,john@example.com,555-1234,Acme Corp
Jane,Smith,jane@example.com,555-5678,Tech Inc`}
        </pre>
      </div>
    </div>
  );
};

export default ContactImport;