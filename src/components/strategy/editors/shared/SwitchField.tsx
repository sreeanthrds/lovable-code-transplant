
import React from 'react';
import { EnhancedSwitch, EnhancedSwitchProps } from '@/components/ui/form/enhanced';

type SwitchFieldProps = EnhancedSwitchProps;

const SwitchField: React.FC<SwitchFieldProps> = (props) => {
  return <EnhancedSwitch {...props} />;
};

export default SwitchField;
