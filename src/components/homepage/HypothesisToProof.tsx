import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Wrench, BarChart3, FileText, Zap, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: Lightbulb,
    label: 'Idea',
    description: 'Start with any trading concept',
    color: 'accent',
  },
  {
    icon: Wrench,
    label: 'Visual Logic',
    description: 'Encode it as executable nodes',
    color: 'primary',
  },
  {
    icon: BarChart3,
    label: 'Historical Test',
    description: 'Validate on historical data',
    color: 'info',
  },
  {
    icon: FileText,
    label: 'Paper Trade',
    description: 'Test on live markets without real money',
    color: 'warning',
  },
  {
    icon: Zap,
    label: 'Live Execution',
    description: 'Execute only when confident',
    color: 'success',
  },
];

const HypothesisToProof = () => {
  return (
    <section id="how-it-works" className="section-padding bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            From Hypothesis to Proof —{' '}
            <span className="gradient-text-accent">Without Losing Money</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trading ideas are hypotheses. Most fail. TradeLayout lets you validate before you risk.
          </p>
        </motion.div>

        {/* Flow visualization */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="group relative"
              >
                <div className="glass-card p-6 rounded-2xl text-center min-w-[160px] transition-all duration-300 group-hover:border-primary/50">
                  <div 
                    className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all duration-300"
                    style={{ 
                      background: `hsl(var(--${step.color}) / 0.15)`,
                    }}
                  >
                    <step.icon 
                      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" 
                      style={{ color: `hsl(var(--${step.color}))` }} 
                    />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{step.label}</h4>
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {step.description}
                  </p>
                </div>
              </motion.div>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                  className="hidden lg:flex items-center"
                >
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HypothesisToProof;
