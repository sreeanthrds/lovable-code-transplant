
import React from 'react';
import { SwitchField, InputField } from '../shared';

interface ForceEndNodeSettingsProps {
  closeAll: boolean;
  message: string;
  onCloseAllChange: (checked: boolean) => void;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ForceEndNodeSettings: React.FC<ForceEndNodeSettingsProps> = ({
  closeAll,
  message,
  onCloseAllChange,
  onMessageChange,
}) => {
  return (
    <div className="space-y-4">
      <SwitchField 
        label="Close all open positions"
        checked={closeAll}
        onCheckedChange={onCloseAllChange}
      />
      
      <InputField
        label="End Message"
        id="end-message"
        value={message}
        onChange={onMessageChange}
        placeholder="Message to display when strategy ends"
      />
    </div>
  );
};

export default ForceEndNodeSettings;
