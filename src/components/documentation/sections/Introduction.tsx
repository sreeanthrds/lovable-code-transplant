import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Introduction: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Introduction to the Trading Strategy Builder</h1>
      
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <Info className="h-4 w-4" />
        <AlertTitle>Welcome to the documentation</AlertTitle>
        <AlertDescription>
          This guide provides detailed information on how to use the Trading Strategy Builder platform
          to create, test, and deploy your trading strategies.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="key-concepts">Key Concepts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-muted-foreground">
            The Trading Strategy Builder is a visual programming environment for creating and testing trading strategies.
            It uses a node-based approach where you connect different components to build a complete trading strategy
            without writing any code.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Visual Strategy Creation</h3>
              <p className="text-sm text-muted-foreground">
                Build trading strategies by connecting nodes on a visual canvas,
                making complex strategy design accessible to traders of all coding skill levels.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Comprehensive Backtesting</h3>
              <p className="text-sm text-muted-foreground">
                Test your strategies against historical market data to evaluate performance
                before risking real capital.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Technical Indicators Library</h3>
              <p className="text-sm text-muted-foreground">
                Access a wide range of technical indicators and customization options
                to create sophisticated trading strategies.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Review detailed performance metrics and visualizations to
                understand your strategy's strengths and weaknesses.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="getting-started" className="space-y-4 mt-4">
          <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
          <p className="text-muted-foreground">
            Follow these steps to create your first trading strategy:
          </p>
          
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Navigate to the Strategy Builder:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Click on "Strategy Builder" in the main navigation menu to access the strategy editor.
              </p>
            </li>
            <li>
              <strong>Start with a new strategy:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Click the "New Strategy" button or select a template to begin with a pre-configured strategy.
              </p>
            </li>
            <li>
              <strong>Configure the Start Node:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Select your trading instrument, timeframe, and add technical indicators you'll need.
              </p>
            </li>
            <li>
              <strong>Add Signal Nodes:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Drag Signal Nodes from the node panel and connect them to define entry and exit conditions.
              </p>
            </li>
            <li>
              <strong>Add Action Nodes:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Add Entry and Exit Nodes to specify how positions should be opened and closed.
              </p>
            </li>
            <li>
              <strong>Connect Nodes:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Create connections between nodes by dragging from output handles to input handles.
              </p>
            </li>
            <li>
              <strong>Backtest Your Strategy:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Use the Backtesting module to evaluate your strategy against historical data.
              </p>
            </li>
            <li>
              <strong>Analyze Results:</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Review performance metrics and make adjustments to optimize your strategy.
              </p>
            </li>
          </ol>
          
          <div className="bg-muted p-4 rounded-lg mt-4">
            <h3 className="font-medium mb-2">Quick Start Video Tutorials</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Watch our video tutorials to get started quickly:
            </p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li><a href="#" className="text-blue-500 hover:underline">Introduction to the Platform</a></li>
              <li><a href="#" className="text-blue-500 hover:underline">Creating Your First Strategy</a></li>
              <li><a href="#" className="text-blue-500 hover:underline">Backtesting Fundamentals</a></li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="key-concepts" className="space-y-4 mt-4">
          <h2 className="text-2xl font-bold tracking-tight">Key Concepts</h2>
          <p className="text-muted-foreground">
            Understanding these core concepts will help you make the most of the Trading Strategy Builder:
          </p>
          
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Node-Based Programming</h3>
              <p className="text-sm text-muted-foreground">
                The platform uses nodes (visual blocks) that you connect together to create a strategy flow.
                Each node performs a specific function, and the connections between nodes define how data and
                signals flow through your strategy.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Signal Generation</h3>
              <p className="text-sm text-muted-foreground">
                Trading signals are generated when specific conditions are met. Signal Nodes define these
                conditions using technical indicators, price data, and other market information.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Strategy Flow</h3>
              <p className="text-sm text-muted-foreground">
                A complete strategy flow typically consists of:
              </p>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground mt-1">
                <li>A Start Node that initializes the strategy and defines global settings</li>
                <li>Signal Nodes that generate entry and exit signals</li>
                <li>Action Nodes that execute trades when signals are triggered</li>
                <li>Optional flow control nodes for complex logic</li>
              </ol>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Backtesting</h3>
              <p className="text-sm text-muted-foreground">
                Backtesting simulates how your strategy would have performed if traded on historical market data.
                This helps you evaluate and refine your strategy before deploying it with real capital.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Key metrics include:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground mt-1">
                <li>Total return and annualized return</li>
                <li>Drawdown (maximum loss from a peak)</li>
                <li>Win rate and profit factor</li>
                <li>Sharpe ratio and other risk-adjusted metrics</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Position Management</h3>
              <p className="text-sm text-muted-foreground">
                The platform uses a virtual position system to track trades during backtesting and live trading.
                Each position has:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground mt-1">
                <li>A unique identifier (VPI - Virtual Position ID)</li>
                <li>Optional user-defined tag (VPT - Virtual Position Tag)</li>
                <li>Entry price, quantity, and direction (long/short)</li>
                <li>Optional stop-loss and take-profit levels</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Documentation Structure</h2>
        <p className="text-muted-foreground">
          This documentation is organized into the following sections:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Strategy Builder:</strong> 
            <span className="text-muted-foreground ml-2">
              Guide to the strategy editor interface and workflow
            </span>
          </li>
          <li>
            <strong>Node Types:</strong> 
            <span className="text-muted-foreground ml-2">
              Overview of all available node types and their purposes
            </span>
          </li>
          <li>
            <strong>Signal Nodes:</strong> 
            <span className="text-muted-foreground ml-2">
              Detailed guide to creating and configuring signal generation nodes
            </span>
          </li>
          <li>
            <strong>Action Nodes:</strong> 
            <span className="text-muted-foreground ml-2">
              Comprehensive information on entry, exit, and other action nodes
            </span>
          </li>
          <li>
            <strong>Backtesting:</strong> 
            <span className="text-muted-foreground ml-2">
              Instructions for testing strategies against historical data
            </span>
          </li>
          <li>
            <strong>Reports & Analytics:</strong> 
            <span className="text-muted-foreground ml-2">
              Understanding the performance metrics and visualization tools
            </span>
          </li>
        </ul>
        
        <p className="text-muted-foreground">
          Navigate through these sections using the sidebar menu. Each section provides comprehensive
          information about specific aspects of the platform.
        </p>
      </div>
      
      <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 rounded-lg">
        <h3 className="font-medium mb-2">Need Additional Help?</h3>
        <p className="text-sm text-muted-foreground">
          If you need assistance beyond what's covered in this documentation:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground mt-2">
          <li>Contact our support team at support@tradingstrategybuilder.com</li>
          <li>Visit our community forum to connect with other users</li>
          <li>Check out our YouTube channel for video tutorials</li>
        </ul>
      </div>
    </div>
  );
};

export default Introduction;
