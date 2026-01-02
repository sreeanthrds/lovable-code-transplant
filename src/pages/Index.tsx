import React, { useEffect } from 'react';
import WebsiteNavbar from '@/components/homepage/WebsiteNavbar';
import HeroSection from '@/components/homepage/HeroSection';
import BrokerLogosStrip from '@/components/homepage/BrokerLogosStrip';
import WhatIsTradeLayout from '@/components/homepage/WhatIsTradeLayout';
import HypothesisToProof from '@/components/homepage/HypothesisToProof';
import StrategyBuildShowcase from '@/components/homepage/StrategyBuildShowcase';
import RealStrategyPreview from '@/components/home/RealStrategyPreview';
import CapabilitySnippets from '@/components/homepage/CapabilitySnippets';
import SafetyReliability from '@/components/homepage/SafetyReliability';
import WhyVisualProgramming from '@/components/homepage/WhyVisualProgramming';
import Testimonials from '@/components/home/testimonials';
import NewPricingSection from '@/components/homepage/NewPricingSection';
import FinalCTA from '@/components/homepage/FinalCTA';
import WebsiteFooter from '@/components/homepage/WebsiteFooter';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <WebsiteNavbar />
      <HeroSection />
      <BrokerLogosStrip />
      <WhatIsTradeLayout />
      <HypothesisToProof />
      <StrategyBuildShowcase />
      <RealStrategyPreview />
      <CapabilitySnippets />
      <SafetyReliability />
      <WhyVisualProgramming />
      <Testimonials />
      <NewPricingSection />
      <FinalCTA />
      <WebsiteFooter />
    </div>
  );
};

export default Index;
