
import React from 'react';
import { 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  Dice1, 
  Clock, 
  FileText, 
  Settings, 
  Activity, 
  ExternalLink, 
  HelpCircle,
  Variable
} from 'lucide-react';

const ExpressionIcon: React.FC<{ type: any; className?: string }> = ({ type, className = "h-3 w-3" }) => {
  switch (type) {
    case 'market_data':
      return <BarChart3 className={className} />;
    case 'live_data':
      return <LineChart className={className} />;
    case 'indicator':
      return <TrendingUp className={className} />;
    case 'constant':
      return <Dice1 className={className} />;
    case 'time_function':
      return <Clock className={className} />;
    case 'position_data':
      return <FileText className={className} />;
    case 'strategy_metric':
      return <Settings className={className} />;
    case 'execution_data':
      return <Activity className={className} />;
    case 'external_trigger':
      return <ExternalLink className={className} />;
    case 'expression':
      return <HelpCircle className={className} />;
    case 'node_variable': // Snapshot Variables
      return <Variable className={className} />;
    case 'global_variable':
      return <Variable className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export default ExpressionIcon;
