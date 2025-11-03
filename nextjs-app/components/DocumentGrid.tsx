'use client';

import { FileTextIcon, EyeIcon, EditIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Document } from '@/types';

interface DocumentGridProps {
  viewMode: 'grid' | 'list';
  searchTerm: string;
  statusFilter: string;
}

export function DocumentGrid({ viewMode, searchTerm, statusFilter }: DocumentGridProps) {
  // Sample data - in real app, this would come from API
  const documents: Document[] = [
    {
      id: '1',
      title: 'Sample Document 1',
      snippet: 'This is a sample document snippet for demonstration purposes.',
      status: 'READY TO PUBLISH',
      visibility: 'PUBLIC',
      lastUpdated: new Date().toISOString(),
      ownerId: 'user1',
      accessList: ['user1', 'user2'],
    },
    {
      id: '2',
      title: 'Another Document',
      snippet: 'Another example document with different content.',
      status: 'DRAFT',
      visibility: 'PRIVATE',
      lastUpdated: new Date(Date.now() - 86400000).toISOString(),
      ownerId: 'user1',
      accessList: ['user1'],
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.snippet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-m3-primary-container rounded-lg flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-m3-on-primary-container" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  document.status === 'READY TO PUBLISH'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {document.status}
                </span>
              </div>

              <h3 className="font-semibold text-m3-on-surface mb-2 line-clamp-2">
                {document.title}
              </h3>

              <p className="text-m3-on-surface-variant text-sm mb-4 line-clamp-3">
                {document.snippet}
              </p>

              <div className="flex items-center justify-between text-xs text-m3-on-surface-variant mb-4">
                <span>Updated {new Date(document.lastUpdated).toLocaleDateString()}</span>
                <span>{document.visibility}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <EyeIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-m3-error">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDocuments.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-m3-primary-container rounded-lg flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-m3-on-primary-container" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-m3-on-surface line-clamp-1">
                    {document.title}
                  </h3>
                  <p className="text-m3-on-surface-variant text-sm line-clamp-1">
                    {document.snippet}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  document.status === 'READY TO PUBLISH'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {document.status}
                </span>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-m3-error">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 text-xs text-m3-on-surface-variant">
              Updated {new Date(document.lastUpdated).toLocaleDateString()} • {document.visibility}
            </div>
          </Card>
        ))}
      </div>
    );
  );
}