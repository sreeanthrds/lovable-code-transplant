
import React from 'react';

const ActionNodesDoc: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Action Nodes</h1>
      
      <p className="text-muted-foreground">
        Action Nodes execute specific operations when triggered by signals. They are responsible for
        opening or closing positions, modifying existing positions, and generating alerts.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Types of Action Nodes</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Entry Node</h3>
          <p>
            Entry Nodes create new trading positions when triggered by entry signals.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Open new long or short positions</li>
            <li><strong>Key Settings:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Position Type:</strong> Buy (long) or Sell (short)</li>
                <li><strong>Order Type:</strong> Market or Limit orders</li>
                <li><strong>Quantity:</strong> Number of lots/shares/contracts</li>
                <li><strong>Product Type:</strong> Intraday or Carry Forward</li>
                <li><strong>Options Settings:</strong> For options trading strategies</li>
                <li><strong>Post-Execution:</strong> Stop-loss, take-profit, and trailing stop settings</li>
              </ul>
            </li>
            <li><strong>Position Management:</strong> Creates virtual positions tracked by the Position Store</li>
            <li><strong>Position Tagging:</strong> Assign virtual position IDs (VPI) and tags (VPT) for tracking</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Exit Node</h3>
          <p>
            Exit Nodes close existing trading positions when triggered by exit signals.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Close existing positions partially or completely</li>
            <li><strong>Key Settings:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Target Position:</strong> Specific position or any position</li>
                <li><strong>Exit Quantity:</strong> All, percentage, or specific quantity</li>
                <li><strong>Order Type:</strong> Market or Limit orders</li>
                <li><strong>Re-entry Settings:</strong> Configure automatic re-entry after exit</li>
              </ul>
            </li>
            <li><strong>Exit Types:</strong> Manual exit, take-profit, stop-loss, or trailing stop</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Modify Node</h3>
          <p>
            Modify Nodes adjust parameters of existing positions without closing them.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Update stop-loss, take-profit, or other position parameters</li>
            <li><strong>Key Settings:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Target Position:</strong> Position to be modified</li>
                <li><strong>Modification Type:</strong> Stop-loss, take-profit, trailing stop</li>
                <li><strong>New Values:</strong> Updated price levels or percentages</li>
              </ul>
            </li>
            <li><strong>Use Cases:</strong> Moving stops to breakeven, widening take-profit targets, etc.</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Alert Node</h3>
          <p>
            Alert Nodes generate notifications without executing trades.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Create custom alerts for specific market conditions</li>
            <li><strong>Key Settings:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Alert Message:</strong> Customizable message content</li>
                <li><strong>Alert Type:</strong> Information, warning, or critical</li>
                <li><strong>Notification Channels:</strong> Where alerts are sent</li>
              </ul>
            </li>
            <li><strong>Use Cases:</strong> Market condition notifications, strategy monitoring, debugging</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Retry Node</h3>
          <p>
            Retry Nodes attempt to reprocess a strategy branch after a condition is met.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Implement re-entry logic or retry failed operations</li>
            <li><strong>Key Settings:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Retry Count:</strong> Maximum number of retry attempts</li>
                <li><strong>Retry Delay:</strong> Time between retry attempts</li>
                <li><strong>Retry Conditions:</strong> Conditions that must be met to trigger a retry</li>
              </ul>
            </li>
          </ul>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Entry Node Configuration in Detail</h2>
        
        <h3 className="text-xl font-bold tracking-tight">Basic Order Settings</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Position Type:</strong> Defines whether you're opening a long (buy) or short (sell) position</li>
          <li><strong>Order Type:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Market Order:</strong> Executes immediately at the current market price</li>
              <li><strong>Limit Order:</strong> Executes only at a specified price or better</li>
            </ul>
          </li>
          <li><strong>Quantity:</strong> The size of the position in lots, shares, or contracts</li>
          <li><strong>Product Type:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Intraday (MIS):</strong> Positions that automatically close at the end of the trading day</li>
              <li><strong>Carry Forward (CNC):</strong> Positions that can be held overnight</li>
            </ul>
          </li>
          <li><strong>Priority:</strong> Determines the execution order when multiple entry signals are triggered simultaneously</li>
          <li><strong>Virtual Position ID (VPI):</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li>Automatically generated unique identifier for each position</li>
              <li>Used by other nodes (Exit, Modify) to reference this specific position</li>
              <li>Format: Usually based on node ID and creation timestamp</li>
            </ul>
          </li>
          <li><strong>Virtual Position Tag (VPT):</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li>User-defined label to categorize positions</li>
              <li>Allows grouping similar positions (e.g., "Day Trade", "Swing", "RSI Oversold")</li>
              <li>Used to target groups of positions in Exit and Modify nodes</li>
            </ul>
          </li>
        </ul>
        
        <h3 className="text-xl font-bold tracking-tight">Post-Execution Settings</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Stop Loss:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Fixed Price:</strong> Absolute price level for stop-loss</li>
              <li><strong>Percentage:</strong> Percentage away from entry price</li>
              <li><strong>ATR Multiple:</strong> Distance based on Average True Range</li>
              <li><strong>Activation:</strong> Immediate or after a condition is met</li>
              <li><strong>Order Type:</strong> Market or Limit order for the stop-loss execution</li>
            </ul>
          </li>
          <li><strong>Take Profit:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Fixed Price:</strong> Absolute price level for take-profit</li>
              <li><strong>Percentage:</strong> Percentage away from entry price</li>
              <li><strong>Risk/Reward Ratio:</strong> Multiple of stop-loss distance</li>
              <li><strong>Multiple Targets:</strong> Define several take-profit levels with partial exits</li>
              <li><strong>Target Allocation:</strong> Percentage of position to exit at each target</li>
              <li><strong>Order Type:</strong> Market or Limit order for each take-profit level</li>
            </ul>
          </li>
          <li><strong>Trailing Stop:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Initial Distance:</strong> Starting distance from entry price</li>
              <li><strong>Step Size:</strong> How much the stop moves when price moves in your favor</li>
              <li><strong>Activation:</strong> Price level or percentage where trailing begins</li>
              <li><strong>Lock-in Profit:</strong> Option to never move the stop below breakeven after reaching profit</li>
              <li><strong>Order Type:</strong> Market or Limit order for the trailing stop execution</li>
            </ul>
          </li>
          <li><strong>Trailing Variables:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Position Price Variable:</strong> Automatically created variable that tracks the position's current price in real-time</li>
              <li><strong>Underlying Price Variable:</strong> For options positions only, tracks the underlying instrument's price movement</li>
              <li><strong>Configuration:</strong> Set price move threshold and trail distance parameters</li>
              <li><strong>Units:</strong> Configure in either points (absolute) or percentage (relative) terms</li>
              <li><strong>Usage:</strong> These variables can be referenced in signal node conditions and other expression builders throughout the strategy</li>
              <li><strong>Validity:</strong> Variables are only valid while the associated position remains open; they return null after position closure</li>
              <li><strong>Naming:</strong> Variables are automatically named as "Trailing_&#123;VPT/VPI&#125;_Position" and "Trailing_&#123;VPT/VPI&#125;_Underlying"</li>
            </ul>
          </li>
          <li><strong>Position Expiry:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Time-Based:</strong> Close position after a specific duration</li>
              <li><strong>Session-Based:</strong> Close at the end of a trading session</li>
              <li><strong>Bar-Based:</strong> Close after a certain number of price bars</li>
            </ul>
          </li>
        </ul>
        
        <h3 className="text-xl font-bold tracking-tight">Options Trading Settings</h3>
        <p>
          When trading options, additional settings are available:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Option Type:</strong> Call or Put</li>
          <li><strong>Expiry Selection:</strong> Weekly, monthly, or specific dates</li>
          <li><strong>Strike Selection:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>ATM (At-the-money):</strong> Strike closest to current price</li>
              <li><strong>ITM (In-the-money):</strong> Strikes favorable to the option type</li>
              <li><strong>OTM (Out-of-the-money):</strong> Strikes unfavorable to the option type</li>
              <li><strong>Specific Strike:</strong> Exact strike price value</li>
              <li><strong>Premium-Based:</strong> Strike with premium closest to target value</li>
            </ul>
          </li>
          <li><strong>ITM/OTM Distance:</strong> For ITM or OTM options, how many strikes away from ATM</li>
          <li><strong>Option Chain Settings:</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Weekly Options:</strong> Current week (W0), next week (W1), etc.</li>
              <li><strong>Monthly Options:</strong> Current month (M0), next month (M1), etc.</li>
              <li><strong>Quarterly Options:</strong> Current quarter (Q0), next quarter (Q1), etc.</li>
            </ul>
          </li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Exit Node Configuration in Detail</h2>
        <p>
          Exit nodes have specialized settings for closing positions:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Target Position Selection:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Any Position:</strong> Close any open position when triggered</li>
              <li><strong>Specific VPI:</strong> Close only the position with the specified Virtual Position ID</li>
              <li><strong>By VPT:</strong> Close all positions with a specific Virtual Position Tag</li>
              <li><strong>By Position Type:</strong> Close all long or all short positions</li>
            </ul>
          </li>
          <li><strong>Exit Quantity Options:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>All:</strong> Close the entire position</li>
              <li><strong>Percentage:</strong> Close a percentage of the position (e.g., 50%)</li>
              <li><strong>Specific Quantity:</strong> Close an exact number of lots/shares/contracts</li>
            </ul>
          </li>
          <li><strong>Order Type Settings:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Market Order:</strong> Immediate execution at current price</li>
              <li><strong>Limit Order:</strong> Exit only at specified price or better</li>
              <li><strong>Limit Price:</strong> For limit orders, the target exit price</li>
            </ul>
          </li>
          <li><strong>Re-Entry Configuration:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Re-Entry Enable:</strong> Toggle option to re-enter after exit</li>
              <li><strong>Re-Entry Node:</strong> Connection to a Retry Node for implementation</li>
            </ul>
          </li>
          <li><strong>Exit Reason Tagging:</strong> Label the exit with a reason (take profit, stop loss, etc.)</li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Position Management</h2>
        <p>
          Action Nodes interact with the Position Store to track and manage trading positions:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Virtual Position IDs (VPI):</strong> Unique identifiers for each position</li>
          <li><strong>Virtual Position Tags (VPT):</strong> User-defined labels for categorizing positions</li>
          <li><strong>Position Filtering:</strong> Exit and Modify nodes can target specific positions by ID or tag</li>
          <li><strong>Position Visualization:</strong> The Visual Position Store displays all active positions</li>
          <li><strong>Re-Entry Logic:</strong> Configure automatic re-entry after position exits</li>
          <li><strong>Position Lifecycle:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Created:</strong> When an Entry Node is triggered</li>
              <li><strong>Modified:</strong> When a Modify Node updates its parameters</li>
              <li><strong>Partially Closed:</strong> When an Exit Node closes part of the position</li>
              <li><strong>Fully Closed:</strong> When an Exit Node closes the entire position</li>
              <li><strong>Re-Entered:</strong> When a closed position is re-opened via a Retry Node</li>
            </ul>
          </li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Action Node Connections</h2>
        <p>
          Understanding the proper connections for Action Nodes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Input Connections:</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li>Action Nodes typically receive connections from Signal Nodes</li>
              <li>They can also receive connections directly from other Action Nodes in sequence</li>
              <li>Multiple signals can connect to a single Action Node</li>
            </ul>
          </li>
          <li><strong>Output Connections:</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li>Action Nodes can connect to other Action Nodes (chaining actions)</li>
              <li>They can connect to End Nodes to terminate a strategy branch</li>
              <li>They can connect to Retry Nodes for re-entry logic</li>
            </ul>
          </li>
          <li><strong>Connection Execution:</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li>Connections represent the flow of execution when signals trigger</li>
              <li>When a Signal Node condition is met, all connected Action Nodes execute</li>
              <li>Priority settings determine order of execution for multiple Action Nodes</li>
            </ul>
          </li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Trailing Variables in Detail</h2>
        <p>
          Trailing variables are dynamic values that automatically track price movements for positions, 
          enabling sophisticated condition-based logic throughout your strategy.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Automatic Creation:</strong> When trailing functionality is enabled on a position, 
              two types of variables are automatically created:
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Position Price Variable:</strong> Tracks the current price of the trading instrument (stock, future, option contract)</li>
              <li><strong>Underlying Price Variable:</strong> For options only, tracks the price of the underlying instrument</li>
            </ul>
          </li>
          <li><strong>Variable Configuration:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Price Move:</strong> The minimum favorable price movement required before trailing begins</li>
              <li><strong>Trail Price:</strong> The distance the variable maintains from the most favorable price reached</li>
              <li><strong>Units:</strong> Configure in "points" for absolute price differences or "percentage" for relative differences</li>
            </ul>
          </li>
          <li><strong>Accessing in Conditions:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li>Available in Signal Node condition builders under "Trailing Variable" expression type</li>
              <li>Can be used in comparisons, mathematical operations, and complex conditional logic</li>
              <li>Variables are accessible by name throughout the strategy duration</li>
            </ul>
          </li>
          <li><strong>Lifecycle Management:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Active Period:</strong> Variables update in real-time while the associated position is open</li>
              <li><strong>Position Closure:</strong> Variables become null immediately when the position is closed</li>
              <li><strong>Error Handling:</strong> Referencing closed position variables returns null, preventing strategy errors</li>
            </ul>
          </li>
          <li><strong>Use Cases:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dynamic Exit Conditions:</strong> Exit when trailing variable reaches specific levels</li>
              <li><strong>Position Scaling:</strong> Add to positions based on trailing variable performance</li>
              <li><strong>Cross-Variable Analysis:</strong> Compare multiple trailing variables for portfolio strategies</li>
              <li><strong>Underlying vs. Position Tracking:</strong> For options, make decisions based on either option price or underlying price movement</li>
            </ul>
          </li>
        </ul>

        <h2 className="text-2xl font-bold tracking-tight">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Position Sizing:</strong> Consider using percentage of account or volatility-based position sizing</li>
          <li><strong>Order Types:</strong> Use limit orders when precise entry prices are critical</li>
          <li><strong>Risk Management:</strong> Always define stop-loss levels for all positions</li>
          <li><strong>Position Tracking:</strong> Use consistent VPI/VPT naming conventions for easier management</li>
          <li><strong>Exit Strategy:</strong> Plan multiple exit scenarios, including partial exits</li>
          <li><strong>Trailing Variables:</strong> Test trailing variable parameters thoroughly in backtesting to optimize performance</li>
          <li><strong>Variable Validation:</strong> Always check if trailing variables are not null before using them in conditions</li>
          <li><strong>Backtesting:</strong> Test how different order types affect performance in historical testing</li>
          <li><strong>Logging:</strong> Use Alert Nodes to keep track of important strategy events</li>
          <li><strong>Node Organization:</strong> Keep related Entry and Exit nodes visually grouped together on the canvas</li>
          <li><strong>Automation vs. Discretion:</strong> 
            <ul className="list-disc pl-6 space-y-1">
              <li>Use Alert Nodes for discretionary trade notification if you don't want fully automated execution</li>
              <li>Start with automated entry but manual exit if you're not comfortable with fully automated trading</li>
              <li>Progress to fully automated strategies as confidence increases</li>
            </ul>
          </li>
          <li><strong>Strategy Verification:</strong> Use the Visual Position Store to verify that entry and exit logic works as expected</li>
        </ul>
      </div>
    </div>
  );
};

export default ActionNodesDoc;
