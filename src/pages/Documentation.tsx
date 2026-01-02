
import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import DocNavigation from '@/components/documentation/DocNavigation';
import DocumentationLayout from '@/components/documentation/DocumentationLayout';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-6">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
          <div className="flex-1 font-semibold">Trading Strategy Builder Documentation</div>
        </div>
      </header>
      
      <div className="py-6">
        <DocumentationLayout />
      </div>
    </div>
  );
};

export default Documentation;
