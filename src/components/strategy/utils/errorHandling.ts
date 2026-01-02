
import { toast } from "@/hooks/use-toast";

/**
 * Utility function for standardized error handling
 */
export const handleError = (error: unknown, context: string = 'Unknown Context') => {
  console.error(`Error in ${context}:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Log to console for debugging
  console.error(`${context}: ${errorMessage}`);
  
  // Show toast notification to user (optional)
  toast({
    title: `Error in ${context}`,
    description: errorMessage.length > 100 ? 
      `${errorMessage.substring(0, 100)}...` : errorMessage,
    variant: "destructive"
  });
  
  // Return the error to allow for chaining
  return error;
};

/**
 * Creates a safe function wrapper that catches errors
 */
export function createSafeFunction<T extends (...args: any[]) => any>(
  fn: T, 
  context: string,
  fallbackValue?: ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, context);
      return fallbackValue as ReturnType<T>;
    }
  };
}

/**
 * Creates an async safe function wrapper that catches errors in promises
 */
export function createSafeAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  context: string,
  fallbackValue?: Awaited<ReturnType<T>>
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return fallbackValue as Awaited<ReturnType<T>>;
    }
  };
}
