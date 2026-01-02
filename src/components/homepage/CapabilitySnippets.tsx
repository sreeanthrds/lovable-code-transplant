import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Layers, Bell } from 'lucide-react';

const snippets = [
  {
    icon: RefreshCcw,
    title: 'Re-entry Logic',
    hybridName: 'Re-enter Logic (Re-Entry Signal Node)',
    description: 'Re-enter after stop-loss if conditions restore',
    color: 'primary',
    nodes: ['Retry Node', 'Re-Entry Signal Node', 'Entry Node'],
  },
  {
    icon: Layers,
    title: 'Multi-leg Options',
    hybridName: 'Adjust Position (Modify Node)',
    description: 'Execute complex option spreads as single logic blocks',
    color: 'accent',
    nodes: ['Entry Signal Node', 'Modify Node (4-leg spread)'],
  },
  {
    icon: Bell,
    title: 'Alerts Without Execution',
    hybridName: 'Send Alert (Alert Node)',
    description: 'Get notified without auto-execution',
    color: 'info',
    nodes: ['Entry Signal Node', 'Alert Node'],
  },
];

const CapabilitySnippets = () => {
  return (
    <section className="py-16 bg-card/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Build Any Logic You Can Imagine
          </h3>
          <p className="text-muted-foreground">
            These are just a few examples of what's possible
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {snippets.map((snippet, index) => (
            <motion.div
              key={snippet.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card-hover p-6 rounded-xl"
            >
              <div 
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                style={{ 
                  background: `hsl(var(--${snippet.color}) / 0.15)`,
                }}
              >
                <snippet.icon 
                  className="w-6 h-6" 
                  style={{ color: `hsl(var(--${snippet.color}))` }} 
                />
              </div>
              
              <h4 className="font-semibold text-foreground mb-1">{snippet.title}</h4>
              <p className="text-xs text-muted-foreground mb-4">{snippet.hybridName}</p>
              
              {/* Mini node flow */}
              <div className="space-y-2 mb-4">
                {snippet.nodes.map((node, nodeIndex) => (
                  <div key={node} className="flex items-center gap-2">
                    {nodeIndex > 0 && (
                      <div className="w-4 h-0.5 bg-border" />
                    )}
                    <div className="text-xs px-2 py-1 rounded bg-muted/50 border border-border text-muted-foreground">
                      {node}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">{snippet.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitySnippets;
