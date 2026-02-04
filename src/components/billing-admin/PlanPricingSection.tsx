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
import { IndianRupee, DollarSign, Euro, Percent } from 'lucide-react';
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

  // Calculate GST amounts
  const gstRate = formState.gst_percentage / 100;
  const monthlyWithGst = formState.price_monthly * (1 + gstRate);
  const yearlyWithGst = formState.price_yearly * (1 + gstRate);
  const monthlyGstAmount = formState.price_monthly * gstRate;
  const yearlyGstAmount = formState.price_yearly * gstRate;

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

      {/* GST Percentage - Prominently placed at top */}
      <div className="bg-accent/20 border border-accent/40 rounded-lg p-4 space-y-2">
        <Label className="flex items-center gap-2 text-base font-semibold">
          <Percent className="h-5 w-5 text-primary" />
          GST Percentage
        </Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={formState.gst_percentage ?? 18}
            onChange={(e) => onChange({ gst_percentage: parseFloat(e.target.value) || 0 })}
            className="w-32 font-mono text-lg"
            placeholder="18"
          />
          <span className="text-lg text-muted-foreground">%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This percentage will be added to base prices at checkout
        </p>
      </div>

      {/* Pricing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Monthly Price (Base)</Label>
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
            Billed monthly (before GST)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Yearly Price (Base)</Label>
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
            Billed annually (before GST)
          </p>
        </div>
      </div>

      {/* Price with GST Display */}
      {(formState.price_monthly > 0 || formState.price_yearly > 0) && formState.gst_percentage > 0 && (
        <div className="bg-accent/30 border border-accent/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Price with GST ({formState.gst_percentage}%)</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formState.price_monthly > 0 && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Monthly</p>
                <p className="font-mono font-bold text-lg">
                  {selectedCurrency.symbol}{monthlyWithGst.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Base: {selectedCurrency.symbol}{formState.price_monthly.toFixed(2)} + GST: {selectedCurrency.symbol}{monthlyGstAmount.toFixed(2)}
                </p>
              </div>
            )}
            {formState.price_yearly > 0 && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Yearly</p>
                <p className="font-mono font-bold text-lg">
                  {selectedCurrency.symbol}{yearlyWithGst.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Base: {selectedCurrency.symbol}{formState.price_yearly.toFixed(2)} + GST: {selectedCurrency.symbol}{yearlyGstAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
