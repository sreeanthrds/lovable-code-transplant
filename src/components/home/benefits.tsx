
import React from 'react';
import { 
  GitBranch, 
  Database, 
  BarChart3, 
  Zap, 
  Target, 
  TrendingUp,
  Activity,
  Shield,
  Clock,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClerkUser } from '@/hooks/useClerkUser';
import { useState } from 'react';
import AuthModal from '../auth/AuthModal';
import userTradingDoodle from '@/assets/user-trading-doodle.png';
import analyticsDoodle from '@/assets/analytics-doodle.png';
import visualBuilderIcon from '@/assets/visual-builder-icon.png';
import marketDataIcon from '@/assets/market-data-icon.png';
import performanceIcon from '@/assets/performance-icon.png';
import realtimeIcon from '@/assets/realtime-icon.png';
import riskIcon from '@/assets/risk-icon.png';
import analyticsIcon from '@/assets/analytics-icon.png';

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  link?: string;
  color: string;
}

const BenefitCard = ({ icon, title, description, delay, link, color }: BenefitProps) => {
  const { isAuthenticated } = useClerkUser();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleClick = () => {
    if (link) {
      if (isAuthenticated) {
        // User is authenticated, navigate to the link
        window.location.href = link;
      } else {
        // User is not authenticated, show signup modal
        setAuthModal({ isOpen: true, mode: 'signup' });
      }
    }
  };

  const content = (
    <div 
      className="group p-8 rounded-3xl bg-white/90 dark:bg-white/10 backdrop-blur-2xl border border-white/40 dark:border-white/20 hover:border-primary/60 dark:hover:border-primary/50 shadow-xl hover:shadow-2xl dark:shadow-2xl transition-all duration-500 h-full hover:-translate-y-2 cursor-pointer hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleClick}
    >
      {/* Modern neumorphic icon container */}
      <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
        <div className="relative z-10">{icon}</div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      
      {link && (
        <div className="mt-6 flex items-center text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {!isAuthenticated && <LogIn className="w-4 h-4 mr-2" />}
          <span className="mr-2">{isAuthenticated ? 'Try it now' : 'Sign up to try'}</span>
          <TrendingUp className="h-4 w-4" />
        </div>
      )}

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        mode={authModal.mode}
      />
    </div>
  );

  return content;
};

const Benefits = () => {
  const { isAuthenticated } = useClerkUser();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  const benefits = [
    {
      icon: <img src={visualBuilderIcon} alt="Visual Builder" className="h-12 w-12" />,
      title: "Visual Strategy Builder",
      description: "Drag and drop nodes to create complex trading strategies. Connect entry signals, exit conditions, and risk management rules visually.",
      delay: 100,
      link: "/app",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <img src={marketDataIcon} alt="Market Data" className="h-12 w-12" />,
      title: "Indian Market Data",
      description: "Access real NSE, BSE, and MCX data with minute-level precision. Corporate actions adjusted and tick-by-tick historical data available.",
      delay: 200,
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: <img src={performanceIcon} alt="Backtesting" className="h-12 w-12" />,
      title: "Advanced Backtesting",
      description: "Test your strategies against years of historical data. Get detailed performance metrics, drawdown analysis, and risk-adjusted returns.",
      delay: 300,
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <img src={realtimeIcon} alt="Real-time" className="h-12 w-12" />,
      title: "Real-time Simulation",
      description: "Experience live market conditions with our real-time simulation engine. See how your strategy performs in current market scenarios.",
      delay: 400,
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: <img src={riskIcon} alt="Risk Management" className="h-12 w-12" />,
      title: "Risk Management",
      description: "Built-in stop-loss, take-profit, and position sizing controls. Manage your risk with sophisticated money management rules.",
      delay: 500,
      color: "from-red-500 to-pink-600"
    },
    {
      icon: <img src={analyticsIcon} alt="Analytics" className="h-12 w-12" />,
      title: "Performance Analytics",
      description: "Comprehensive metrics including Sharpe ratio, maximum drawdown, win rate, and profit factor. Understand every aspect of your strategy.",
      delay: 600,
      color: "from-green-500 to-emerald-600"
    }
  ];

  const handleStartBuilding = () => {
    if (isAuthenticated) {
      window.location.href = '/app';
    } else {
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black">
      {/* Light mode background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(220_90%_60%_/_0.08),_transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,_hsl(260_90%_70%_/_0.1),_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(142_86%_50%_/_0.06),_transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,_hsl(142_86%_28%_/_0.08),_transparent_50%)]"></div>
      
      {/* Floating glass elements */}
      <div className="absolute top-32 left-32 w-64 h-64 bg-blue-200/20 dark:bg-white/5 rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-32 right-32 w-80 h-80 bg-green-200/15 dark:bg-primary/5 rounded-full blur-3xl animate-pulse opacity-40"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-200/20 dark:bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          {/* Modern badge with glass morphism */}
          <div className="inline-flex items-center px-8 py-4 mb-8 rounded-full bg-green-100/80 dark:bg-white/10 backdrop-blur-xl border border-green-300/60 dark:border-white/20 text-green-700 dark:text-green-400 text-sm font-medium shadow-xl hover:shadow-green-500/25 transition-all duration-300">
            <Shield className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-400">Professional Trading Tools</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight">
            Everything You Need to Build Winning Strategies
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            From visual strategy creation to advanced backtesting, our platform provides all the tools 
            professional traders need to develop, test, and deploy sophisticated trading algorithms.
          </p>
          
          {/* Doodle illustration */}
          <div className="flex justify-center mt-12 mb-8">
            <img src={userTradingDoodle} alt="User Trading Illustration" className="w-64 h-64 object-contain animate-fade-in" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="animate-fade-in h-full">
              <BenefitCard {...benefit} />
            </div>
          ))}
        </div>

        {/* Modern call to action with glass morphism */}
        <div className="text-center mt-24">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-2xl p-12 rounded-3xl border border-white/40 dark:border-white/20 max-w-5xl mx-auto relative overflow-hidden shadow-xl dark:shadow-2xl">
            {/* Background doodle */}
            <div className="absolute top-4 right-4 opacity-10">
              <img src={analyticsDoodle} alt="Analytics Background" className="w-32 h-32 object-contain" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Ready to Build Your First Strategy?
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of traders who have discovered the power of visual strategy building. 
              Start with our free tier and scale as you grow.
            </p>
            <button 
              onClick={handleStartBuilding}
              className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-2 transition-all duration-300 text-lg"
            >
              {!isAuthenticated && <LogIn className="mr-3 h-6 w-6" />}
              <GitBranch className="mr-3 h-6 w-6" />
              <span className="relative">{isAuthenticated ? 'Start Building Now' : 'Sign Up to Start Building'}</span>
              <Clock className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        <AuthModal 
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
          mode={authModal.mode}
        />
      </div>
    </section>
  );
};

export default Benefits;
