import React from 'react';
import { motion } from 'framer-motion';
import { Unplug, Power, Activity, BellRing } from 'lucide-react';

const features = [
  {
    icon: Unplug,
    title: 'Broker Disconnect Handling',
    description: 'Logic pauses safely, resumes on reconnect',
  },
  {
    icon: Power,
    title: 'Strategy Kill-Switches',
    description: 'Stop execution instantly from anywhere',
  },
  {
    icon: Activity,
    title: 'Execution State Tracking',
    description: 'Know exactly where your logic is at any moment',
  },
  {
    icon: BellRing,
    title: 'Real-time Alerts',
    description: 'Get notified on executions, errors, and edge cases',
  },
];

const SafetyReliability = () => {
  return (
    <section className="py-12 border-y border-border/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h3 className="text-xl font-semibold text-foreground">
            Built for When Things Go Wrong
          </h3>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SafetyReliability;
