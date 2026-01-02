
/**
 * Helper functions for working with indicators
 */

/**
 * Formats an indicator name with its parameters for display
 * Example: formatIndicatorName("EMA", { timeperiod: 21 }) => "EMA(21)"
 */
export const formatIndicatorName = (
  baseIndicatorName: string,
  parameters: Record<string, any>
): string => {
  if (!parameters) return baseIndicatorName;
  
  // Extract parameters for display (skip indicator_name and display_name)
  const displayParams = { ...parameters };
  delete displayParams.indicator_name;
  delete displayParams.display_name;
  
  // Get parameter values and filter out undefined/null values
  const paramValues = Object.values(displayParams).filter(value => 
    value !== undefined && value !== null && value !== ''
  );
  
  // Join parameters into a string
  const paramString = paramValues.join(',');
  
  return paramString ? `${baseIndicatorName}(${paramString})` : baseIndicatorName;
};

/**
 * Extracts the base indicator name from a formatted indicator name
 * Example: extractBaseIndicatorName("EMA(21)") => "EMA"
 */
export const extractBaseIndicatorName = (formattedName: string): string => {
  if (!formattedName.includes('(')) return formattedName;
  return formattedName.split('(')[0];
};

/**
 * Extracts parameters from a formatted indicator name
 * Example: extractParametersFromName("EMA(21)") => ["21"]
 */
export const extractParametersFromName = (formattedName: string): string[] => {
  if (!formattedName.includes('(')) return [];
  
  const paramString = formattedName.split('(')[1]?.replace(')', '') || '';
  return paramString.split(',').map(p => p.trim());
};

/**
 * Checks if two indicator references point to the same indicator
 */
export const isSameIndicator = (name1: string, name2: string): boolean => {
  const base1 = extractBaseIndicatorName(name1);
  const base2 = extractBaseIndicatorName(name2);
  return base1 === base2;
};
