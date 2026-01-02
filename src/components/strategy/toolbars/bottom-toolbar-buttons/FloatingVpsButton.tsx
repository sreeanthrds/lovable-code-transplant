
import React from 'react';
import { Maximize2 } from 'lucide-react';
import ToolbarButton from '../bottom-toolbar/ToolbarButton';

const FloatingVpsButton: React.FC = () => {
  const toggleVps = () => {
    // Trigger VPS visibility toggle
    const event = new CustomEvent('toggle-vps-visibility');
    window.dispatchEvent(event);
  };

  return (
    <ToolbarButton
      icon={Maximize2}
      label="Visualize"
      onClick={toggleVps}
      tooltip="Toggle visualization panel"
    />
  );
};

export default FloatingVpsButton;
