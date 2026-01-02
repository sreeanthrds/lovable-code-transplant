export interface EndConditions {
  immediateExit?: {
    enabled: boolean;
  };
  timeBasedExit?: {
    enabled: boolean;
    exitTime?: string; // HH:MM format
    exitAtMarketClose?: boolean;
    minutesBeforeClose?: number;
  };
  performanceBasedExit?: {
    enabled: boolean;
    dailyPnLTarget?: {
      enabled: boolean;
      targetAmount: number;
      targetType: 'absolute' | 'percentage';
    };
    dailyLossLimit?: {
      enabled: boolean;
      limitAmount: number;
      limitType: 'absolute' | 'percentage';
    };
  };
  positionClosure?: {
    orderType: 'market' | 'limit';
    limitOffset?: number;
    forceClose: boolean;
  };
  alertNotification?: {
    enabled: boolean;
  };
}

export interface SquareOffNodeData {
  label?: string;
  message?: string;
  endConditions?: EndConditions;
}
