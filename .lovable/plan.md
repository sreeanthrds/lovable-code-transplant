
# Comprehensive Billing Administration Page with Dynamic Plan Creator

## Overview
This plan creates a complete billing administration system that moves plan definitions from hardcoded TypeScript constants to a database-driven model, enabling admins to create, edit, and manage plans dynamically without code changes.

## Current State Analysis

| Component | Current State | Issue |
|-----------|---------------|-------|
| Plan Definitions | Hardcoded in `PLAN_CONFIGS` (`src/types/billing.ts`) | Cannot add/modify plans without code deployment |
| Usage Metering | Monthly tracking works, daily tracking incomplete | Missing DB columns for daily counters |
| Enforcement | Logic exists but reads from hardcoded configs | Cannot enforce dynamically created plans |
| Admin UI | Scattered across Admin tabs (Plans, Billing) | No unified plan management interface |

---

## Architecture

```text
+---------------------------+
|     Admin Billing Page    |
|    /app/admin/billing     |
+---------------------------+
            |
            v
+---------------------------+
|   Plan Definition CRUD    |
|  - Create Plan Form       |
|  - Edit Existing Plans    |
|  - Archive/Delete Plans   |
+---------------------------+
            |
            v
+---------------------------+
|   plan_definitions Table  |
|   (New Supabase Table)    |
+---------------------------+
            |
            v
+---------------------------+
|   usePlanDefinitions()    |
|   Hook for fetching plans |
+---------------------------+
            |
            v
+---------------------------+
|  useQuota() - Updated     |
|  Reads from DB instead    |
|  of PLAN_CONFIGS          |
+---------------------------+
```

---

## Implementation Plan

### Phase 1: Database Schema

**Create `plan_definitions` table in Supabase**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | VARCHAR(50) | Unique plan code (e.g., 'FREE', 'PRO') |
| `name` | VARCHAR(100) | Display name |
| `description` | TEXT | Plan description for pricing pages |
| `tier_level` | INTEGER | Hierarchy for upgrade/downgrade logic |
| `is_active` | BOOLEAN | Whether plan is available for purchase |
| `is_public` | BOOLEAN | Show on public pricing page |
| **Validity** | | |
| `duration_type` | VARCHAR(20) | 'subscription', 'fixed', 'lifetime' |
| `duration_days` | INTEGER | For fixed-duration plans (NULL = ongoing) |
| `trial_days` | INTEGER | Trial period length |
| `grace_period_days` | INTEGER | Post-expiry access window |
| **Backtest Limits** | | |
| `backtests_daily_limit` | INTEGER | Per-day cap (-1 = unlimited) |
| `backtests_monthly_limit` | INTEGER | Per-month cap (-1 = unlimited) |
| `backtests_total_limit` | INTEGER | Lifetime cap (-1 = unlimited) |
| **Live Trading Limits** | | |
| `live_executions_monthly_limit` | INTEGER | Per-month cap (-1 = unlimited) |
| **Paper Trading Limits** | | |
| `paper_trading_daily_limit` | INTEGER | Per-day cap (-1 = unlimited) |
| `paper_trading_monthly_limit` | INTEGER | Per-month cap (-1 = unlimited) |
| **Reset Rules** | | |
| `reset_type` | VARCHAR(20) | 'calendar' (1st of month) or 'rolling' (from purchase) |
| `daily_reset_hour` | INTEGER | Hour (0-23) for daily reset (default: 0 = midnight) |
| `reset_timezone` | VARCHAR(50) | Timezone for resets (default: 'Asia/Kolkata') |
| **Pricing** | | |
| `price_monthly` | DECIMAL(10,2) | Monthly price |
| `price_yearly` | DECIMAL(10,2) | Yearly price |
| `currency` | VARCHAR(3) | Currency code (default: 'INR') |
| `discount_percentage` | INTEGER | Yearly discount to display |
| **Features** | | |
| `can_buy_addons` | BOOLEAN | Allow addon purchases |
| `feature_flags` | JSONB | Feature toggles (e.g., {"api_access": true}) |
| `ui_color` | VARCHAR(20) | Badge color variant |
| `ui_icon` | VARCHAR(50) | Icon name for display |
| **Metadata** | | |
| `sort_order` | INTEGER | Display order on pricing page |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `created_by` | TEXT | Admin who created |
| `updated_by` | TEXT | Admin who last updated |

**Add daily tracking columns to `user_plans` table**

| Column | Type | Description |
|--------|------|-------------|
| `backtests_used_today` | INTEGER | Daily backtest counter |
| `paper_trading_used_today` | INTEGER | Daily paper trade counter |
| `usage_reset_date` | DATE | Date when daily counters were last reset |
| `plan_definition_id` | UUID | FK to plan_definitions (optional, for linking) |

---

### Phase 2: New Components

**File Structure**
```text
src/
├── pages/
│   └── BillingAdmin.tsx              # New dedicated billing admin page
├── components/
│   └── billing-admin/
│       ├── PlanDefinitionsManager.tsx # Main plan CRUD interface
│       ├── PlanCreatorForm.tsx        # Dynamic plan creation form
│       ├── PlanEditDialog.tsx         # Edit existing plan dialog
│       ├── PlanLimitsSection.tsx      # Limits configuration section
│       ├── PlanPricingSection.tsx     # Pricing configuration section
│       ├── PlanValiditySection.tsx    # Validity & reset rules section
│       ├── PlanFeaturesSection.tsx    # Feature flags configuration
│       ├── PlanPreviewCard.tsx        # Preview how plan will look
│       └── UserSubscriptionsTable.tsx # Existing user management (moved)
├── hooks/
│   └── usePlanDefinitions.ts          # Fetch/CRUD plan definitions
├── lib/
│   └── supabase/
│       └── services/
│           └── plan-definitions-service.ts  # DB operations
└── types/
    └── plan-definitions.ts            # TypeScript interfaces
```

