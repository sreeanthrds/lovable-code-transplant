
import React from 'react';

const StrategyBuilderDoc: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Strategy Builder</h1>
      
      <p className="text-muted-foreground">
        The Strategy Builder is the core component of the platform, allowing you to create and edit trading strategies visually.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Interface Overview</h2>
        <p>
          The Strategy Builder interface consists of the following components:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Canvas:</strong> The main workspace where you create and connect nodes</li>
          <li><strong>Node Sidebar:</strong> Contains all available node types that can be dragged onto the canvas</li>
          <li><strong>Node Panel:</strong> Opens when a node is selected, allowing you to configure its properties</li>
          <li><strong>Toolbar:</strong> Contains tools for zooming, panning, and other canvas operations</li>
          <li><strong>Connection Controls:</strong> Appear when hovering over nodes to create connections</li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Creating a Strategy</h2>
        <p>
          To create a new strategy, follow these steps:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Add Start Node:</strong> Every strategy begins with a Start Node. This node defines the trading instrument, 
            timeframe, and other basic settings for your strategy.
          </li>
          <li>
            <strong>Add Signal Nodes:</strong> Connect Signal nodes to define entry and exit conditions. These nodes use 
            technical indicators, price patterns, or other market data to generate trading signals.
          </li>
          <li>
            <strong>Add Action Nodes:</strong> Connect Action nodes to specify what happens when signals are triggered. 
            These include Entry nodes for opening positions, Exit nodes for closing positions, and Alert nodes for notifications.
          </li>
          <li>
            <strong>Connect Nodes:</strong> Create connections between nodes by clicking and dragging from a node's output 
            handle to another node's input handle. These connections define the flow of your strategy.
          </li>
          <li>
            <strong>Configure Node Settings:</strong> Click on any node to open its configuration panel, where you can 
            adjust settings specific to that node type.
          </li>
        </ol>
        
        <h2 className="text-2xl font-bold tracking-tight">Working with the Canvas</h2>
        <h3 className="text-xl font-bold tracking-tight">Navigation</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Pan:</strong> Hold the space bar and drag, or middle-mouse drag</li>
          <li><strong>Zoom:</strong> Use the mouse wheel or pinch gesture on touchpads</li>
          <li><strong>Reset View:</strong> Click the "Fit View" button in the toolbar to center all nodes</li>
          <li><strong>Select Multiple Nodes:</strong> Click and drag to create a selection box</li>
        </ul>
        
        <h3 className="text-xl font-bold tracking-tight">Editing Operations</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Move Nodes:</strong> Click and drag nodes to reposition them</li>
          <li><strong>Delete Nodes:</strong> Select a node and press Delete, or use the delete button in the node controls</li>
          <li><strong>Delete Connections:</strong> Click on a connection to select it, then press Delete</li>
          <li><strong>Copy/Paste:</strong> Use Ctrl+C and Ctrl+V to copy and paste selected nodes</li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Saving and Loading Strategies</h2>
        <p>
          Strategies are automatically saved to local storage as you work. You can also:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Export Strategy:</strong> Save your strategy as a JSON file for backup or sharing</li>
          <li><strong>Import Strategy:</strong> Load a previously exported strategy file</li>
          <li><strong>Reset Strategy:</strong> Clear the canvas and start fresh</li>
        </ul>
      </div>
    </div>
  );
};

export default StrategyBuilderDoc;
