import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { DoubtsProvider } from './context/DoubtsContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Home } from './pages/Home.tsx';
import { CommunityFeed } from './pages/CommunityFeed.tsx';
import { AskDoubt } from './pages/AskDoubt.tsx';
import { AITutorPage } from './pages/AITutorPage.tsx';
import { QuizPractice } from './pages/QuizPractice.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { TeacherDashboard } from './pages/TeacherDashboard.tsx';
import { AdminModelPage } from './pages/AdminModelPage.tsx';
import { PrivacyNotice } from './pages/PrivacyNotice.tsx';
import { CaseStudyPage } from './pages/CaseStudyPage.tsx';
import { DoubtDetailModal } from './components/DoubtDetailModal.tsx';
import { NavigationPage, Doubt } from './types/index.ts';
import { GraduationCap, ShieldCheck, Heart, Sparkles, Lock, FileText } from 'lucide-react';

function DoubtMateApp() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [feedSubjectFilter, setFeedSubjectFilter] = useState<string>('All Subjects');

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Page View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentPage === 'home' && (
          <Home
            onNavigate={setCurrentPage}
            onSelectDoubt={setSelectedDoubt}
            onSelectSubject={(subj) => {
              setFeedSubjectFilter(subj);
              setCurrentPage('feed');
            }}
          />
        )}
        {currentPage === 'feed' && (
          <CommunityFeed
            onSelectDoubt={setSelectedDoubt}
            onNavigate={setCurrentPage}
            initialSubject={feedSubjectFilter}
          />
        )}
        {currentPage === 'tutor' && (
          <AITutorPage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'quiz' && (
          <QuizPractice onNavigate={setCurrentPage} />
        )}
        {currentPage === 'ask' && (
          <AskDoubt onNavigate={setCurrentPage} />
        )}
        {currentPage === 'student-dashboard' && (
          <StudentDashboard
            onSelectDoubt={setSelectedDoubt}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'teacher-dashboard' && (
          <TeacherDashboard
            onSelectDoubt={setSelectedDoubt}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'admin-model' && (
          <AdminModelPage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'privacy' && (
          <PrivacyNotice onNavigate={setCurrentPage} />
        )}
        {currentPage === 'case-study' && (
          <CaseStudyPage onNavigate={setCurrentPage} />
        )}
      </main>

      {/* Doubt Detail Modal */}
      {selectedDoubt && (
        <DoubtDetailModal
          doubt={selectedDoubt}
          onClose={() => setSelectedDoubt(null)}
          onSelectDoubt={setSelectedDoubt}
        />
      )}

      {/* Modern Academic Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-800">DoubtMate AI</span>
              <span className="text-slate-400">—</span>
              <span className="font-medium text-slate-600">
                Ask Freely. Learn Confidently. Grow Together.
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 text-[11px] flex-wrap">
              <button
                onClick={() => setCurrentPage('case-study')}
                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive Case Study (PDF)</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setCurrentPage('privacy')}
                className="flex items-center gap-1 hover:text-indigo-600 font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privacy Notice & Anonymity</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setCurrentPage('quiz')}
                className="hover:text-indigo-600 transition-colors"
              >
                Quiz Practice
              </button>
              <span className="text-slate-300">•</span>
              <span>Firestore Security Rules Enforced</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            AI can make mistakes. Verify important answers with your teacher.
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <DoubtsProvider>
        <DoubtMateApp />
      </DoubtsProvider>
    </AuthProvider>
  );
}
