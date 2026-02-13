import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, EyeOff, Play, Copy, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStrategyImport } from '@/hooks/strategy-management/useStrategyImport';
import { v4 as uuidv4 } from 'uuid';

// Lazy load react-json-view to avoid SSR issues
const ReactJson = lazy(() => import('react-json-view'));

// Bright, high-visibility themes for JSON viewer
const JSON_THEMES = {
  'bright-ocean': {
    name: 'Bright Ocean',
    theme: {
      base00: '#0a1929',
      base01: '#0d2137',
      base02: '#1a3a5c',
      base03: '#4fc3f7',
      base04: '#81d4fa',
      base05: '#e1f5fe',
      base06: '#ffffff',
      base07: '#ffffff',
      base08: '#ff6b6b',
      base09: '#ffa726',
      base0A: '#ffee58',
      base0B: '#66bb6a',
      base0C: '#4dd0e1',
      base0D: '#42a5f5',
      base0E: '#ba68c8',
      base0F: '#ff7043',
    }
  },
  'neon-pop': {
    name: 'Neon Pop',
    theme: {
      base00: '#1a1a2e',
      base01: '#16213e',
      base02: '#0f3460',
      base03: '#00ff88',
      base04: '#00ffff',
      base05: '#ffffff',
      base06: '#ffffff',
      base07: '#ffffff',
      base08: '#ff2e63',
      base09: '#ff9f1c',
      base0A: '#ffff00',
      base0B: '#00ff88',
      base0C: '#00ffff',
      base0D: '#7b68ee',
      base0E: '#ff69b4',
      base0F: '#ffa500',
    }
  },
  'sunset-glow': {
    name: 'Sunset Glow',
    theme: {
      base00: '#2d1b2e',
      base01: '#3d2b3e',
      base02: '#4d3b4e',
      base03: '#ffb74d',
      base04: '#ffcc80',
      base05: '#fff8e1',
      base06: '#ffffff',
      base07: '#ffffff',
      base08: '#ef5350',
      base09: '#ff7043',
      base0A: '#ffd54f',
      base0B: '#9ccc65',
      base0C: '#4dd0e1',
      base0D: '#64b5f6',
      base0E: '#ce93d8',
      base0F: '#ffab91',
    }
  },
  'forest-bright': {
    name: 'Forest Bright',
    theme: {
      base00: '#1b2e1b',
      base01: '#2b3e2b',
      base02: '#3b4e3b',
      base03: '#81c784',
      base04: '#a5d6a7',
      base05: '#e8f5e9',
      base06: '#ffffff',
      base07: '#ffffff',
      base08: '#f44336',
      base09: '#ff9800',
      base0A: '#ffeb3b',
      base0B: '#4caf50',
      base0C: '#00bcd4',
      base0D: '#2196f3',
      base0E: '#9c27b0',
      base0F: '#795548',
    }
  },
  'high-contrast': {
    name: 'High Contrast',
    theme: {
      base00: '#000000',
      base01: '#111111',
      base02: '#222222',
      base03: '#00ffff',
      base04: '#ffffff',
      base05: '#ffffff',
      base06: '#ffffff',
      base07: '#ffffff',
      base08: '#ff0000',
      base09: '#ff8800',
      base0A: '#ffff00',
      base0B: '#00ff00',
      base0C: '#00ffff',
      base0D: '#00aaff',
      base0E: '#ff00ff',
      base0F: '#ff8888',
    }
  },
  'monokai-bright': {
    name: 'Monokai Bright',
    theme: 'monokai'
  },
  'hopscotch': {
    name: 'Hopscotch',
    theme: 'hopscotch'
  },
  'ashes': {
    name: 'Ashes',
    theme: 'ashes'
  }
} as const;

type ThemeKey = keyof typeof JSON_THEMES;

interface DecryptedResultProps {
  decryptedData: string;
  sourceUserId?: string;
}

const THEME_STORAGE_KEY = 'json-viewer-theme';

