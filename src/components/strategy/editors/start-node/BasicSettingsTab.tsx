import React from 'react';
import InstrumentManager from './components/InstrumentManager';

interface BasicSettingsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleTradingInstrumentChange: (type: 'stock' | 'futures' | 'options') => void;
  handleUnderlyingTypeChange: (underlyingType: 'index' | 'indexFuture' | 'stock') => void;
  instrumentType?: 'trading' | 'supporting';
}

const BasicSettingsTab: React.FC<BasicSettingsTabProps> = ({
  formData,
  handleInputChange,
  handleTradingInstrumentChange,
  handleUnderlyingTypeChange,
  instrumentType = 'trading'
}) => {
  return (
    <InstrumentManager
      instrumentType={instrumentType}
      formData={formData}
      handleInputChange={handleInputChange}
      handleTradingInstrumentChange={handleTradingInstrumentChange}
      handleUnderlyingTypeChange={handleUnderlyingTypeChange}
    />
  );
};

export default BasicSettingsTab;
