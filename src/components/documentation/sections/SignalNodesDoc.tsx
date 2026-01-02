
import React from 'react';

const SignalNodesDoc: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Signal Nodes</h1>
      
      <p className="text-muted-foreground">
        Signal Nodes are essential components that define when your strategy should enter or exit positions.
        They translate market conditions into actionable trading signals.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Types of Signal Nodes</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Entry Signal Node</h3>
          <p>
            Entry Signal Nodes are specifically designed to generate signals for entering new positions.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Define conditions for opening new positions</li>
            <li><strong>Use Case:</strong> Identifying buying or selling opportunities based on technical indicators, price patterns, or other market conditions</li>
            <li><strong>Typical Connections:</strong> Connect to Entry Nodes to execute trades when conditions are met</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Exit Signal Node</h3>
          <p>
            Exit Signal Nodes are designed to generate signals for exiting existing positions.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Define conditions for closing positions</li>
            <li><strong>Use Case:</strong> Identifying profit-taking opportunities, stop-loss conditions, or other exit criteria</li>
            <li><strong>Typical Connections:</strong> Connect to Exit Nodes to execute position closures when conditions are met</li>
          </ul>
          
          <h3 className="text-xl font-bold tracking-tight">Combined Signal Node</h3>
          <p>
            Combined Signal Nodes can generate both entry and exit signals based on separate condition sets.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Purpose:</strong> Define both entry and exit conditions in a single node</li>
            <li><strong>Use Case:</strong> Creating related entry and exit signals that share common logic</li>
            <li><strong>Organization:</strong> Uses tabs to separate entry and exit condition builders</li>
          </ul>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Creating and Configuring Signal Nodes</h2>
        
        <h3 className="text-xl font-bold tracking-tight">Adding a Signal Node</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Open Node Sidebar:</strong> Click on the "Nodes" tab in the left sidebar</li>
          <li><strong>Locate Signal Nodes:</strong> Under the "Signal" category, you'll find different signal node types</li>
          <li><strong>Drag to Canvas:</strong> Click and drag your desired signal node type onto the canvas</li>
          <li><strong>Position:</strong> Place it between your Start Node and intended Action Nodes</li>
        </ol>
        
        <h3 className="text-xl font-bold tracking-tight">Signal Node Configuration Panel</h3>
        <p>
          When you click on a Signal Node, the configuration panel opens on the right side of the screen with the following sections:
        </p>
        
        <div className="space-y-3 mt-2">
          <h4 className="text-lg font-semibold">1. Node Label Field</h4>
          <p>
            Located at the top of the panel, this text input allows you to give your node a descriptive name.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Purpose:</strong> Makes it easier to identify nodes on the canvas</li>
            <li><strong>Best Practice:</strong> Use descriptive names like "RSI Oversold Entry" or "MA Crossover Exit"</li>
            <li><strong>UI Element:</strong> Single-line text input field</li>
          </ul>
          
          <h4 className="text-lg font-semibold">2. Condition Tabs (Combined Signal Node only)</h4>
          <p>
            For Combined Signal Nodes, you'll see tabs to switch between entry and exit condition builders.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Entry Tab:</strong> Click to configure conditions for generating entry signals</li>
            <li><strong>Exit Tab:</strong> Click to configure conditions for generating exit signals</li>
            <li><strong>UI Element:</strong> Horizontal tab selector at the top of the condition builder</li>
          </ul>
          
          <h4 className="text-lg font-semibold">3. Condition Group Header</h4>
          <p>
            Controls for the logical grouping of conditions.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>AND/OR Toggle:</strong> Dropdown or toggle button to switch between requiring all conditions to be true (AND) or any condition to be true (OR)</li>
            <li><strong>Add Group Button:</strong> Creates a nested group of conditions, allowing for complex logical structures</li>
            <li><strong>UI Location:</strong> At the top of each condition group</li>
          </ul>
          
          <h4 className="text-lg font-semibold">4. Condition Row Elements</h4>
          <p>
            Each condition row contains the following UI elements (from left to right):
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Left Expression Selector:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Type:</strong> Dropdown menu with categories (Indicator, Market Data, etc.)</li>
                <li><strong>Selection:</strong> After choosing a type, a secondary dropdown appears for specific selection</li>
                <li><strong>Parameters:</strong> Some expressions require additional parameters (e.g., period selection)</li>
              </ul>
            </li>
            <li>
              <strong>Operator Selector:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>UI Element:</strong> Dropdown menu</li>
                <li><strong>Options:</strong> Comparison operators like equals (=), greater than (&gt;), crosses above (↗), etc.</li>
                <li><strong>Context-Sensitive:</strong> Available operators may change based on expression types</li>
              </ul>
            </li>
            <li>
              <strong>Right Expression Selector:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Structure:</strong> Similar to Left Expression Selector</li>
                <li><strong>Constant Option:</strong> For entering fixed numeric values</li>
                <li><strong>Dynamic Fields:</strong> Additional fields appear based on expression type</li>
              </ul>
            </li>
            <li>
              <strong>Remove Button:</strong>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>UI Element:</strong> X icon button at the end of the row</li>
                <li><strong>Function:</strong> Deletes this specific condition</li>
              </ul>
            </li>
          </ul>
          
          <h4 className="text-lg font-semibold">5. Condition Group Controls</h4>
          <p>
            At the bottom of each condition group, you'll find:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Add Condition Button:</strong> Adds a new condition row to the current group</li>
            <li><strong>Remove Group Button:</strong> For nested groups, deletes the entire group and its conditions</li>
            <li><strong>UI Element:</strong> Button with "+" icon and text "Add Condition"</li>
          </ul>
          
          <h4 className="text-lg font-semibold">6. Condition Preview Section</h4>
          <p>
            Shows a human-readable summary of your configured conditions.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>UI Element:</strong> Text display box, typically with syntax highlighting</li>
            <li><strong>Location:</strong> At the bottom of the condition builder</li>
            <li><strong>Purpose:</strong> Helps verify the logical structure of your conditions</li>
            <li><strong>Updates:</strong> Refreshes in real-time as you modify conditions</li>
          </ul>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Condition Builder</h2>
        <p>
          The core of each Signal Node is the Condition Builder, which allows you to define complex logical conditions.
        </p>
        
        <h3 className="text-xl font-bold tracking-tight">Building Conditions Step-by-Step</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Start with a Basic Condition:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li>Click the "Add Condition" button</li>
              <li>Select the left expression (e.g., an indicator like RSI)</li>
              <li>Choose an operator (e.g., "less than")</li>
              <li>Select or enter the right expression (e.g., constant value "30")</li>
            </ul>
          </li>
          <li>
            <strong>Add More Conditions (if needed):</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li>Click "Add Condition" again</li>
              <li>Configure the new condition row</li>
              <li>By default, conditions are combined with AND logic</li>
              <li>Change to OR logic using the group operator toggle if needed</li>
            </ul>
          </li>
          <li>
            <strong>Create Nested Logic (if needed):</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li>Click "Add Group" to create a nested condition group</li>
              <li>Configure the group's AND/OR operator</li>
              <li>Add conditions to the nested group</li>
              <li>This allows for complex logic like "(A AND B) OR (C AND D)"</li>
            </ul>
          </li>
          <li>
            <strong>Review in Preview:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li>Check the condition preview to ensure logic is correctly structured</li>
              <li>Make adjustments if the logic doesn't match your intention</li>
            </ul>
          </li>
        </ol>
        
        <h3 className="text-xl font-bold tracking-tight">Expression Types in Detail</h3>
        
        <h4 className="text-lg font-semibold">Indicator Expressions</h4>
        <p>
          When selecting "Indicator" as your expression type, you'll see these UI elements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Indicator Dropdown:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown menu listing all indicators from the Start Node</li>
              <li><strong>Behavior:</strong> Only shows indicators that have been added to the strategy</li>
              <li><strong>Empty State:</strong> If no indicators are configured, a message prompts you to add them in the Start Node</li>
            </ul>
          </li>
          <li>
            <strong>Output Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown menu (appears after selecting an indicator)</li>
              <li><strong>Purpose:</strong> For indicators with multiple outputs (e.g., MACD has main line, signal line, and histogram)</li>
              <li><strong>Options:</strong> Vary based on the selected indicator</li>
            </ul>
          </li>
          <li>
            <strong>Lookback Period Input:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Numeric input field with up/down controls</li>
              <li><strong>Purpose:</strong> Specifies how many bars back to look for the indicator value</li>
              <li><strong>Default:</strong> 0 (current bar)</li>
              <li><strong>Valid Values:</strong> 0 or negative integers (-1 for previous bar, -2 for two bars ago, etc.)</li>
            </ul>
          </li>
        </ul>
        
        <h4 className="text-lg font-semibold">Market Data Expressions</h4>
        <p>
          When selecting "Market Data" as your expression type, you'll see these UI elements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Data Type Dropdown:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown menu with price and volume options</li>
              <li><strong>Common Options:</strong> Open, High, Low, Close, Volume, Typical Price, Median Price</li>
            </ul>
          </li>
          <li>
            <strong>Bar Selection Input:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Numeric input with up/down controls</li>
              <li><strong>Purpose:</strong> Specifies which bar to reference</li>
              <li><strong>Default:</strong> 0 (current bar)</li>
              <li><strong>Values:</strong> 0 or negative integers for historical bars</li>
            </ul>
          </li>
        </ul>
        
        <h4 className="text-lg font-semibold">Position Data Expressions</h4>
        <p>
          When selecting "Position Data" as your expression type, you'll see these UI elements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Position Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown or radio buttons</li>
              <li><strong>Options:</strong> "Any Position", specific VPI selection, or VPT filter</li>
            </ul>
          </li>
          <li>
            <strong>Metric Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown menu</li>
              <li><strong>Options:</strong> Entry Price, Current P/L, Position Age, etc.</li>
              <li><strong>Format Controls:</strong> For P/L, toggle between absolute value and percentage</li>
            </ul>
          </li>
        </ul>
        
        <h4 className="text-lg font-semibold">Time Function Expressions</h4>
        <p>
          When selecting "Time" as your expression type, you'll see these UI elements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Time Component Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown menu</li>
              <li><strong>Options:</strong> Hour, Minute, Day of Week, Month, etc.</li>
            </ul>
          </li>
          <li>
            <strong>Time Context Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown or radio buttons</li>
              <li><strong>Options:</strong> Bar Time, Current Time, Market Session</li>
            </ul>
          </li>
        </ul>
        
        <h4 className="text-lg font-semibold">Mathematical Expressions</h4>
        <p>
          When selecting "Math" as your expression type, you'll see these UI elements:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>First Value Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Similar to other expression selectors</li>
              <li><strong>Purpose:</strong> Select the first value in the mathematical operation</li>
            </ul>
          </li>
          <li>
            <strong>Operation Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Dropdown menu with mathematical operators</li>
              <li><strong>Options:</strong> Add (+), Subtract (-), Multiply (×), Divide (÷), Percentage (%), Modulo (mod)</li>
            </ul>
          </li>
          <li>
            <strong>Second Value Selector:</strong>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>UI Element:</strong> Similar to other expression selectors</li>
              <li><strong>Purpose:</strong> Select the second value in the operation</li>
            </ul>
          </li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Operators</h2>
        <p>
          The condition builder supports various comparison operators:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Basic Comparisons:</strong> Equals (=), Not Equals (≠), Greater Than (&gt;), Less Than (&lt;), Greater Than or Equal (≥), Less Than or Equal (≤)</li>
          <li><strong>Crossing Operators:</strong> Crosses Above (↗), Crosses Below (↘)</li>
          <li><strong>Range Operators:</strong> Between, Not Between, Inside Range, Outside Range</li>
          <li><strong>Pattern Operators:</strong> Increasing For N Bars, Decreasing For N Bars, Bouncing Off, Rejecting From</li>
        </ul>
        
        <h3 className="text-xl font-bold tracking-tight">Operator Details</h3>
        <div className="space-y-3 mt-2">
          <div>
            <h4 className="text-lg font-semibold">Basic Comparison Operators</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Equals (=):</strong> True when both expressions have the same value</li>
              <li><strong>Not Equals (≠):</strong> True when expressions have different values</li>
              <li><strong>Greater Than (&gt;):</strong> True when left expression is larger than right expression</li>
              <li><strong>Less Than (&lt;):</strong> True when left expression is smaller than right expression</li>
              <li><strong>Greater Than or Equal (≥):</strong> True when left expression is larger than or equal to right expression</li>
              <li><strong>Less Than or Equal (≤):</strong> True when left expression is smaller than or equal to right expression</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold">Crossing Operators</h4>
            <p className="text-sm text-muted-foreground">These operators evaluate the relationship between expressions across multiple bars</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Crosses Above (↗):</strong> True on the bar where the left expression moves from below to above the right expression</li>
              <li><strong>Crosses Below (↘):</strong> True on the bar where the left expression moves from above to below the right expression</li>
              <li><strong>UI Input:</strong> These operators don't require additional parameters</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold">Range Operators</h4>
            <p className="text-sm text-muted-foreground">These operators check if a value falls within or outside of a specified range</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Between:</strong> True when the left expression is between the two values specified in the right expression</li>
              <li><strong>Not Between:</strong> True when the left expression is not between the two values specified</li>
              <li><strong>Inside Range:</strong> Similar to Between but includes the boundary values</li>
              <li><strong>Outside Range:</strong> Similar to Not Between but includes the boundary values</li>
              <li><strong>UI Inputs:</strong> These operators require two additional input fields for the lower and upper bounds</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold">Pattern Operators</h4>
            <p className="text-sm text-muted-foreground">These operators detect specific patterns over multiple bars</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Increasing For N Bars:</strong> True when the expression has been increasing for the specified number of bars</li>
              <li><strong>Decreasing For N Bars:</strong> True when the expression has been decreasing for the specified number of bars</li>
              <li><strong>Bouncing Off:</strong> True when the expression reverses direction after approaching the value specified</li>
              <li><strong>Rejecting From:</strong> True when the expression fails to cross a value and reverses direction</li>
              <li><strong>UI Inputs:</strong> These operators require a numeric parameter input field for the number of bars or threshold values</li>
            </ul>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Start Simple:</strong> Begin with clear, simple conditions before adding complexity</li>
          <li><strong>Group Logically:</strong> Use condition groups to organize related conditions</li>
          <li><strong>Use Descriptive Labels:</strong> Give your Signal Nodes descriptive names that explain their purpose</li>
          <li><strong>Test Incrementally:</strong> Add and test conditions one at a time to ensure they work as expected</li>
          <li><strong>Consider Frequency:</strong> Be aware of how often your conditions might be triggered in real market conditions</li>
          <li><strong>Avoid Overfitting:</strong> Create conditions that capture genuine market patterns rather than historical anomalies</li>
          <li><strong>Combine Technical Approaches:</strong> Consider using multiple types of indicators (trend, momentum, volatility) for more robust signals</li>
          <li><strong>Add Filters:</strong> Use conditions to filter out weak signals or poor market conditions</li>
        </ul>
        
        <h2 className="text-2xl font-bold tracking-tight">Troubleshooting</h2>
        <div className="space-y-3 mt-2">
          <div>
            <h4 className="text-lg font-semibold">Common Issues</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>No Signals Generated:</strong> 
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Check:</strong> Conditions may be too restrictive</li>
                  <li><strong>Solution:</strong> Simplify conditions or widen parameter ranges</li>
                </ul>
              </li>
              <li>
                <strong>Too Many Signals:</strong> 
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Check:</strong> Conditions may be too general</li>
                  <li><strong>Solution:</strong> Add filtering conditions to make criteria more specific</li>
                </ul>
              </li>
              <li>
                <strong>Unexpected Logic Results:</strong> 
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Check:</strong> AND/OR operators might be set incorrectly</li>
                  <li><strong>Solution:</strong> Review the condition preview and adjust group operators</li>
                </ul>
              </li>
              <li>
                <strong>Missing Indicators:</strong> 
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Check:</strong> Indicators must be added in the Start Node first</li>
                  <li><strong>Solution:</strong> Go to Start Node, add required indicators, then return to Signal Node</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold">Visual Indicators</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Red Outline:</strong> Indicates incomplete or invalid condition configuration</li>
              <li><strong>Warning Icons:</strong> Hover to see specific validation errors</li>
              <li><strong>Disabled Save Button:</strong> Appears when conditions aren't fully configured</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalNodesDoc;
