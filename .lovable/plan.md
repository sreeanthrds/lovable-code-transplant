

# Development Environment with Remix + GitHub Sync

## Overview

Using Lovable's **Remix** feature is a practical approach to create an isolated development environment. However, syncing code changes back to production requires **GitHub integration** since Lovable projects don't have a direct "merge" mechanism.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT WORKFLOW                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────────┐         ┌──────────────────┐                 │
│   │  PROD PROJECT    │         │   DEV PROJECT    │                 │
│   │  (Current)       │         │   (Remix)        │                 │
│   │                  │         │                  │                 │
│   │  joy-forge-core  │         │  joy-forge-dev   │                 │
│   │  .lovable.app    │         │  .lovable.app    │                 │
│   └────────┬─────────┘         └────────┬─────────┘                 │
│            │                            │                           │
│            │   GitHub Integration       │                           │
│            ▼                            ▼                           │
│   ┌──────────────────────────────────────────────────┐              │
│   │              GitHub Repository                   │              │
│   │  ┌─────────┐              ┌─────────┐            │              │
│   │  │  main   │◄─── PR ◄────│   dev   │            │              │
│   │  │ branch  │              │ branch  │            │              │
│   │  └─────────┘              └─────────┘            │              │
│   └──────────────────────────────────────────────────┘              │
│            │                            │                           │
│            ▼                            ▼                           │
│   ┌──────────────────┐         ┌──────────────────┐                 │
│   │  PROD SUPABASE   │         │  DEV SUPABASE    │                 │
│   │  oonepfqgzpd...  │         │  (New Project)   │                 │
│   └──────────────────┘         └──────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Implementation

### Phase 1: Create Development Supabase Project

1. **Create new Supabase project** at https://supabase.com/dashboard
   - Name: `tradelayout-dev`
   - Region: Same as production for consistency
   
2. **Apply all existing migrations** to the dev database:
   - Use Supabase CLI: `supabase db push --db-url <dev-db-url>`
   - Or manually run migration files in order via SQL Editor

3. **Copy Clerk JWT configuration**:
   - In dev Supabase: Settings → API → JWT Settings
   - Set the same JWT secret as production (or configure Clerk to work with both)

### Phase 2: Connect Both Projects to GitHub

1. **Production project** → Settings → GitHub → Connect to `main` branch
2. **Create remix** of current project
3. **Dev project (remix)** → Settings → GitHub → Connect to `dev` branch

This enables:
- Code pushed to `dev` branch updates the remix project
- Code pushed to `main` branch updates production
- Pull Requests for code review before production deployment

### Phase 3: Environment-Based Configuration

Create a centralized config that reads from environment variables:

**File: `src/config/environment.ts`**
```typescript
// Environment configuration for multi-environment support
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  },
  environment: import.meta.env.VITE_ENVIRONMENT || 'production',
  isDev: import.meta.env.VITE_ENVIRONMENT === 'development',
  isProd: import.meta.env.VITE_ENVIRONMENT === 'production',
};
```

**Update Supabase clients to use config:**

```typescript
// src/lib/supabase/tradelayout-client.ts
import { config } from '@/config/environment';

export const tradelayoutClient = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
);
```

### Phase 4: Database Migration Workflow

Since you have 80+ migrations, you need a proper sync workflow:

**Development Flow:**
```text
1. Make schema changes in DEV Supabase
2. Generate migration: supabase db diff --use-migra -f new_migration
3. Commit migration file to dev branch
4. Test thoroughly in dev environment
5. Create PR to main branch
6. After merge, apply to PROD: supabase db push
```

**Sync Script (optional helper):**
```bash
#!/bin/bash
# scripts/sync-to-production.sh

echo "🔄 Syncing migrations to production..."

# Set production project
export SUPABASE_PROJECT_REF="oonepfqgzpdssfzvokgk"

# Push migrations
supabase db push --linked

echo "✅ Production database updated!"
```

### Phase 5: Edge Functions Deployment

Edge functions are environment-agnostic but need separate secrets:

1. **Dev project**: Set secrets in Supabase Dashboard → Edge Functions → Secrets
2. **Prod project**: Keep existing secrets

When deploying from dev to prod:
```bash
# Deploy specific function to production
supabase functions deploy update-api-config --project-ref oonepfqgzpdssfzvokgk
```

## Deployment Workflow Summary

```text
┌──────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT WORKFLOW                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DEVELOP                                                      │
│     └─► Make changes in Dev Lovable project                      │
│     └─► Test with Dev Supabase                                   │
│                                                                  │
│  2. COMMIT                                                       │
│     └─► Changes auto-push to GitHub 'dev' branch                 │
│                                                                  │
│  3. REVIEW                                                       │
│     └─► Create Pull Request: dev → main                          │
│     └─► Review code changes                                      │
│                                                                  │
│  4. MERGE                                                        │
│     └─► Merge PR to main                                         │
│     └─► Production Lovable auto-updates from GitHub              │
│                                                                  │
│  5. DATABASE                                                     │
│     └─► Run new migrations on Production Supabase                │
│         supabase db push --project-ref oonepfqgzpdssfzvokgk      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/config/environment.ts` | Create | Centralized environment config |
| `src/lib/supabase/tradelayout-client.ts` | Modify | Use environment config |
| `src/hooks/useSupabaseClient.ts` | Modify | Use environment config |
| `src/integrations/supabase/client.ts` | Modify | Use environment config |
| `.env.example` | Create | Document required env vars |
| `scripts/sync-migrations.sh` | Create | Helper script for DB sync |
| `docs/DEVELOPMENT_WORKFLOW.md` | Create | Document the workflow |

## Environment Variables per Project

**Production Project (.env):**
```bash
VITE_ENVIRONMENT="production"
VITE_SUPABASE_URL="https://oonepfqgzpdssfzvokgk.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_PROJECT_ID="oonepfqgzpdssfzvokgk"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

**Development Project (.env) - after remix:**
```bash
VITE_ENVIRONMENT="development"
VITE_SUPABASE_URL="https://YOUR_DEV_PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_DEV_ANON_KEY"
VITE_SUPABASE_PROJECT_ID="YOUR_DEV_PROJECT_ID"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."  # Same Clerk for both
```

## Key Benefits

1. **Complete isolation**: Dev changes never affect production data
2. **Code review**: PR-based workflow ensures quality control
3. **Migration tracking**: All DB changes are versioned and reproducible
4. **Rollback capability**: Git history enables reverting changes
5. **Team collaboration**: Multiple developers can work on dev branch

## Prerequisites

- GitHub account connected to both Lovable projects
- Supabase CLI installed (`npm install -g supabase`)
- Access to create new Supabase projects
- Clerk configured to accept JWTs from both Supabase projects

