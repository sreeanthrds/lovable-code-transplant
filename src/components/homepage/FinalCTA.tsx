import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] bg-primary/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Build Trading Logic That Actually Works?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join traders who are encoding their strategies visually.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app/strategies" className="btn-primary-glow inline-flex items-center justify-center">
              Start Building Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/app/strategies" className="btn-accent-glow inline-flex items-center justify-center">
              Claim ₹500 Launch Offer
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
