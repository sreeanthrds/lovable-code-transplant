import { useCallback, useEffect, useRef, useState } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import type { DiagnosticsExport, TradesDaily, Trade } from '@/types/backtest';

interface UseLiveReportV2Options {
  sessionId: string | null;
  enabled?: boolean;
  apiBaseUrl?: string | null;
}

interface UseLiveReportV2Result {
  tradesDaily: TradesDaily | null;
  diagnosticsExport: DiagnosticsExport | null;
  status: string;
  isConnected: boolean;
  error: string | null;
  refetch: () => void;
}

function dedupeTrades(trades: Trade[]): Trade[] {
  const map = new Map<string, Trade>();
  for (const t of trades) {
    const key = `${t.trade_id}::${t.re_entry_num}::${t.entry_time}::${t.exit_time}`;
    map.set(key, t);
  }
  return Array.from(map.values());
}

export function useLiveReportV2({ sessionId, enabled = true, apiBaseUrl = null }: UseLiveReportV2Options): UseLiveReportV2Result {
  const [tradesDaily, setTradesDaily] = useState<TradesDaily | null>(null);
  const [diagnosticsExport, setDiagnosticsExport] = useState<DiagnosticsExport | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reportUnsupportedRef = useRef(false);

  const apiBaseUrlRef = useRef<string>('');
  useEffect(() => {
    apiBaseUrlRef.current = apiBaseUrl || '';
  }, [apiBaseUrl]);

  const buildUrl = useCallback((path: string) => {
    const base = apiBaseUrlRef.current;
    if (!base) return path;
    const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${normalized}${path}`;
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const fetchReport = useCallback(async () => {
    if (!sessionId) return;

    try {
      const encoded = encodeURIComponent(sessionId);
      const fetchFromState = async () => {
        const stateRes = await fetch(buildUrl(`/api/v2/live/state/${encoded}?since=0`), {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (stateRes.status === 404) {
          setStatus('not_submitted');
          setError(null);
          return;
        }

        if (!stateRes.ok) {
          const text = await stateRes.text().catch(() => '');
          throw new Error(text || `HTTP ${stateRes.status}`);
        }

        const state = await stateRes.json();
        const td = state?.trades as TradesDaily | undefined;
        const diag = state?.diagnostics as any;

        if (td) {
          setTradesDaily(td);
        }

        if (diag?.events_history) {
          setDiagnosticsExport({ events_history: diag.events_history });
        } else {
          setDiagnosticsExport({ events_history: {} });
        }

        setStatus(String(state?.status || ''));
        setError(null);
        return;
      };

      if (reportUnsupportedRef.current) {
        await fetchFromState();
        return;
      }

      const res = await fetch(buildUrl(`/api/v2/live/report/${encoded}`), {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!res.ok && (res.status === 404 || res.status === 409)) {
        if (res.status === 404) {
          const text = await res.text().catch(() => '');
          const isSessionMissing = text.toLowerCase().includes('session not found');
          const isGenericNotFound = text.toLowerCase().includes('not found') && !isSessionMissing;

          if (isGenericNotFound) {
            reportUnsupportedRef.current = true;
          }
        }

        await fetchFromState();
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const td = data?.trades_daily as TradesDaily | undefined;
      const diag = data?.diagnostics_export as any;

      if (td) {
        setTradesDaily(td);
      }

      if (diag?.events_history) {
        setDiagnosticsExport({ events_history: diag.events_history });
      } else {
        setDiagnosticsExport({ events_history: {} });
      }

      setStatus(String(data?.status || ''));
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    }
  }, [sessionId, buildUrl]);

  // Initial fetch
  useEffect(() => {
    if (!enabled || !sessionId) return;
    fetchReport();
  }, [enabled, sessionId, fetchReport]);

  // SSE connection
  useEffect(() => {
    if (!enabled || !sessionId) {
      disconnect();
      return;
    }

    disconnect();
    setError(null);

    const streamUrl = buildUrl(`/api/v2/live/stream/${encodeURIComponent(sessionId)}`);

    const es = new EventSourcePolyfill(streamUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.addEventListener('initial_state', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);

        if (payload?.trades) {
          setTradesDaily(payload.trades as TradesDaily);
        }

        if (payload?.diagnostics?.events_history) {
          setDiagnosticsExport({ events_history: payload.diagnostics.events_history });
        }
      } catch {
        // ignore
      }
    });

    es.addEventListener('trade_update', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data);
        const trade: Trade | undefined = payload?.trade;
        const summary = payload?.summary;

        if (!trade) return;

        setTradesDaily((prev) => {
          const base: TradesDaily = prev || {
            date: '',
            summary: {
              total_trades: 0,
              total_pnl: '0',
              winning_trades: 0,
              losing_trades: 0,
              win_rate: '0'
            },
            trades: []
          };

          const nextTrades = dedupeTrades([...(base.trades || []), trade]);

          return {
            ...base,
            trades: nextTrades,
            summary: summary || base.summary
          };
        });
      } catch {
        // ignore
      }
    });

    es.addEventListener('node_events', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as Record<string, any>;
        if (!payload || typeof payload !== 'object') return;

        setDiagnosticsExport((prev) => {
          const base: DiagnosticsExport = prev || { events_history: {} };
          return {
            events_history: {
              ...(base.events_history || {}),
              ...payload
            }
          };
        });
      } catch {
        // ignore
      }
    });

    es.addEventListener('session_complete', () => {
      setStatus('completed');
      // Make sure we have latest full report snapshot
      fetchReport();
    });

    es.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [enabled, sessionId, disconnect, fetchReport, buildUrl]);

  return {
    tradesDaily,
    diagnosticsExport,
    status,
    isConnected,
    error,
    refetch: fetchReport
  };
}
