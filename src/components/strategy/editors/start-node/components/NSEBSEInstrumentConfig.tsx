import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroupField, SelectField } from '../../shared';
import SymbolSelector from '../../form-components/SymbolSelector';
import TimeframeManager from './TimeframeManager';
import { TimeframeConfig, SymbolConfig } from '../../action-node/types';
import { Search } from 'lucide-react';

interface NSEBSEInstrumentConfigProps {
  instrumentType: 'trading' | 'supporting';
  config: SymbolConfig;
  exchange: 'NSE' | 'BSE';
  symbolType: 'index' | 'stock';
  instrumentClass: 'equity' | 'futures' | 'options';
  onSymbolTypeChange: (type: 'index' | 'stock') => void;
  onInstrumentClassChange: (type: 'equity' | 'futures' | 'options') => void;
  onSymbolChange: (symbol: string) => void;
  onTimeframesChange: (timeframes: TimeframeConfig[]) => void;
  onContractMonthChange: (month: string) => void;
  strategyType?: string;
  onStrategyTypeChange?: (type: string) => void;
  deleteDisabled?: boolean;
}

const NSEBSEInstrumentConfig: React.FC<NSEBSEInstrumentConfigProps> = ({
  instrumentType,
  config,
  exchange,
  symbolType,
  instrumentClass,
  onSymbolTypeChange,
  onInstrumentClassChange,
  onSymbolChange,
  onTimeframesChange,
  onContractMonthChange,
  strategyType,
  onStrategyTypeChange,
  deleteDisabled = false
}) => {
  const isTrading = instrumentType === 'trading';

  return (
    <div className="space-y-3">
      {/* Symbol Type Selection */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Underlying Symbol Type</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <RadioGroupField
            label=""
            value={symbolType}
            options={[
              { value: 'index', label: 'Index' },
              { value: 'stock', label: 'Stock' }
            ]}
            onChange={(value) => onSymbolTypeChange(value as 'index' | 'stock')}
            layout="horizontal"
            required={true}
          />
        </CardContent>
      </Card>

      {/* For Index: Show Futures/Options selection first */}
      {symbolType === 'index' && (
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
              onChange={(value) => onInstrumentClassChange(value as 'equity' | 'futures' | 'options')}
              layout="horizontal"
              required={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Contract Month for Index Futures only - Show before symbol */}
      {symbolType === 'index' && instrumentClass === 'futures' && (
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Contract Month</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <SelectField
              label=""
              id={`${instrumentType}-contract-month`}
              value={config.contractMonth || 'M0'}
              options={[
                { value: 'M0', label: 'Current Month (M0)' },
                { value: 'M1', label: 'Next Month (M1)' },
                { value: 'M2', label: 'Far Month (M2)' }
              ]}
              onChange={onContractMonthChange}
              placeholder="Select expiry"
            />
          </CardContent>
        </Card>
      )}

      {/* Symbol Selection */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Select Symbol
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <SymbolSelector
            value={config.symbol}
            onChange={onSymbolChange}
            placeholder="Search for a symbol..."
            exchange={exchange}
            {...(symbolType && { symbolTypeFilter: symbolType })}
          />
        </CardContent>
      </Card>

      {/* For Stock: Show instrument class only after symbol selection */}
      {symbolType === 'stock' && config.symbol && (
        <>
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm">Instrument Class</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <RadioGroupField
                label=""
                value={instrumentClass}
                options={[
                  { value: 'equity', label: 'Equity' },
                  { value: 'futures', label: 'Futures' },
                  { value: 'options', label: 'Options' }
                ]}
                onChange={(value) => onInstrumentClassChange(value as 'equity' | 'futures' | 'options')}
                layout="horizontal"
                required={true}
              />
            </CardContent>
          </Card>

          {/* Contract Month for Stock Futures only */}
          {instrumentClass === 'futures' && (
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-sm">Contract Month</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <SelectField
                  label=""
                  id={`${instrumentType}-contract-month-stock`}
                  value={config.contractMonth || 'M0'}
                  options={[
                    { value: 'M0', label: 'Current Month (M0)' },
                    { value: 'M1', label: 'Next Month (M1)' },
                    { value: 'M2', label: 'Far Month (M2)' }
                  ]}
                  onChange={onContractMonthChange}
                  placeholder="Select expiry"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

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

      {/* Strategy Type (only for trading instrument) */}
      {isTrading && onStrategyTypeChange && (
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

export default NSEBSEInstrumentConfig;
