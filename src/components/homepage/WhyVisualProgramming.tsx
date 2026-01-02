import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const comparisons = [
  { aspect: 'Learning curve', traditional: 'Weeks/months', tradeLayout: 'Hours' },
  { aspect: 'Building complex logic', traditional: 'Error-prone', tradeLayout: 'Visual & intuitive' },
  { aspect: 'Debugging', traditional: 'Print statements', tradeLayout: 'Visual flow tracing' },
  { aspect: 'Modifications', traditional: 'Rewrite & redeploy', tradeLayout: 'Drag, connect, run' },
  { aspect: 'Testing', traditional: 'Manual scripting', tradeLayout: 'Built-in simulation' },
  { aspect: 'Execution', traditional: 'Servers required', tradeLayout: 'Zero infrastructure' },
];

const benefits = [
  'See your logic, don\'t imagine it',
  'Modify in seconds, not hours',
  'No servers, no DevOps, no downtime',
];

const WhyVisualProgramming = () => {
  return (
    <section id="why-visual" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Visual Programming{' '}
            <span className="gradient-text-primary">Beats Code</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl overflow-hidden mb-12"
          >
            <div className="grid grid-cols-3 bg-muted/30 border-b border-border">
              <div className="p-4 text-sm font-medium text-muted-foreground">Aspect</div>
              <div className="p-4 text-sm font-medium text-muted-foreground text-center border-x border-border">Traditional Coding</div>
              <div className="p-4 text-sm font-medium text-primary text-center">TradeLayout</div>
            </div>
            {comparisons.map((row, index) => (
              <div 
                key={row.aspect} 
                className={`grid grid-cols-3 ${index !== comparisons.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="p-4 text-sm text-foreground">{row.aspect}</div>
                <div className="p-4 text-sm text-muted-foreground text-center border-x border-border/50 flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-destructive/50" />
                  {row.traditional}
                </div>
                <div className="p-4 text-sm text-primary text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  {row.tradeLayout}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Benefit cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card-hover p-6 rounded-xl text-center"
              >
                <div className="w-10 h-10 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <p className="text-foreground font-medium">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyVisualProgramming;
