import React, { useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { Doubt, SimilarDoubtMatch } from '../types/index.ts';
import { findSimilarDoubts } from '../utils/similarity.ts';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';

interface SimilarDoubtsPanelProps {
  currentDoubt: Doubt;
  allDoubts: Doubt[];
  onSelectDoubt: (doubt: Doubt) => void;
  verifiedDoubtIds?: Set<string>;
}

export const SimilarDoubtsPanel: React.FC<SimilarDoubtsPanelProps> = ({
  currentDoubt,
  allDoubts,
  onSelectDoubt,
  verifiedDoubtIds
}) => {
  const similarMatches = useMemo(() => {
    return findSimilarDoubts(currentDoubt, allDoubts, verifiedDoubtIds, 0.25);
  }, [currentDoubt, allDoubts, verifiedDoubtIds]);

  // Requirement: "and show nothing if none qualify"
  if (similarMatches.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 via-white to-purple-50/30 p-4 sm:p-5 shadow-xs space-y-3.5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Similar Doubts</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {similarMatches.length}
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              TF-IDF Cosine Similarity &ge; 0.25
            </p>
          </div>
        </div>
      </div>

      {/* List of similar doubts */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {similarMatches.map(({ doubt, similarity, hasVerifiedAnswer }) => {
          const matchPercent = Math.round(similarity * 100);
          return (
            <div
              key={doubt.id}
              onClick={() => onSelectDoubt(doubt)}
              className="group p-3 rounded-xl border border-slate-200/90 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all duration-150 cursor-pointer shadow-xs space-y-2"
            >
              {/* Badges row */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                  <span>{matchPercent}% similarity</span>
                </span>

                {hasVerifiedAnswer && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Teacher-verified</span>
                  </span>
                )}
              </div>

              {/* Question text snippet */}
              <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed group-hover:text-indigo-950 transition-colors">
                {doubt.questionText}
              </p>

              {/* Subject & meta footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-slate-700 truncate">{doubt.subject}</span>
                  {doubt.predictedTopic && doubt.predictedTopic !== 'Topic uncertain' && (
                    <>
                      <span>&bull;</span>
                      <span className="text-indigo-600 truncate">{doubt.predictedTopic}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
