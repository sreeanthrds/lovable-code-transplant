
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Network, 
  Box, 
  AlertTriangle, 
  PlayCircle, 
  AreaChart, 
  FileText 
} from 'lucide-react';

interface DocNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DocNavigation: React.FC<DocNavigationProps> = ({ activeSection, setActiveSection }) => {
  const sections = [
    { id: 'introduction', name: 'Introduction', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { id: 'strategy-builder', name: 'Strategy Builder', icon: <Network className="h-4 w-4 mr-2" /> },
    { id: 'node-types', name: 'Node Types', icon: <Box className="h-4 w-4 mr-2" /> },
    { id: 'signal-nodes', name: 'Signal Nodes', icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
    { id: 'action-nodes', name: 'Action Nodes', icon: <PlayCircle className="h-4 w-4 mr-2" /> },
    { id: 'backtesting', name: 'Backtesting', icon: <FileText className="h-4 w-4 mr-2" /> },
    { id: 'reports', name: 'Reports & Analytics', icon: <AreaChart className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium mb-4">Documentation</div>
      {sections.map((section) => (
        <Button
          key={section.id}
          variant={activeSection === section.id ? "secondary" : "ghost"}
          className="w-full justify-start text-sm"
          onClick={() => setActiveSection(section.id)}
        >
          {section.icon}
          {section.name}
        </Button>
      ))}
    </div>
  );
};

export default DocNavigation;
