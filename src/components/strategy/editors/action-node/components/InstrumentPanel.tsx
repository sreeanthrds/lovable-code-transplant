
import React from 'react';
import InstrumentDisplay from '../InstrumentDisplay';

interface InstrumentPanelProps {
  startNodeSymbol?: string;
}

const InstrumentPanel: React.FC<InstrumentPanelProps> = ({
  startNodeSymbol
}) => {
  return <InstrumentDisplay startNodeSymbol={startNodeSymbol} />;
};

export default InstrumentPanel;
