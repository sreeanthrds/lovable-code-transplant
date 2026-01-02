import React from 'react';
import { motion } from 'framer-motion';

import zerodhaLogo from '@/assets/brokers/zerodha.svg';
import angeloneLogo from '@/assets/brokers/angelone.svg';
import upstoxLogo from '@/assets/brokers/upstox.svg';
import fivepaisaLogo from '@/assets/brokers/5paisa.svg';
import aliceblueLogo from '@/assets/brokers/aliceblue.svg';
import dhanLogo from '@/assets/brokers/dhan.svg';
import fyersLogo from '@/assets/brokers/fyers.svg';
import iiflLogo from '@/assets/brokers/iifl.svg';

const brokers = [
  { name: 'Zerodha', logo: zerodhaLogo },
  { name: 'Angel One', logo: angeloneLogo },
  { name: 'Upstox', logo: upstoxLogo },
  { name: '5paisa', logo: fivepaisaLogo },
  { name: 'Alice Blue', logo: aliceblueLogo },
  { name: 'Dhan', logo: dhanLogo },
  { name: 'Fyers', logo: fyersLogo },
  { name: 'IIFL', logo: iiflLogo },
];

const BrokerLogosStrip = () => {
  return (
    <section className="py-12 border-y border-border/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-sm text-muted-foreground">
          Connects With Your Existing Broker
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient overlays for seamless scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll-left">
          {/* Duplicate for seamless loop */}
          {[...brokers, ...brokers].map((broker, index) => (
            <motion.div
              key={`${broker.name}-${index}`}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 mx-6 group cursor-pointer"
            >
              <div className="w-32 h-16 rounded-lg bg-card/50 border border-border/30 flex items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card px-3">
                <img 
                  src={broker.logo} 
                  alt={`${broker.name} logo`}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
                {broker.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrokerLogosStrip;