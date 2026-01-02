import React from 'react';
import { EnhancedNumberInput } from '@/components/ui/form/enhanced';

interface ReEntrySettingsFormProps {
  maxReEntries: number;
  onMaxReEntriesChange: (value: number) => void;
}

export const ReEntrySettingsForm: React.FC<ReEntrySettingsFormProps> = ({
  maxReEntries,
  onMaxReEntriesChange
}) => {
  return (
    <div className="space-y-4 pt-2">
      <EnhancedNumberInput
        label="Max Re-Entries"
        value={maxReEntries}
        onChange={(value) => onMaxReEntriesChange(value || 1)}
        min={1}
        step={1}
        description="Maximum number of times positions can re-enter"
      />
    </div>
  );
};