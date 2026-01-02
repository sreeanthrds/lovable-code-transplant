
import React, { useState } from 'react';
import { Play, PauseCircle, Loader } from 'lucide-react';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useNavigate } from 'react-router-dom';
import ToolbarButton from '../bottom-toolbar/ToolbarButton';
import { useToast } from '@/hooks/use-toast';
import { useWebsiteTheme } from '@/hooks/use-website-theme';
import { getApiBaseUrl } from '@/lib/api-config';

interface BacktestButtonProps {
  isRunning?: boolean;
  strategyId?: string;
}

const BacktestButton: React.FC<BacktestButtonProps> = ({ 
  isRunning = false,
  strategyId
}) => {
  const { user } = useClerkUser();
  const { theme } = useWebsiteTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleBacktestClick = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to run backtest",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the current API URL from config
      const apiUrl = await getApiBaseUrl(user.id);
      console.log('🔧 BacktestButton - API URL retrieved:', apiUrl);
      
      // Navigate to backtesting page with strategy ID, theme, and API URL
      const params = new URLSearchParams();
      if (strategyId) params.set('strategyId', strategyId);
      params.set('theme', theme);
      if (apiUrl) {
        params.set('apiUrl', apiUrl);
        console.log('✅ BacktestButton - API URL added to params');
      } else {
        console.warn('⚠️ BacktestButton - No API URL to add to params');
      }
      
      const finalUrl = `/app/backtesting?${params.toString()}`;
      console.log('🚀 BacktestButton - Navigating to:', finalUrl);
      navigate(finalUrl);
    } catch (error) {
      console.error('Error getting API URL:', error);
      toast({
        title: "Configuration Error",
        description: "Failed to get API configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ToolbarButton
      icon={loading ? Loader : (isRunning ? PauseCircle : Play)}
      label={loading ? "Running..." : (isRunning ? "Stop" : "Backtest")}
      onClick={handleBacktestClick}
      disabled={loading}
      tooltip={loading ? "Backtest in progress..." : (isRunning ? "Stop backtesting" : "Run backtest on this strategy")}
    />
  );
};

export default BacktestButton;
