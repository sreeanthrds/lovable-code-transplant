import React from 'react';
import InstrumentManager from './components/InstrumentManager';

interface BasicSettingsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleTradingInstrumentChange: (type: 'stock' | 'futures' | 'options') => void;
  handleUnderlyingTypeChange: (underlyingType: 'index' | 'indexFuture' | 'stock') => void;
  instrumentType?: 'trading' | 'supporting';
  deleteDisabled?: boolean;
}

const BasicSettingsTab: React.FC<BasicSettingsTabProps> = ({
  formData,
  handleInputChange,
  handleTradingInstrumentChange,
  handleUnderlyingTypeChange,
  instrumentType = 'trading',
  deleteDisabled = false
}) => {
  return (
    <InstrumentManager
      instrumentType={instrumentType}
      formData={formData}
      handleInputChange={handleInputChange}
      handleTradingInstrumentChange={handleTradingInstrumentChange}
      handleUnderlyingTypeChange={handleUnderlyingTypeChange}
      deleteDisabled={deleteDisabled}
    />
  );
};

export default BasicSettingsTab;
