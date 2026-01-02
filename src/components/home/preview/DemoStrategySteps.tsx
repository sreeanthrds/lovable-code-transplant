
import React from 'react';

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  nodes: any[];
  edges: any[];
  highlight?: string;
}

export const demoSteps: DemoStep[] = [
  {
    id: 'step1',
    title: 'Start with Market Entry',
    description: 'Every strategy begins with defining when to enter the market',
    nodes: [
      {
        id: 'start',
        type: 'strategyNode',
        position: { x: 50, y: 50 },
        data: {
          type: 'start',
          label: 'Market Entry',
          details: ['Symbol: RELIANCE', 'Timeframe: 15min', 'Ready to configure'],
          icon: 'Play',
          color: 'bg-gradient-to-br from-emerald-500 to-green-600',
          status: 'active'
        }
      }
    ],
    edges: [],
    highlight: 'start'
  },
  {
    id: 'step2',
    title: 'Add Entry Signal',
    description: 'Define what market conditions trigger your entry',
    nodes: [
      {
        id: 'start',
        type: 'strategyNode',
        position: { x: 50, y: 50 },
        data: {
          type: 'start',
          label: 'Market Entry',
          details: ['Symbol: RELIANCE', 'Timeframe: 15min', 'Connected to signal'],
          icon: 'Play',
          color: 'bg-gradient-to-br from-emerald-500 to-green-600'
        }
      },
      {
        id: 'entry-signal',
        type: 'strategyNode',
        position: { x: 350, y: 50 },
        data: {
          type: 'signal',
          label: 'EMA Crossover',
          details: ['EMA(9) > EMA(21)', 'Volume > 1M', 'Price > VWAP'],
          icon: 'TrendingUp',
          color: 'bg-gradient-to-br from-blue-500 to-blue-600',
          status: 'active'
        }
      }
    ],
    edges: [
      { 
        id: 'e1', 
        source: 'start', 
        target: 'entry-signal', 
        animated: true, 
        style: { stroke: '#10b981', strokeWidth: 2 } 
      }
    ],
    highlight: 'entry-signal'
  },
  {
    id: 'step3',
    title: 'Execute Trade',
    description: 'When conditions are met, automatically place your trade',
    nodes: [
      {
        id: 'start',
        type: 'strategyNode',
        position: { x: 50, y: 50 },
        data: {
          type: 'start',
          label: 'Market Entry',
          details: ['Symbol: RELIANCE', 'Timeframe: 15min', 'Strategy active'],
          icon: 'Play',
          color: 'bg-gradient-to-br from-emerald-500 to-green-600'
        }
      },
      {
        id: 'entry-signal',
        type: 'strategyNode',
        position: { x: 350, y: 50 },
        data: {
          type: 'signal',
          label: 'EMA Crossover',
          details: ['EMA(9) > EMA(21)', 'Volume > 1M', 'Price > VWAP'],
          icon: 'TrendingUp',
          color: 'bg-gradient-to-br from-blue-500 to-blue-600'
        }
      },
      {
        id: 'entry-action',
        type: 'strategyNode',
        position: { x: 50, y: 200 },
        data: {
          type: 'action',
          label: 'Buy 100 Shares',
          details: ['Order: Market Buy', 'Quantity: 100', 'Auto-executed'],
          icon: 'ArrowRight',
          color: 'bg-gradient-to-br from-green-500 to-emerald-600',
          status: 'active'
        }
      }
    ],
    edges: [
      { 
        id: 'e1', 
        source: 'start', 
        target: 'entry-signal', 
        animated: true, 
        style: { stroke: '#10b981', strokeWidth: 2 } 
      },
      { 
        id: 'e2', 
        source: 'entry-signal', 
        target: 'entry-action', 
        animated: true, 
        style: { stroke: '#3b82f6', strokeWidth: 2 } 
      }
    ],
    highlight: 'entry-action'
  },
  {
    id: 'step4',
    title: 'Risk Management',
    description: 'Protect your capital with automatic stop-loss and targets',
    nodes: [
      {
        id: 'start',
        type: 'strategyNode',
        position: { x: 50, y: 50 },
        data: {
          type: 'start',
          label: 'Market Entry',
          details: ['Symbol: RELIANCE', 'Timeframe: 15min', 'Strategy running'],
          icon: 'Play',
          color: 'bg-gradient-to-br from-emerald-500 to-green-600'
        }
      },
      {
        id: 'entry-signal',
        type: 'strategyNode',
        position: { x: 350, y: 50 },
        data: {
          type: 'signal',
          label: 'EMA Crossover',
          details: ['EMA(9) > EMA(21)', 'Volume > 1M', 'Price > VWAP'],
          icon: 'TrendingUp',
          color: 'bg-gradient-to-br from-blue-500 to-blue-600'
        }
      },
      {
        id: 'entry-action',
        type: 'strategyNode',
        position: { x: 50, y: 200 },
        data: {
          type: 'action',
          label: 'Buy 100 Shares',
          details: ['Order: Market Buy', 'Quantity: 100', 'Position opened'],
          icon: 'ArrowRight',
          color: 'bg-gradient-to-br from-green-500 to-emerald-600'
        }
      },
      {
        id: 'risk-management',
        type: 'strategyNode',
        position: { x: 350, y: 200 },
        data: {
          type: 'risk',
          label: 'Risk Control',
          details: ['Stop Loss: -2%', 'Target: +4%', 'Trailing enabled'],
          icon: 'AlertTriangle',
          color: 'bg-gradient-to-br from-amber-500 to-orange-600',
          status: 'active'
        }
      }
    ],
    edges: [
      { 
        id: 'e1', 
        source: 'start', 
        target: 'entry-signal', 
        animated: true, 
        style: { stroke: '#10b981', strokeWidth: 2 } 
      },
      { 
        id: 'e2', 
        source: 'entry-signal', 
        target: 'entry-action', 
        animated: true, 
        style: { stroke: '#3b82f6', strokeWidth: 2 } 
      },
      { 
        id: 'e3', 
        source: 'entry-action', 
        target: 'risk-management', 
        animated: true, 
        style: { stroke: '#10b981', strokeWidth: 2 } 
      }
    ],
    highlight: 'risk-management'
  }
];
