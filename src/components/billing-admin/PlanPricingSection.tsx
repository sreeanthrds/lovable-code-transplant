import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IndianRupee, DollarSign, Euro } from 'lucide-react';
import type { PlanFormState } from '@/types/plan-definitions';

interface PlanPricingSectionProps {
  formState: PlanFormState;
  onChange: (updates: Partial<PlanFormState>) => void;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', icon: IndianRupee, name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', icon: DollarSign, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', icon: Euro, name: 'Euro' },
];

export function PlanPricingSection({ formState, onChange }: PlanPricingSectionProps) {
  const selectedCurrency = CURRENCIES.find(c => c.code === formState.currency) || CURRENCIES[0];
  
  // Calculate yearly savings percentage
  const yearlySavings = formState.price_monthly > 0
    ? Math.round((1 - formState.price_yearly / (formState.price_monthly * 12)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Currency Selection */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <Select
          value={formState.currency}
          onValueChange={(value) => onChange({ currency: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-2">
                  <currency.icon className="h-4 w-4" />
                  <span>{currency.code} - {currency.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pricing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Monthly Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {selectedCurrency.symbol}
            </span>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={formState.price_monthly}
              onChange={(e) => onChange({ price_monthly: parseFloat(e.target.value) || 0 })}
              className="pl-8 font-mono"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Billed monthly
          </p>
        </div>

        <div className="space-y-2">
          <Label>Yearly Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {selectedCurrency.symbol}
            </span>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={formState.price_yearly}
              onChange={(e) => onChange({ price_yearly: parseFloat(e.target.value) || 0 })}
              className="pl-8 font-mono"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Billed annually (full year)
          </p>
        </div>
      </div>

      {/* Savings Display */}
      {formState.price_monthly > 0 && formState.price_yearly > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Yearly Savings</p>
              <p className="text-xs text-muted-foreground">
                {selectedCurrency.symbol}{(formState.price_monthly * 12 - formState.price_yearly).toFixed(2)} saved vs monthly
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {yearlySavings}%
            </div>
          </div>
        </div>
      )}

      {/* Display Discount */}
      <div className="space-y-2">
        <Label>Display Discount Percentage</Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={0}
            max={100}
            value={formState.discount_percentage}
            onChange={(e) => onChange({ discount_percentage: parseInt(e.target.value) || 0 })}
            className="w-24 font-mono"
            placeholder="0"
          />
          <span className="text-muted-foreground">%</span>
          <p className="text-xs text-muted-foreground">
            Shown on pricing page (can differ from calculated savings)
          </p>
        </div>
      </div>

      {/* Add-ons Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Allow Add-on Purchases</Label>
          <p className="text-xs text-muted-foreground">
            Users on this plan can buy additional backtest/execution packs
          </p>
        </div>
        <Switch
          checked={formState.can_buy_addons}
          onCheckedChange={(checked) => onChange({ can_buy_addons: checked })}
        />
      </div>

      {/* Free Plan Notice */}
      {formState.price_monthly === 0 && formState.price_yearly === 0 && (
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium">💡 This is a free plan</p>
          <p className="text-xs mt-1">
            No payment required. Users will be assigned this plan by default or through specific actions.
          </p>
        </div>
      )}
    </div>
  );
}
