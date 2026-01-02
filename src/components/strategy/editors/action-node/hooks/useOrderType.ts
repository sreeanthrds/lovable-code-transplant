import { useState, useEffect } from 'react';

interface UseOrderTypeProps {
  orderType?: string;
}

export const useOrderType = ({ orderType }: UseOrderTypeProps) => {
  const [showLimitPrice, setShowLimitPrice] = useState(orderType === 'limit');
  
  // Keep orderType and showLimitPrice in sync
  useEffect(() => {
    setShowLimitPrice(orderType === 'limit');
  }, [orderType]);
  
  return { showLimitPrice };
};
