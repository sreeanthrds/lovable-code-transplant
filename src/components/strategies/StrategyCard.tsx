
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClerkUser } from '@/hooks/useClerkUser';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Calendar, Clock, Trash, Play, TrendingUp, Files, Plus, Activity } from 'lucide-react';
import { useLiveTradeStore } from '@/hooks/use-live-trade-store';
import { useWebsiteTheme } from '@/hooks/use-website-theme';
import { setSavingState } from '@/hooks/strategy-store/supabase-persistence';
import { useToast } from '@/hooks/use-toast';
import { saveStrategy } from '@/hooks/strategy-store/supabase-persistence';
import { strategyService } from '@/lib/supabase/services/strategy-service';
import { queueService } from '@/lib/supabase/services/queue-service';
import { getAuthenticatedTradelayoutClient } from '@/lib/supabase/tradelayout-client';
import { useBrokerConnections } from '@/hooks/use-broker-connections';
import { v4 as uuidv4 } from 'uuid';


interface StrategyCardProps {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  created: string;
  returns?: number;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isLiveTrade?: boolean;
}

const StrategyCard = ({ 
  id, 
  name, 
  description, 
  lastModified, 
  created, 
  returns,
  onDelete,
  onDuplicate,
  isLiveTrade = false
}: StrategyCardProps) => {
  const navigate = useNavigate();
  const { user, userId } = useClerkUser();
  const { theme } = useWebsiteTheme();
  const { toast } = useToast();
  
  // Live trading store
  const { addToLiveTrading, isStrategyInLiveTrading } = useLiveTradeStore();
  const isInLiveTrading = isStrategyInLiveTrading(id);
  
console.log('🔍 StrategyCard render:', { id, name, isInLiveTrading });
  
  // Broker connections
  const { connections } = useBrokerConnections();
  
  // Helper function to load strategy from database only
  const loadStrategyFromSource = async (strategyId: string) => {
    console.log('Loading strategy from database:', strategyId);
    
    if (!user?.id) {
      console.error('No user ID available');
      return null;
    }

    try {
      console.log('Loading from database...');
      const supabaseStrategy = await strategyService.getStrategyById(strategyId, user.id);
      
      if (supabaseStrategy && supabaseStrategy.strategy) {
        console.log('Successfully loaded from database');
        const strategyData = supabaseStrategy.strategy as any;
        return {
          nodes: strategyData.nodes || [],
          edges: strategyData.edges || [],
          name: supabaseStrategy.name
        };
      }
    } catch (error) {
      console.error('Failed to load from database:', error);
    }
    
    console.log('Failed to load strategy');
    return null;
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete strategy "${name}"?`)) {
      onDelete(id);
    }
  };

  const handleTestClick = () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to run backtest",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to local backtesting page with strategy ID and theme
    const params = new URLSearchParams();
    params.set('strategyId', id);
    params.set('theme', theme);
    
    navigate(`/app/backtesting?${params.toString()}`);
  };

  const handleLiveTradeClick = async () => {
    setSavingState(true, 'Starting live trade...');
    
    // Add a small delay to show the starting state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSavingState(false);
  };

  const handleOpenClick = () => {
    // Open strategy in read-only mode for live trading
    navigate(`/app/strategy-builder?id=${id}&name=${encodeURIComponent(name)}&mode=view`);
  };

  const handleAddToLiveTrade = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to add strategy to live trading",
        variant: "destructive",
      });
      return;
    }
    
    if (isInLiveTrading) {
      toast({
        title: "Already in Live Trading",
        description: "This strategy is already added to live trading",
      });
      return;
    }
try {
      // Use the queue service - same pattern as strategyService.saveStrategy
      const result = await queueService.addToQueue(id, userId);
      
      console.log('✅ Successfully added to queue:', result);

      // Also update local state
      addToLiveTrading({ id, name, description }, userId || '');
      
      // Force refresh the LiveStrategiesGrid by triggering a page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast({
        title: "Added to Live Trading",
        description: `"${name}" has been added to live trading`,
      });
    } catch (error) {
      console.error('❌ Error adding to queue:', error);
      toast({
        title: "Error",
        description: `Failed to add strategy: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleCardClick = () => {
    // Make entire card clickable to open strategy builder
    if (!isLiveTrade) {
      navigate(`/app/strategy-builder?id=${id}&name=${encodeURIComponent(name)}`);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Duplicate clicked for strategy:', id, name);
    
    if (!user?.id) {
      console.log('No user found, authentication required');
      toast({
        title: "Authentication required",
        description: "Please log in to duplicate strategy",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Loading original strategy from source...');
      // Load the original strategy
      const originalStrategy = await loadStrategyFromSource(id);
      console.log('Original strategy loaded:', originalStrategy);
      
      if (!originalStrategy) {
        console.log('Failed to load original strategy');
        toast({
          title: "Failed to duplicate",
          description: "Could not load original strategy",
          variant: "destructive",
        });
        return;
      }

      // Create new strategy with duplicate data
      const newId = uuidv4();
      const newName = `Copy of ${name}`;
      console.log('Creating duplicate with new ID:', newId, 'and name:', newName);
      
      // Save the duplicated strategy
      console.log('Saving duplicated strategy...');
      const success = await saveStrategy(
        originalStrategy.nodes,
        originalStrategy.edges,
        newId,
        newName
      );
      console.log('Strategy saved successfully:', success);

      if (!success) {
        console.log('Failed to save duplicated strategy');
        toast({
          title: "Failed to duplicate",
          description: "Could not save duplicated strategy",
          variant: "destructive",
        });
        return;
      }

      // Wait a bit for the save to complete due to debouncing
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Strategy duplicated",
        description: `Created "${newName}" successfully`,
      });

      // Call the onDuplicate callback if provided
      if (onDuplicate) {
        console.log('Calling onDuplicate callback...');
        onDuplicate(newId);
      } else {
        console.log('No onDuplicate callback provided');
      }

    } catch (error) {
      console.error('Failed to duplicate strategy:', error);
      toast({
        title: "Failed to duplicate",
        description: "An error occurred while duplicating the strategy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative h-full">
      <Card 
        className={`relative h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-3 ${!isLiveTrade ? 'cursor-pointer' : ''}`}
        style={{
          background: 'rgba(255, 255, 255, 0.003)',
          backdropFilter: 'blur(4px) saturate(120%)',
          WebkitBackdropFilter: 'blur(4px) saturate(120%)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 170, 165, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(65, 170, 165, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onClick={handleCardClick}
      >
        {/* Live trading indicator */}
        {isLiveTrade && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center px-3 py-1 bg-info text-white text-xs font-semibold rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}
        
        {/* Delete button - top right corner */}
        {!isLiveTrade && (
          <div className="absolute top-4 right-4 z-10">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 bg-background hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
        
        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl font-semibold">
                  {name}
                </CardTitle>
                {isInLiveTrading && !isLiveTrade && (
                  <Badge variant="secondary" className="text-xs bg-info/20 text-info border-info/30">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-2 line-clamp-2 text-muted-foreground">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-4">
          {/* Performance metrics */}
          {returns !== undefined && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Returns</span>
                <div className="flex items-center">
                  <TrendingUp className={`h-4 w-4 mr-2 ${returns >= 0 ? 'text-success' : 'text-destructive'}`} />
                  <span className={`font-bold text-lg ${returns >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {returns > 0 ? "+" : ""}{returns.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 border-t">
          <div className="flex gap-3 w-full">
            {isLiveTrade ? (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl border-info/30 text-info hover:bg-info/10"
                  onClick={handleOpenClick}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  className="flex-1 bg-success hover:bg-success/90 text-white rounded-xl shadow-lg"
                  onClick={handleLiveTradeClick}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Live Trade
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl border-warning/30 text-warning hover:bg-warning/10"
                  onClick={handleTestClick}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button 
                  variant="outline"
                  className={`flex-1 rounded-xl border-success/30 text-success hover:bg-success/10 ${isInLiveTrading ? 'opacity-50' : ''}`}
                  onClick={handleAddToLiveTrade}
                  disabled={isInLiveTrading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isInLiveTrading ? 'Live' : 'Go Live'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-info/30 text-info hover:bg-info/10"
                  onClick={handleDuplicate}
                >
                  <Files className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StrategyCard;
