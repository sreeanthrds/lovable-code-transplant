
import React from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface PlanFeature {
  title: string;
  included: boolean;
}

interface PricingPlanProps {
  title: string;
  price: string;
  description: string;
  features: PlanFeature[];
  ctaText: string;
  ctaLink: string;
  buttonVariant?: 'default' | 'outline';
  popular?: boolean;
  points?: number;
  onClick?: () => void;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  title,
  price,
  description,
  features,
  ctaText,
  buttonVariant = 'default',
  popular = false,
  points,
  onClick
}) => {
  return (
    <div className="relative h-full">
      {popular && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2 text-sm font-semibold rounded-full shadow-lg flex items-center">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Most Popular
          </div>
        </div>
      )}
      
      <Card className={`h-full bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group ${
        popular 
          ? 'border-primary shadow-primary/20 scale-105 bg-gradient-to-br from-white to-primary/5 dark:from-gray-800 dark:to-primary/10' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{title}</CardTitle>
          <div className="mb-4">
            <span className={`text-5xl font-bold ${popular ? 'bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent' : 'text-gray-800 dark:text-white'}`}>
              {price}
            </span>
            {points && (
              <div className="mt-2">
                <span className="text-2xl font-semibold text-primary">{points}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">points</span>
              </div>
            )}
          </div>
          <CardDescription className="text-gray-600 dark:text-gray-300 text-base">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow px-6">
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3 mt-0.5 border border-green-200 dark:border-green-800">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{feature.title}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="pt-8 px-6">
          <Button 
            className={`w-full py-3 font-semibold transition-all duration-300 ${
              popular
                ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                : buttonVariant === 'outline' 
                  ? 'bg-white/90 dark:bg-white/10 backdrop-blur-sm border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary' 
                  : 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white'
            }`}
            variant={popular ? 'default' : buttonVariant}
            onClick={onClick}
          >
            {ctaText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PricingPlan;
