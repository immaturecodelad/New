import React from 'react';
import { 
  ShieldCheck, 
  EyeOff, 
  UserCheck, 
  Lock, 
  Database, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { NavigationPage } from '../types/index.ts';

interface PrivacyNoticeProps {
  onNavigate: (page: NavigationPage) => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Student Confidentiality Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Privacy Notice & Data Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          How DoubtMate AI protects student anonymity among peers while preserving academic integrity and faculty oversight.
        </p>
      </div>

      {/* Main Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: What is Stored */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              1. What We Store
            </h3>
            <p className="text-xs text-slate-500">
              Only academic and learning data essential for coursework doubt-solving.
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Account Profile:</strong> Your Google name, university email, role (student/teacher), and assigned student pseudonym (e.g. <em>"Curious Panda 42"</em>).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Questions & Doubts:</strong> Problem text, subject, ML predicted topic tag, confidence score, optional problem image, and anonymous toggle setting.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Solutions & Ratings:</strong> Faculty solutions, AI tutor explanations, and helpfulness feedback (thumbs up/down).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Quiz Performance:</strong> Selected topics, scores, and timestamps used exclusively for personal revision recommendations.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Who Sees What */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              2. Who Sees What
            </h3>
            <p className="text-xs text-slate-500">
              Two distinct access tiers: Peer Anonymity vs. Faculty Accountability.
            </p>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
            <li className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">&bull;</div>
              <span><strong>Your Classmates (Community Feed):</strong> If you select "Post Anonymously", other students only ever see your pseudonym alias. Your real name and email address are never exposed in community feeds or search results.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">&bull;</div>
              <span><strong>Course Instructors & Admins:</strong> Verified teachers and course faculty can view the real student author behind questions. This prevents academic misconduct, ensures student welfare, and enables instructors to reach out to students who need 1-on-1 tutoring.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">&bull;</div>
              <span><strong>Access Control:</strong> Students are strictly denied access to the Teacher Dashboard and Administrative moderation pages.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: AI Processing */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              3. AI Processing & Disclaimers
            </h3>
            <p className="text-xs text-slate-500">
              Server-side intelligence via Google Gemini API.
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            When you ask a doubt, scan a textbook problem image, or chat in the AI Tutor, your question is processed on our server via Google's Gemini models.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
            <strong>Important Educational Disclaimer:</strong> AI can make mistakes. AI-generated answers and quiz keys are educational study aids and must always be verified with course instructors for exam preparation.
          </div>
        </div>

        {/* Pillar 4: Your Rights */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              4. Student Rights & Control
            </h3>
            <p className="text-xs text-slate-500">
              You stay in control of your identity at all times.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Regenerate your scholar pseudonym at any time on your dashboard.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark your doubts as "Resolved" once your question is answered.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero advertising trackers, marketing cookies, or selling of student data.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Ready to explore college doubts?</h4>
          <p className="text-xs text-slate-500">Ask questions freely without fear of peer judgment.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ask')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Ask a Doubt Now
          </button>
          <button
            onClick={() => onNavigate('feed')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Browse Community
          </button>
        </div>
      </div>

    </div>
  );
};
