import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroupField, SelectField } from '../../shared';
import TimeframeManager from './TimeframeManager';
import { TimeframeConfig, SymbolConfig } from '../../action-node/types';

interface MCXInstrumentConfigProps {
  config: SymbolConfig;
  instrumentClass: 'futures' | 'options';
  onCommodityChange: (commodity: string) => void;
  onContractTypeChange: (type: 'current' | 'next') => void;
  onInstrumentClassChange: (type: 'futures' | 'options') => void;
  onTimeframesChange: (timeframes: TimeframeConfig[]) => void;
  strategyType?: string;
  onStrategyTypeChange?: (type: string) => void;
  deleteDisabled?: boolean;
}

const commodityOptions = [
  { value: 'CRUDEOIL', label: 'Crude Oil' },
  { value: 'NATURALGAS', label: 'Natural Gas' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLDM', label: 'Gold Mini' },
  { value: 'SILVERM', label: 'Silver Mini' },
  { value: 'NATURALGASM', label: 'Natural Gas Mini' }
];

const MCXInstrumentConfig: React.FC<MCXInstrumentConfigProps> = ({
  config,
  instrumentClass,
  onCommodityChange,
  onContractTypeChange,
  onInstrumentClassChange,
  onTimeframesChange,
  strategyType,
  onStrategyTypeChange,
  deleteDisabled = false
}) => {
  // Derive values from config
  const commodity = config.symbol || '';
  const contractType = config.expiry_type === 'M1' ? 'next' : 'current';
  return (
    <div className="space-y-3">
      {/* Commodity Selection */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Select Commodity</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <SelectField
            label=""
            id="mcx-commodity"
            value={commodity}
            options={commodityOptions}
            onChange={onCommodityChange}
            placeholder="Choose a commodity"
            required={true}
          />
        </CardContent>
      </Card>

      {/* Contract Type (Current/Next Month) */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Trading Symbol</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <RadioGroupField
            label=""
            value={contractType}
            options={[
              { value: 'current', label: 'Current Month' },
              { value: 'next', label: 'Next Month' }
            ]}
            onChange={(value) => onContractTypeChange(value as 'current' | 'next')}
            layout="horizontal"
            required={true}
          />
        </CardContent>
      </Card>

      {/* Instrument Class (Futures/Options) */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Instrument Class</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <RadioGroupField
            label=""
            value={instrumentClass}
            options={[
              { value: 'futures', label: 'Futures' },
              { value: 'options', label: 'Options' }
            ]}
            onChange={(value) => onInstrumentClassChange(value as 'futures' | 'options')}
            layout="horizontal"
            required={true}
          />
        </CardContent>
      </Card>

      {/* Timeframes & Indicators */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Timeframes & Indicators</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <TimeframeManager
            timeframes={config.timeframes}
            onChange={onTimeframesChange}
            maxTimeframes={3}
            deleteDisabled={deleteDisabled}
          />
        </CardContent>
      </Card>

      {/* Strategy Type */}
      {onStrategyTypeChange && (
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Strategy Type</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <RadioGroupField
              label=""
              value={strategyType || 'intraday'}
              options={[
                { value: 'intraday', label: 'Intraday' },
                { value: 'carryforward', label: 'Carry Forward' }
              ]}
              onChange={onStrategyTypeChange}
              layout="horizontal"
              required={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MCXInstrumentConfig;
