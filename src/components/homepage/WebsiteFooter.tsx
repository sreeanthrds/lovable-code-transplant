import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/logo';

const WebsiteFooter = () => {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground">
              Visual Programming Language for Algo Trading
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/app/strategies" className="hover:text-foreground transition-colors">Strategies</Link></li>
              <li><Link to="/app/backtesting" className="hover:text-foreground transition-colors">Backtesting</Link></li>
              <li><Link to="/app/live-trading" className="hover:text-foreground transition-colors">Live Trading</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/documentation" className="hover:text-foreground transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TradeLayout. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Your broker credentials are never shared.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;
