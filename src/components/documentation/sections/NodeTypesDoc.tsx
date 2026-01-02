
import React from 'react';

const NodeTypesDoc: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Node Types</h1>
      
      <p className="text-muted-foreground">
        The Strategy Builder uses different types of nodes to represent various components of a trading strategy.
        Each node type serves a specific purpose and has unique configuration options.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Overview of Node Types</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Start Node</h3>
          <p>
            The Start Node is the entry point of every strategy. It defines the fundamental settings for the strategy.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Initialize strategy and define global settings</li>
            <li><strong>Settings:</strong> Trading instrument, timeframe, exchange, and technical indicators</li>
            <li><strong>Connections:</strong> Can connect to Signal Nodes or Action Nodes</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Signal Nodes</h3>
          <p>
            Signal Nodes define the conditions that trigger entry or exit signals in your strategy.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Entry Signal Node:</strong> Generates entry signals based on defined conditions</li>
            <li><strong>Exit Signal Node:</strong> Generates exit signals based on defined conditions</li>
            <li><strong>Signal Node:</strong> Can generate both entry and exit signals based on separate condition sets</li>
            <li><strong>Settings:</strong> Condition builder with support for indicators, price data, and logical operators</li>
            <li><strong>Connections:</strong> Typically connect to Action Nodes</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Action Nodes</h3>
          <p>
            Action Nodes define what happens when a signal is triggered. They handle order execution and position management.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Entry Node:</strong> Opens new positions when connected signals are triggered</li>
            <li><strong>Exit Node:</strong> Closes existing positions when connected signals are triggered</li>
            <li><strong>Modify Node:</strong> Adjusts existing positions (e.g., changing stop-loss or take-profit levels)</li>
            <li><strong>Alert Node:</strong> Generates notifications without executing trades</li>
            <li><strong>Settings:</strong> Order types, quantities, product types, and position management rules</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Flow Control Nodes</h3>
          <p>
            Flow Control Nodes manage the execution path of your strategy.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>End Node:</strong> Marks the end of a strategy branch</li>
            <li><strong>Force End Node:</strong> Immediately terminates strategy execution when reached</li>
            <li><strong>Retry Node:</strong> Reprocesses a strategy branch after a specified condition is met</li>
          </ul>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Node Connections</h2>
        <p>
          Nodes are connected to define the flow of your strategy. Each connection represents a path of execution from one node to another.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Connection Types:</strong> Standard connections, conditional connections, and filtered connections</li>
          <li><strong>Creating Connections:</strong> Click and drag from an output handle to an input handle</li>
          <li><strong>Valid Connections:</strong> Not all node types can connect to each other; the system only allows valid connections</li>
          <li><strong>Deleting Connections:</strong> Click on a connection to select it, then press Delete or use the delete button</li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Node Configuration</h2>
        <p>
          Each node type has unique configuration options accessible by clicking on the node.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Node Panel:</strong> Opens when a node is selected, displaying configuration options</li>
          <li><strong>Validation:</strong> The system validates node settings to ensure they're complete and valid</li>
          <li><strong>Dependencies:</strong> Some nodes may reference data or settings from other nodes</li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Node Configuration Panel Details</h2>
        
        <h3 className="text-xl font-bold tracking-tight">Start Node Configuration</h3>
        <p>
          The Start Node configuration panel includes two tabs:
        </p>
        <div className="pl-6 space-y-4">
          <div>
            <h4 className="text-lg font-semibold">Basic Settings Tab</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Strategy Name:</strong> Name your strategy for easy identification</li>
              <li><strong>Trading Instrument Type:</strong> Choose between Stock, Futures, or Options</li>
              <li><strong>Underlying Type:</strong> For options, select between Index, Index Future, or Stock</li>
              <li><strong>Timeframe:</strong> Select the chart timeframe (e.g., 1m, 5m, 15m, 1h, 1d)</li>
              <li><strong>Exchange:</strong> Choose the stock exchange (e.g., NSE, BSE)</li>
              <li><strong>Symbol:</strong> Search and select a specific trading instrument</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold">Indicators Tab</h4>
            <p>Add and configure technical indicators used throughout your strategy:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Add Indicator:</strong> Select from a wide range of technical indicators</li>
              <li><strong>Configure Parameters:</strong> Set specific parameters for each indicator (e.g., period length for moving averages)</li>
              <li><strong>Managing Indicators:</strong> Expand/collapse, remove, or modify indicators</li>
              <li><strong>Dependency Tracking:</strong> System warns if removing indicators used elsewhere in the strategy</li>
            </ul>
            <p className="mt-2">Available indicators include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Moving Averages (SMA, EMA, WMA)</li>
              <li>Oscillators (RSI, MACD, Stochastic)</li>
              <li>Volatility measures (Bollinger Bands, ATR)</li>
              <li>Volume indicators (OBV, Volume Profile)</li>
              <li>And many more specialized indicators</li>
            </ul>
          </div>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight">Signal Node Configuration</h3>
        <p>
          Signal nodes use a condition builder interface to define when trading signals should be generated:
        </p>
        <div className="pl-6 space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Node Label:</strong> Custom name for the signal node</li>
            <li><strong>Condition Builder:</strong> Create logical conditions using a visual interface</li>
            <li><strong>Condition Groups:</strong> Combine multiple conditions with AND/OR operators</li>
            <li><strong>Expression Types:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Indicators:</strong> Reference technical indicators defined in the Start Node</li>
                <li><strong>Market Data:</strong> Price points (open, high, low, close), volume, etc.</li>
                <li><strong>Mathematical:</strong> Add, subtract, multiply, divide values</li>
                <li><strong>Constants:</strong> Fixed numerical values</li>
              </ul>
            </li>
            <li><strong>Operators:</strong> Greater than, less than, crosses above, crosses below, equals, etc.</li>
            <li><strong>Tabs:</strong> For combined Signal Nodes, separate tabs for entry and exit conditions</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight">Entry Node Configuration</h3>
        <p>
          Entry nodes configure how positions are opened when entry signals are triggered:
        </p>
        <div className="pl-6 space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Node Label:</strong> Custom name for the entry node</li>
            <li><strong>Position Tab:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Position Type:</strong> Buy (long) or Sell (short)</li>
                <li><strong>Order Type:</strong> Market order or Limit order</li>
                <li><strong>Limit Price:</strong> For limit orders, the specific price level</li>
                <li><strong>Quantity:</strong> Number of lots/shares to trade</li>
                <li><strong>Product Type:</strong> Intraday (MIS) or Carry Forward (CNC)</li>
                <li><strong>Virtual Position ID (VPI):</strong> Auto-generated identifier</li>
                <li><strong>Virtual Position Tag (VPT):</strong> User-defined label for the position</li>
                <li><strong>Priority:</strong> Execution precedence when multiple signals trigger</li>
              </ul>
            </li>
            <li><strong>Options Settings (if applicable):</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Expiry:</strong> Current week, next week, monthly, quarterly, etc.</li>
                <li><strong>Strike Selection:</strong> ATM, ITM, OTM, or premium-based</li>
                <li><strong>Strike Distance:</strong> For ITM/OTM, how many strikes away</li>
                <li><strong>Option Type:</strong> Call (CE) or Put (PE)</li>
              </ul>
            </li>
            <li><strong>Post-Execution Tab:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Stop Loss:</strong> Price-based, percentage-based, or ATR-based</li>
                <li><strong>Take Profit:</strong> Multiple target levels with percentage allocation</li>
                <li><strong>Trailing Stop:</strong> Dynamic stop-loss that moves with price</li>
              </ul>
            </li>
          </ul>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight">Exit Node Configuration</h3>
        <p>
          Exit nodes define how positions are closed when exit signals are triggered:
        </p>
        <div className="pl-6 space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Node Label:</strong> Custom name for the exit node</li>
            <li><strong>Target Position:</strong> Which position(s) to close (specific VPI or any position)</li>
            <li><strong>Order Type:</strong> Market order or Limit order</li>
            <li><strong>Limit Price:</strong> For limit orders, the specific price level</li>
            <li><strong>Quantity Type:</strong> All, percentage, or specific quantity</li>
            <li><strong>Partial Quantity:</strong> For percentage exit, what percentage to close</li>
            <li><strong>Specific Quantity:</strong> For specific quantity exit, how many lots/shares to close</li>
            <li><strong>Re-Entry Settings:</strong> Enable/disable automatic re-entry after exit</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight">Alert Node Configuration</h3>
        <p>
          Alert nodes generate notifications without executing trades:
        </p>
        <div className="pl-6 space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Node Label:</strong> Custom name for the alert node</li>
            <li><strong>Alert Message:</strong> Custom message to display when triggered</li>
            <li><strong>Alert Type:</strong> Info, Warning, or Critical priority</li>
            <li><strong>Notification Settings:</strong> Where the alert should be displayed</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight">End and Force End Node Configuration</h3>
        <p>
          End nodes mark the termination points of strategy branches:
        </p>
        <div className="pl-6 space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Node Label:</strong> Custom name for the end node</li>
            <li><strong>Close All Positions (Force End only):</strong> Whether to close all open positions</li>
            <li><strong>End Message (Force End only):</strong> Custom message explaining why strategy ended</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-bold tracking-tight">Retry Node Configuration</h3>
        <p>
          Retry nodes implement re-entry logic for the strategy:
        </p>
        <div className="pl-6 space-y-4">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Node Label:</strong> Custom name for the retry node</li>
            <li><strong>Group Number:</strong> Identifier for which exit group to retry</li>
            <li><strong>Maximum Re-Entries:</strong> How many times to attempt re-entry before stopping</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NodeTypesDoc;
