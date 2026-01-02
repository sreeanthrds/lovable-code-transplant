import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DecryptionInstructions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decryption Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <h4 className="font-medium">File Decryption:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li><strong>.tls files:</strong> Admin-only encrypted strategy files</li>
            <li>Upload files or paste encrypted data to decrypt</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium">Database Access:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Access any user's strategies directly from localStorage</li>
            <li>Select user first, then choose from their available strategies</li>
            <li>No decryption needed - strategies are stored as plain JSON</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium">Supabase Database:</h4>
          <p className="text-muted-foreground">
            Strategies in Supabase are stored as plain JSON in the 
            <code className="bg-muted px-1 rounded"> strategy</code> column. No decryption needed for direct database access.
          </p>
        </div>

        <div>
          <h4 className="font-medium">Access Control:</h4>
          <p className="text-muted-foreground">
            Only admin users can access these decryption and strategy loading tools. This ensures data security and controlled access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};