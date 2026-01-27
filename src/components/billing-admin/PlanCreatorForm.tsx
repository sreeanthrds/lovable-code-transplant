import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { PlanLimitsSection } from './PlanLimitsSection';
import { PlanPricingSection } from './PlanPricingSection';
import { PlanValiditySection } from './PlanValiditySection';
import { PlanFeaturesSection } from './PlanFeaturesSection';
import { PlanPreviewCard } from './PlanPreviewCard';
import { 
  PlanFormState, 
  INITIAL_FORM_STATE,
  formStateToPlanInput,
  planToFormState,
  PlanDefinition 
} from '@/types/plan-definitions';

interface PlanCreatorFormProps {
  initialPlan?: PlanDefinition;
  onSubmit: (data: ReturnType<typeof formStateToPlanInput>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type SectionKey = 'identity' | 'validity' | 'limits' | 'pricing' | 'features';

export function PlanCreatorForm({ 
  initialPlan, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: PlanCreatorFormProps) {
  const [formState, setFormState] = useState<PlanFormState>(
    initialPlan ? planToFormState(initialPlan) : INITIAL_FORM_STATE
  );
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set(['identity', 'limits', 'pricing'])
  );
  const [codeError, setCodeError] = useState<string | null>(null);

  const isEditing = !!initialPlan;

  const updateForm = (updates: Partial<PlanFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const toggleSection = (section: SectionKey) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const validateCode = (code: string): boolean => {
    if (!code) {
      setCodeError('Plan code is required');
      return false;
    }
    if (!/^[A-Z0-9_]+$/.test(code.toUpperCase())) {
      setCodeError('Code must be alphanumeric with underscores only');
      return false;
    }
    if (code.length < 2 || code.length > 50) {
      setCodeError('Code must be 2-50 characters');
      return false;
    }
    setCodeError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCode(formState.code)) {
      return;
    }

    if (!formState.name.trim()) {
      return;
    }

    const planInput = formStateToPlanInput(formState);
    await onSubmit(planInput);
  };

  const renderSectionHeader = (
    title: string,
    section: SectionKey,
    description: string
  ) => (
    <CollapsibleTrigger asChild>
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        <div className="text-left">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {openSections.has(section) ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    </CollapsibleTrigger>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Sections */}
        <div className="lg:col-span-2 space-y-4">
          {/* Identity Section */}
          <Collapsible open={openSections.has('identity')}>
            <Card>
              {renderSectionHeader('Identity', 'identity', 'Basic plan information')}
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Plan Code *</Label>
                      <Input
                        id="code"
                        value={formState.code}
                        onChange={(e) => {
                          updateForm({ code: e.target.value.toUpperCase() });
                          validateCode(e.target.value);
                        }}
                        placeholder="e.g., PRO, ENTERPRISE"
                        className="font-mono uppercase"
                        disabled={isEditing}
                      />
                      {codeError && (
                        <p className="text-xs text-destructive">{codeError}</p>
                      )}
                      {isEditing && (
                        <p className="text-xs text-muted-foreground">
                          Code cannot be changed after creation
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name *</Label>
                      <Input
                        id="name"
                        value={formState.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                        placeholder="e.g., Pro Plan"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formState.description}
                      onChange={(e) => updateForm({ description: e.target.value })}
                      placeholder="Brief description for the pricing page..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tier_level">Tier Level</Label>
                      <Input
                        id="tier_level"
                        type="number"
                        min={0}
                        value={formState.tier_level}
                        onChange={(e) => updateForm({ tier_level: parseInt(e.target.value) || 0 })}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher = better plan (for upgrade logic)
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label>Active</Label>
                        <p className="text-xs text-muted-foreground">Available for purchase</p>
                      </div>
                      <Switch
                        checked={formState.is_active}
                        onCheckedChange={(checked) => updateForm({ is_active: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label>Public</Label>
                        <p className="text-xs text-muted-foreground">Show on pricing page</p>
                      </div>
                      <Switch
                        checked={formState.is_public}
                        onCheckedChange={(checked) => updateForm({ is_public: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Validity Section */}
          <Collapsible open={openSections.has('validity')}>
            <Card>
              {renderSectionHeader('Validity & Reset Rules', 'validity', 'Duration, trial periods, and reset schedule')}
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <PlanValiditySection formState={formState} onChange={updateForm} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Limits Section */}
          <Collapsible open={openSections.has('limits')}>
            <Card>
              {renderSectionHeader('Usage Limits', 'limits', 'Backtests, live trading, and paper trading caps')}
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <PlanLimitsSection formState={formState} onChange={updateForm} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Pricing Section */}
          <Collapsible open={openSections.has('pricing')}>
            <Card>
              {renderSectionHeader('Pricing', 'pricing', 'Monthly, yearly, and add-on settings')}
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <PlanPricingSection formState={formState} onChange={updateForm} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Features Section */}
          <Collapsible open={openSections.has('features')}>
            <Card>
              {renderSectionHeader('Features & UI', 'features', 'Feature flags and visual customization')}
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <PlanFeaturesSection formState={formState} onChange={updateForm} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Live Preview
            </h3>
            <PlanPreviewCard formState={formState} />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !formState.code || !formState.name}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
