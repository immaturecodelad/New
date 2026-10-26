import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  EyeOff, 
  MessageSquare, 
  PlusCircle,
  Flag,
  Sparkles,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Doubt, DoubtStatus, NavigationPage } from '../types/index.ts';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';
import { ReportModal } from '../components/ReportModal.tsx';
import { CSE_SUBJECTS, getSubjectConfig } from '../constants/subjects.ts';

interface CommunityFeedProps {
  onSelectDoubt: (doubt: Doubt) => void;
  onNavigate: (page: NavigationPage) => void;
  initialSubject?: string;
}

const ALL_SUBJECTS = 'All Subjects';

const SUBJECT_LIST = [
  ALL_SUBJECTS,
  ...CSE_SUBJECTS.map(s => s.name)
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onSelectDoubt, onNavigate, initialSubject }) => {
  const { doubts, loading } = useDoubts();
  const { isTeacher } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || ALL_SUBJECTS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTargetDoubt, setReportTargetDoubt] = useState<Doubt | null>(null);

  // Filtered Doubts
  const filteredDoubts = useMemo(() => {
    return doubts.filter((d) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesText = d.questionText.toLowerCase().includes(query);
        const matchesSubject = d.subject.toLowerCase().includes(query);
        const matchesTopic = (d.predictedTopic || '').toLowerCase().includes(query);
        const matchesAlias = d.authorAlias.toLowerCase().includes(query);
        if (!matchesText && !matchesSubject && !matchesTopic && !matchesAlias) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== ALL_SUBJECTS && d.subject !== selectedSubject) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && d.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [doubts, searchQuery, selectedSubject, statusFilter]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header and Quick Ask Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Peer Learning Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Doubts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse questions asked by fellow college scholars. Learn from verified solutions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('ask')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask New Doubt</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doubts by concept, keyword, subject, or topic..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/40 focus:bg-white"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          
          {/* Subject Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {SUBJECT_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'answered', label: 'Answered' },
              { id: 'needs teacher review', label: 'Needs Review' },
              { id: 'resolved', label: 'Resolved' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  statusFilter === st.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-bold text-slate-800">{filteredDoubts.length}</span> doubts
          {selectedSubject !== ALL_SUBJECTS && ` in ${selectedSubject}`}
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-indigo-600 hover:underline font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Doubts Grid */}
      {filteredDoubts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Doubts Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No questions match your current search and filters. Try adjusting your filter or be the first to ask!
          </p>
          <button
            onClick={() => onNavigate('ask')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-xs hover:bg-indigo-700"
          >
            Ask This Doubt Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoubts.map((doubt) => (
            <div
              key={doubt.id}
              onClick={() => onSelectDoubt(doubt)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2.5">
                
                {/* Subject & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(() => {
                      const cfg = getSubjectConfig(doubt.subject);
                      const Icon = cfg.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${cfg.chipBg} ${cfg.chipText} border ${cfg.chipBorder}`}>
                          <Icon className="w-3 h-3" />
                          <span>{doubt.subject}</span>
                        </span>
                      );
                    })()}
                    {doubt.subTopic ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        • {doubt.subTopic}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {doubt.predictedTopic}
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 capitalize ${
                    doubt.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doubt.status === 'needs teacher review'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : doubt.status === 'answered'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {doubt.status}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-sm font-bold text-slate-800 line-clamp-3 leading-relaxed group-hover:text-indigo-600 transition-colors">
                  {doubt.questionText}
                </h3>

                {/* Image attachment display on card */}
                {doubt.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200/90 bg-slate-100 h-36 flex items-center justify-center">
                    <img
                      src={doubt.imageUrl}
                      alt="Question diagram or problem snapshot"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                  </div>
                )}
              </div>

              {/* Card Footer: Alias and Metadata */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  
                  {/* Author / Anonymous Alias */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getAliasGradient(doubt.authorAlias)} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {getAliasInitials(doubt.authorAlias)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-slate-700 text-xs">
                        <span>{doubt.isAnonymous ? doubt.authorAlias : (doubt.authorName || doubt.authorAlias)}</span>
                        {doubt.isAnonymous && (
                          <span title="Anonymous Scholar">
                            <EyeOff className="w-3 h-3 text-slate-400" />
                          </span>
                        )}
                      </div>
                      
                      {/* Teacher exclusive: show real student author name */}
                      {isTeacher && doubt.isAnonymous && (
                        <div className="text-[10px] text-amber-800 font-medium">
                          Author: {doubt.authorName || 'Student'} ({doubt.authorEmail || 'verified'})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Answers info */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{doubt.answersCount ? `${doubt.answersCount}` : '0'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportTargetDoubt(doubt);
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50"
                      title="Report doubt for moderation"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>


                <div className="text-[10px] text-slate-400">
                  Asked {new Date(doubt.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reportTargetDoubt && (
        <ReportModal
          doubt={reportTargetDoubt}
          onClose={() => setReportTargetDoubt(null)}
        />
      )}
    </div>
  );
};
