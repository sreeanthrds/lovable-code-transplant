import { v4 as uuidv4 } from 'uuid';

export const createDefaultNodeData = (nodeType: string, nodeId: string) => {
  const timestamp = Date.now();
  // Extract just the number part from nodeId (e.g., "entry-1" -> "1")
  const nodeNumber = nodeId.split('-')[1] || '1';

  switch (nodeType) {
    case 'startNode':
      return {
        label: `Start ${nodeNumber}`,
        timeframe: '5MIN',
        exchange: 'NSE',
        tradingInstrument: {
          type: 'options', // Set to options by default for testing
          underlyingType: 'index'
        },
        indicators: {}, // Now a JSON object instead of array + separate parameters
        symbol: 'NIFTY',
        _lastUpdated: timestamp
      };

    case 'signalNode':
      return {
        label: `Signal ${nodeNumber}`,
        _lastUpdated: timestamp,
        conditions: {
          type: 'simple',
          operator: 'and',
          conditions: []
        }
      };
      
    case 'entrySignalNode':
      return {
        label: `Entry ${nodeNumber}`,
        _lastUpdated: timestamp,
        conditions: [{
          id: 'root',
          groupLogic: 'AND',
          conditions: []
        }]
      };
      
    case 'exitSignalNode':
      return {
        label: `Exit ${nodeNumber}`,
        _lastUpdated: timestamp,
        conditions: [{
          id: 'root',
          groupLogic: 'AND',
          conditions: []
        }]
      };

    case 'actionNode':
      return {
        label: `Action ${nodeNumber}`,
        actionType: 'entry',
        positions: [],
        _lastUpdated: timestamp
      };

    case 'entryNode':
      // Create base position with proper option details for options trading
      const basePosition = {
        vpi: `${nodeId}-pos1`,
        vpt: '',
        priority: 1,
        positionType: 'buy',
        orderType: 'market',
        quantity: 1,
        multiplier: 1,
        productType: 'intraday',
        _lastUpdated: timestamp,
        // Add option details by default since start node is set to options
        optionDetails: {
          expiry: 'W0',
          strikeType: 'ATM',
          optionType: 'CE'
        }
      };

      return {
        label: `Entry ${nodeNumber}`,
        actionType: 'entry',
        positions: [basePosition],
        _lastUpdated: timestamp
      };

    case 'exitNode':
      return {
        label: `Exit ${nodeNumber}`,
        actionType: 'exit',
        exitType: 'specific',
        positions: [],
        exitCondition: {
          type: 'positionExit',
          params: {}
        },
        _lastUpdated: timestamp
      };
      
    case 'modifyNode':
      return {
        label: `Modify ${nodeNumber}`,
        actionType: 'modify',
        targetPositionId: null,
        targetNodeId: null,
        modifications: {},
        _lastUpdated: timestamp
      };

    case 'alertNode':
      return {
        label: `Alert ${nodeNumber}`,
        actionType: 'alert',
        alertMessage: 'Strategy alert',
        alertType: 'info',
        sendEmail: false,
        sendSms: false,
        sendPush: true,
        _lastUpdated: timestamp
      };

    case 'endNode':
      return {
        label: `End ${nodeNumber}`,
        _lastUpdated: timestamp
      };

    case 'forceEndNode':
      return {
        label: `Force End ${nodeNumber}`,
        closePositions: true,
        _lastUpdated: timestamp
      };

    case 'retryNode':
      return {
        label: `Re-Entry node ${nodeNumber}`,
        actionType: 'retry',
        retryConfig: {
          groupNumber: 1,
          maxReEntries: 1
        },
        conditions: [{
          id: 'root',
          groupLogic: 'AND',
          conditions: []
        }],
        // Don't set a default targetNodeId here - let the editor handle it
        _lastUpdated: timestamp
      };

    case 'reEntrySignalNode':
      return {
        label: `Re-Entry node`,
        _lastUpdated: timestamp,
        conditions: [{
          id: 'root',
          groupLogic: 'AND',
          conditions: []
        }],
        retryConfig: {
          groupNumber: 1,
          maxReEntries: 1
        }
      };

    case 'squareOffNode':
      return {
        label: `Square off ${nodeNumber}`,
        message: 'Strategy forcibly stopped - all positions closed',
        endConditions: {
          immediateExit: { enabled: false },
          timeBasedExit: { enabled: false },
          performanceBasedExit: { enabled: false },
          positionClosure: { orderType: 'market', forceClose: true },
          alertNotification: { enabled: false }
        },
        _lastUpdated: timestamp
      };

    default:
      return {
        label: `Node ${nodeNumber}`,
        _lastUpdated: timestamp
      };
  }
};
