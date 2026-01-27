import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, RotateCcw } from 'lucide-react';
import type { PlanFormState, DurationType, ResetType } from '@/types/plan-definitions';

interface PlanValiditySectionProps {
  formState: PlanFormState;
  onChange: (updates: Partial<PlanFormState>) => void;
}

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)', offset: '+05:30' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' },
  { value: 'America/New_York', label: 'EST (New York)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'PST (Los Angeles)', offset: '-08:00' },
  { value: 'Europe/London', label: 'GMT (London)', offset: '+00:00' },
  { value: 'Asia/Singapore', label: 'SGT (Singapore)', offset: '+08:00' },
];

const DURATION_TYPES: { value: DurationType; label: string; description: string }[] = [
  { value: 'subscription', label: 'Subscription', description: 'Recurring billing until cancelled' },
  { value: 'fixed', label: 'Fixed Duration', description: 'Expires after a set number of days' },
  { value: 'lifetime', label: 'Lifetime', description: 'One-time purchase, never expires' },
];

const RESET_TYPES: { value: ResetType; label: string; description: string }[] = [
  { value: 'calendar', label: 'Calendar Month', description: 'Resets on the 1st of each month' },
  { value: 'rolling', label: 'Rolling Window', description: 'Resets X days from subscription start' },
];

export function PlanValiditySection({ formState, onChange }: PlanValiditySectionProps) {
  return (
    <div className="space-y-6">
      {/* Duration Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Duration Type
        </Label>
        <Select
          value={formState.duration_type}
          onValueChange={(value: DurationType) => onChange({ duration_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration type" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col">
                  <span>{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration Days (only for fixed) */}
      {formState.duration_type === 'fixed' && (
        <div className="space-y-2 pl-4 border-l-2 border-primary/30">
          <Label>Duration in Days</Label>
          <Input
            type="number"
            min={1}
            value={formState.duration_days || ''}
            onChange={(e) => onChange({ duration_days: parseInt(e.target.value) || null })}
            placeholder="e.g., 60 for 2 months"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Plan will expire after this many days from activation
          </p>
        </div>
      )}

      {/* Trial & Grace Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trial Period (days)</Label>
          <Input
            type="number"
            min={0}
            value={formState.trial_days}
            onChange={(e) => onChange({ trial_days: parseInt(e.target.value) || 0 })}
            className="font-mono"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Days of free access before billing starts
          </p>
        </div>

        <div className="space-y-2">
          <Label>Grace Period (days)</Label>
          <Input
            type="number"
            min={0}
            value={formState.grace_period_days}
            onChange={(e) => onChange({ grace_period_days: parseInt(e.target.value) || 0 })}
            className="font-mono"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Days of access after plan expiry
          </p>
        </div>
      </div>

      {/* Reset Rules */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Quota Reset Rules
        </h4>

        <div className="space-y-2">
          <Label>Monthly Reset Type</Label>
          <Select
            value={formState.reset_type}
            onValueChange={(value: ResetType) => onChange({ reset_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reset type" />
            </SelectTrigger>
            <SelectContent>
              {RESET_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily Reset Hour
            </Label>
            <Select
              value={formState.daily_reset_hour.toString()}
              onValueChange={(value) => onChange({ daily_reset_hour: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}:00 ({i === 0 ? 'Midnight' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              When daily limits reset
            </p>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={formState.reset_timezone}
              onValueChange={(value) => onChange({ reset_timezone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Timezone for reset calculations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
