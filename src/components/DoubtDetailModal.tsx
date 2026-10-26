import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  User, 
  ShieldAlert, 
  Send, 
  Award, 
  BookOpen, 
  Flag, 
  EyeOff, 
  CheckCheck,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Languages,
  UserCheck,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { Doubt, Answer } from '../types/index.ts';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';
import { ReportModal } from './ReportModal.tsx';
import { SimilarDoubtsPanel } from './SimilarDoubtsPanel.tsx';
import { findSimilarDoubts } from '../utils/similarity.ts';

interface DoubtDetailModalProps {
  doubt: Doubt;
  onClose: () => void;
  onSelectDoubt?: (newDoubt: Doubt) => void;
}

export const DoubtDetailModal: React.FC<DoubtDetailModalProps> = ({ doubt: initialDoubt, onClose, onSelectDoubt }) => {
  const { 
    doubts,
    getAnswersForDoubt, 
    addAnswer, 
    updateDoubtStatus, 
    rateAnswer, 
    requestTeacherReview,
    modifyAIAnswer 
  } = useDoubts();
  const { user, profile, isTeacher, role } = useAuth();

  const [doubt, setDoubt] = useState<Doubt>(initialDoubt);

  useEffect(() => {
    setDoubt(initialDoubt);
  }, [initialDoubt]);

  const hasQualifyingSimilar = useMemo(() => {
    return findSimilarDoubts(doubt, doubts, undefined, 0.25).length > 0;
  }, [doubt, doubts]);



  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [newAnswerText, setNewAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // State for modified AI answers { [answerId]: { text: string, mode: string, loading: boolean } }
  const [modifiedAnswers, setModifiedAnswers] = useState<Record<string, { text: string; mode: string; loading: boolean }>>({});
  const [ratedMap, setRatedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [reviewRequestedNotice, setReviewRequestedNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAnswers() {
      setLoadingAnswers(true);
      const data = await getAnswersForDoubt(doubt.id);
      if (isMounted) {
        setAnswers(data);
        setLoadingAnswers(false);
      }
    }
    loadAnswers();
    return () => {
      isMounted = false;
    };
  }, [doubt.id]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;
    setSubmittingAnswer(true);
    try {
      await addAnswer(doubt.id, newAnswerText.trim());
      setNewAnswerText('');
      const updated = await getAnswersForDoubt(doubt.id);
      setAnswers(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleToggleResolved = async () => {
    setStatusUpdating(true);
    const nextStatus = doubt.status === 'resolved' ? 'answered' : 'resolved';
    try {
      await updateDoubtStatus(doubt.id, nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRate = async (ans: Answer, rating: 'up' | 'down') => {
    setRatedMap((prev) => ({ ...prev, [ans.id]: rating }));
    await rateAnswer(doubt.id, ans.id, rating);
    if (rating === 'down') {
      setReviewRequestedNotice('Doubt marked as "Needs Teacher Review". A faculty member will review this question.');
      setTimeout(() => setReviewRequestedNotice(null), 5000);
    }
  };

  const handleAskTeacher = async () => {
    setStatusUpdating(true);
    await requestTeacherReview(doubt.id);
    setStatusUpdating(false);
    setReviewRequestedNotice('Sent to faculty queue! Doubt status updated to "Needs Teacher Review".');
    setTimeout(() => setReviewRequestedNotice(null), 5000);
  };

  const handleModifierClick = async (ans: Answer, mode: 'simple' | 'example' | 'hinglish') => {
    setModifiedAnswers((prev) => ({
      ...prev,
      [ans.id]: { text: '', mode, loading: true }
    }));
    try {
      const modified = await modifyAIAnswer(
        doubt.id,
        ans.id,
        doubt.questionText,
        ans.answerText,
        mode
      );
      setModifiedAnswers((prev) => ({
        ...prev,
        [ans.id]: { text: modified, mode, loading: false }
      }));
    } catch (err) {
      console.error(err);
      setModifiedAnswers((prev) => ({
        ...prev,
        [ans.id]: { text: 'Could not generate alternative explanation at this time.', mode, loading: false }
      }));
    }
  };

  const isAuthor = user ? user.uid === doubt.userId : false;
  const canModifyStatus = isTeacher || isAuthor;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
        <div className={`bg-white rounded-3xl ${hasQualifyingSimilar ? 'max-w-5xl' : 'max-w-3xl'} w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all duration-200`}>
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                  {doubt.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
                  {doubt.predictedTopic}
                </span>

                {/* Status Badges */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  doubt.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : doubt.status === 'needs teacher review'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : doubt.status === 'answered'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    doubt.status === 'resolved'
                      ? 'bg-emerald-500'
                      : doubt.status === 'needs teacher review'
                      ? 'bg-amber-500'
                      : doubt.status === 'answered'
                      ? 'bg-blue-500'
                      : 'bg-slate-400'
                  }`} />
                  <span className="capitalize">{doubt.status}</span>
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Asked {new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            <div className={`grid grid-cols-1 ${hasQualifyingSimilar ? 'lg:grid-cols-12' : ''} gap-6 items-start`}>
              <div className={`${hasQualifyingSimilar ? 'lg:col-span-7 xl:col-span-8' : 'w-full'} space-y-6`}>

            
            {/* Identity & Anonymity Card */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAliasGradient(doubt.authorAlias)} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                  {getAliasInitials(doubt.authorAlias)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {doubt.isAnonymous ? doubt.authorAlias : (doubt.authorName || doubt.authorAlias)}
                    </span>
                    {doubt.isAnonymous && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                        <EyeOff className="w-3 h-3" /> Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {doubt.isAnonymous
                      ? 'Student identity masked for peer privacy'
                      : 'Public college student post'}
                  </p>
                </div>
              </div>

              {/* Teacher/Admin Exclusive Author Reveal */}
              {isTeacher && doubt.isAnonymous && (
                <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <span className="font-bold text-amber-800">Faculty Audit: </span>
                  <span className="text-amber-900 font-medium">
                    {doubt.authorName || 'Student'} ({doubt.authorEmail || 'verified student'})
                  </span>
                </div>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {doubt.questionText}
              </h2>

              {/* Diagram / Image */}
              {doubt.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-80 flex items-center justify-center">
                  <img
                    src={doubt.imageUrl}
                    alt="Diagram/Attachment for doubt"
                    className="max-h-80 w-auto object-contain rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Action Bar for Doubt */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {canModifyStatus && (
                  <button
                    onClick={handleToggleResolved}
                    disabled={statusUpdating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      doubt.status === 'resolved'
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>{doubt.status === 'resolved' ? 'Re-open Doubt' : 'Mark Resolved'}</span>
                  </button>
                )}

                <button
                  onClick={handleAskTeacher}
                  disabled={statusUpdating || doubt.status === 'needs teacher review'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    doubt.status === 'needs teacher review'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  }`}
                  title="Request faculty to examine this question"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{doubt.status === 'needs teacher review' ? 'Teacher Review Requested' : 'Ask a Teacher'}</span>
                </button>
              </div>

              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Content</span>
              </button>
            </div>

            {/* Notification alert banner */}
            {reviewRequestedNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{reviewRequestedNotice}</span>
              </div>
            )}

            {/* Verified Answers Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Solutions & Explanations ({answers.length})</span>
                </h3>
              </div>

              {loadingAnswers ? (
                <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                  Loading solutions...
                </div>
              ) : answers.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700">No solutions submitted yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    This doubt is queued for faculty review.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {answers.map((ans) => {
                    const isAI = ans.source === 'ai';
                    const modData = modifiedAnswers[ans.id];

                    return (
                      <div
                        key={ans.id}
                        className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
                          isAI
                            ? 'bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 border-purple-200/80'
                            : 'bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 border-emerald-200/80'
                        }`}
                      >
                        {/* Answer Header: Badges & Author */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                              isAI ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-emerald-600'
                            }`}>
                              {isAI ? <Sparkles className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">
                                  {ans.authorName}
                                </span>

                                {/* BADGES */}
                                {isAI && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                    AI-generated
                                  </span>
                                )}
                                {ans.source === 'teacher' && ans.isVerified && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    Teacher-verified
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(ans.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Answer Text */}
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                          {ans.answerText}
                        </div>

                        {/* Modified Answer Sub-Card (if student requested Explain Simply / Example / Hinglish) */}
                        {modData && (
                          <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                              <span className="flex items-center gap-1.5 capitalize">
                                {modData.mode === 'simple' && <Lightbulb className="w-3.5 h-3.5 text-amber-500" />}
                                {modData.mode === 'example' && <BookOpen className="w-3.5 h-3.5 text-emerald-500" />}
                                {modData.mode === 'hinglish' && <Languages className="w-3.5 h-3.5 text-indigo-500" />}
                                <span>{modData.mode === 'simple' ? 'Simplified Analogy' : modData.mode === 'example' ? 'Practical Example' : 'Hinglish Explanation'}</span>
                              </span>
                              <button
                                onClick={() => setModifiedAnswers((prev) => {
                                  const copy = { ...prev };
                                  delete copy[ans.id];
                                  return copy;
                                })}
                                className="text-[10px] text-slate-400 hover:text-slate-600 font-normal"
                              >
                                Hide
                              </button>
                            </div>
                            {modData.loading ? (
                              <div className="text-xs text-slate-400 animate-pulse">Generating alternative perspective...</div>
                            ) : (
                              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                {modData.text}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Buttons under AI Answer */}
                        {isAI && (
                          <div className="pt-2 border-t border-purple-100/70 space-y-2">
                            {/* Explanation Modifiers */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleModifierClick(ans, 'simple')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors flex items-center gap-1"
                              >
                                <Lightbulb className="w-3 h-3 text-indigo-500" />
                                <span>Explain simply</span>
                              </button>

                              <button
                                onClick={() => handleModifierClick(ans, 'example')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors flex items-center gap-1"
                              >
                                <BookOpen className="w-3 h-3 text-emerald-500" />
                                <span>Give an example</span>
                              </button>

                              <button
                                onClick={() => handleModifierClick(ans, 'hinglish')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors flex items-center gap-1"
                              >
                                <Languages className="w-3 h-3 text-amber-600" />
                                <span>Explain in Hinglish</span>
                              </button>
                            </div>

                            {/* Thumbs up/down & Ask a Teacher button */}
                            <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">Was this helpful?</span>
                                <button
                                  onClick={() => handleRate(ans, 'up')}
                                  className={`p-1 rounded-md transition-colors ${
                                    ratedMap[ans.id] === 'up'
                                      ? 'text-emerald-600 bg-emerald-50'
                                      : 'text-slate-400 hover:text-slate-700'
                                  }`}
                                  title="Thumbs Up"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRate(ans, 'down')}
                                  className={`p-1 rounded-md transition-colors ${
                                    ratedMap[ans.id] === 'down'
                                      ? 'text-rose-600 bg-rose-50'
                                      : 'text-slate-400 hover:text-rose-600'
                                  }`}
                                  title="Thumbs Down (Requests teacher review)"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={handleAskTeacher}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Ask a teacher</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Teacher Answer Input (Restricted to verified teachers/admins) */}
              {isTeacher && (
                <form onSubmit={handlePostAnswer} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Post Teacher-Verified Solution
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {newAnswerText.length}/5000
                    </span>
                  </div>
                  <textarea
                    value={newAnswerText}
                    onChange={(e) => setNewAnswerText(e.target.value)}
                    placeholder="Provide a verified step-by-step conceptual or mathematical solution for this student..."
                    rows={4}
                    maxLength={5000}
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingAnswer || newAnswerText.trim().length < 2}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingAnswer ? 'Publishing...' : 'Publish Verified Solution'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Beside each doubt - Similar Doubts Panel */}
          {hasQualifyingSimilar && (
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <SimilarDoubtsPanel
                currentDoubt={doubt}
                allDoubts={doubts}
                onSelectDoubt={(newDoubt) => {
                  setDoubt(newDoubt);
                  if (onSelectDoubt) onSelectDoubt(newDoubt);
                }}
              />
            </div>
          )}
        </div>

        {/* AI Warning Footer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-[11px] text-slate-500">
          AI can make mistakes. Verify important answers with your teacher.
        </div>
      </div>

        </div>
      </div>

      {reportModalOpen && (
        <ReportModal doubt={doubt} onClose={() => setReportModalOpen(false)} />
      )}
    </>
  );
};
