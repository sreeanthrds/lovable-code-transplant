import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, GitBranch, ToggleRight } from 'lucide-react';

const pillars = [
  {
    icon: Workflow,
    title: 'Visual Logic Nodes',
    description: 'Every trading decision becomes a visual block. Signals, conditions, actions, exits — all as draggable, connectable nodes.',
    color: 'primary',
  },
  {
    icon: GitBranch,
    title: 'Execution Connections',
    description: 'Connect nodes to define execution flow. Your logic runs exactly as designed — no interpretation, no surprises.',
    color: 'accent',
  },
  {
    icon: ToggleRight,
    title: 'One Program, Multiple Modes',
    description: 'Same visual logic runs in Backtest, Paper Trade, and Live modes. Validate safely, execute confidently.',
    color: 'success',
  },
];

const WhatIsTradeLayout = () => {
  return (
    <section id="features" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What is <span className="gradient-text-primary">TradeLayout</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A visual programming language that turns your trading ideas into executable programs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card-hover p-8 rounded-2xl text-center"
            >
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ 
                  background: `hsl(var(--${pillar.color}) / 0.15)`,
                  boxShadow: `0 0 30px hsl(var(--${pillar.color}) / 0.2)`
                }}
              >
                <pillar.icon 
                  className="w-8 h-8" 
                  style={{ color: `hsl(var(--${pillar.color}))` }} 
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">{pillar.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsTradeLayout;
