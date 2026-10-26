import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { Doubt } from '../types/index.ts';

interface ReportModalProps {
  doubt: Doubt;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ doubt, onClose }) => {
  const { submitReport } = useDoubts();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedReasons = [
    'Contains offensive language or personal attacks',
    'Academic dishonesty / asking for live exam solutions',
    'Spam, advertising, or irrelevant content',
    'Leaking someone\'s private personally identifiable information'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the report.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReport(doubt.id, reason.trim());
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
            <Flag className="w-5 h-5" />
            <span>Report Content to Faculty</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Report Submitted</h3>
            <p className="text-sm text-slate-600">
              Thank you for keeping our college learning space safe. Course moderators will review this promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Flagging Doubt
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-medium line-clamp-2 border border-slate-200">
                "{doubt.questionText}"
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Common Flag Reasons:
              </label>
              <div className="space-y-1.5">
                {predefinedReasons.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setReason(r)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                      reason === r
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Reason:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this content violates academic integrity or community guidelines..."
                rows={3}
                maxLength={500}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              />
              <div className="text-[11px] text-slate-400 text-right mt-1">
                {reason.length}/500
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
