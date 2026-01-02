
import React from 'react';
import FormField from './FormField';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupFieldProps {
  label: string;
  values: string[];
  options: CheckboxOption[];
  onChange: (values: string[]) => void;
  description?: string;
  className?: string;
}

const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  label,
  values = [],
  options,
  onChange,
  description,
  className = '',
}) => {
  const handleCheckboxChange = (checked: boolean | 'indeterminate', value: string) => {
    if (checked === true) {
      onChange([...values, value]);
    } else {
      onChange(values.filter(v => v !== value));
    }
  };

  return (
    <FormField label={label} description={description} className={className}>
      <div className="flex flex-col gap-2 pl-1">
        {options.map((option) => (
          <div className="flex items-center space-x-2" key={option.value}>
            <Checkbox
              id={`checkbox-${option.value}`}
              checked={values.includes(option.value)}
              onCheckedChange={(checked) => handleCheckboxChange(checked, option.value)}
            />
            <Label
              htmlFor={`checkbox-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </FormField>
  );
};

export default CheckboxGroupField;
