import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import IndicatorForm from '../IndicatorForm';
import { flatIndicatorConfig } from '../../utils/categorizedIndicatorConfig';
import { formatIndicatorName } from '../../utils/indicatorHelpers';

interface IndicatorConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: Record<string, any>) => void;
  indicatorName: string;
  initialValues?: Record<string, any>;
  mode: 'add' | 'edit';
}

const IndicatorConfigDialog: React.FC<IndicatorConfigDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  indicatorName,
  initialValues = {},
  mode
}) => {
  const indicator = flatIndicatorConfig[indicatorName];
  
  // Generate default values for new indicators
  const getDefaultValues = () => {
    if (!indicator) return {};
    
    const defaults: Record<string, any> = {};
    indicator.parameters.forEach(param => {
      if (param.default !== undefined) {
        defaults[param.name] = param.default;
      } else if (param.type === 'number') {
        defaults[param.name] = 14; // Common default for periods
      } else if (param.type === 'dropdown' && Array.isArray(param.options) && param.options.length > 0) {
        defaults[param.name] = param.options[0];
      } else {
        defaults[param.name] = ''; // Allow empty initial values
      }
    });
    return defaults;
  };

  const [formValues, setFormValues] = React.useState<Record<string, any>>(() => {
    if (mode === 'add') {
      return getDefaultValues();
    }
    return initialValues;
  });

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'add') {
        setFormValues(getDefaultValues());
      } else {
        setFormValues(initialValues);
      }
    }
  }, [isOpen, mode, indicatorName]);

  const handleParameterChange = (paramName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Validation: check if required fields have values
  const isFormValid = () => {
    if (!indicator) return false;
    
    return indicator.parameters.every(param => {
      const value = formValues[param.name];
      // Consider a field invalid if it's completely empty/undefined for required fields
      if (param.type === 'number') {
        return value !== undefined && value !== null && value !== '';
      }
      // For other types, allow them to be empty but still validate they exist
      return value !== undefined;
    });
  };

  const handleConfirm = () => {
    if (!isFormValid()) {
      return; // Don't save if form is invalid
    }
    
    // Ensure display name is updated based on current form values
    const displayName = formatIndicatorName(indicatorName, formValues);
    const finalParams = {
      ...formValues,
      display_name: displayName,
      indicator_name: indicatorName
    };
    onConfirm(finalParams);
    onClose();
  };

  if (!indicator) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Configure' : 'Edit'} {indicator.display_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <IndicatorForm
            indicator={indicator}
            values={formValues}
            onChange={handleParameterChange}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!isFormValid()}
              title={!isFormValid() ? 'Please fill in all required fields' : ''}
            >
              {mode === 'add' ? 'Add' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndicatorConfigDialog;