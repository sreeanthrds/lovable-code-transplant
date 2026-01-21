
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import Logo from './logo';
import DesktopNav from './desktop-nav';
import MobileNav from './mobile-nav';
import { PlanBadge } from '@/components/billing/PlanBadge';
import { usePlan } from '@/hooks/usePlan';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const closeSheet = () => setIsOpen(false);
  const { planData, loading: planLoading } = usePlan();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-white/10 border-white/40 dark:border-white/20 shadow-sm backdrop-blur-xl">
      <div className="container flex h-16 items-center px-4 max-w-7xl mx-auto">
        {/* Mobile layout */}
        <div className="flex md:hidden w-full items-center justify-between">
          {/* Left side - Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo asChild />
          </Link>
          
          {/* Center - Mobile hamburger button in blue rounded rectangle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white rounded-full"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <MobileNav isOpen={isOpen} toggleMenu={closeSheet} />
            </SheetContent>
          </Sheet>
          
          {/* Right side - user */}
          <div className="flex items-center space-x-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link to="/app">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex w-full items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-8 flex items-center space-x-2">
              <Logo asChild />
            </Link>
            <DesktopNav />
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-3">
            <SignedIn>
              <Link to="/app/account?tab=billing" className="hover:opacity-80 transition-opacity">
                {!planLoading && <PlanBadge plan={planData.plan} expiresAt={planData.expires_date} />}
              </Link>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link to="/app">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
