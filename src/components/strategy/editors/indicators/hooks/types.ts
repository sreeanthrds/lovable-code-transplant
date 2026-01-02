
export interface IndicatorData {
  display_name: string;
  indicator_name: string;
  [key: string]: any;
}

export interface UseIndicatorManagementProps {
  selectedIndicators: Record<string, IndicatorData>;
  onChange: (indicators: Record<string, IndicatorData>) => void;
}

export interface IndicatorManagementReturn {
  selectedIndicator: string;
  openStates: Record<string, boolean>;
  setSelectedIndicator: (indicator: string) => void;
  handleAddIndicator: (newIndicator: any) => void;
  handleRemoveIndicator: (indicatorName: string) => void;
  handleParameterChange: (indicatorId: string, paramName: string, value: any) => void;
  toggleOpen: (indicatorId: string) => void;
  findUsages: (indicatorId: string) => any[];
  indicators: Record<string, IndicatorData>;
  addIndicator: () => void;
  removeIndicator: (indicatorName: string) => void;
  updateIndicator: (indicatorName: string, newParams: any) => void;
  getAvailableIndicators: () => string[];
}

export enum IndicatorParamType {
  series = 'series',
  value = 'value'
}

export enum IndicatorFieldType {
  open = 'open',
  high = 'high',
  low = 'low',
  close = 'close',
  volume = 'volume'
}
