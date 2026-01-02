
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ToolbarButton from './ToolbarButton';
import EncryptionAccessManager from '../../utils/import-export/EncryptionAccessManager';

const EncryptionManagerButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ToolbarButton
            icon={Shield}
            label="Encryption Manager"
            onClick={() => setOpen(true)}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Encryption Access Manager</DialogTitle>
        </DialogHeader>
        <EncryptionAccessManager onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default EncryptionManagerButton;
