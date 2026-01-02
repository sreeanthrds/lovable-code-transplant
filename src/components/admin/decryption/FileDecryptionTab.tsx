import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

interface FileDecryptionTabProps {
  encryptedData: string;
  setEncryptedData: (data: string) => void;
  onDecrypt: () => void;
  loading: boolean;
  setError: (error: string) => void;
}

export const FileDecryptionTab: React.FC<FileDecryptionTabProps> = ({
  encryptedData,
  setEncryptedData,
  onDecrypt,
  loading,
  setError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setEncryptedData(text);
      setError('');
    } catch (error) {
      setError('Failed to read file');
    }
  };

  return (
    <>
      {/* File Upload */}
      <div>
        <Label htmlFor="file-upload">Upload Encrypted File</Label>
        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".tls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Manual Input */}
      <div>
        <Label htmlFor="encrypted-data">Or Paste Encrypted Data</Label>
        <Textarea
          id="encrypted-data"
          value={encryptedData}
          onChange={(e) => setEncryptedData(e.target.value)}
          placeholder="Paste encrypted strategy data here..."
          rows={6}
          className="mt-1"
        />
      </div>

      {/* Decrypt Button */}
      <Button
        onClick={onDecrypt}
        disabled={!encryptedData.trim() || loading}
        className="w-full"
      >
        {loading ? 'Decrypting...' : 'Decrypt Strategy'}
      </Button>
    </>
  );
};