import React from 'react';
import { InputField } from '../shared';

interface SquareOffNodeSettingsProps {
  message: string;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SquareOffNodeSettings: React.FC<SquareOffNodeSettingsProps> = ({
  message,
  onMessageChange,
}) => {
  return (
    <div className="space-y-4">
      <InputField
        label="Stop Message"
        id="stop-message"
        value={message}
        onChange={onMessageChange}
        placeholder="Message to display when strategy is forcibly stopped"
      />
    </div>
  );
};

export default SquareOffNodeSettings;