export const DecryptedResult: React.FC<DecryptedResultProps> = ({ decryptedData, sourceUserId }) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved && saved in JSON_THEMES) ? saved as ThemeKey : 'neon-pop';
  });

  const handleThemeChange = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  };
  const navigate = useNavigate();
  const { importStrategy } = useStrategyImport();
  
  const getCurrentUserId = () => {
    try {
      const clerk = (window as any).Clerk;
      if (clerk && clerk.user) {
        return clerk.user.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };
  
  const currentUserId = getCurrentUserId();
  const isOwner = currentUserId === sourceUserId;
  const canEdit = isOwner || !sourceUserId;
  
  const handleDownloadDecrypted = () => {
    if (!decryptedData) return;

    const blob = new Blob([decryptedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'decrypted_strategy.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadToBuilder = () => {
    try {
      const strategyData = JSON.parse(decryptedData);
      
      if (!strategyData.nodes || !strategyData.edges || !strategyData.name) {
        toast.error('Invalid strategy data format');
        return;
      }
      
      const strategyName = canEdit ? strategyData.name : `${strategyData.name} (Read-only)`;
      const strategyId = canEdit ? strategyData.id : uuidv4();
      
      const params = new URLSearchParams({
        id: strategyId,
        name: strategyName,
        mode: canEdit ? 'edit' : 'readonly'
      });
      
      sessionStorage.setItem(`strategy_${strategyId}`, JSON.stringify(strategyData));
      
      navigate(`/app/strategy-builder?${params.toString()}`);
      toast.success(canEdit ? 'Strategy loaded for editing' : 'Strategy loaded in read-only mode');
    } catch (error) {
      console.error('Error loading strategy:', error);
      toast.error('Failed to load strategy data');
    }
  };

  const handleCloneStrategy = () => {
    try {
      const strategyData = JSON.parse(decryptedData);
      
      if (!strategyData.nodes || !strategyData.edges || !strategyData.name) {
        toast.error('Invalid strategy data format');
        return;
      }
      
      const clonedName = `${strategyData.name} (Copy)`;
      
      if (importStrategy(strategyData, clonedName)) {
        toast.success('Strategy cloned successfully');
        navigate('/app/strategies');
      } else {
        toast.error('Failed to clone strategy');
      }
    } catch (error) {
      console.error('Error cloning strategy:', error);
      toast.error('Failed to clone strategy');
    }
  };

  let parsedData = null;
  let isValidStrategy = false;
  try {
    parsedData = JSON.parse(decryptedData);
    isValidStrategy = parsedData && parsedData.nodes && parsedData.edges && parsedData.name;
  } catch (error) {
    parsedData = null;
  }

  const currentThemeConfig = JSON_THEMES[selectedTheme];
  const jsonTheme = currentThemeConfig.theme;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="w-5 h-5" />
          Decrypted Strategy Data
        </CardTitle>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedTheme} onValueChange={(v) => handleThemeChange(v as ThemeKey)}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JSON_THEMES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strategy Builder Actions */}
          {isValidStrategy && (
            <>
              <Button
                onClick={handleLoadToBuilder}
                className="flex items-center gap-2"
                size="sm"
              >
                <Play className="w-4 h-4" />
                {canEdit ? 'Edit in Builder' : 'View in Builder'}
              </Button>
              {!canEdit && (
                <Button
                  variant="outline"
                  onClick={handleCloneStrategy}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                  Clone to My Strategies
                </Button>
              )}
            </>
          )}
          
          {/* Regular Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDecrypted}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(decryptedData);
              toast.success('Copied to clipboard');
            }}
          >
            Copy to Clipboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            className="flex items-center gap-2"
          >
            {viewMode === 'formatted' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {viewMode === 'formatted' ? 'Raw View' : 'Formatted View'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'formatted' && parsedData ? (
          <div className="border border-border rounded-lg p-4 bg-black/80 overflow-auto max-h-[600px]">
            <Suspense fallback={<div className="text-muted-foreground">Loading JSON viewer...</div>}>
              <ReactJson
                src={parsedData}
                theme={jsonTheme}
                displayDataTypes={false}
                enableClipboard={true}
                collapsed={false}
                style={{ 
                  backgroundColor: 'transparent',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}
              />
            </Suspense>
          </div>
        ) : (
          <Textarea
            value={decryptedData}
            readOnly
            rows={20}
            className="font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  );
};
