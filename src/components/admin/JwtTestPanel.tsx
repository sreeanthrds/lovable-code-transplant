import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, AlertTriangle, KeyRound, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppAuth } from '@/contexts/AuthContext';

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
    aud: string | null;
    exp: string | null;
    iat: string | null;
    role: string | null;
    all_claims: string[];
  } | null;
  user_info: {
    user_id: string | null;
    email: string | null;
    phone: string | null;
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
  const { session, user } = useAppAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JwtDiagnostics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!session?.access_token) {
        setError('No Supabase session found. Please ensure you are logged in.');
        setLoading(false);
        return;
      }

      // Build diagnostic result from Supabase session
      const token = session.access_token;
      const isJwtFormat = token.split('.').length === 3;

      // Decode JWT to get claims
      let decodedClaims = null;
      if (isJwtFormat) {
        try {
          const payloadPart = token.split('.')[1];
          const decoded = JSON.parse(atob(payloadPart));
          decodedClaims = {
            sub: decoded.sub || null,
            aud: decoded.aud || null,
            exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
            iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
            role: decoded.role || null,
            all_claims: Object.keys(decoded),
          };
        } catch (e) {
          console.error('Error decoding JWT:', e);
        }
      }

      // Check user profile in database
      let profileLookup = {
        successful: false,
        profile_found: false,
        profile_data: null as any,
        error: null as string | null,
      };

      if (user?.id) {
        try {
          // Use any to bypass complex type instantiation
          const client = supabase as any;
          const { data: profile, error: profileError } = await client
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          profileLookup = {
            successful: !profileError,
            profile_found: !!profile,
            profile_data: profile,
            error: profileError?.message || null,
          };
        } catch (e: any) {
          profileLookup.error = e.message;
        }
      }

      const diagnosticResult: JwtDiagnostics = {
        success: true,
        timestamp: new Date().toISOString(),
        token_info: {
          token_present: !!token,
          token_length: token.length,
          is_jwt_format: isJwtFormat,
        },
        decoded_claims: decodedClaims,
        user_info: {
          user_id: user?.id || null,
          email: user?.email || null,
          phone: user?.phone || null,
        },
        user_profile_lookup: profileLookup,
        recommendations: [],
      };

      // Add recommendations
      if (!profileLookup.profile_found) {
        diagnosticResult.recommendations.push('No user profile found. Consider creating one.');
      }

      setResult(diagnosticResult);
    } catch (err: any) {
      console.error('Test error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ success }: { success: boolean }) => 
    success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Supabase Auth Diagnostics
        </CardTitle>
        <CardDescription>
          Test your Supabase authentication and profile lookup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            'Run Auth Test'
          )}
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Error</span>
            </div>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {/* Overall Status */}
              <div className="flex items-center gap-2">
                <StatusIcon success={result.success} />
                <span className="font-medium">Overall Status:</span>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </Badge>
              </div>

              {/* Token Info */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Token Info
                </h4>
                <div className="pl-6 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusIcon success={result.token_info.token_present} />
                    <span>Token Present: {String(result.token_info.token_present)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={result.token_info.is_jwt_format} />
                    <span>JWT Format: {String(result.token_info.is_jwt_format)}</span>
                  </div>
                  <div>Token Length: {result.token_info.token_length}</div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <h4 className="font-medium">User Info</h4>
                <div className="pl-6 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusIcon success={!!result.user_info.user_id} />
                    <span>User ID: {result.user_info.user_id || 'N/A'}</span>
                  </div>
                  <div>Email: {result.user_info.email || 'N/A'}</div>
                  <div>Phone: {result.user_info.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Decoded Claims */}
              {result.decoded_claims && (
                <div className="space-y-2">
                  <h4 className="font-medium">JWT Claims</h4>
                  <div className="pl-6 space-y-1 text-sm">
                    <div>Subject (sub): {result.decoded_claims.sub || 'N/A'}</div>
                    <div>Audience (aud): {result.decoded_claims.aud || 'N/A'}</div>
                    <div>Role: {result.decoded_claims.role || 'N/A'}</div>
                    <div>Expires: {result.decoded_claims.exp || 'N/A'}</div>
                    <div>Issued At: {result.decoded_claims.iat || 'N/A'}</div>
                    <div>All Claims: {result.decoded_claims.all_claims.join(', ')}</div>
                  </div>
                </div>
              )}

              {/* Profile Lookup */}
              <div className="space-y-2">
                <h4 className="font-medium">Profile Lookup</h4>
                <div className="pl-6 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusIcon success={result.user_profile_lookup.successful} />
                    <span>Query Successful: {String(result.user_profile_lookup.successful)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={result.user_profile_lookup.profile_found} />
                    <span>Profile Found: {String(result.user_profile_lookup.profile_found)}</span>
                  </div>
                  {result.user_profile_lookup.error && (
                    <div className="text-red-500">Error: {result.user_profile_lookup.error}</div>
                  )}
                  {result.user_profile_lookup.profile_data && (
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.user_profile_lookup.profile_data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Recommendations
                  </h4>
                  <ul className="pl-6 list-disc text-sm space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default JwtTestPanel;
