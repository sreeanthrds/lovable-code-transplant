
/**
 * Utility functions for mathematical operations
 */

/**
 * Increases a value by a percentage
 * @param value The base value
 * @param percentage The percentage to increase by
 * @returns The value increased by the specified percentage
 */
export function increaseByPercentage(value: number, percentage: number): number {
  return value + (value * percentage) / 100;
}

/**
 * Decreases a value by a percentage
 * @param value The base value
 * @param percentage The percentage to decrease by
 * @returns The value decreased by the specified percentage
 */
export function decreaseByPercentage(value: number, percentage: number): number {
  return value - (value * percentage) / 100;
}

/**
 * Calculates the result of an operation between two numbers
 * @param left Left operand
 * @param right Right operand
 * @param operation The operation to perform
 * @returns The result of the operation
 */
export function calculateOperation(
  left: number, 
  right: number, 
  operation: '+' | '-' | '*' | '/' | '%' | '+%' | '-%'
): number | string {
  switch (operation) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right !== 0 ? left / right : "Error: Division by zero";
    case '%':
      return right !== 0 ? left % right : "Error: Modulo by zero";
    case '+%':
      return increaseByPercentage(left, right);
    case '-%':
      return decreaseByPercentage(left, right);
    default:
      return 0;
  }
}

/**
 * Calculates the result of a function with multiple expressions
 * @param values Array of numbers
 * @param functionName The function to perform
 * @returns The result of the function
 */
export function calculateFunction(
  values: number[],
  functionName: 'max' | 'min'
): number | string {
  if (values.length === 0) {
    return "Error: No values provided";
  }

  switch (functionName) {
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    default:
      return 0;
  }
}