---

### Phase 3: Component Details

#### 1. PlanCreatorForm.tsx
A comprehensive form with collapsible sections:

**Identity Section**
- Plan Code (uppercase, alphanumeric, unique)
- Display Name
- Description (markdown supported)
- Tier Level (numeric for hierarchy)
- Active toggle
- Public (show on pricing page) toggle

**Validity Section**
- Duration Type dropdown (Subscription / Fixed / Lifetime)
- Duration in Days (for fixed plans)
- Trial Period (days)
- Grace Period (days)

**Limits Section**
- Backtests: Daily / Monthly / Total (with "Unlimited" toggle each)
- Live Executions: Monthly limit
- Paper Trading: Daily / Monthly limits
- Visual indicator: -1 = Unlimited, 0 = Disabled, N = Limited

**Reset Rules Section**
- Reset Type: Calendar (resets on 1st) vs Rolling (from subscription start)
- Daily Reset Hour (0-23)
- Timezone selector

**Pricing Section**
- Monthly Price
- Yearly Price
- Currency dropdown (INR default)
- Yearly Discount percentage (auto-calculated or manual)
- Can Buy Add-ons toggle

**Features Section**
- Dynamic key-value editor for feature_flags JSONB
- Predefined toggles: API Access, Priority Support, Custom Reports
- UI Color picker
- Icon selector

**Preview Section**
- Live preview of how the plan card will look on the pricing page

---

#### 2. PlanDefinitionsManager.tsx
Main interface showing all plans:
- Table/Grid view of all plan definitions
- Columns: Name, Code, Tier, Limits Summary, Price, Status, Actions
- Actions: Edit, Duplicate, Archive, Delete
- Bulk actions: Activate/Deactivate selected
- Search and filter by status

---

#### 3. usePlanDefinitions Hook
```typescript
interface UsePlanDefinitions {
  plans: PlanDefinition[];
  loading: boolean;
  error: Error | null;
  createPlan: (data: CreatePlanInput) => Promise<PlanDefinition>;
  updatePlan: (id: string, data: UpdatePlanInput) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  duplicatePlan: (id: string) => Promise<PlanDefinition>;
  getPlanByCode: (code: string) => PlanDefinition | undefined;
  refreshPlans: () => Promise<void>;
}
```

---

### Phase 4: Quota Enforcement Update

**Update useQuota.ts to read from database**

```typescript
// Before (hardcoded)
const config = PLAN_CONFIGS[effectivePlan];

// After (database-driven)
const { getPlanByCode } = usePlanDefinitions();
const config = getPlanByCode(effectivePlan) || DEFAULT_FREE_CONFIG;
```

**Add daily reset logic**
```typescript
const shouldResetDailyCounters = (plan: UserPlan): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return plan.usage_reset_date !== today;
};

// In consumeBacktest():
if (shouldResetDailyCounters(currentPlan)) {
  updateData.backtests_used_today = 1;
  updateData.usage_reset_date = getTodayDateString();
} else {
  updateData.backtests_used_today = (currentPlan.backtests_used_today || 0) + 1;
}
```

---

### Phase 5: Migration Strategy

**Seed initial plan_definitions from PLAN_CONFIGS**
- Create database records matching current hardcoded plans
- Maintain backward compatibility during transition
- Gradual deprecation of `PLAN_CONFIGS` constant

**Fallback mechanism**
- If plan_definitions table is empty or unavailable, fall back to PLAN_CONFIGS
- Ensures zero downtime during migration

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/BillingAdmin.tsx` | New dedicated admin billing page |
| `src/components/billing-admin/PlanDefinitionsManager.tsx` | Plan CRUD list/grid |
| `src/components/billing-admin/PlanCreatorForm.tsx` | Create/edit plan form |
| `src/components/billing-admin/PlanLimitsSection.tsx` | Limits configuration UI |
| `src/components/billing-admin/PlanPricingSection.tsx` | Pricing configuration UI |
| `src/components/billing-admin/PlanValiditySection.tsx` | Validity rules UI |
| `src/components/billing-admin/PlanPreviewCard.tsx` | Live preview component |
| `src/hooks/usePlanDefinitions.ts` | Data fetching hook |
| `src/lib/supabase/services/plan-definitions-service.ts` | Database operations |
| `src/types/plan-definitions.ts` | TypeScript interfaces |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add route `/app/billing-admin` |
| `src/pages/Admin.tsx` | Add link to new billing page |
| `src/hooks/useQuota.ts` | Read from DB, add daily reset logic |
| `supabase/migrations/` | Add new migration for `plan_definitions` table |

## Database Migrations Required

1. **Create plan_definitions table** with all columns
2. **Add daily tracking columns** to user_plans table
3. **Seed initial data** from current PLAN_CONFIGS
4. **Create RLS policies** for admin-only access to plan_definitions

---

## Security Considerations

- Plan definitions table: Admin-only write access via RLS
- All plan modifications logged with `updated_by` admin ID
- Soft delete (archive) instead of hard delete for audit trail
- Validation: Prevent deletion of plans with active subscribers

---

## Testing Checklist

- [ ] Create a new plan via the form
- [ ] Edit existing plan limits
- [ ] Verify quota enforcement reads from new table
- [ ] Test daily reset at midnight
- [ ] Verify FREE plan users are limited to 2 backtests/day
- [ ] Test plan hierarchy prevents downgrades
- [ ] Confirm fallback to PLAN_CONFIGS if DB unavailable
