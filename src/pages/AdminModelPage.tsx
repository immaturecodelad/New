import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  BrainCircuit, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  HelpCircle,
  TrendingUp,
  Cpu,
  Target,
  ArrowRight,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { NavigationPage } from '../types/index.ts';

interface ModelMetrics {
  datasetSize: number;
  trainSize: number;
  testSize: number;
  categoryCounts: Record<string, number>;
  splitMethod: string;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  perClassMetrics: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
  trainedAt: string;
}

interface PredictionTestResult {
  predictedTopic: string;
  topicConfidence: number;
  isUncertain: boolean;
  displayBadge: string;
  allProbabilities: Record<string, number>;
}

interface AdminModelPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AdminModelPage: React.FC<AdminModelPageProps> = ({ onNavigate }) => {
  const { isTeacher, role, switchDemoRole } = useAuth();
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  // Playground test state
  const [testText, setTestText] = useState('How does virtual memory paging translate logical addresses using the TLB?');
  const [testResult, setTestResult] = useState<PredictionTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/model-metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.warn('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainSuccess(false);
    try {
      const res = await fetch('/api/admin/retrain-model', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setRetrainSuccess(true);
        setTimeout(() => setRetrainSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetraining(false);
    }
  };

  const handleRunPredictionTest = async (textToRun?: string) => {
    const query = (textToRun || testText).trim();
    if (!query) return;
    setTesting(true);
    try {
      const res = await fetch('/api/classifier/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    handleRunPredictionTest();
  }, []);

  // Access control check: Only Admin and Teacher
  if (!isTeacher) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            Staff Only: Model Administration Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The doubt classifier training analytics and confusion matrix are accessible only to faculty and admins.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
          <span className="font-bold text-slate-800">Testing DoubtMate AI?</span>
          <p className="text-[11px] text-slate-500">
            Switch your role to Teacher or Admin in the navigation bar or below to review the model evaluation dashboard:
          </p>
          <button
            onClick={() => switchDemoRole('admin')}
            className="w-full py-2 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
          >
            Switch to Admin Persona
          </button>
        </div>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading model metrics and confusion matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              TF-IDF + Softmax Regression
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Preliminary results (small dataset)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doubt Classifier Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Server-side multinomial logistic regression model trained from scratch with stratified 80/20 train/test evaluation.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Retraining Model...' : 'Retrain Model'}</span>
        </button>
      </div>

      {retrainSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Model retrained and weights updated in <code>server/ml/model_weights.json</code>!</span>
        </div>
      )}

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Test Accuracy (Held-Out)
          </span>
          <div className="text-3xl font-black text-indigo-600">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">
            Evaluated on {metrics.testSize} test questions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Macro F1-Score
          </span>
          <div className="text-3xl font-black text-purple-600">
            {metrics.macroF1.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500">
            Harmonic mean across all {Object.keys(metrics.categoryCounts).length} classes
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Dataset Size
          </span>
          <div className="text-3xl font-black text-slate-800">
            {metrics.datasetSize}
          </div>
          <span className="text-[10px] text-slate-500">
            {metrics.trainSize} train • {metrics.testSize} test
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Uncertainty Threshold
          </span>
          <div className="text-3xl font-black text-amber-600">
            &lt; 0.40
          </div>
          <span className="text-[10px] text-slate-500">
            Flags question as "Topic uncertain"
          </span>
        </div>
      </div>

      {/* Split Method & Preliminary Results Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Preliminary results (small dataset):</span>
        </div>
        <p className="text-[11px] text-amber-900/90 leading-relaxed pl-6">
          Evaluation computed using <strong>{metrics.splitMethod}</strong>. The dataset contains {metrics.datasetSize} total labelled questions across {Object.keys(metrics.categoryCounts).length} CSE core subjects.
        </p>
      </div>

      {/* Category Counts Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Dataset Distribution Across {Object.keys(metrics.categoryCounts).length} CSE Categories</span>
          </h2>
          <span className="text-xs text-slate-500">
            Balanced {Object.values(metrics.categoryCounts)[0] || 22} items per domain
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(metrics.categoryCounts).map(([cat, count]) => (
            <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-xs font-bold text-slate-800 line-clamp-1" title={cat}>
                {cat}
              </span>
              <div className="text-lg font-black text-indigo-600">{count}</div>
              <span className="text-[10px] text-slate-400">questions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Class Precision, Recall, F1 Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Per-Class Metrics on Held-Out Test Set (20%)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject Category</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">Test Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(metrics.perClassMetrics).map(([cat, score]) => (
                <tr key={cat} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800">{cat}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                    {(score.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-purple-600">
                    {(score.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                    {score.f1.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {score.support} samples
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/80 font-bold">
                <td className="py-3 px-4 text-slate-900">Macro Average</td>
                <td className="py-3 px-4 font-mono text-indigo-700">
                  {(metrics.macroPrecision * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 font-mono text-purple-700">
                  {(metrics.macroRecall * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 font-mono text-emerald-700">
                  {metrics.macroF1.toFixed(3)}
                </td>
                <td className="py-3 px-4 text-slate-700 font-mono">
                  {metrics.testSize} total
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="space-y-1">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Confusion Matrix (Held-Out Test Set)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Rows correspond to actual true topic labels; columns correspond to model predictions.
          </p>
        </div>

        <div className="overflow-x-auto pt-2">
          <div className="inline-block min-w-full">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-slate-400 font-normal">True \ Pred</th>
                  {metrics.confusionMatrix.labels.map((lbl) => (
                    <th key={lbl} className="p-2 font-bold text-slate-700 text-center max-w-[100px] truncate" title={lbl}>
                      {lbl.length > 10 ? `${lbl.slice(0, 10)}.` : lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.confusionMatrix.matrix.map((row, rIdx) => {
                  const trueLabel = metrics.confusionMatrix.labels[rIdx];
                  return (
                    <tr key={trueLabel}>
                      <td className="p-2 font-bold text-slate-700 whitespace-nowrap text-right pr-4">
                        {trueLabel}
                      </td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className={`p-3 text-center font-mono font-bold border border-slate-200/80 transition-colors ${
                              isDiagonal
                                ? val > 0
                                  ? 'bg-emerald-100 text-emerald-900 font-black'
                                  : 'bg-emerald-50 text-emerald-700'
                                : val > 0
                                ? 'bg-rose-50 text-rose-700 font-semibold'
                                : 'bg-slate-50 text-slate-400'
                            }`}
                            title={`True: ${trueLabel}, Predicted: ${metrics.confusionMatrix.labels[cIdx]} (${val})`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real-time Classification Interactive Playground */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Real-Time Inference Playground</span>
            </h2>
            <p className="text-xs text-slate-500">
              Type or paste any student question to test the live TF-IDF vectorizer and softmax probabilities
            </p>
          </div>
        </div>

        {/* Quick sample buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'How does the virtual memory page table translate addresses in OS?',
            'What is the difference between BCNF and 3NF functional dependencies in DBMS?',
            'How to implement double-checked locking in singleton pattern in Java?',
            'Why do deep convolutional networks use ReLU over Sigmoid activations?',
            'What is the geometric meaning of eigenvalues in 3D linear transformations?',
            'Difference between TCP slow start and congestion avoidance algorithms?'
          ].map((sample, sIdx) => (
            <button
              key={sIdx}
              onClick={() => {
                setTestText(sample);
                handleRunPredictionTest(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] font-medium transition-colors"
            >
              Sample {sIdx + 1}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={3}
              placeholder="Type any student question..."
              className="w-full text-xs sm:text-sm p-3.5 pr-20 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-slate-800"
            />
            <button
              onClick={() => handleRunPredictionTest()}
              disabled={testing || !testText.trim()}
              className="absolute right-3 bottom-3.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <span>{testing ? 'Testing...' : 'Classify'}</span>
              <Send className="w-3 h-3" />
            </button>
          </div>

          {/* Test Prediction Outcome */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Predicted Topic:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                    testResult.isUncertain
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {testResult.isUncertain && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{testResult.predictedTopic}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Confidence:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(testResult.topicConfidence * 100).toFixed(1)}%
                  </span>
                  {testResult.isUncertain && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                      Below 0.45 threshold
                    </span>
                  )}
                </div>
              </div>

              {/* All Category Probability Bars */}
              <div className="space-y-2 pt-2 border-t border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Softmax Probability Distribution Across Classes:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(testResult.allProbabilities).map(([category, prob]) => {
                    const pct = Math.round(prob * 100);
                    const isWinner = category === testResult.predictedTopic && !testResult.isUncertain;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-semibold ${isWinner ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                            {category}
                          </span>
                          <span className="font-mono font-semibold text-slate-700">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isWinner ? 'bg-indigo-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
