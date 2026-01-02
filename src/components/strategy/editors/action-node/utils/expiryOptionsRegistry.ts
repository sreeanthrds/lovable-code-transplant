/**
 * Expiry options registry for different exchanges and symbols
 */

export interface ExpiryOption {
  value: string;
  label: string;
}

// Major indices that support weekly expiry
const WEEKLY_EXPIRY_SYMBOLS = [
  'NIFTY',
  'BANKNIFTY',
  'FINNIFTY',
  'MIDCPNIFTY',
  'NIFTYNXT50',
  'SENSEX'
];

// All expiry options
const ALL_EXPIRY_OPTIONS: ExpiryOption[] = [
  { value: 'W0', label: 'Current Week (W0)' },
  { value: 'W1', label: 'Next Week (W1)' },
  { value: 'W2', label: 'Week 2 (W2)' },
  { value: 'W3', label: 'Week 3 (W3)' },
  { value: 'W4', label: 'Week 4 (W4)' },
  { value: 'M0', label: 'Current Month (M0)' },
  { value: 'M1', label: 'Next Month (M1)' },
  { value: 'M2', label: 'Month 2 (M2)' },
  { value: 'Q0', label: 'Current Quarter (Q0)' },
  { value: 'Q1', label: 'Next Quarter (Q1)' },
  { value: 'Y0', label: 'Current Year (Y0)' },
  { value: 'Y1', label: 'Next Year (Y1)' }
];

// Monthly and longer expiry options (no weekly)
const MONTHLY_EXPIRY_OPTIONS: ExpiryOption[] = ALL_EXPIRY_OPTIONS.filter(
  option => !option.value.startsWith('W')
);

// MCX only supports monthly expiry
const MCX_EXPIRY_OPTIONS: ExpiryOption[] = [
  { value: 'M0', label: 'Current Month (M0)' },
  { value: 'M1', label: 'Next Month (M1)' },
  { value: 'M2', label: 'Month 2 (M2)' }
];

/**
 * Get expiry options based on exchange and symbol
 */
export const getExpiryOptions = (exchange?: string, symbol?: string): ExpiryOption[] => {
  if (!exchange || !symbol) {
    return ALL_EXPIRY_OPTIONS;
  }

  const normalizedExchange = exchange.toUpperCase();
  const normalizedSymbol = symbol.toUpperCase();

  // MCX only supports M0-M2
  if (normalizedExchange === 'MCX') {
    return MCX_EXPIRY_OPTIONS;
  }

  // Check if symbol supports weekly expiry
  const supportsWeekly = WEEKLY_EXPIRY_SYMBOLS.includes(normalizedSymbol);

  if (supportsWeekly) {
    return ALL_EXPIRY_OPTIONS;
  }

  // Other symbols only get monthly and quarterly expiry
  return MONTHLY_EXPIRY_OPTIONS;
};

/**
 * Check if a symbol supports weekly expiry
 */
export const supportsWeeklyExpiry = (symbol: string): boolean => {
  return WEEKLY_EXPIRY_SYMBOLS.includes(symbol.toUpperCase());
};
