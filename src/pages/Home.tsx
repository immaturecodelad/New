import React from 'react';
import { 
  GraduationCap, 
  EyeOff, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  MessageSquare,
  Users,
  Layers,
  Search,
  BookOpen,
  FileText
} from 'lucide-react';
import { NavigationPage, Doubt } from '../types/index.ts';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';
import { CSE_SUBJECTS, getSubjectConfig } from '../constants/subjects.ts';

interface HomeProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectDoubt: (doubt: Doubt) => void;
  onSelectSubject?: (subject: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectDoubt, onSelectSubject }) => {
  const { doubts } = useDoubts();
  const { profile, role } = useAuth();

  const previewDoubts = doubts.slice(0, 4);

  const handleSubjectClick = (subjectName: string) => {
    if (onSelectSubject) {
      onSelectSubject(subjectName);
    } else {
      onNavigate('feed');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Anonymous Academic Sanctuary for CSE Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Ask Freely. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Learn Confidently.
            </span> <br />
            Master CSE Core.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            Hesitant to raise your hand in 200-person CSE lecture halls? DoubtMate AI pairs your questions with a random scholar alias like <span className="text-indigo-300 font-semibold underline decoration-indigo-400/50">Curious Panda 42</span>. Zero peer judgment, verified faculty answers, pure conceptual clarity across all 11 core computer science domains.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('tutor')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Chat with AI Tutor</span>
            </button>

            <button
              onClick={() => onNavigate('ask')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Ask Doubt Anonymously</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('feed')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-indigo-300" />
              <span>Browse Feed</span>
            </button>

            <button
              onClick={() => onNavigate('case-study')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-300" />
              <span>Case Study (PDF)</span>
            </button>
          </div>

          {/* Quick stats pills */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Peer Identity Masking</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verified Faculty Guidance</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>11 Core CSE Curricula</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Subject Grid (11 Subjects with Doubt Counts) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Academic Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Browse by CSE Subject
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore college doubts organized across 11 core computer science and engineering disciplines.
            </p>
          </div>

          <button
            onClick={() => onNavigate('feed')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <span>Explore All Doubts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CSE_SUBJECTS.map((subj) => {
            const Icon = subj.icon;
            const count = doubts.filter(d => d.subject === subj.name).length;

            return (
              <div
                key={subj.id}
                onClick={() => handleSubjectClick(subj.name)}
                className={`group p-5 rounded-2xl bg-white border ${subj.cardBorder} ${subj.cardHoverBorder} hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-3`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${subj.chipBg} ${subj.chipText} border ${subj.chipBorder} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${subj.badgeBg} ${subj.badgeText}`}>
                      {count} {count === 1 ? 'doubt' : 'doubts'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <span className="font-semibold">{subj.subTopics.length} Sub-topics</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span>Browse</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core Value Propositions */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Stress-Free Learning
          </h2>
          <p className="text-sm text-slate-500">
            Everything you need to master tough CSE & college coursework without feeling self-conscious.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Zero Peer Judgment
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every doubt is posted under an anonymous pseudonym (e.g. "Clever Falcon 88"). Classmates only see your alias, removing the fear of asking fundamental questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Verified Faculty Solutions
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instructors and vetted teaching assistants post pedagogical breakdowns, diagrams, and proof steps with official verification badges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Accountable Anonymity
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              While peers only ever see your anonymous alias, teachers and admins have audit transparency, ensuring a respectful, spam-free academic environment.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Community Doubts Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Recent doubts from the community
            </h2>
            <p className="text-xs text-slate-500">
              Explore peer questions across core CSE disciplines with faculty verification
            </p>
          </div>

          <button
            onClick={() => onNavigate('feed')}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <span>View All ({doubts.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {previewDoubts.map((doubt) => {
            const subjConfig = getSubjectConfig(doubt.subject);
            const SubjIcon = subjConfig.icon;

            return (
              <div
                key={doubt.id}
                onClick={() => onSelectDoubt(doubt)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${subjConfig.chipBg} ${subjConfig.chipText} border ${subjConfig.chipBorder}`}>
                        <SubjIcon className="w-3 h-3" />
                        <span>{doubt.subject}</span>
                      </span>
                      {doubt.subTopic && (
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          • {doubt.subTopic}
                        </span>
                      )}
                    </div>

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

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getAliasGradient(doubt.authorAlias)} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {getAliasInitials(doubt.authorAlias)}
                    </div>
                    <span className="font-semibold text-slate-700">
                      {doubt.authorAlias}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {doubt.hasVerifiedAnswer && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Teacher Verified</span>
                      </span>
                    )}
                    <span className="text-indigo-600 font-medium">
                      {doubt.answersCount ? `${doubt.answersCount} Solution` : '0 Solutions'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Banner */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-100 border border-slate-200 space-y-6">
        <h3 className="text-xl font-bold text-slate-800 text-center">
          How DoubtMate AI Works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-800">Post Without Hesitation</h4>
            <p className="text-xs text-slate-500">
              Select your CSE subject, type your doubt or upload a whiteboard diagram. Your identity is instantly masked.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-800">Faculty & AI Verification</h4>
            <p className="text-xs text-slate-500">
              Course professors review queued doubts and provide rigorous step-by-step solutions with official badges.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-800">Master Concepts Together</h4>
            <p className="text-xs text-slate-500">
              Filter by CSE core subject, search past doubts, and prepare for midterms and finals with clean explanations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
