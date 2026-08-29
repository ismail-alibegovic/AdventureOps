import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { X, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface TestSuiteModalProps {
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ onClose }) => {
  const [running, setRunning] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    try {
      setRunning(true);
      setError(null);
      const res = await apiClient.runTests();
      setResults(res);
    } catch (err: any) {
      setError(err.message || 'Failed to run test suite');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-md">
      <div className="bg-[#0E1A17] border border-[#1F332C] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F332C] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#081210] border border-[#1F332C] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Sistem Test Suite & Atomic Concurrency Tester
              </h3>
              <p className="text-xs text-slate-400">
                Automatska provjera transakcijskog integriteta, kalkulacije cijena i zaštite od prepunjavanja.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#13211D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Summary bar */}
        <div className="flex items-center justify-between bg-[#081210] border border-[#1F332C] rounded-2xl p-4">
          {results ? (
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 block">Ukupno testova:</span>
                <span className="text-sm font-bold text-white font-display">{results.summary.total}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Uspješno:</span>
                <span className="text-sm font-bold text-emerald-400 font-display">
                  {results.summary.passed} PASSED
                </span>
              </div>
              {results.summary.failed > 0 && (
                <div>
                  <span className="text-slate-400 block">Neuspješno:</span>
                  <span className="text-sm font-bold text-rose-400 font-display">
                    {results.summary.failed} FAILED
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block">Vrijeme izvršenja:</span>
                <span className="text-sm font-bold text-slate-300 font-mono">
                  {results.summary.duration_ms} ms
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Pokretanje testova u toku...</span>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={runTests}
            disabled={running}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />}
          >
            {running ? 'Testiram...' : 'Pokreni Ponovo'}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Test List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {running && !results && (
            <div className="py-12 text-center text-emerald-400 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400 mx-auto" />
              <p className="text-xs text-slate-400">Izvršavam paralelne transakcije i verifikaciju...</p>
            </div>
          )}

          {results?.tests.map((t: any) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-4 ${
                t.status === 'passed'
                  ? 'bg-[#081210] border-[#1F332C] text-slate-200'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {t.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm font-display">{t.name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#0E1A17] border border-[#1F332C] text-slate-400 text-[10px]">
                      {t.category}
                    </span>
                  </div>
                  {t.message && (
                    <p className="mt-1 font-mono text-[11px] text-rose-300 bg-rose-950/80 p-2 rounded-lg border border-rose-800/80">
                      {t.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-slate-400 text-[11px]">{t.duration_ms} ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
