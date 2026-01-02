
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertConfigDialog from '../../alerts/AlertConfigDialog';

const AlertConfigButton: React.FC = () => {
  return (
    <AlertConfigDialog
      trigger={
        <Button 
          variant="outline" 
          size="default" 
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Alert Config
        </Button>
      }
    />
  );
};

export default AlertConfigButton;
