import React, { useState } from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  UserCheck,
  Bot,
  Brain,
  BrainCircuit,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { NavigationPage } from '../types/index.ts';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, profile, role, isTeacher, signIn, signOut, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; requiresTeacher?: boolean; isAi?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'feed', label: 'Community', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-4 h-4 text-purple-600" />, isAi: true },
    { id: 'quiz', label: 'Quiz Practice', icon: <Brain className="w-4 h-4 text-indigo-600" /> },
    { id: 'ask', label: 'Ask a Doubt', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'case-study', label: 'Case Study (PDF)', icon: <FileText className="w-4 h-4 text-rose-600" /> },
    { id: 'student-dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'teacher-dashboard', label: 'Teacher Portal', icon: <ShieldCheck className="w-4 h-4" />, requiresTeacher: true },
    { id: 'admin-model', label: 'Classifier ML', icon: <BrainCircuit className="w-4 h-4 text-purple-600" />, requiresTeacher: true },
    { id: 'privacy', label: 'Privacy', icon: <ShieldCheck className="w-4 h-4 text-slate-500" /> }
  ];


  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const currentAlias = profile?.alias || 'Curious Scholar';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  DoubtMate
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-md border border-purple-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Ask Freely. Learn Confidently.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.requiresTeacher && !isTeacher) return null;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.requiresTeacher && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">
                      Staff
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Area: Alias, Role Badge, Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Alias Pill (Shows student anonymous alias) */}
            <div 
              onClick={() => handleNavClick('student-dashboard')}
              title="Your anonymous student pseudonym" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 cursor-pointer transition-colors"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getAliasGradient(currentAlias)} text-white flex items-center justify-center text-[10px] font-bold shadow-xs`}>
                {getAliasInitials(currentAlias)}
              </div>
              <span className="text-xs font-semibold text-slate-700 max-w-[130px] truncate">
                {currentAlias}
              </span>
            </div>

            {/* Role indicator dropdown for testing / inspecting */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                  role === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : role === 'teacher'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
                title="Click to test different student/teacher roles"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{role}</span>
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Persona:
                  </div>
                  <button
                    onClick={() => { switchDemoRole('student'); setRoleSwitcherOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      role === 'student' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>🎓 Student</span>
                    {role === 'student' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('teacher'); setRoleSwitcherOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      role === 'teacher' ? 'bg-amber-50 text-amber-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>👩‍🏫 Teacher (Faculty)</span>
                    {role === 'teacher' && <span className="text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setRoleSwitcherOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      role === 'admin' ? 'bg-rose-50 text-rose-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>🛡️ Admin</span>
                    {role === 'admin' && <span className="text-xs">✓</span>}
                  </button>
                  <div className="mt-1 pt-1 border-t border-slate-100 px-2 py-1 text-[10px] text-slate-400">
                    Server allowlist checked on Google login
                  </div>
                </div>
              )}
            </div>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={signOut}
                title={`Signed in as ${user.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xs shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="px-2 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-200 capitalize"
            >
              {role}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getAliasGradient(currentAlias)} text-white flex items-center justify-center text-xs font-bold`}>
                {getAliasInitials(currentAlias)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{currentAlias}</div>
                <div className="text-[10px] text-slate-500 capitalize">{role} Account</div>
              </div>
            </div>
            {user ? (
              <button
                onClick={signOut}
                className="text-xs text-rose-600 font-semibold px-2 py-1 rounded bg-rose-50"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={signIn}
                className="text-xs text-white bg-indigo-600 font-bold px-3 py-1.5 rounded-lg shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              if (item.requiresTeacher && !isTeacher) return null;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Switch Persona:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => switchDemoRole('student')}
                className={`py-1.5 px-2 text-xs rounded-md font-bold text-center border ${
                  role === 'student' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => switchDemoRole('teacher')}
                className={`py-1.5 px-2 text-xs rounded-md font-bold text-center border ${
                  role === 'teacher' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`py-1.5 px-2 text-xs rounded-md font-bold text-center border ${
                  role === 'admin' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
