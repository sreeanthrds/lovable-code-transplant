
import React, { useState, useEffect } from 'react';
import GlobalVariablesModal from './GlobalVariablesModal';

const TopToolbar: React.FC = () => {
  const [variablesOpen, setVariablesOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setVariablesOpen(true);
    window.addEventListener('openGlobalVariables', handleOpen);
    return () => window.removeEventListener('openGlobalVariables', handleOpen);
  }, []);
  
  return (
    <GlobalVariablesModal open={variablesOpen} onOpenChange={setVariablesOpen} />
  );
};

export default TopToolbar;
