import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectField } from '../../shared';
import { Building } from 'lucide-react';

interface ExchangeSelectorProps {
  exchange: string;
  onChange: (exchange: string) => void;
  disabled?: boolean;
}

const exchangeOptions = [
  { value: 'NSE', label: 'NSE (National Stock Exchange)' },
  { value: 'BSE', label: 'BSE (Bombay Stock Exchange)' },
  { value: 'MCX', label: 'MCX (Multi Commodity Exchange)' }
];

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({ exchange, onChange, disabled = false }) => {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building className="h-4 w-4" />
          Exchange Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <SelectField
          label="Select Exchange"
          id="exchange-selector"
          value={exchange}
          options={exchangeOptions}
          onChange={onChange}
          placeholder="Choose an exchange"
          required={true}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

export default ExchangeSelector;
