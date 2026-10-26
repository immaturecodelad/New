import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  Clock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  MessageSquare, 
  PlusCircle, 
  Send,
  Flag,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  Check,
  Edit3,
  Bot,
  Sparkles,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { Doubt, DoubtStatus, NavigationPage, DoubtReport, ReportStatus, Answer } from '../types/index.ts';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';
import { CSE_SUBJECTS, getSubjectConfig } from '../constants/subjects.ts';

interface TeacherDashboardProps {
  onSelectDoubt: (doubt: Doubt) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectDoubt, onNavigate }) => {
  const { isTeacher, isAdmin, role, switchDemoRole } = useAuth();
  const { doubts, reports, updateReportStatus, addAnswer, updateDoubtStatus, getAnswersForDoubt } = useDoubts();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics' | 'reports' | 'allowlist'>('queue');

  // Queue Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // AI Draft & Solution Editor State
  const [answeringDoubt, setAnsweringDoubt] = useState<Doubt | null>(null);
  const [aiDraftText, setAiDraftText] = useState<string>('');
  const [editableAnswer, setEditableAnswer] = useState<string>('');
  const [loadingAiDraft, setLoadingAiDraft] = useState<boolean>(false);
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Allowlist state
  const [allowlistAdmins, setAllowlistAdmins] = useState<string[]>([]);
  const [allowlistTeachers, setAllowlistTeachers] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'teacher' | 'admin'>('teacher');
  const [allowlistLoading, setAllowlistLoading] = useState(false);
  const [allowlistMessage, setAllowlistMessage] = useState<string | null>(null);

  // Load allowlist
  useEffect(() => {
    async function loadAllowlist() {
      try {
        const res = await fetch('/api/admin/allowlist');
        if (res.ok) {
          const data = await res.json();
          setAllowlistAdmins(data.admins || []);
          setAllowlistTeachers(data.teachers || []);
        }
      } catch (err) {
        console.warn('Could not load allowlist:', err);
      }
    }
    loadAllowlist();
  }, []);

  // When teacher opens answer composer for a doubt, load or generate AI draft
  const handleOpenAnswerModal = async (doubt: Doubt) => {
    setAnsweringDoubt(doubt);
    setLoadingAiDraft(true);
    setAiDraftText('');
    setEditableAnswer('');

    try {
      // 1. Check existing answers for this doubt
      const existingAnswers = await getAnswersForDoubt(doubt.id);
      const aiAns = existingAnswers.find(a => a.source === 'ai');

      if (aiAns && aiAns.answerText) {
        setAiDraftText(aiAns.answerText);
        setEditableAnswer(aiAns.answerText);
      } else {
        // 2. Generate instant AI draft on the fly
        const res = await fetch('/api/gemini/auto-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText: doubt.questionText,
            subject: doubt.subject
          })
        });
        if (res.ok) {
          const data = await res.json();
          const draft = data.answerText || '';
          setAiDraftText(draft);
          setEditableAnswer(draft);
        }
      }
    } catch (e) {
      console.warn('Could not fetch AI draft:', e);
    } finally {
      setLoadingAiDraft(false);
    }
  };

  // Publish teacher verified solution (approving draft or publishing edited solution)
  const handlePublishTeacherAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringDoubt || !editableAnswer.trim()) return;

    setSubmittingAnswer(true);
    try {
      // addAnswer saves as source='teacher', isVerified=true, status='answered'
      await addAnswer(answeringDoubt.id, editableAnswer.trim());
      setActionSuccessNotice(`Teacher-verified solution successfully published for doubt #${answeringDoubt.id}!`);
      setTimeout(() => setActionSuccessNotice(null), 5000);
      setAnsweringDoubt(null);
      setEditableAnswer('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAddAllowlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAllowlistLoading(true);
    setAllowlistMessage(null);
    try {
      const res = await fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole })
      });
      if (res.ok) {
        const data = await res.json();
        setAllowlistAdmins(data.admins);
        setAllowlistTeachers(data.teachers);
        setAllowlistMessage(`Successfully added ${newEmail} as ${newRole}!`);
        setNewEmail('');
      }
    } catch {
      setAllowlistMessage('Failed to update allowlist.');
    } finally {
      setAllowlistLoading(false);
    }
  };

  // BLOCKING CHECK FOR STUDENTS - Strict access control
  if (!isTeacher) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Teacher Portal Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            This dashboard is reserved for verified college faculty instructors and administrators. Student accounts cannot view teacher administrative controls, student identity logs, or moderation queues.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2.5">
          <span className="font-bold text-slate-800">Testing DoubtMate AI?</span>
          <p className="text-[11px] text-slate-500">
            You can switch your persona using the role switcher in the top navigation bar to test the Teacher Portal, or click below:
          </p>
          <button
            onClick={() => switchDemoRole('teacher')}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
          >
            Switch to Teacher Persona (Demo)
          </button>
        </div>
      </div>
    );
  }

  // Unique filter lists
  const availableSubjects = CSE_SUBJECTS.map(s => s.name);
  const availableTopics = Array.from(new Set(doubts.map(d => d.predictedTopic).filter(Boolean))).sort();

  // Filtered & Sorted Doubts: Unanswered First
  const queueDoubts = useMemo(() => {
    return doubts
      .filter(d => {
        if (subjectFilter !== 'all' && d.subject !== subjectFilter) return false;
        if (topicFilter !== 'all' && d.predictedTopic !== topicFilter) return false;
        if (statusFilter !== 'all') {
          if (statusFilter === 'unanswered' && d.status !== 'open') return false;
          if (statusFilter === 'needs_review' && d.status !== 'needs teacher review') return false;
          if (statusFilter === 'answered' && d.status !== 'answered') return false;
          if (statusFilter === 'resolved' && d.status !== 'resolved') return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Unanswered first: 'open' (priority 1), 'needs teacher review' (priority 2), 'answered' (priority 3), 'resolved' (priority 4)
        const getPriority = (status: DoubtStatus) => {
          if (status === 'open') return 1;
          if (status === 'needs teacher review') return 2;
          if (status === 'answered') return 3;
          return 4;
        };
        const pA = getPriority(a.status);
        const pB = getPriority(b.status);
        if (pA !== pB) return pA - pB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [doubts, subjectFilter, topicFilter, statusFilter]);

  const needsReviewCount = doubts.filter(d => d.status === 'needs teacher review').length;
  const unansweredCount = doubts.filter(d => d.status === 'open').length;

  // ANALYTICS & CHARTS DATA
  // Chart 1: Questions per Topic
  const questionsPerTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of doubts) {
      const key = d.predictedTopic && d.predictedTopic !== 'Topic uncertain' ? d.predictedTopic : d.subject;
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, [doubts]);

  // Chart 2: Answered vs Unanswered
  const statusDistribution = useMemo(() => {
    const answered = doubts.filter(d => d.status === 'answered' || d.status === 'resolved').length;
    const unanswered = doubts.filter(d => d.status === 'open').length;
    const needsReview = doubts.filter(d => d.status === 'needs teacher review').length;
    const total = doubts.length || 1;

    return {
      answered,
      unanswered,
      needsReview,
      total,
      answeredPct: Math.round((answered / total) * 100),
      unansweredPct: Math.round((unanswered / total) * 100),
      needsReviewPct: Math.round((needsReview / total) * 100)
    };
  }, [doubts]);

  // Chart 3: Most Common Topics This Week
  const commonTopicsThisWeek = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeekDoubts = doubts.filter(d => new Date(d.createdAt).getTime() >= sevenDaysAgo);
    const counts: Record<string, number> = {};
    for (const d of thisWeekDoubts) {
      const key = d.predictedTopic && d.predictedTopic !== 'Topic uncertain' ? d.predictedTopic : d.subject;
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [doubts]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Faculty Command & Verification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review student questions, view real student authors, edit AI drafts, and publish verified solutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Verified {role.toUpperCase()} Account</span>
          </span>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* High Priority Alert for "needs teacher review" */}
      {needsReviewCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-900">
                Action Required: {needsReviewCount} {needsReviewCount === 1 ? 'Doubt Needs' : 'Doubts Need'} Faculty Review
              </h4>
              <p className="text-xs text-amber-800">
                A student flagged an AI answer as uncertain or clicked "Ask a Teacher". Please verify and provide a solution.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('queue');
              setStatusFilter('needs_review');
            }}
            className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Filter Review Queue ({needsReviewCount})
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Doubts Queue (Unanswered First)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {doubts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Course Analytics & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Moderation List</span>
          {reports.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">
              {reports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('allowlist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'allowlist'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Role Allowlist</span>
        </button>
      </div>

      {/* TAB 1: QUEUE OF DOUBTS */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          
          {/* Transparency Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Faculty Transparency Mode: </span>
              <span>
                Even when students choose "Post Anonymously" (masking their name from classmates), verified teachers and admins can view their real name and college email below for academic safety and student support.
              </span>
            </div>
          </div>

          {/* Queue Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Queue Filters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Subject Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Filter by Subject
                </label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="all">All Subjects</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Filter by Predicted Topic
                </label>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="all">All Predicted Topics</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="all">All Statuses (Unanswered First)</option>
                  <option value="unanswered">Unanswered / Open ({unansweredCount})</option>
                  <option value="needs_review">Needs Teacher Review ({needsReviewCount})</option>
                  <option value="answered">Answered</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doubts List */}
          {queueDoubts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No doubts match current filters</h3>
              <p className="text-xs text-slate-500">Try clearing one of the filters above to see more questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueDoubts.map((doubt) => {
                const isNeedsReview = doubt.status === 'needs teacher review';

                return (
                  <div
                    key={doubt.id}
                    className={`p-6 rounded-3xl bg-white border shadow-xs space-y-4 transition-all ${
                      isNeedsReview
                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(() => {
                          const cfg = getSubjectConfig(doubt.subject);
                          const Icon = cfg.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${cfg.chipBg} ${cfg.chipText} border ${cfg.chipBorder}`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{doubt.subject}</span>
                            </span>
                          );
                        })()}
                        {doubt.subTopic ? (
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            • {doubt.subTopic}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {doubt.predictedTopic}
                          </span>
                        )}

                        {isNeedsReview ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Needs Teacher Review</span>
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            doubt.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doubt.status === 'answered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {doubt.status}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Asked {new Date(doubt.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Real Author Details (Visible only to teachers/admins) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${getAliasGradient(doubt.authorAlias)} text-white flex items-center justify-center font-bold text-xs`}>
                          {getAliasInitials(doubt.authorAlias)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>Real Student:</span>
                            <span className="text-indigo-950 font-black">{doubt.authorName || 'Registered Student'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {doubt.authorEmail || 'verified.student@college.edu'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Peer Alias:</span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-indigo-700 text-xs">
                          {doubt.authorAlias}
                        </span>
                        {doubt.isAnonymous ? (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Anonymous to Classmates
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {doubt.questionText}
                      </p>
                      {doubt.imageUrl && (
                        <div className="pt-2 space-y-1">
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
                            <img
                              src={doubt.imageUrl}
                              alt="Problem snapshot"
                              className="max-h-56 w-auto object-contain rounded-lg"
                            />
                          </div>
                          <a
                            href={doubt.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 font-semibold hover:underline inline-block"
                          >
                            Open full-resolution image in new tab ↗
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAnswerModal(doubt)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Review AI Draft & Answer</span>
                        </button>

                        <button
                          onClick={() => onSelectDoubt(doubt)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          View Thread & Answers
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateDoubtStatus(doubt.id, 'resolved')}
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COURSE ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Academic Engagement & Doubt Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Visual analysis across course topics, resolution statuses, and weekly trends
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CHART 1: Questions per Topic */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Questions per Topic
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {doubts.length} Total Doubts
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {questionsPerTopic.map(({ topic, count }) => {
                  const maxCount = Math.max(...questionsPerTopic.map(q => q.count), 1);
                  const barPercent = Math.round((count / maxCount) * 100);

                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                          {topic}
                        </span>
                        <span className="font-bold text-indigo-600 shrink-0">
                          {count} {count === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHART 2: Answered vs Unanswered */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Answered vs. Unanswered
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Resolution Breakdown
                </span>
              </div>

              {/* Status Metric Breakdown Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                  <div className="text-2xl font-black text-emerald-700">{statusDistribution.answered}</div>
                  <div className="text-[11px] font-bold text-emerald-900">Answered</div>
                  <div className="text-[10px] text-emerald-600">{statusDistribution.answeredPct}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-2xl font-black text-slate-700">{statusDistribution.unanswered}</div>
                  <div className="text-[11px] font-bold text-slate-800">Unanswered</div>
                  <div className="text-[10px] text-slate-500">{statusDistribution.unansweredPct}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="text-2xl font-black text-amber-700">{statusDistribution.needsReview}</div>
                  <div className="text-[11px] font-bold text-amber-900">Needs Review</div>
                  <div className="text-[10px] text-amber-600">{statusDistribution.needsReviewPct}%</div>
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${statusDistribution.answeredPct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Answered: ${statusDistribution.answeredPct}%`}
                  />
                  <div 
                    style={{ width: `${statusDistribution.needsReviewPct}%` }}
                    className="bg-amber-500 h-full transition-all duration-500"
                    title={`Needs Review: ${statusDistribution.needsReviewPct}%`}
                  />
                  <div 
                    style={{ width: `${statusDistribution.unansweredPct}%` }}
                    className="bg-slate-300 h-full transition-all duration-500"
                    title={`Unanswered: ${statusDistribution.unansweredPct}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* CHART 3: Most Common Topics This Week */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Most Common Topics This Week (Past 7 Days)
                  </h3>
                </div>
                <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Weekly Spike Monitor
                </span>
              </div>

              {commonTopicsThisWeek.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No questions logged in the last 7 days.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {commonTopicsThisWeek.map(({ topic, count }, i) => (
                    <div key={topic} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                          #{i + 1}
                        </span>
                        <span className="text-xs font-black text-purple-900 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                          {count} {count === 1 ? 'doubt' : 'doubts'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {topic}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: MODERATION LIST FOR ADMINS AND TEACHERS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <Flag className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Moderation Queue for Faculty & Admins: </span>
              <span>Review doubt flags submitted by students for academic integrity violations, spam, or inappropriate content.</span>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">Moderation Queue Clear</h3>
              <p className="text-xs text-slate-500">There are no pending flagged reports.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-rose-700">Doubt ID: {rep.doubtId}</span>
                    <span className={`capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === 'pending'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : rep.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      Status: {rep.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">
                    <span className="font-bold text-slate-900">Report Reason: </span>
                    {rep.reason}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Reported by: {rep.userId}</span>
                    <span>Date: {new Date(rep.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => updateReportStatus(rep.id, 'reviewed')}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Acknowledge & Mark Reviewed
                    </button>
                    <button
                      onClick={() => updateReportStatus(rep.id, 'dismissed')}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SERVER ROLE ALLOWLIST */}
      {activeTab === 'allowlist' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Server-Side Role Allowlist
            </h2>
            <p className="text-xs text-slate-500">
              Roles are authoritative on the Node.js server. When a user signs in via Google, their role is verified against these lists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Admin Allowlist ({allowlistAdmins.length})
              </span>
              <ul className="space-y-1 text-xs text-slate-700 font-mono">
                {allowlistAdmins.map((adm) => (
                  <li key={adm} className="p-2 rounded-xl bg-white border border-rose-100 font-medium flex items-center justify-between">
                    <span>{adm}</span>
                    <span className="text-[10px] text-rose-600 font-bold">Admin</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Teacher (Faculty) Allowlist ({allowlistTeachers.length})
              </span>
              <ul className="space-y-1 text-xs text-slate-700 font-mono">
                {allowlistTeachers.map((tea) => (
                  <li key={tea} className="p-2 rounded-xl bg-white border border-amber-100 font-medium flex items-center justify-between">
                    <span>{tea}</span>
                    <span className="text-[10px] text-amber-700 font-bold">Teacher</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form onSubmit={handleAddAllowlist} className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800">
              Add Email to Server Allowlist:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="faculty.member@doubtmate.edu"
                className="text-xs sm:text-sm p-3 rounded-xl border border-slate-200 flex-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'teacher' | 'admin')}
                className="text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="teacher">Teacher (Faculty)</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={allowlistLoading || !newEmail.trim()}
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {allowlistLoading ? 'Saving...' : 'Authorize Email'}
              </button>
            </div>
            {allowlistMessage && (
              <p className="text-xs text-emerald-600 font-bold mt-1">
                {allowlistMessage}
              </p>
            )}
          </form>
        </div>
      )}

      {/* AI DRAFT ANSWER REVIEW & APPROVAL MODAL */}
      {answeringDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-indigo-700 text-sm">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Faculty Solution Review & Verification</span>
              </div>
              <button
                onClick={() => setAnsweringDoubt(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 flex-1 pr-1">
              
              {/* Question summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Student Question &bull; {answeringDoubt.subject} ({answeringDoubt.predictedTopic}):
                  </span>
                  <span className="font-semibold text-indigo-600">
                    Author: {answeringDoubt.authorName || 'Student'} ({answeringDoubt.authorEmail || 'email'})
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm leading-relaxed">
                  {answeringDoubt.questionText}
                </p>
              </div>

              {/* AI Draft Answer banner */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-purple-900">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>AI Draft Answer (Editable)</span>
                  </span>
                  {loadingAiDraft ? (
                    <span className="text-[10px] text-purple-600 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Loading draft...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditableAnswer(aiDraftText)}
                      className="text-[10px] font-bold text-purple-700 hover:underline"
                    >
                      Reset to Original AI Draft
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  You can edit, refine, or completely replace this AI draft. Publishing will mark this solution as <span className="font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">source='teacher', isVerified=true</span>.
                </p>
              </div>

              {/* Editable Text Area */}
              <form onSubmit={handlePublishTeacherAnswer} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Verified Teacher Solution:</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {editableAnswer.length}/5000 characters
                    </span>
                  </label>
                  <textarea
                    value={editableAnswer}
                    onChange={(e) => setEditableAnswer(e.target.value)}
                    placeholder="Provide or approve the step-by-step solution..."
                    rows={8}
                    maxLength={5000}
                    className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditableAnswer('')}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Clear and Write Fresh
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAnsweringDoubt(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAnswer || editableAnswer.trim().length < 2}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all shadow-md hover:scale-[1.02]"
                    >
                      <Check className="w-4 h-4" />
                      <span>{submittingAnswer ? 'Publishing...' : 'Approve & Publish as Verified Teacher Answer'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
