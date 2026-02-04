import React, { useMemo } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, RotateCcw, CalendarDays, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanFormState, DurationType, ResetType } from '@/types/plan-definitions';

interface PlanValiditySectionProps {
  formState: PlanFormState;
  onChange: (updates: Partial<PlanFormState>) => void;
}

type ValidityInputMode = 'date' | 'days';

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
  const [validityMode, setValidityMode] = React.useState<ValidityInputMode>(
    formState.valid_till ? 'date' : 'days'
  );

  // Calculate remaining days if valid_till is set
  const validityInfo = useMemo(() => {
    if (!formState.valid_till) return null;
    const expiryDate = new Date(formState.valid_till);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const remaining = differenceInDays(expiryDate, today);
    return { remaining, expiryDate };
  }, [formState.valid_till]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange({ valid_till: date.toISOString() });
      // Also calculate duration_days from today
      const days = differenceInDays(date, new Date());
      onChange({ duration_days: days > 0 ? days : null });
    } else {
      onChange({ valid_till: null, duration_days: null });
    }
  };

  const handleDaysChange = (days: number | null) => {
    onChange({ duration_days: days });
    if (days && days > 0) {
      const newDate = addDays(new Date(), days);
      onChange({ valid_till: newDate.toISOString() });
    } else {
      onChange({ valid_till: null });
    }
  };

  const clearValidity = () => {
    onChange({ valid_till: null, duration_days: null });
  };

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

      {/* Valid Till Section (only for fixed duration) */}
      {formState.duration_type === 'fixed' && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30 bg-accent/20 rounded-r-lg p-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              Plan Validity Period
            </Label>
            {(formState.valid_till || formState.duration_days) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearValidity}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Toggle between date and days input */}
          <RadioGroup
            value={validityMode}
            onValueChange={(v) => setValidityMode(v as ValidityInputMode)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="date" id="validity-date" />
              <Label htmlFor="validity-date" className="cursor-pointer flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Specific Date
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="days" id="validity-days" />
              <Label htmlFor="validity-days" className="cursor-pointer flex items-center gap-1">
                <Hash className="h-4 w-4" />
                Number of Days
              </Label>
            </div>
          </RadioGroup>

          {/* Date Picker */}
          {validityMode === 'date' && (
            <div className="space-y-2">
              <Label>Valid Till Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formState.valid_till && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formState.valid_till ? (
                      format(new Date(formState.valid_till), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formState.valid_till ? new Date(formState.valid_till) : undefined}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Days Input */}
          {validityMode === 'days' && (
            <div className="space-y-2">
              <Label>Duration in Days (from activation)</Label>
              <Input
                type="number"
                min={1}
                value={formState.duration_days ?? ''}
                onChange={(e) => handleDaysChange(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="e.g., 30, 60, 90, 365"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Plan will expire after this many days from activation
              </p>
            </div>
          )}

          {/* Validity Summary */}
          {validityInfo && (
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg text-sm border",
              validityInfo.remaining > 7 
                ? "bg-primary/10 text-primary border-primary/30"
                : validityInfo.remaining > 0
                  ? "bg-accent/50 text-accent-foreground border-accent"
                  : validityInfo.remaining === 0
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-destructive/10 text-destructive border-destructive/30"
            )}>
              {validityInfo.remaining > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Valid for <strong>{validityInfo.remaining} days</strong> 
                    {' '}(until {format(validityInfo.expiryDate, "PPP")})
                  </span>
                </>
              ) : validityInfo.remaining === 0 ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>Expires today</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>Already expired {Math.abs(validityInfo.remaining)} days ago</span>
                </>
              )}
            </div>
          )}
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
