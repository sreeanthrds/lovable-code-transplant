import React from 'react';
import InstrumentManager from './components/InstrumentManager';

interface BasicSettingsTabProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleTradingInstrumentChange: (type: 'stock' | 'futures' | 'options') => void;
  handleUnderlyingTypeChange: (underlyingType: 'index' | 'indexFuture' | 'stock') => void;
  instrumentType?: 'trading' | 'supporting';
  isLocked?: boolean;
  isIndicatorUsed?: (indicatorId: string) => boolean;
  isTimeframeUsed?: (timeframeId: string, indicators: Record<string, any>) => boolean;
}

const BasicSettingsTab: React.FC<BasicSettingsTabProps> = ({
  formData,
  handleInputChange,
  handleTradingInstrumentChange,
  handleUnderlyingTypeChange,
  instrumentType = 'trading',
  isLocked,
  isIndicatorUsed,
  isTimeframeUsed
}) => {
  return (
    <InstrumentManager
      instrumentType={instrumentType}
      formData={formData}
      handleInputChange={handleInputChange}
      handleTradingInstrumentChange={handleTradingInstrumentChange}
      handleUnderlyingTypeChange={handleUnderlyingTypeChange}
      isLocked={isLocked}
      isIndicatorUsed={isIndicatorUsed}
      isTimeframeUsed={isTimeframeUsed}
    />
  );
};

export default BasicSettingsTab;
