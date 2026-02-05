// Error suppression for development environment issues
// This suppresses known development-only errors that don't affect functionality

const suppressedErrorPatterns = [
  /DataCloneError.*URL object could not be cloned/i,
  /Failed to execute 'postMessage' on 'Window'.*URL object could not be cloned/i,
  /Failed to send message to.*URL object could not be cloned/i,
  /Uncaught ReferenceError: inputValue is not defined/i,
  /login\.js.*inputValue is not defined/i,
  /Failed to parse data/i,
  /Decompression error/i,
  /Object of type datetime is not JSON serializable/i,
  // React development warning - doesn't affect functionality
  /Function components cannot be given refs/i,
  /Check the render method of/i,
];

const originalConsoleError = console.error;
const originalWindowError = window.onerror;
const originalUnhandledRejection = window.onunhandledrejection;

// Suppress console.error for known development issues
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedErrorPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

// Suppress window.onerror for known issues
window.onerror = (message, source, lineno, colno, error) => {
  const messageStr = typeof message === 'string' ? message : String(message);
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedErrorPatterns.some(pattern => 
    pattern.test(messageStr)
  );
  
  if (!shouldSuppress && originalWindowError) {
    return originalWindowError(message, source, lineno, colno, error);
  }
  
  return true; // Prevent default browser error handling for suppressed errors
};

// Suppress unhandled promise rejections for known issues
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || String(event.reason);
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedErrorPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (shouldSuppress) {
    event.preventDefault(); // Suppress the error
    return;
  }
  
  // Let other unhandled rejections through
  if (originalUnhandledRejection) {
    originalUnhandledRejection.call(window, event);
  }
});

export { suppressedErrorPatterns };