-- Create strategies table first
CREATE TABLE public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  strategy JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own strategies" 
ON public.strategies 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own strategies" 
ON public.strategies 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own strategies" 
ON public.strategies 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own strategies" 
ON public.strategies 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create index for faster lookups
CREATE INDEX idx_strategies_user_id ON public.strategies(user_id);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_strategies_updated_at
BEFORE UPDATE ON public.strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Now create strategy_versions table
CREATE TABLE public.strategy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  strategy JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(strategy_id, version_number)
);

-- Enable Row Level Security
ALTER TABLE public.strategy_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own strategy versions" 
ON public.strategy_versions 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own strategy versions" 
ON public.strategy_versions 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own strategy versions" 
ON public.strategy_versions 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create indexes
CREATE INDEX idx_strategy_versions_strategy_id ON public.strategy_versions(strategy_id);
CREATE INDEX idx_strategy_versions_user_id ON public.strategy_versions(user_id);

-- Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_strategy_versions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.strategy_versions
  WHERE id IN (
    SELECT id FROM public.strategy_versions
    WHERE strategy_id = NEW.strategy_id
    ORDER BY version_number DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER cleanup_strategy_versions_trigger
AFTER INSERT ON public.strategy_versions
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_old_strategy_versions();