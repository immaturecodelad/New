import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  EyeOff, 
  RefreshCw, 
  PlusCircle, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Award,
  Sparkles,
  Lightbulb,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { Doubt, NavigationPage, QuizResult } from '../types/index.ts';
import { generateRandomAlias, getAliasGradient, getAliasInitials } from '../utils/alias.ts';

interface StudentDashboardProps {
  onSelectDoubt: (doubt: Doubt) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onSelectDoubt, onNavigate }) => {
  const { user, profile, updateAlias, role } = useAuth();
  const { doubts } = useDoubts();

  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'answered' | 'resolved'>('all');
  const [regenerating, setRegenerating] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const currentUserId = user ? user.uid : (profile ? profile.id : 'student_seed_01');
  const currentAlias = profile?.alias || 'Curious Panda 42';

  // Load Quiz Results for current student
  useEffect(() => {
    async function loadQuizResults() {
      const local: QuizResult[] = JSON.parse(localStorage.getItem('doubtmate_quiz_results') || '[]');
      
      if (user) {
        try {
          const q = query(
            collection(db, 'quizResults'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const remote: QuizResult[] = snap.docs.map(d => ({
              id: d.id,
              ...(d.data() as Omit<QuizResult, 'id'>)
            }));
            setQuizResults(remote);
            return;
          }
        } catch {
          // Fallback to local
        }
      }

      // If local is empty, provide realistic demo practice results for initial guidance
      if (local.length === 0) {
        const demoResults: QuizResult[] = [
          {
            id: 'demo-quiz-1',
            userId: currentUserId,
            topic: 'Operating Systems',
            difficulty: 'Medium',
            score: 2,
            total: 5,
            percentage: 40,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          },
          {
            id: 'demo-quiz-2',
            userId: currentUserId,
            topic: 'DBMS',
            difficulty: 'Easy',
            score: 4,
            total: 5,
            percentage: 80,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
          }
        ];
        setQuizResults(demoResults);
      } else {
        setQuizResults(local);
      }
    }

    loadQuizResults();
  }, [user, currentUserId]);

  // Filter doubts authored by this student
  const myDoubts = doubts.filter((d) => {
    if (user) return d.userId === user.uid;
    return d.userId === currentUserId || d.authorAlias === currentAlias || d.userId.startsWith('student_seed');
  });

  const filteredMyDoubts = myDoubts.filter((d) => {
    if (activeTab === 'all') return true;
    return d.status === activeTab;
  });

  const openCount = myDoubts.filter((d) => d.status === 'open' || d.status === 'needs teacher review').length;
  const answeredCount = myDoubts.filter((d) => d.status === 'answered').length;
  const resolvedCount = myDoubts.filter((d) => d.status === 'resolved').length;

  // Compute "Recommended revision" based on recent doubts & low quiz scores
  const revisionRecommendations = useMemo(() => {
    const list: Array<{
      topic: string;
      reason: string;
      type: 'quiz_low' | 'doubt_open' | 'concept_review';
      suggestion: string;
      actionTopic: string;
    }> = [];

    // 1. Check for low quiz scores (< 70%)
    const lowQuizzes = quizResults.filter(q => (q.score / q.total) < 0.7);
    for (const q of lowQuizzes) {
      if (!list.some(item => item.topic === q.topic)) {
        list.push({
          topic: q.topic,
          reason: `Practice quiz score: ${q.score}/${q.total} (${Math.round((q.score / q.total) * 100)}%)`,
          type: 'quiz_low',
          suggestion: `You might want to review foundational ${q.topic} principles before midterms. Focus on core derivations, time complexity bounds, and common pitfalls.`,
          actionTopic: q.topic
        });
      }
    }

    // 2. Check for recent doubts asked by the student
    for (const d of myDoubts) {
      const topicName = d.predictedTopic && d.predictedTopic !== 'Topic uncertain' 
        ? d.predictedTopic 
        : d.subject;

      if (!list.some(item => item.topic === topicName || item.topic === d.subject)) {
        list.push({
          topic: topicName,
          reason: `Recent doubt asked in ${d.subject}${d.status === 'needs teacher review' ? ' • Marked for faculty review' : ''}`,
          type: 'doubt_open',
          suggestion: `Based on your recent question on "${d.questionText.slice(0, 65)}...", you may want to revisit the underlying theoretical proof or code walk-through.`,
          actionTopic: d.subject
        });
      }
    }

    // Fallback if no low scores or doubts
    if (list.length === 0) {
      list.push({
        topic: 'Operating Systems & Paging',
        reason: 'Recommended for undergraduate exam readiness',
        type: 'concept_review',
        suggestion: 'Strengthen your grasp of virtual memory, page tables, TLBs, and deadlock prevention algorithms.',
        actionTopic: 'Operating Systems'
      });
      list.push({
        topic: 'Discrete Mathematics & Graph Theory',
        reason: 'Common challenging college coursework topic',
        type: 'concept_review',
        suggestion: 'Review Bayesian probability, graph traversal invariants, and recurrence relation solutions.',
        actionTopic: 'Mathematics'
      });
    }

    return list.slice(0, 3);
  }, [quizResults, myDoubts]);

  const handleRegenerateAlias = async () => {
    setRegenerating(true);
    const newAlias = generateRandomAlias();
    await updateAlias(newAlias);
    setTimeout(() => setRegenerating(false), 400);
  };


  return (
    <div className="space-y-8 pb-16">
      
      {/* Student Profile & Alias Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${getAliasGradient(currentAlias)} text-white flex items-center justify-center font-extrabold text-lg shadow-md`}>
              {getAliasInitials(currentAlias)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {currentAlias}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {role} Account
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your anonymous scholar pseudonym for questions</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerateAlias}
              disabled={regenerating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/15 backdrop-blur-xs transition-all active:scale-95"
              title="Roll a new random alias (e.g. Curious Panda 42)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Alias</span>
            </button>
          </div>
        </div>

        {/* Privacy Shield Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Student Zero-Exposure Guarantee</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              In the Community Doubts feed, fellow classmates only ever see "{currentAlias}". Your real email ({profile?.email || 'authenticated user'}) and full name are strictly protected by Firestore security rules.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-extrabold text-white">{myDoubts.length}</div>
            <div className="text-[11px] text-indigo-200">Total Doubts</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-extrabold text-amber-300">{openCount}</div>
            <div className="text-[11px] text-indigo-200">Open Questions</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-extrabold text-blue-300">{answeredCount}</div>
            <div className="text-[11px] text-indigo-200">Faculty Answers</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-extrabold text-emerald-300">{resolvedCount}</div>
            <div className="text-[11px] text-indigo-200">Concepts Resolved</div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED REVISION (Worded as a suggestion based on recent doubts & low quiz scores) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Personalized Study Guidance</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Recommended Revision
            </h2>
            <p className="text-xs text-slate-500">
              Suggestions formulated from your recent doubts and low quiz scores to target your weakest areas
            </p>
          </div>

          <button
            onClick={() => onNavigate('quiz')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
          >
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>Practice Another Quiz</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {revisionRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {rec.topic}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    rec.type === 'quiz_low' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {rec.type === 'quiz_low' ? <AlertCircle className="w-3 h-3 text-amber-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
                    <span>{rec.type === 'quiz_low' ? 'Quiz Focus' : 'Doubt Context'}</span>
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-500">
                  {rec.reason}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {rec.suggestion}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onNavigate('quiz')}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Brain className="w-3 h-3" />
                  <span>Practice Quiz</span>
                </button>
                <button
                  onClick={() => onNavigate('tutor')}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>AI Tutor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Doubts Tabs & List */}
      <div className="space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              My Doubts & Discussions
            </h2>
            <p className="text-xs text-slate-500">
              Track questions you have submitted and review faculty solutions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'open', 'answered', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('ask')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Doubt</span>
            </button>
          </div>
        </div>

        {filteredMyDoubts.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Doubts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'all'
                ? "You haven't asked any doubts yet. Post your first question anonymously!"
                : `No doubts with status '${activeTab}'.`}
            </p>
            <button
              onClick={() => onNavigate('ask')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-xs hover:bg-indigo-700"
            >
              Ask a Doubt Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMyDoubts.map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => onSelectDoubt(doubt)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                      {doubt.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      doubt.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doubt.status === 'answered'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doubt.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed">
                    {doubt.questionText}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] text-slate-400">
                    Asked {new Date(doubt.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-indigo-600 font-semibold text-xs">
                    {doubt.answersCount ? `${doubt.answersCount} Faculty Solution` : 'Pending Solution'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
