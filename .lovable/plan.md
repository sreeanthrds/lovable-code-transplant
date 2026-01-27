

# Backtest Usage Meter Implementation Plan

## Overview
Modify the backtest quota system to only consume quota when a backtest produces actual trades (`total_trades > 0`), and enhance the UI to display remaining quota with reset timing.

---

## Current State

The quota is currently consumed **immediately** when the user clicks "Start Backtest", regardless of the outcome. This means:
- A backtest with 0 trades still consumes quota
- Users cannot "preview" if their strategy produces any trades

---

## Proposed Changes

### 1. Move Quota Consumption to After Completion

**What changes:**
Instead of consuming quota when the backtest starts, consume it only when the backtest completes AND `total_trades > 0`.

**Files to modify:**
- `src/pages/Backtesting.tsx` - Add post-completion quota consumption logic
- `src/components/backtest/BacktestForm.tsx` - Remove immediate `consumeBacktest()` call
- `src/hooks/useQuota.ts` - Add a new function for conditional consumption

**Logic flow:**
```text
User clicks "Start Backtest"
       |
       v
Check canRunBacktest() - block if quota = 0
       |
       v
Start backtest (do NOT consume yet)
       |
       v
Poll for status...
       |
       v
Backtest completes with overall_summary
       |
       v
IF overall_summary.total_trades > 0
   THEN consumeBacktest()
   Show "1 backtest used" toast
ELSE
   Show "No trades generated - quota not consumed" toast
```

---

### 2. Enhance Quota Display on Backtest Page

**What to display:**
- Remaining backtests (already shown in form, but add to main page header)
- Reset time with timezone (e.g., "Resets at 12 AM IST")
- Daily vs Monthly remaining (if applicable)

**Files to modify:**
- `src/pages/Backtesting.tsx` - Add quota info banner at top
- `src/hooks/usePlanDefinitions.ts` - Fetch `daily_reset_hour` and `reset_timezone`

**UI component:**
```text
+--------------------------------------------------+
| Backtests: 5 remaining | Resets at 12 AM IST     |
| Plan: FREE | Daily: 2/2 used | [Upgrade Button]  |
+--------------------------------------------------+
```

---

### 3. Quota Exhausted Enforcement

**Current behavior:** Already partially implemented in `BacktestForm.tsx`

**Enhancements needed:**
- Add a dedicated "Quota Exhausted" modal/card when quota hits 0
- Different CTAs based on plan type:
  - FREE plan: "Upgrade to PRO" button (links to /pricing)
  - LAUNCH plan: "Upgrade to PRO" button
  - PRO plan: "Buy Add-ons" button + "Upgrade to Enterprise" option
  - ENTERPRISE: Should never hit this (unlimited)

**Files to modify:**
- Create new component: `src/components/backtest/QuotaExhaustedCard.tsx`
- `src/pages/Backtesting.tsx` - Show card when `quotaInfo.backtests.remaining === 0`

---

## Technical Implementation Details

### Step 1: Remove Immediate Quota Consumption

**File: `src/components/backtest/BacktestForm.tsx`**

Remove lines 270-274:
```typescript
// REMOVE THIS:
if (config.strategyId !== TEST_STRATEGY_ID) {
  await consumeBacktest();
  await refreshQuota();
}
```

The form will still check `canRunBacktest()` before allowing submission, but won't consume until results are in.

---

### Step 2: Add Conditional Consumption in Backtesting Page

**File: `src/pages/Backtesting.tsx`**

Add effect to watch for backtest completion:

```typescript
// Import useQuota
const { consumeBacktest, refreshQuota, quotaInfo } = useQuota();

// Track if quota was consumed for this session
const [quotaConsumed, setQuotaConsumed] = useState(false);

// Watch for completion and conditionally consume
useEffect(() => {
  if (session?.status === 'completed' && 
      session.overall_summary && 
      !quotaConsumed) {
    
    if (session.overall_summary.total_trades > 0) {
      // Consume quota
      consumeBacktest().then(() => {
        refreshQuota();
        setQuotaConsumed(true);
        toast({
          title: 'Backtest counted',
          description: `${session.overall_summary.total_trades} trades generated. 1 backtest consumed.`,
        });
      });
    } else {
      // No trades - don't consume
      setQuotaConsumed(true);
      toast({
        title: 'No quota consumed',
        description: 'Backtest produced 0 trades.',
      });
    }
  }
}, [session?.status, session?.overall_summary, quotaConsumed]);

// Reset quotaConsumed when starting new backtest
const handleReset = () => {
  reset();
  setQuotaConsumed(false);
  // ... rest of reset logic
};
```

---

### Step 3: Create Quota Info Banner Component

**New file: `src/components/backtest/BacktestQuotaBanner.tsx`**

```typescript
interface BacktestQuotaBannerProps {
  quotaInfo: QuotaInfo;
  resetHour: number;
  resetTimezone: string;
}

// Display:
// - Remaining count with badge
// - Reset time (convert hour to readable format)
// - Plan name
// - Upgrade/Add-on button when low
```

---

### Step 4: Create Quota Exhausted Card

**New file: `src/components/backtest/QuotaExhaustedCard.tsx`**

Display when `quotaInfo.backtests.remaining === 0`:
- For FREE: "Upgrade to unlock more backtests"
- For paid plans: "Purchase add-ons" or "Upgrade to higher tier"

---

### Step 5: Fetch Reset Time from Database

**File: `src/hooks/usePlanDefinitions.ts`**

Ensure the hook returns `daily_reset_hour` and `reset_timezone` for the user's current plan, so we can display "Resets at X:00 AM/PM [Timezone]".

---

## Database Changes Required

**None** - All required columns already exist:
- `plan_definitions.daily_reset_hour` (integer, 0-23)
- `plan_definitions.reset_timezone` (string, e.g., "Asia/Kolkata")
- `user_plans.backtests_used_today` (integer)
- `user_plans.usage_reset_date` (date)

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/backtest/BacktestForm.tsx` | Remove immediate `consumeBacktest()` call |
| `src/pages/Backtesting.tsx` | Add completion effect + quota banner |
| `src/components/backtest/BacktestQuotaBanner.tsx` | **NEW** - Quota display component |
| `src/components/backtest/QuotaExhaustedCard.tsx` | **NEW** - Exhausted state with CTAs |
| `src/hooks/useQuota.ts` | Minor: ensure daily tracking works |
| `src/hooks/usePlanDefinitions.ts` | Ensure reset time fields are exposed |

---

## Edge Cases Handled

1. **User starts backtest but leaves page before completion**: Quota not consumed (safe - user can re-run)
2. **Backtest fails mid-way**: Quota not consumed (only success with trades counts)
3. **Test strategy**: Already excluded from quota checks
4. **Multiple rapid submissions**: `canRunBacktest()` gate prevents over-consumption

---

## Testing Checklist

- [ ] Start backtest with 0 trades result - verify quota NOT consumed
- [ ] Start backtest with trades - verify quota consumed once
- [ ] Verify remaining count decrements correctly
- [ ] Verify FREE user sees "Upgrade" when exhausted
- [ ] Verify PRO user sees "Buy Add-ons" when exhausted
- [ ] Verify reset time displays correctly per timezone

