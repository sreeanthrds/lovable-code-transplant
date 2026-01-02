/**
 * Utilities for improving expression naming to avoid confusion with minus operators
 */

/**
 * Converts hyphenated names to more readable formats for expressions
 * Replaces hyphens with underscores to avoid confusion with minus operators
 */
export const sanitizeExpressionName = (name: string): string => {
  if (!name) return name;
  
  // Replace hyphens with underscores to avoid confusion with minus
  return name.replace(/-/g, '_');
};

/**
 * Formats display names for better readability in expressions
 * Uses dots for hierarchy and underscores for word separation
 */
export const formatExpressionDisplayName = (
  baseName: string, 
  context?: {
    instrumentType?: string;
    timeframe?: string;
    parameter?: string;
    offset?: number;
  }
): string => {
  let displayName = sanitizeExpressionName(baseName);
  
  if (context) {
    const { instrumentType, timeframe, parameter, offset } = context;
    
    // Build hierarchical name using dots (more readable than hyphens)
    const parts: string[] = [];
    
    if (instrumentType) {
      parts.push(instrumentType);
    }
    
    if (timeframe) {
      parts.push(timeframe);
    }
    
    parts.push(displayName);
    
    // Add parameter with dot notation
    if (parameter) {
      parts.push(parameter);
    }
    
    displayName = parts.join('.');
    
    // Add offset prefix for better readability
    if (offset !== undefined) {
      if (offset === 0) {
        displayName = `Current[${displayName}]`;
      } else if (offset === -1) {
        displayName = `Previous[${displayName}]`;
      } else if (offset < 0) {
        displayName = `${Math.abs(offset)}ago[${displayName}]`;
      }
    }
  }
  
  return displayName;
};

/**
 * Converts a UUID to a more readable short identifier
 * Takes first 8 characters and converts to uppercase for better visibility
 */
export const formatUuidForDisplay = (uuid: string): string => {
  if (!uuid || uuid.length < 8) return uuid;
  
  // Check if it looks like a UUID (contains hyphens and is long)
  if (uuid.length >= 36 && uuid.includes('-')) {
    return `ID_${uuid.substring(0, 8).toUpperCase()}`;
  }
  
  return sanitizeExpressionName(uuid);
};

/**
 * Converts various naming patterns to expression-friendly format
 */
export const normalizeExpressionIdentifier = (identifier: string): string => {
  if (!identifier) return identifier;
  
  // Handle UUIDs
  if (identifier.length >= 36 && identifier.includes('-')) {
    return formatUuidForDisplay(identifier);
  }
  
  // Handle regular names with hyphens
  return sanitizeExpressionName(identifier);
};

/**
 * Creates a readable node variable reference
 */
export const formatNodeVariableReference = (nodeId: string, variableName: string): string => {
  const cleanNodeId = normalizeExpressionIdentifier(nodeId);
  const cleanVariableName = sanitizeExpressionName(variableName);
  
  return `${cleanNodeId}.${cleanVariableName}`;
};