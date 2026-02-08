# Development Workflow

This document describes the development and deployment workflow for TradeLayout using Lovable's Remix feature and GitHub integration.

## Architecture Overview

```
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

## Initial Setup

### 1. Create Development Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project named `tradelayout-dev`
3. Choose the same region as production for consistency

### 2. Apply Migrations to Dev Database

Using Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your dev project
supabase link --project-ref YOUR_DEV_PROJECT_ID

# Push all migrations
supabase db push
```

### 3. Configure Clerk JWT

In your dev Supabase project:
1. Go to Settings → API → JWT Settings
2. Configure the same JWT secret as production
3. Or update Clerk to generate tokens for both projects

### 4. Connect Projects to GitHub

**Production Project:**
1. Open Lovable Settings → GitHub
2. Connect to your repository's `main` branch

**Development Project (after remix):**
1. Open Lovable Settings → GitHub
2. Connect to your repository's `dev` branch

### 5. Set Environment Variables

**In Production Lovable Project:**
```env
VITE_ENVIRONMENT="production"
VITE_SUPABASE_URL="https://oonepfqgzpdssfzvokgk.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-prod-anon-key"
VITE_SUPABASE_PROJECT_ID="oonepfqgzpdssfzvokgk"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

**In Development Lovable Project:**
```env
VITE_ENVIRONMENT="development"
VITE_SUPABASE_URL="https://YOUR_DEV_PROJECT.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-dev-anon-key"
VITE_SUPABASE_PROJECT_ID="YOUR_DEV_PROJECT"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

## Daily Development Workflow

### Making Changes

1. **Develop** in the Dev Lovable project
2. **Test** with Dev Supabase (isolated from production)
3. Changes automatically push to GitHub `dev` branch

### Database Schema Changes

1. Make schema changes in Dev Supabase Dashboard
2. Generate migration file:
   ```bash
   supabase db diff --use-migra -f descriptive_name
   ```
3. Commit the migration file to `dev` branch
4. Test thoroughly in development

### Deploying to Production

1. **Create Pull Request**: `dev` → `main`
2. **Review** code changes
3. **Merge** PR to `main`
4. Production Lovable auto-updates from GitHub
5. **Apply database migrations**:
   ```bash
   supabase link --project-ref oonepfqgzpdssfzvokgk
   supabase db push
   ```

### Edge Functions Deployment

```bash
# Deploy to production
supabase functions deploy function-name --project-ref oonepfqgzpdssfzvokgk
```

## Quick Reference

### Supabase CLI Commands

```bash
# Link to a project
supabase link --project-ref PROJECT_ID

# Push migrations
supabase db push

# Generate new migration
supabase db diff --use-migra -f migration_name

# Deploy edge function
supabase functions deploy FUNCTION_NAME
```

### Project IDs

| Environment | Supabase Project ID |
|-------------|---------------------|
| Production  | `oonepfqgzpdssfzvokgk` |
| Development | `YOUR_DEV_PROJECT_ID` |

## Troubleshooting

### JWT/Auth Issues

If Clerk tokens don't work with the dev Supabase:
1. Verify JWT secret is configured correctly in Supabase
2. Check Clerk template is generating correct claims
3. Ensure `sub` claim matches expected format

### Migration Conflicts

If migrations fail:
1. Check migration order matches between environments
2. Use `supabase db reset` for dev (destroys data)
3. Never reset production - fix forward with new migrations

### GitHub Sync Issues

If changes don't sync:
1. Check GitHub connection in Lovable Settings
2. Verify branch connections are correct
3. Look for merge conflicts in GitHub
