import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, AlertTriangle, KeyRound, Info } from 'lucide-react';
import { tradelayoutClient as supabase } from '@/lib/supabase/tradelayout-client';

interface JwtDiagnostics {
  success: boolean;
  timestamp: string;
  token_info: {
    token_present: boolean;
    token_length: number;
    is_jwt_format: boolean;
  };
  decoded_claims: {
    sub: string | null;
    iss: string | null;
    aud: string | null;
    exp: string | null;
    iat: string | null;
    azp: string | null;
    role: string | null;
    all_claims: string[];
  } | null;
  clerk_user_extraction: {
    working: boolean;
    extracted_user_id: string | null;
    method: string;
  };
  supabase_native_auth: {
    user_recognized: boolean;
    user_id: string | null;
    user_error: string | null;
    note: string;
  };
  user_profile_lookup: {
    successful: boolean;
    profile_found: boolean;
    profile_data: any;
    error: string | null;
  };
  recommendations: string[];
  error?: string;
}

const JwtTestPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JwtDiagnostics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get Clerk token
      const clerk = (window as any).Clerk;
      if (!clerk?.session) {
        setError('No Clerk session found. Please ensure you are logged in.');
        setLoading(false);
        return;
      }

      const token = await clerk.session.getToken({ template: 'supabase' });
      if (!token) {
        setError('Failed to get Clerk token.');
        setLoading(false);
        return;
      }

      // Call the test edge function
      const { data, error: fnError } = await supabase.functions.invoke('test-clerk-jwt', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (fnError) {
        setError(`Edge function error: ${fnError.message}`);
        setLoading(false);
        return;
      }

      setResult(data as JwtDiagnostics);
    } catch (err: unknown) {
      const e = err as Error;
      setError(`Test failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ success }: { success: boolean }) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          JWT Integration Test
        </CardTitle>
        <CardDescription>
          Test if Clerk JWT tokens can be used to identify users in the backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Run JWT Integration Test'
          )}
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="space-y-6">
              {/* Token Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Token Information
                  <StatusIcon success={result.token_info?.token_present} />
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Token Present:</span>
                  <Badge variant={result.token_info?.token_present ? 'default' : 'destructive'}>
                    {result.token_info?.token_present ? 'Yes' : 'No'}
                  </Badge>
                  <span className="text-muted-foreground">Token Length:</span>
                  <span>{result.token_info?.token_length}</span>
                  <span className="text-muted-foreground">JWT Format:</span>
                  <Badge variant={result.token_info?.is_jwt_format ? 'default' : 'destructive'}>
                    {result.token_info?.is_jwt_format ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
              </div>

              {/* Decoded Claims */}
              {result.decoded_claims && (
                <div>
                  <h3 className="font-semibold mb-2">Decoded JWT Claims</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Subject (sub):</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded break-all">
                      {result.decoded_claims.sub || 'N/A'}
                    </code>
                    <span className="text-muted-foreground">Issuer (iss):</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded break-all">
                      {result.decoded_claims.iss || 'N/A'}
                    </code>
                    <span className="text-muted-foreground">Audience (aud):</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded break-all">
                      {result.decoded_claims.aud || 'N/A'}
                    </code>
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="outline">{result.decoded_claims.role || 'N/A'}</Badge>
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{result.decoded_claims.exp || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Clerk User Extraction - THE KEY RESULT */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Clerk User ID Extraction
                  <StatusIcon success={result.clerk_user_extraction?.working} />
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Extraction Working:</span>
                  <Badge variant={result.clerk_user_extraction?.working ? 'default' : 'destructive'}>
                    {result.clerk_user_extraction?.working ? 'Yes' : 'No'}
                  </Badge>
                  <span className="text-muted-foreground">User ID:</span>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded break-all font-bold">
                    {result.clerk_user_extraction?.extracted_user_id || 'Not available'}
                  </code>
                  <span className="text-muted-foreground">Method:</span>
                  <span className="text-xs">{result.clerk_user_extraction?.method}</span>
                </div>
              </div>

              {/* User Profile Lookup */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  User Profile Lookup
                  <StatusIcon success={result.user_profile_lookup?.profile_found} />
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Profile Found:</span>
                  <Badge variant={result.user_profile_lookup?.profile_found ? 'default' : 'secondary'}>
                    {result.user_profile_lookup?.profile_found ? 'Yes' : 'No'}
                  </Badge>
                  {result.user_profile_lookup?.profile_data && (
                    <>
                      <span className="text-muted-foreground">Email:</span>
                      <span>{result.user_profile_lookup.profile_data.email}</span>
                      <span className="text-muted-foreground">Name:</span>
                      <span>{result.user_profile_lookup.profile_data.first_name || 'N/A'}</span>
                    </>
                  )}
                  {result.user_profile_lookup?.error && (
                    <>
                      <span className="text-muted-foreground">Error:</span>
                      <span className="text-destructive text-xs">{result.user_profile_lookup.error}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Supabase Native Auth - Expected to fail */}
              <div className="opacity-60">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Supabase Native Auth (auth.uid)
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {result.supabase_native_auth?.note}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Recognized:</span>
                  <Badge variant="secondary">
                    {result.supabase_native_auth?.user_recognized ? 'Yes' : 'No (Expected)'}
                  </Badge>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    Results
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className={`text-sm p-2 rounded ${
                        rec.startsWith('✅') 
                          ? 'bg-green-500/10 border border-green-500/20' 
                          : rec.startsWith('⚠️')
                          ? 'bg-yellow-500/10 border border-yellow-500/20'
                          : 'bg-blue-500/10 border border-blue-500/20'
                      }`}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Summary</h3>
                {result.clerk_user_extraction?.working ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 inline mr-2" />
                    <strong>Clerk integration is working!</strong> User ID can be extracted from JWT tokens.
                    Edge functions can use this to authorize database operations.
                  </div>
                ) : (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
                    <XCircle className="h-4 w-4 text-destructive inline mr-2" />
                    <strong>Unable to extract user ID from JWT.</strong> Check if the Clerk JWT template is configured correctly.
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default JwtTestPanel;
