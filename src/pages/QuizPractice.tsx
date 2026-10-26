import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  BookOpen, 
  ArrowRight, 
  RefreshCw, 
  Award,
  ChevronRight,
  ChevronLeft,
  Flame,
  Brain,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { NavigationPage, QuizQuestion, QuizResult } from '../types/index.ts';
import { CSE_SUBJECTS, getSubjectConfig, getSubjectSubTopics } from '../constants/subjects.ts';

interface QuizPracticeProps {
  onNavigate: (page: NavigationPage) => void;
}

const DIFFICULTIES: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];

export const QuizPractice: React.FC<QuizPracticeProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();

  const [topic, setTopic] = useState<string>(CSE_SUBJECTS[0].name);
  const [subTopic, setSubTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Quiz lifecycle states: 'configure' | 'loading' | 'taking' | 'results'
  const [quizState, setQuizState] = useState<'configure' | 'loading' | 'taking' | 'results'>('configure');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startQuiz = async () => {
    setQuizState('loading');
    setLoadingError(null);
    setSelectedAnswers({});
    setCurrentQIndex(0);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subTopic, difficulty })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate quiz. Please try again.');
      }

      const data = await res.json();
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length < 5) {
        throw new Error('Received incomplete quiz questions from server. Please try again.');
      }

      setQuestions(data.questions);
      setQuizState('taking');
    } catch (err: unknown) {
      console.error('Quiz start error:', err);
      setLoadingError(err instanceof Error ? err.message : 'Could not contact quiz server.');
      setQuizState('configure');
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (quizState !== 'taking') return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    // 1. Score in code strictly
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setQuizState('results');

    // 2. Save result to Firestore quizResults
    setIsSaving(true);
    const currentUserId = user ? user.uid : (profile ? profile.id : 'student_seed_01');
    const resultPayload = {
      userId: currentUserId,
      topic,
      difficulty,
      score: calculatedScore,
      total: questions.length,
      percentage: Math.round((calculatedScore / questions.length) * 100),
      createdAt: new Date().toISOString()
    };

    try {
      if (user) {
        await addDoc(collection(db, 'quizResults'), resultPayload);
      }
      // Store in local storage for instant dashboard updates in demo/offline
      const existingLocal: QuizResult[] = JSON.parse(localStorage.getItem('doubtmate_quiz_results') || '[]');
      existingLocal.unshift({
        id: `quiz_${Date.now()}`,
        ...resultPayload
      });
      localStorage.setItem('doubtmate_quiz_results', JSON.stringify(existingLocal.slice(0, 30)));
    } catch (err) {
      console.warn('Could not save quiz result to Firestore:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetQuiz = () => {
    setQuizState('configure');
    setSelectedAnswers({});
    setQuestions([]);
    setScore(0);
    setLoadingError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Active Recall Practice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quiz Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pick an undergraduate topic and test your mastery with 5 AI-formulated multiple choice questions.
          </p>
        </div>

        {quizState === 'taking' && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-800">
            <span>{Object.keys(selectedAnswers).length} / {questions.length} Answered</span>
          </div>
        )}
      </div>

      {/* STATE 1: CONFIGURE & TOPIC SELECTION */}
      {quizState === 'configure' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {loadingError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Quiz Generation Error</span>
                  <p>{loadingError}</p>
                </div>
              </div>
            )}

            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>1. Select CSE Core Subject</span>
                </span>
                {(() => {
                  const cfg = getSubjectConfig(topic);
                  const Icon = cfg.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText} border ${cfg.chipBorder}`}>
                      <Icon className="w-3 h-3" />
                      <span>{cfg.shortName}</span>
                    </span>
                  );
                })()}
              </label>

              {/* 11 CSE Subject Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {CSE_SUBJECTS.map((s) => {
                  const Icon = s.icon;
                  const isSelected = topic === s.name;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setTopic(s.name);
                        setSubTopic('');
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? `${s.badgeBg} ${s.badgeText} border-indigo-500 shadow-xs ring-2 ring-indigo-500/30`
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${s.chipBg} ${s.chipText} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate font-semibold">{s.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Sub-Topic Dropdown */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Specific Sub-Topic (Optional)
                </label>
                <select
                  value={subTopic}
                  onChange={(e) => setSubTopic(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-colors font-medium text-slate-800"
                >
                  <option value="">-- All Sub-Topics in {topic} (Comprehensive Exam) --</option>
                  {getSubjectSubTopics(topic).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>2. Select Difficulty Level</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`p-3.5 rounded-2xl text-xs font-bold border text-center transition-all ${
                      difficulty === d
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions & Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Quiz Specifications:</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Generates exactly 5 multiple choice questions with 4 options each, verified and scored strictly in client code. Per-question conceptual explanations will be displayed after submission.
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={startQuiz}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate 5-Question Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING GENERATION */}
      {quizState === 'loading' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              Formulating {topic} Questions
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generating 5 rigorous MCQs on {difficulty} difficulty via Gemini with strict JSON schema validation...
            </p>
          </div>
        </div>
      )}

      {/* STATE 3: TAKING QUIZ */}
      {quizState === 'taking' && questions.length > 0 && (
        <div className="space-y-6">
          
          {/* Progress Bar & Question Jumpers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-indigo-600 font-semibold">
                {topic} &bull; {difficulty}
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQIndex(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentQIndex === i
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : selectedAnswers[i] !== undefined
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question Card */}
          {(() => {
            const currentQ = questions[currentQIndex];
            const currentChoice = selectedAnswers[currentQIndex];

            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Question {currentQIndex + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* 4 Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = currentChoice === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQIndex, optIdx)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-150 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed">
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentQIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:scale-[1.02]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* AI Accuracy Disclaimer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 font-medium">
            AI-generated answer keys may contain errors.
          </div>
        </div>
      )}

      {/* STATE 4: QUIZ RESULTS & PER-QUESTION FEEDBACK */}
      {quizState === 'results' && (
        <div className="space-y-6">
          
          {/* Score Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-300 border border-white/20 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Quiz Evaluation Completed
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {score} / {questions.length} Correct
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                Topic: {topic} &bull; Difficulty: {difficulty} &bull; Score: {Math.round((score / questions.length) * 100)}%
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startQuiz}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                type="button"
                onClick={resetQuiz}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-100 bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Choose Another Topic</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('student-dashboard')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-200 hover:text-white transition-colors"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI-generated answer keys notice */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>AI-generated answer keys may contain errors.</span>
          </div>

          {/* Per-Question Detailed Feedback */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Detailed Question-by-Question Breakdown
            </h3>

            {questions.map((q, idx) => {
              const studentChoice = selectedAnswers[idx];
              const isCorrect = studentChoice === q.correctIndex;

              return (
                <div 
                  key={idx}
                  className={`p-6 rounded-3xl border bg-white shadow-xs space-y-4 transition-all ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500">
                      Question {idx + 1}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCorrect 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct (+1)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Incorrect (0)</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Problem statement */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>

                  {/* Options list showing student pick & correct answer */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isStudentPick = studentChoice === optIdx;
                      const isCorrectOption = q.correctIndex === optIdx;

                      let styleClasses = 'border-slate-200 bg-slate-50/50 text-slate-700';
                      if (isCorrectOption) {
                        styleClasses = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isStudentPick && !isCorrectOption) {
                        styleClasses = 'border-rose-500 bg-rose-50/80 text-rose-950 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${styleClasses}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-bold shrink-0">{letter}.</span>
                            <span>{opt}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 font-bold text-[11px]">
                            {isCorrectOption && (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                              </span>
                            )}
                            {isStudentPick && !isCorrectOption && (
                              <span className="text-rose-700 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Your Choice
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Educational explanation */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Explanation:</span>
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
