import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useStrategyImport } from '@/hooks/strategy-management/useStrategyImport';
import { exportSecureStrategy } from '@/components/strategy/utils/import-export/secureFileOperations';
import { useClerkUser } from '@/hooks/useClerkUser';
import { getStrategiesList, loadStrategyFromStorage } from '@/hooks/strategy-store/strategy-operations';
import { saveStrategy as persistSave } from '@/hooks/strategy-store/supabase-persistence';

const JsonToTlsTab: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importStrategy } = useStrategyImport();
  const { user } = useClerkUser();
  const [jsonText, setJsonText] = useState('');
  const [nameOverride, setNameOverride] = useState('');
  const [error, setError] = useState<string | null>(null);

  const readFile = async (file: File) => {
    try {
      const text = await file.text();
      setJsonText(text);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to read file');
    }
  };

  const handleFilePick = () => fileInputRef.current?.click();

  const parseStrategy = (): any | null => {
    try {
      const obj = JSON.parse(jsonText);
      if (!obj || !Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) {
        throw new Error('Invalid strategy JSON. It must include nodes[] and edges[].');
      }
      return obj;
    } catch (e: any) {
      setError(e?.message || 'Invalid JSON');
      return null;
    }
  };

  const handleCreateStrategy = async () => {
    setError(null);
    const obj = parseStrategy();
    if (!obj) return;

    // Ensure a name
    if (!obj.name) obj.name = nameOverride || 'Imported Strategy';

    const ok = importStrategy(obj);
    if (!ok) {
      setError('Failed to import strategy. Please verify the JSON format.');
      return;
    }

    // Also persist to Supabase using the most recently saved strategy
    try {
      const list = getStrategiesList();
      if (list && list.length > 0) {
        const latest = [...list].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];
        const full = loadStrategyFromStorage(latest.id);
        if (full) {
          await persistSave(full.nodes as any, full.edges as any, full.id, full.name);
        }
      }
    } catch (e) {
      console.warn('Supabase save after import failed:', e);
    }
  };

  const handleDownloadTls = () => {
    setError(null);
    const obj = parseStrategy();
    if (!obj) return;

    const strategy = {
      id: obj.id || `imported-${Date.now()}`,
      name: nameOverride || obj.name || 'imported-strategy',
      nodes: obj.nodes,
      edges: obj.edges,
      created: obj.created || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      description: obj.description || 'Imported strategy',
    };

    try {
      exportSecureStrategy(strategy);
    } catch (e: any) {
      setError(e?.message || 'Failed to export .tls');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Strategy from JSON</CardTitle>
        <CardDescription>Admins can paste or upload JSON and either save the strategy or download a .tls file.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Optional strategy name override"
            value={nameOverride}
            onChange={(e) => setNameOverride(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFilePick}>Upload JSON</Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <Textarea
          placeholder="Paste strategy JSON here"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="min-h-[240px] font-mono text-sm"
        />

        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCreateStrategy}>Create Strategy</Button>
          <Button variant="secondary" onClick={handleDownloadTls}>Download .tls</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonToTlsTab;
