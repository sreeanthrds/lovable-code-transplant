import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  BarChart3, 
  Receipt, 
  Settings, 
  LogOut,
  Crown,
  Zap
} from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';

interface UserMenuProps {
  showPlanBadge?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ showPlanBadge = true }) => {
  const { user, signOut } = useAppAuth();
  const { planData, loading: planLoading } = usePlan();
  const navigate = useNavigate();

  if (!user) return null;

  const getInitials = (name: string | null | undefined) => {
    if (!name) {
      // Use email or phone as fallback
      if (user.email) return user.email[0].toUpperCase();
      if (user.phone) return 'P';
      return 'U';
    }
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case 'PRO':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
      case 'LAUNCH':
      case 'LO':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case 'PRO':
        return 'PRO';
      case 'LAUNCH':
        return 'LO';
      default:
        return 'FREE';
    }
  };

  const displayName = user.fullName || user.email || user.phone || 'User';
  const displayEmail = user.email || user.phone || '';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary/20 rounded-full p-0.5 transition-all hover:opacity-80">
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-border">
              <AvatarImage src={user.imageUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            {showPlanBadge && !planLoading && (
              <span 
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full border-2 border-background ${getPlanBadgeStyle(planData.plan)}`}
              >
                {getPlanLabel(planData.plan)}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        {/* User Info Header */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.imageUrl} alt={displayName} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {displayEmail}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Plan Badge Section */}
        {!planLoading && (
          <>
            <Link to="/app/account?tab=billing">
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>Current Plan</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getPlanBadgeStyle(planData.plan)}`}>
                    {planData.plan === 'LAUNCH' ? 'LAUNCH' : planData.plan}
                  </span>
                </div>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Menu Items */}
        <Link to="/app/account?tab=profile">
          <DropdownMenuItem className="p-3 cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/app/account?tab=billing">
          <DropdownMenuItem className="p-3 cursor-pointer">
            <BarChart3 className="mr-3 h-4 w-4" />
            <span>Usage & Quota</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/app/account?tab=billing">
          <DropdownMenuItem className="p-3 cursor-pointer">
            <Zap className="mr-3 h-4 w-4" />
            <span>Plan & Add-ons</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/app/account?tab=payments">
          <DropdownMenuItem className="p-3 cursor-pointer">
            <Receipt className="mr-3 h-4 w-4" />
            <span>Payment History</span>
          </DropdownMenuItem>
        </Link>

        <Link to="/app/account?tab=security">
          <DropdownMenuItem className="p-3 cursor-pointer">
            <Settings className="mr-3 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="p-3 cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
