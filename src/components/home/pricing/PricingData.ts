
import { PlanFeature } from './PricingPlan';

export interface PlanData {
  title: string;
  price: string;
  description: string;
  features: PlanFeature[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
  isPoints?: boolean;
}

export const getFreePlan = (): PlanData => ({
  title: "Free Trial",
  price: "₹0",
  description: "Perfect for exploring trading simulation.",
  features: [
    { title: "1-day trading simulator access", included: true },
    { title: "Limited historical data (1 month)", included: true },
    { title: "Basic performance metrics", included: true },
    { title: "Community support", included: true },
    { title: "Advanced analytics", included: false },
    { title: "Extended backtesting", included: false },
    { title: "Priority support", included: false },
  ],
  ctaText: "Start Free",
  ctaLink: "/signup",
  popular: false,
});

export const getPointsPlans = (): PlanData[] => [
  {
    title: "Starter Pack",
    price: "500 Points - ₹999",
    description: "For casual traders just getting started.",
    features: [
      { title: "5 backtesting sessions", included: true },
      { title: "3 months historical data", included: true },
      { title: "Basic technical indicators", included: true },
      { title: "Equity curve analysis", included: true },
      { title: "Export reports (PDF)", included: true },
      { title: "Advanced strategy tools", included: false },
      { title: "Priority support", included: false },
    ],
    ctaText: "Buy Points",
    ctaLink: "/signup?plan=starter",
    popular: false,
    isPoints: true,
  },
  {
    title: "Pro Trader",
    price: "1500 Points - ₹2499",
    description: "For serious traders seeking an edge.",
    features: [
      { title: "20 backtesting sessions", included: true },
      { title: "Full 3 months historical data", included: true },
      { title: "Advanced technical indicators", included: true },
      { title: "Strategy optimization tools", included: true },
      { title: "Export reports (all formats)", included: true },
      { title: "Email support", included: true },
      { title: "Multi-timeframe analysis", included: true },
    ],
    ctaText: "Get Pro Pack",
    ctaLink: "/signup?plan=pro",
    popular: true,
    isPoints: true,
  },
  {
    title: "Institutional",
    price: "5000 Points - ₹7999",
    description: "For professionals and institutions.",
    features: [
      { title: "Unlimited backtesting sessions", included: true },
      { title: "Full historical data access", included: true },
      { title: "Custom indicator development", included: true },
      { title: "Multi-user accounts", included: true },
      { title: "Priority support", included: true },
      { title: "Strategy consulting session", included: true },
      { title: "API access", included: true },
    ],
    ctaText: "Get Institutional",
    ctaLink: "/signup?plan=institutional",
    popular: false,
    isPoints: true,
  },
];
