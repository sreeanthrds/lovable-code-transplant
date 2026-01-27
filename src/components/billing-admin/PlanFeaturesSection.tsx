import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Sparkles } from 'lucide-react';
import type { PlanFormState } from '@/types/plan-definitions';

interface PlanFeaturesSectionProps {
  formState: PlanFormState;
  onChange: (updates: Partial<PlanFormState>) => void;
}

const PREDEFINED_FEATURES = [
  { key: 'api_access', label: 'API Access', description: 'Enable REST API access' },
  { key: 'priority_support', label: 'Priority Support', description: 'Faster response times' },
  { key: 'custom_reports', label: 'Custom Reports', description: 'Export custom reports' },
  { key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Detailed performance metrics' },
  { key: 'webhook_notifications', label: 'Webhook Notifications', description: 'Real-time trade alerts' },
  { key: 'multi_broker', label: 'Multi-Broker Support', description: 'Connect multiple brokers' },
];

const UI_COLORS = [
  { value: 'default', label: 'Default', className: 'bg-primary' },
  { value: 'secondary', label: 'Secondary', className: 'bg-secondary' },
  { value: 'destructive', label: 'Premium (Red)', className: 'bg-destructive' },
  { value: 'outline', label: 'Outline', className: 'bg-transparent border-2' },
];

const UI_ICONS = [
  { value: '', label: 'None' },
  { value: 'rocket', label: 'Rocket 🚀' },
  { value: 'star', label: 'Star ⭐' },
  { value: 'crown', label: 'Crown 👑' },
  { value: 'diamond', label: 'Diamond 💎' },
  { value: 'fire', label: 'Fire 🔥' },
  { value: 'zap', label: 'Lightning ⚡' },
];

export function PlanFeaturesSection({ formState, onChange }: PlanFeaturesSectionProps) {
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState(true);

  const toggleFeature = (key: string, enabled: boolean) => {
    onChange({
      feature_flags: {
        ...formState.feature_flags,
        [key]: enabled,
      },
    });
  };

  const removeFeature = (key: string) => {
    const newFlags = { ...formState.feature_flags };
    delete newFlags[key];
    onChange({ feature_flags: newFlags });
  };

  const addCustomFeature = () => {
    if (!newFeatureKey.trim()) return;
    const key = newFeatureKey.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    onChange({
      feature_flags: {
        ...formState.feature_flags,
        [key]: newFeatureValue,
      },
    });
    setNewFeatureKey('');
  };

  return (
    <div className="space-y-6">
      {/* Predefined Features */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Feature Flags
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREDEFINED_FEATURES.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
            >
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{feature.label}</Label>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                checked={formState.feature_flags[feature.key] === true}
                onCheckedChange={(checked) => toggleFeature(feature.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Features */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-semibold">Custom Feature Flags</h4>
        
        {/* Existing Custom Features */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(formState.feature_flags)
            .filter(([key]) => !PREDEFINED_FEATURES.some(f => f.key === key))
            .map(([key, value]) => (
              <Badge
                key={key}
                variant={value ? 'default' : 'secondary'}
                className="flex items-center gap-1 pr-1"
              >
                <span className="font-mono text-xs">{key}</span>
                <span className="mx-1">:</span>
                <span>{value ? 'true' : 'false'}</span>
                <button
                  onClick={() => removeFeature(key)}
                  className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
        </div>

        {/* Add Custom Feature */}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Feature Key</Label>
            <Input
              placeholder="e.g., custom_feature"
              value={newFeatureKey}
              onChange={(e) => setNewFeatureKey(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="w-24 space-y-1">
            <Label className="text-xs">Value</Label>
            <Select
              value={newFeatureValue.toString()}
              onValueChange={(v) => setNewFeatureValue(v === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomFeature}
            disabled={!newFeatureKey.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* UI Customization */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-semibold">UI Customization</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Badge Color</Label>
            <Select
              value={formState.ui_color}
              onValueChange={(value) => onChange({ ui_color: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {UI_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.className}`} />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan Icon</Label>
            <Select
              value={formState.ui_icon}
              onValueChange={(value) => onChange({ ui_icon: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {UI_ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
