
-- Add the new strategy column as JSONB
ALTER TABLE public.strategies ADD COLUMN strategy JSONB;

-- Migrate existing data: combine nodes and edges into strategy column
UPDATE public.strategies 
SET strategy = jsonb_build_object(
  'nodes', COALESCE(nodes, '[]'::jsonb),
  'edges', COALESCE(edges, '[]'::jsonb)
)
WHERE nodes IS NOT NULL OR edges IS NOT NULL;

-- Drop the old columns
ALTER TABLE public.strategies DROP COLUMN nodes;
ALTER TABLE public.strategies DROP COLUMN edges;

-- Make strategy column not nullable for future records
ALTER TABLE public.strategies ALTER COLUMN strategy SET NOT NULL;
ALTER TABLE public.strategies ALTER COLUMN strategy SET DEFAULT '{}'::jsonb;
