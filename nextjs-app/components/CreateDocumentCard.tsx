'use client';

import { PlusIcon, FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CreateDocumentCardProps {
  onCreateNew: () => void;
}

export function CreateDocumentCard({ onCreateNew }: CreateDocumentCardProps) {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-dashed border-2 border-m3-outline hover:border-m3-primary">
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="w-16 h-16 bg-m3-primary-container rounded-full flex items-center justify-center mb-4 group-hover:bg-m3-primary transition-colors">
          <PlusIcon className="w-8 h-8 text-m3-on-primary-container group-hover:text-m3-on-primary transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-m3-on-surface mb-2 text-center">
          Create New Document
        </h3>
        <p className="text-m3-on-surface-variant text-center mb-4">
          Start writing a new document with AI-powered tools
        </p>
        <Button
          onClick={onCreateNew}
          className="w-full"
          variant="outline"
        >
          Get Started
        </Button>
      </div>
    </Card>
  );
}