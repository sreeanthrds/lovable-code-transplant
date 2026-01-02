
import React from 'react';
import { EnhancedRadioGroup, EnhancedRadioGroupProps } from '@/components/ui/form/enhanced';

type RadioGroupFieldProps = EnhancedRadioGroupProps;

const RadioGroupField: React.FC<RadioGroupFieldProps> = (props) => {
  return <EnhancedRadioGroup {...props} />;
};

export default RadioGroupField;
