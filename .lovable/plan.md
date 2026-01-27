
# Plan: User-Specific API URL Toggle for Admin Users

## Overview
This plan consolidates the Supabase projects and implements a user-specific API URL switching feature for admin users. Each admin can toggle between the global production URL and their own local development URL without affecting other users.

---

## Part 1: Consolidate Supabase Projects

### Step 1.1: Update Environment Variables
**File: `.env`**
- Replace the secondary project credentials with the primary project credentials
- Update `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` to point to `oonepfqgzpdssfzvokgk`

### Step 1.2: Update Auto-Generated Client (Optional)
**File: `src/integrations/supabase/client.ts`**
- After `.env` is updated, this file will automatically use the correct project
- Add a comment noting it now points to the consolidated TradeLayout database

---

## Part 2: Database Schema Changes

### Step 2.1: Add Columns to `api_configurations` Table
Run this migration in Supabase SQL Editor:

```sql
-- Add columns for user-specific local URL override
ALTER TABLE public.api_configurations 
ADD COLUMN IF NOT EXISTS local_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS use_local_url BOOLEAN DEFAULT false;

-- Migrate existing dev_url data to local_url (if any)
UPDATE public.api_configurations 
SET local_url = dev_url, use_local_url = use_dev_url
WHERE dev_url IS NOT NULL AND dev_url != '';
```

### Step 2.2: Create Global Configuration Row
Ensure a single global configuration exists that all non-admin users (and admins not using local mode) will use:

```sql
-- Insert global configuration (if not exists)
INSERT INTO public.api_configurations (user_id, base_url, config_name, timeout, retries)
VALUES ('__GLOBAL__', 'https://api.tradelayout.com', 'Global Production', 30000, 3)
ON CONFLICT (user_id) DO NOTHING;
```

---

## Part 3: Update API Config Service

### Step 3.1: Update TypeScript Interface
**File: `src/lib/api-config.ts`**

```typescript
interface ApiConfig {
  baseUrl: string;      // Global production URL (read-only for regular users)
  localUrl: string;     // User-specific local URL (only for admins)
  useLocalUrl: boolean; // Toggle for admin users
  timeout: number;
  retries: number;
}
```

### Step 3.2: Update URL Resolution Logic
**File: `src/lib/api-config.ts`**

Modify `getActiveApiUrl` to:
1. Check if user is admin AND has `useLocalUrl = true`
2. If yes, return their `localUrl`
3. Otherwise, return global `baseUrl`

```typescript
export const getActiveApiUrl = (config: ApiConfig, isAdmin: boolean): string => {
  if (isAdmin && config.useLocalUrl && config.localUrl) {
    return config.localUrl;
  }
  return config.baseUrl;
};
```

### Step 3.3: Update `getApiConfig` Function
- For admin users: Fetch their user-specific row first
- For non-admin users: Always fetch the global configuration row
- Fallback: Return default production URL

### Step 3.4: Update `updateApiConfig` Function
- Admin users can only update their `localUrl` and `use_local_url` fields
- Global `baseUrl` changes require a separate admin function (protected)

---

## Part 4: Redesign Admin UI

### Step 4.1: Update ApiConfigManager Component
**File: `src/components/admin/ApiConfigManager.tsx`**

**New UI Design:**

```text
+--------------------------------------------------+
|  API Configuration                                |
|  ------------------------------------------------ |
|                                                   |
|  [Global Production URL - Read Only]              |
|  https://api.tradelayout.com                      |
|                                                   |
|  ------------------------------------------------ |
|                                                   |
|  Use Local Development Server                     |
|  [ OFF ]========[ ON ]                            |
|                                                   |
|  (When toggled ON, show input field below)        |
|                                                   |
|  Your Local URL:                                  |
|  [http://localhost:3001_____________] [Test]      |
|                                                   |
|  [Save Configuration]                             |
+--------------------------------------------------+
```

**Component Changes:**
1. Display global `baseUrl` as read-only (not editable)
2. Show toggle switch labeled "Use Local Development Server"
3. When toggle is ON, show input field for `localUrl`
4. Include "Test Connection" button for the local URL
5. Show current active URL status badge (PROD or LOCAL)

### Step 4.2: Remove Dev URL Fields
- Remove the separate "Development API URL" section
- Replace with the toggle-based approach described above
- Remove `devUrl` and `useDevUrl` state variables
- Use `localUrl` and `useLocalUrl` instead

---

## Part 5: Update API Client

### Step 5.1: Pass Admin Status to URL Resolution
**File: `src/lib/api-config.ts`**

The `ApiClient` class needs to know if the current user is an admin:

```typescript
export class ApiClient {
  private userId?: string;
  private isAdmin: boolean = false;

  setContext(userId?: string, isAdmin: boolean = false) {
    this.userId = userId;
    this.isAdmin = isAdmin;
  }

  private async getConfig(): Promise<ApiConfig> {
    return await getApiConfig(this.userId);
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    const config = await this.getConfig();
    const url = `${getActiveApiUrl(config, this.isAdmin)}${endpoint}`;
    // ... rest of implementation
  }
}
```

### Step 5.2: Initialize Client with User Context
Update places where `apiClient` is used to set the user context:

```typescript
// In a component or hook
const { user } = useClerkUser();
const { isAdmin } = useAdminRole();

useEffect(() => {
  apiClient.setContext(user?.id, isAdmin);
}, [user?.id, isAdmin]);
```

---

## Part 6: Edge Function Updates

### Step 6.1: Update backtest-proxy
**File: `supabase/functions/backtest-proxy/index.ts`**

Update the `getBacktestApiUrl` function to:
1. Check if the requesting user (from header) is an admin
2. Check if they have a local URL configured with `use_local_url = true`
3. Return appropriate URL based on user context

---

## Summary of Files to Modify

| File | Changes |
|------|---------|
| `.env` | Update to primary Supabase project credentials |
| `src/lib/api-config.ts` | Update interface, URL resolution logic, add admin context |
| `src/components/admin/ApiConfigManager.tsx` | Redesign UI with toggle approach |
| `src/integrations/supabase/types.ts` | Update types for new columns (generated) |
| `supabase/functions/backtest-proxy/index.ts` | Update to respect user-specific URLs |

## Database Migration Required

```sql
-- Run in Supabase SQL Editor
ALTER TABLE public.api_configurations 
ADD COLUMN IF NOT EXISTS local_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS use_local_url BOOLEAN DEFAULT false;
```

---

## Technical Notes

1. **Caching**: The current 5-minute cache in `api-config.ts` will need to be user-specific to avoid serving stale URLs when admins toggle between modes.

2. **Security**: The production URL should be protected - only super-admins should be able to modify it. Regular admins can only modify their own local URL.

3. **Fallback**: If an admin's local URL is unreachable, consider adding a fallback mechanism to automatically switch back to production.
