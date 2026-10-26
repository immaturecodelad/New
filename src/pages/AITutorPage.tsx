import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  AlertCircle, 
  BookOpen, 
  Lightbulb, 
  Languages, 
  HelpCircle,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { TutorChatMessage, NavigationPage } from '../types/index.ts';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';

interface AITutorPageProps {
  onNavigate: (page: NavigationPage) => void;
}

const STARTER_PROMPTS = [
  { label: 'Quicksort & Pivot', prompt: 'Why is Quicksort worst-case O(n²) and how does median-of-three partitioning fix it?' },
  { label: 'BCNF vs 3NF', prompt: 'Explain the difference between BCNF and 3NF with a simple relation schema example.' },
  { label: 'OS Clock Algorithm', prompt: 'How does the Clock page replacement algorithm approximate LRU in Operating Systems?' },
  { label: 'TCP Congestion', prompt: 'In TCP congestion control, why does TCP Reno halve cwnd on triple duplicate ACKs but reset to 1 on timeout?' },
  { label: 'Pumping Lemma (TOC)', prompt: 'How do we use the Pumping Lemma to prove L = {0^n 1^n} is not regular?' },
  { label: 'VTable & Virtual Dispatch', prompt: 'Explain how virtual method tables (vtables) and vptrs resolve dynamic polymorphism in C++.' }
];

export const AITutorPage: React.FC<AITutorPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'model',
      content: `👋 Hello! I am your **DoubtMate AI Tutor**.\n\nI specialize strictly in **Computer Science & Engineering (CSE) core subjects**:\n- **Data Structures & Algorithms** (DSA)\n- **Operating Systems** & **Computer Networks**\n- **DBMS & SQL**\n- **Theory of Computation** & **Compiler Design**\n- **Computer Organization & Architecture**\n- **Software Engineering** & **Object-Oriented Programming**\n- **Discrete Mathematics** & **AI / Machine Learning**\n\nAsk me any algorithmic derivation, complexity analysis, or tricky systems concept, complete with code examples and text diagrams! If you want a different angle, use **Explain simply**, **Give an example**, or **Explain in Hinglish**.`,
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratedMap, setRatedMap] = useState<Record<string, 'up' | 'down'>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentAlias = profile?.alias || 'Curious Scholar';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string, modifier?: 'simple' | 'example' | 'hinglish') => {
    const rawQuestion = (textToSend || inputQuestion).trim();
    if (!rawQuestion) return;

    setErrorMessage(null);

    const userMsg: TutorChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: rawQuestion,
      createdAt: new Date().toISOString()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content
          })),
          modifier
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Keep question in input so student doesn't lose it
        setInputQuestion(rawQuestion);
        throw new Error(data.error || 'The AI Tutor is temporarily busy. Please try again!');
      }

      const botMsg: TutorChatMessage = {
        id: `msg_${Date.now()}_m`,
        role: 'model',
        content: data.reply,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI Tutor is temporarily unavailable.';
      setErrorMessage(msg);
      // Keep question in user's input so work is not lost
      setInputQuestion(rawQuestion);
    } finally {
      setLoading(false);
    }
  };

  const handleModifierClick = (modifier: 'simple' | 'example' | 'hinglish', targetMsgIndex?: number) => {
    let contextPrompt = '';
    if (targetMsgIndex !== undefined && messages[targetMsgIndex]) {
      contextPrompt = `Regarding the previous explanation:\n"${messages[targetMsgIndex].content.slice(0, 300)}..."\n\nPlease ${
        modifier === 'simple'
          ? 'explain this simply with an everyday analogy (ELI5)'
          : modifier === 'example'
          ? 'give a concrete code or practical real-world example'
          : 'explain this in conversational Hinglish'
      }.`;
    } else {
      contextPrompt = modifier === 'simple' ? 'Can you explain that simply?' : modifier === 'example' ? 'Can you give an example?' : 'Can you explain in Hinglish?';
    }

    handleSendMessage(contextPrompt, modifier);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRate = (id: string, rating: 'up' | 'down') => {
    setRatedMap((prev) => ({ ...prev, [id]: rating }));
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        content: `Conversation reset. What college concept would you like to explore next?`,
        createdAt: new Date().toISOString()
      }
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col min-h-[calc(100vh-140px)]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                AI Interactive Tutor
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive conceptual Q&A with follow-ups & instant analogies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Suggested Starters (Only when conversation is fresh) */}
      {messages.length <= 2 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Explore Core College Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((starter) => (
              <button
                key={starter.label}
                onClick={() => handleSendMessage(starter.prompt)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs text-slate-700 font-medium transition-all shadow-2xs hover:scale-[1.01]"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[60vh] sm:max-h-[64vh]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getAliasGradient(currentAlias)} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  {getAliasInitials(currentAlias)}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
                
                {/* Badge & Timestamp */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {isUser ? (
                    <span className="font-semibold text-slate-600">{currentAlias}</span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      AI-generated
                    </span>
                  )}
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Bubble Content */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line text-left shadow-2xs ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* AI Interaction Buttons (Explain simply, Give example, Hinglish, Thumbs, Copy) */}
                {!isUser && idx > 0 && (
                  <div className="space-y-2 pt-1">
                    {/* Quick Modifier Action Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleModifierClick('simple', idx)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Lightbulb className="w-3 h-3 text-indigo-500" />
                        <span>Explain simply</span>
                      </button>

                      <button
                        onClick={() => handleModifierClick('example', idx)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <BookOpen className="w-3 h-3 text-emerald-500" />
                        <span>Give an example</span>
                      </button>

                      <button
                        onClick={() => handleModifierClick('hinglish', idx)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Languages className="w-3 h-3 text-amber-600" />
                        <span>Explain in Hinglish</span>
                      </button>
                    </div>

                    {/* Feedback & Utility Row */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRate(msg.id, 'up')}
                          className={`p-1 rounded-md transition-colors ${
                            ratedMap[msg.id] === 'up'
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'hover:text-slate-600'
                          }`}
                          title="Helpful explanation"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRate(msg.id, 'down')}
                          className={`p-1 rounded-md transition-colors ${
                            ratedMap[msg.id] === 'down'
                              ? 'text-rose-600 bg-rose-50'
                              : 'hover:text-slate-600'
                          }`}
                          title="Confusing / Needs review"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onNavigate('ask')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        title="Post this as a community doubt"
                      >
                        Ask a teacher
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="font-semibold text-slate-700">DoubtMate AI is thinking...</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Formulating a pedagogical step-by-step breakdown
              </p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Friendly Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Notice:</span>
            <p className="text-[11px] leading-relaxed">
              {errorMessage} <br />
              <span className="font-medium text-slate-600">Don't worry, your question has been kept in the input box below so you don't have to retype it!</span>
            </p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2"
      >
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question or follow-up... (e.g. 'Can you explain why BCNF preserves functional dependencies or not?')"
            rows={2}
            className="w-full text-xs sm:text-sm p-3 pr-12 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all shadow-xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="text-slate-500 font-medium">
            AI can make mistakes. Verify important answers with your teacher.
          </span>
        </div>
      </form>
    </div>
  );
};
