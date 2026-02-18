
/**
 * Get a prefix for node IDs based on the node type
 */
export const getNodeTypePrefix = (type: string) => {
  switch (type) {
    case 'startNode':
      return 'start';
    case 'signalNode':
      return 'signal';
    case 'entrySignalNode':
      return 'condition';
    case 'exitSignalNode':
      return 'exit-condition';
    case 'actionNode':
      return 'action';
    case 'entryNode':
      return 'entry';
    case 'exitNode':
      return 'exit';
    case 'alertNode':
      return 'alert';
    case 'modifyNode':
      return 'modify';
    case 'endNode':
      return 'end';
    case 'forceEndNode':
      return 'force-end';
    case 'squareOffNode':
      return 'square-off';
    case 'retryNode':
      return 're-entry-node';
    case 'reEntrySignalNode':
      return 're-entry-signal';
    default:
      return 'node';
  }
};
