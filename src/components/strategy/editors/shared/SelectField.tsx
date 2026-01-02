
import React from 'react';
import { EnhancedSelectField, EnhancedSelectFieldProps } from '@/components/ui/form/enhanced';

type SelectFieldProps = EnhancedSelectFieldProps;

const SelectField: React.FC<SelectFieldProps> = (props) => {
  return <EnhancedSelectField {...props} className={`shadow-sm hover:shadow-md transition-shadow ${props.className || ''}`} />;
};

export default SelectField;
