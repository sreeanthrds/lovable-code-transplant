import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WebsiteThemeProvider } from "@/hooks/use-website-theme";
import AuthGuard from "@/components/auth/AuthGuard";
import AdminGuard from "@/components/auth/AdminGuard";
import OAuthCallback from "@/components/auth/OAuthCallback";
import Index from "./pages/Index";
import StrategyBuilder from "./pages/StrategyBuilder";
import Strategies from "./pages/StrategiesLanding";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Documentation from "./pages/Documentation";
import LiveTradingDashboard from "./pages/LiveTradingDashboard";
import StrategyDetail from "./pages/StrategyDetail";
import StrategiesPage from "./pages/Strategies";
import Backtesting from "./pages/Backtesting";
import MultiStrategyBacktest from "./pages/MultiStrategyBacktest";
import Account from "./pages/Account";
import AdminSetup from "./pages/AdminSetup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import Blog from "./pages/Blog";
import ColorPalette from "./pages/ColorPalette";
import PitchDeck from "./pages/PitchDeck";
import Dashboard from "./pages/Dashboard";
import OptionChain from "./pages/OptionChain";
import BrokerConnection from "./pages/BrokerConnection";
import { SSETestNew } from "./pages/SSETestNew";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log('🎯 App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <WebsiteThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/pitch" element={<PitchDeck />} />
              <Route path="/color-palette" element={<ColorPalette />} />
              {/* OAuth callback routes */}
              <Route path="/auth/callback/:brokerId" element={<OAuthCallback />} />
              {/* Legacy callback route for backward compatibility */}
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/app/*" element={
                <AuthGuard>
                  <Routes>
                    <Route path="strategies-landing" element={<Strategies />} />
                    <Route path="strategies" element={<StrategiesPage />} />
                    <Route path="strategy-builder" element={<StrategyBuilder />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="option-chain" element={<OptionChain />} />
                    <Route path="broker-connection" element={<BrokerConnection />} />
                    <Route path="live-trading" element={<LiveTradingDashboard />} />
                    <Route path="live-trading/:strategyId" element={<StrategyDetail />} />
                    <Route path="backtesting" element={<Backtesting />} />
                    <Route path="multi-strategy-backtest" element={<MultiStrategyBacktest />} />
                    <Route path="sse-test" element={<SSETestNew />} />
                    <Route path="account" element={<Account />} />
                    <Route path="admin-setup" element={<AdminGuard><AdminSetup /></AdminGuard>} />
                    <Route path="admin" element={<AdminGuard><Admin /></AdminGuard>} />
                  </Routes>
                </AuthGuard>
              } />
              {/* Wildcard route must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WebsiteThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
