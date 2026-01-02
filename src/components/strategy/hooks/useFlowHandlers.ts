
// This file is kept to maintain imports. Its functionality
// has been moved directly into useFlowState.ts for better
// hook compliance with React's rules.

export const useFlowHandlers = (props: any) => {
  // Using props object to avoid linting issues
  // Returning empty handlers for backward compatibility
  return {
    onNodeClick: () => {},
    handleAddNode: () => {},
    updateNodeData: () => {},
    handleDeleteNode: () => {},
    handleDeleteEdge: () => {},
    closePanel: () => {},
    resetStrategy: () => {},
    handleImportSuccess: () => {}
  };
};
