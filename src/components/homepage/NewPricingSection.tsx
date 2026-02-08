import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '@/contexts/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { initiatePayment } from '@/lib/services/payment-service';
import { toast } from '@/hooks/use-toast';
import { PlanType, BillingCycle } from '@/types/billing';
import AuthModal from '../auth/AuthModal';
import { usePublicPlans } from '@/hooks/usePlanDefinitions';

// Helper functions - defined outside component for stable hook count
const formatPrice = (amount: number, currency: string = 'INR') => {
  if (amount === 0) return '₹0';
  return currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount}`;
};

const calculatePriceWithGst = (basePrice: number, gstPercentage: number = 18) => {
  const gstAmount = Math.round(basePrice * (gstPercentage / 100) * 100) / 100;
  const total = Math.round((basePrice + gstAmount) * 100) / 100;
  return { basePrice, gstAmount, total, gstPercentage };
};

const NewPricingSection = () => {
  const [showYearly, setShowYearly] = useState(false);
  const { isAuthenticated } = useAppAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });

  // Fetch plans from database
  const { plans: dbPlans, loading } = usePublicPlans();

  const handlePayment = async (planType: PlanType, billingCycle: BillingCycle) => {
    if (!isAuthenticated) {
      setAuthModal({ isOpen: true, mode: 'signup' });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      return;
    }

    // Free plan - just navigate
    if (planType === 'FREE') {
      navigate('/app/strategies');
      return;
    }

    setProcessingPlan(`${planType}-${billingCycle}`);
    
    try {
      await initiatePayment(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        user.fullName || user.firstName || 'User',
        planType,
        billingCycle,
        () => {
          toast({
            title: "Payment Successful!",
            description: `Your ${planType} plan has been activated.`,
          });
          navigate('/app/strategies');
          setProcessingPlan(null);
        },
        (error) => {
          toast({
            title: "Payment Failed",
            description: error,
            variant: "destructive"
          });
          setProcessingPlan(null);
        },
        () => {
          // onPending - payment is being processed
        },
        () => {
          // onDismiss - user closed the modal without completing payment
          setProcessingPlan(null);
        }
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive"
      });
      setProcessingPlan(null);
    }
  };

  // Get plan display data from database plans
  const getFreePlan = () => {
    const freePlan = dbPlans.find(p => p.code === 'FREE');
    if (!freePlan) return null;
    
    return {
      name: freePlan.name,
      planType: 'FREE' as PlanType,
      price: formatPrice(freePlan.price_monthly, freePlan.currency),
      period: '/month',
      description: freePlan.description || 'Get started with the basics',
      features: freePlan.features?.length ? freePlan.features : [
        `${freePlan.backtests_daily_limit} strategies backtested per day`,
        `${freePlan.backtests_monthly_limit} total backtests per month`,
        'Strategy builder access',
        'Community support'
      ],
      cta: 'Start Free',
      highlighted: false,
      gstPercentage: freePlan.gst_percentage ?? 18,
    };
  };

  const getLaunchPlan = () => {
    const launchPlan = dbPlans.find(p => p.code === 'LAUNCH');
    if (!launchPlan) return null;
    
    const durationText = launchPlan.duration_days 
      ? `for ${Math.round(launchPlan.duration_days / 30)} months`
      : '/month';
    
    const pricing = calculatePriceWithGst(launchPlan.price_monthly, launchPlan.gst_percentage);
    
    return {
      name: launchPlan.name,
      planType: 'LAUNCH' as PlanType,
      basePrice: launchPlan.price_monthly,
      price: formatPrice(pricing.total, launchPlan.currency),
      priceBreakdown: pricing,
      currency: launchPlan.currency,
      period: durationText,
      badge: 'Early Adopter Access',
      description: launchPlan.description || "We're early. You're early. Let's grow together.",
      features: launchPlan.features?.length ? launchPlan.features : [
        'Unlimited strategies',
        'Full backtest access',
        'Paper trading',
        'Priority support'
      ],
      note: 'Your ₹500 adjusts when you upgrade to Pro',
      cta: 'Claim Offer',
      highlighted: true,
      gstPercentage: launchPlan.gst_percentage ?? 18,
    };
  };

  const getProPlan = () => {
    const proPlan = dbPlans.find(p => p.code === 'PRO');
    if (!proPlan) return null;
    
    const defaultFeatures = [
      `${proPlan.backtests_monthly_limit === -1 ? 'Unlimited' : proPlan.backtests_monthly_limit} backtests per month`,
      `${proPlan.paper_trading_daily_limit === -1 ? 'Unlimited' : proPlan.paper_trading_daily_limit} strategies paper trading per day`,
      `${proPlan.live_executions_monthly_limit === -1 ? 'Unlimited' : proPlan.live_executions_monthly_limit} strategies live trading per day`,
      'Advanced analytics',
      'Priority support',
      'API access'
    ];
    
    const monthlyPricing = calculatePriceWithGst(proPlan.price_monthly, proPlan.gst_percentage);
    const yearlyPricing = calculatePriceWithGst(proPlan.price_yearly, proPlan.gst_percentage);
    const yearlySavings = (monthlyPricing.total * 12) - yearlyPricing.total;
    
    return {
      name: proPlan.name,
      planType: 'PRO' as PlanType,
      currency: proPlan.currency,
      gstPercentage: proPlan.gst_percentage ?? 18,
      monthly: {
        basePrice: proPlan.price_monthly,
        price: formatPrice(monthlyPricing.total, proPlan.currency),
        priceBreakdown: monthlyPricing,
        period: '/month',
        description: proPlan.description || 'Full power for serious traders',
        features: proPlan.features?.length ? proPlan.features : defaultFeatures,
        cta: 'Get Pro Monthly',
      },
      yearly: {
        basePrice: proPlan.price_yearly,
        price: formatPrice(yearlyPricing.total, proPlan.currency),
        priceBreakdown: yearlyPricing,
        period: '/year',
        description: proPlan.description || 'Best value for committed traders',
        features: proPlan.features?.length ? proPlan.features : defaultFeatures,
        cta: 'Get Pro Yearly',
        savings: yearlySavings > 0 ? formatPrice(yearlySavings, proPlan.currency) : null,
      },
    };
  };

  const freePlan = getFreePlan();
  const launchPlan = getLaunchPlan();
  const proPlan = getProPlan();

  // Show loading state
  if (loading) {
    return (
      <section id="pricing" className="section-padding bg-card/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  const currentPro = proPlan ? (showYearly ? proPlan.yearly : proPlan.monthly) : null;

  return (
    <section id="pricing" className="section-padding bg-card/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Start free, upgrade when you're ready</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* FREE Plan */}
          {freePlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="relative rounded-2xl p-6 glass-card"
            >
              <div className="text-center mb-6 pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">{freePlan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{freePlan.price}</span>
                  <span className="text-muted-foreground text-sm">{freePlan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{freePlan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {freePlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment('FREE', 'monthly')}
                disabled={processingPlan === 'FREE-monthly'}
                className="block w-full text-center py-3 rounded-xl font-medium transition-all btn-ghost disabled:opacity-50"
              >
                {processingPlan === 'FREE-monthly' ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  freePlan.cta
                )}
              </button>
            </motion.div>
          )}

          {/* LAUNCH Plan */}
          {launchPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl p-6 bg-gradient-to-b from-accent/10 to-accent/5 border-2 border-accent/50"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {launchPlan.badge}
              </div>

              <div className="text-center mb-6 pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">{launchPlan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{launchPlan.price}</span>
                  <span className="text-muted-foreground text-sm">{launchPlan.period}</span>
                </div>
                {launchPlan.basePrice > 0 && launchPlan.priceBreakdown && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Base: {formatPrice(launchPlan.basePrice, launchPlan.currency)} + {launchPlan.gstPercentage}% GST
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">{launchPlan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {launchPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {launchPlan.note && (
                <p className="text-xs text-muted-foreground text-center mb-4 italic">{launchPlan.note}</p>
              )}

              <button
                onClick={() => handlePayment('LAUNCH', 'monthly')}
                disabled={processingPlan === 'LAUNCH-monthly'}
                className="block w-full text-center py-3 rounded-xl font-medium transition-all btn-accent-glow disabled:opacity-50"
              >
                {processingPlan === 'LAUNCH-monthly' ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  launchPlan.cta
                )}
              </button>
            </motion.div>
          )}

          {/* PRO Plan */}
          {proPlan && currentPro && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl p-6 glass-card"
            >
              {showYearly && proPlan.yearly.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-success text-success-foreground text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Save {proPlan.yearly.savings}
                </div>
              )}
              
              <div className="text-center mb-4 pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-3">{proPlan.name}</h3>
                
                {/* Toggle inside the card */}
                <div className="flex items-center justify-center gap-2 mb-4 p-1.5 bg-muted/50 rounded-full">
                  <button 
                    onClick={() => setShowYearly(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      !showYearly 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setShowYearly(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                      showYearly 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Yearly
                    {proPlan.yearly.savings && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success text-success-foreground font-semibold whitespace-nowrap">
                        Save more
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{currentPro.price}</span>
                  <span className="text-muted-foreground text-sm">{currentPro.period}</span>
                </div>
                {currentPro.basePrice > 0 && currentPro.priceBreakdown && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Base: {formatPrice(currentPro.basePrice, proPlan.currency)} + {proPlan.gstPercentage}% GST
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">{currentPro.description}</p>
                {showYearly && proPlan.yearly.savings && (
                  <p className="text-xs text-success mt-1">Save {proPlan.yearly.savings} annually (incl. GST)</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {currentPro.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment('PRO', showYearly ? 'yearly' : 'monthly')}
                disabled={processingPlan === `PRO-${showYearly ? 'yearly' : 'monthly'}`}
                className="block w-full text-center py-3 rounded-xl font-medium transition-all btn-ghost disabled:opacity-50"
              >
                {processingPlan === `PRO-${showYearly ? 'yearly' : 'monthly'}` ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  currentPro.cta
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
        mode={authModal.mode}
        onModeSwitch={(mode) => setAuthModal({ isOpen: true, mode })}
      />
    </section>
  );
};

export default NewPricingSection;
