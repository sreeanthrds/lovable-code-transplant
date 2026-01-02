
import React from 'react';
import PricingPlan from './PricingPlan';
import PointsInfo from './PointsInfo';
import { getFreePlan, getPointsPlans } from './PricingData';
import { Zap, Crown, TrendingUp } from 'lucide-react';

const Pricing = () => {
  const freePlan = getFreePlan();
  const pointsPlans = getPointsPlans();

  return (
    <section id="pricing" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50/30 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black">
      {/* Subtle decorative element */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl opacity-40"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20 animate-slide-up">
          {/* Clean badge */}
          <div className="inline-flex items-center px-6 py-3 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Crown className="w-4 h-4 mr-2" />
            <span>Flexible Pricing Plans</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
            Simple Points-Based Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Start free and scale as you grow. Our innovative points system gives you the flexibility to access premium features exactly when you need them.
          </p>
          
          {/* Clean value proposition */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <div className="flex items-center text-green-600 dark:text-green-400 bg-white/90 dark:bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-green-300/40 dark:border-green-400/20">
              <Zap className="w-5 h-5 mr-2" />
              <span className="font-medium">No monthly commitments</span>
            </div>
            <div className="flex items-center text-blue-600 dark:text-blue-400 bg-white/90 dark:bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-blue-300/40 dark:border-blue-400/20">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="font-medium">Points never expire</span>
            </div>
            <div className="flex items-center text-purple-600 dark:text-purple-400 bg-white/90 dark:bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-purple-300/40 dark:border-purple-400/20">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-medium">Premium features included</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="animate-slide-up">
            <PricingPlan 
              title={freePlan.title}
              price={freePlan.price}
              description={freePlan.description}
              features={freePlan.features}
              ctaText={freePlan.ctaText}
              ctaLink={freePlan.ctaLink}
              popular={freePlan.popular}
            />
          </div>
          
          {pointsPlans.map((plan, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              <PricingPlan 
                title={plan.title}
                price={plan.price}
                description={plan.description}
                features={plan.features}
                ctaText={plan.ctaText}
                ctaLink={plan.ctaLink}
                popular={plan.popular}
              />
            </div>
          ))}
        </div>
        
        <PointsInfo />
      </div>
    </section>
  );
};

export default Pricing;
