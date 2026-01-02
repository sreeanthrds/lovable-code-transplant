import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface EditableStrategyNameProps {
  name: string;
  onNameChange: (newName: string) => void;
  className?: string;
}

export const EditableStrategyName: React.FC<EditableStrategyNameProps> = ({
  name,
  onNameChange,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [isLoading, setIsLoading] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(name);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editValue.trim()) {
      toast({
        title: "Invalid name",
        description: "Strategy name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (editValue.trim() === name) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onNameChange(editValue.trim());
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Strategy name updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Could not update strategy name",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleClick = () => {
    if (clickTimeout) {
      // This is a double click
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleEdit();
    } else {
      // This is a single click - wait to see if double click follows
      const timeout = setTimeout(() => {
        setClickTimeout(null);
        // Single click - show strategy overview
        window.dispatchEvent(new CustomEvent('showStrategyOverview'));
      }, 300);
      setClickTimeout(timeout);
    }
  };

  // Handle long press for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const timeout = setTimeout(() => {
      handleEdit();
    }, 500); // 500ms for long press
    
    const cleanup = () => {
      clearTimeout(timeout);
      document.removeEventListener('touchend', cleanup);
      document.removeEventListener('touchcancel', cleanup);
    };
    
    document.addEventListener('touchend', cleanup);
    document.addEventListener('touchcancel', cleanup);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="p-2"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="p-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <h1 
        className="text-lg font-semibold flex-1 cursor-pointer select-none"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {name}
      </h1>
    </div>
  );
};