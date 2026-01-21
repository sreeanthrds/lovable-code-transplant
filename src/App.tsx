
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WebsiteThemeProvider } from "@/hooks/use-website-theme";
import AuthGuard from "@/components/auth/AuthGuard";
import OAuthCallback from "@/components/auth/OAuthCallback";
import Index from "./pages/Index";
import Documentation from "./pages/Documentation";
import LiveTradingDashboard from "./pages/LiveTradingDashboard";
import StrategyDetail from "./pages/StrategyDetail";
import StrategiesPage from "./pages/Strategies";
import Backtesting from "./pages/Backtesting";
import Account from "./pages/Account";
import AdminSetup from "./pages/AdminSetup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PitchDeck from "./pages/PitchDeck";
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
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/pitch" element={<PitchDeck />} />
              {/* OAuth callback routes */}
              <Route path="/auth/callback/:brokerId" element={<OAuthCallback />} />
              {/* Legacy callback route for backward compatibility */}
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/app/*" element={
                <AuthGuard>
                  <Routes>
                    <Route path="strategies" element={<StrategiesPage />} />
                    <Route path="broker-connection" element={<BrokerConnection />} />
                    <Route path="live-trading" element={<LiveTradingDashboard />} />
                    <Route path="live-trading/:strategyId" element={<StrategyDetail />} />
                    <Route path="backtesting" element={<Backtesting />} />
                    <Route path="sse-test" element={<SSETestNew />} />
                    <Route path="account" element={<Account />} />
                    <Route path="admin-setup" element={<AdminSetup />} />
                    <Route path="admin" element={<Admin />} />
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
