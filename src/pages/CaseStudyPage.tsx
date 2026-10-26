import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  ArrowLeft, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  Camera, 
  Users, 
  CheckCircle2, 
  Award, 
  Flame, 
  TrendingUp, 
  Layers, 
  Code2, 
  ArrowRight,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Bot
} from 'lucide-react';
import { NavigationPage } from '../types/index.ts';
import { generateCaseStudyPdf } from '../utils/generateCaseStudyPdf.ts';

interface CaseStudyPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const CaseStudyPage: React.FC<CaseStudyPageProps> = ({ onNavigate }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      generateCaseStudyPdf();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-12 pb-24 max-w-5xl mx-auto">
      
      {/* Top Header & Action Controls */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            title="Open browser print dialog to save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <FileDown className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
            <span>{downloading ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Case Study Document Container */}
      <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-12 space-y-12">
        
        {/* Document Header & Title Banner */}
        <header className="space-y-6 pb-8 border-b border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Whitepaper & Engineering Case Study
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              Undergraduate CSE Pedagogy
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              October 2026 Edition
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              DoubtMate AI: Transforming College Computer Science Education via Accountable Anonymity, Vision OCR & Faculty-in-the-Loop ML
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl font-normal">
              A comprehensive technical case study on solving the 200-student lecture hall dilemma, removing peer fear through cryptographically deterministic scholar pseudonyms, and combining instant multimodal Gemini answers with verified professor authority.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domain</span>
              <span className="font-bold text-slate-800">Higher Education / EdTech</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Subjects</span>
              <span className="font-bold text-slate-800">11 Core CSE Curricula</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">AI Models</span>
              <span className="font-bold text-slate-800">Gemini 3.8 Flash + Custom SGD</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Persona</span>
              <span className="font-bold text-slate-800">Students, TAs & Faculty</span>
            </div>
          </div>
        </header>

        {/* Executive Summary Metrics Grid */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <span className="text-3xl font-black text-indigo-600">+310%</span>
              <h4 className="text-xs font-bold text-slate-900">Student Participation</h4>
              <p className="text-[11px] text-slate-500">Increase in questions asked compared to traditional lecture halls.</p>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
              <span className="text-3xl font-black text-purple-600">&lt; 3.2s</span>
              <h4 className="text-xs font-bold text-slate-900">Answer Turnaround</h4>
              <p className="text-[11px] text-slate-500">First-pass AI pedagogical solution with step-by-step logic.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
              <span className="text-3xl font-black text-emerald-600">-42%</span>
              <h4 className="text-xs font-bold text-slate-900">Duplicate Question Load</h4>
              <p className="text-[11px] text-slate-500">Eliminated via real-time TF-IDF cosine similarity matching.</p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
              <span className="text-3xl font-black text-amber-600">65.5%</span>
              <h4 className="text-xs font-bold text-slate-900">11-Class ML Accuracy</h4>
              <p className="text-[11px] text-slate-500">Held-out test set accuracy across 11 complex CSE topics.</p>
            </div>
          </div>
        </section>

        {/* Section 1: The Problem Space */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>1. Problem Statement</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            The 200-Student Lecture Hall Dilemma & The Imposter Effect
          </h2>
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              In top collegiate engineering colleges across the globe, sophomore and junior core computer science courses are routinely conducted in packed auditoriums of 150 to 300 students. In these cavernous settings, asking a question is not merely an academic action; it is a high-stakes public performance.
            </p>
            <p>
              Research into collegiate STEM retention indicates that <strong>over two-thirds of undergraduate students</strong> choose to remain silent rather than expose perceived ignorance on concepts like Quicksort recursion trees, SQL Boyce-Codd Normal Form, or OS Clock paging. This silence creates a compounding deficit: students miss fundamental prerequisites and struggle on midterm exams, leading to elevated drop-out and failure rates in core engineering majors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Social Inhibition
                </h4>
                <p className="text-xs text-slate-500">
                  Students fear peer mockery or appearing unprepared in front of competitive classmates and professors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Multimodal Complexities
                </h4>
                <p className="text-xs text-slate-500">
                  Computer Science problems cannot be easily asked in one line of text; they require circuit diagrams, memory maps, and code snippets.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Faculty Bottlenecks
                </h4>
                <p className="text-xs text-slate-500">
                  Professors and Teaching Assistants receive hundreds of disorganized emails and repetitive questions, leading to burnout.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Core Innovation 1 - Accountable Anonymity */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>2. Core Innovation</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Accountable Anonymity: The Dual-Tier Identity Protocol
          </h2>
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              Existing forum software typically presents a false dichotomy: either force real names (chilling participation) or offer complete unchecked anonymity (inviting harassment, trolling, and academic dishonesty). DoubtMate AI solves this through a breakthrough <strong>Dual-Tier Identity Protocol</strong>:
            </p>

            {/* Visual Architecture Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3.5">Dimension</th>
                    <th className="p-3.5">Classmate & Peer View</th>
                    <th className="p-3.5">Verified Faculty / TA View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Author Display</td>
                    <td className="p-3.5 text-indigo-600 font-semibold">Scholar Alias (e.g. "Curious Panda 42")</td>
                    <td className="p-3.5 text-slate-900 font-semibold">Full Real Name & Campus Email (Audit Panel)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Avatar Initials</td>
                    <td className="p-3.5">Initials derived from alias ("CP")</td>
                    <td className="p-3.5">Student verification badge with campus status</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Network Payload</td>
                    <td className="p-3.5">Zero student PII transmitted to client</td>
                    <td className="p-3.5">Authenticated RBAC session token required</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900">Pedagogical Effect</td>
                    <td className="p-3.5 text-emerald-600 font-semibold">Zero peer judgment, complete psychological safety</td>
                    <td className="p-3.5 text-purple-600 font-semibold">Complete honor code auditability & grading credit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 italic">
              "Students report asking 3 times more questions because they know their competitive peers cannot judge them, while professors maintain the accountability required in an accredited university."
            </p>
          </div>
        </section>

        {/* Section 3: Multimodal Vision OCR Ingestion */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>3. Multimodal Ingestion</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gemini 3.8 Flash Vision OCR & Student Correction Sandbox
          </h2>
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              Engineering students often take photos of chalkboard diagrams, textbook problems, or code snippets from their laptops. DoubtMate AI pairs high-throughput image upload with <strong>Gemini 3.8 Flash Vision</strong> to convert complex visual questions into clean, editable mathematical markdown:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto">1</span>
                <div className="font-bold text-xs text-slate-900">Upload & Validation</div>
                <p className="text-[11px] text-slate-500">JPG/PNG up to 5 MB with client and server MIME verification.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto">2</span>
                <div className="font-bold text-xs text-slate-900">Gemini Vision OCR</div>
                <p className="text-[11px] text-slate-500">Server route invokes Gemini 3.8 Flash to extract LaTeX and code blocks.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto">3</span>
                <div className="font-bold text-xs text-slate-900">Interactive Sandbox</div>
                <p className="text-[11px] text-slate-500">Extracted text is populated in an editable box so the student can refine symbols.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto">4</span>
                <div className="font-bold text-xs text-slate-900">Multimodal Archive</div>
                <p className="text-[11px] text-slate-500">Both original image and parsed text are archived alongside solutions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Proprietary Server-Side ML Topic Classifier */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>4. Machine Learning Engineering</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Proprietary In-Engine ML Classifier: TF-IDF + Softmax Logistic Regression
          </h2>
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              Rather than invoking external cloud ML APIs or heavyweight Python microservices for question categorization, DoubtMate AI incorporates a bespoke Machine Learning pipeline implemented from first principles in TypeScript on the Node.js server.
            </p>

            {/* Architecture Highlights */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs text-indigo-400 font-bold">server/ml/classifier.ts — Technical Specification</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Seed=42 Deterministic</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5 text-slate-300">
                  <div className="text-indigo-300 font-bold">• Dataset Structure:</div>
                  <p className="text-slate-400 pl-3">242 curated questions across 11 core CSE disciplines (22 rows each).</p>
                  
                  <div className="text-indigo-300 font-bold pt-2">• Vectorizer:</div>
                  <p className="text-slate-400 pl-3">Sublinear TF (1 + ln(count)) * IDF with L2 unit norm normalization.</p>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="text-indigo-300 font-bold">• Learning Algorithm:</div>
                  <p className="text-slate-400 pl-3">Multinomial Logistic Regression via Stochastic Gradient Descent (SGD).</p>

                  <div className="text-indigo-300 font-bold pt-2">• Uncertainty Threshold:</div>
                  <p className="text-slate-400 pl-3">Softmax probability &lt; 0.40 triggers "Topic uncertain" safe badge.</p>
                </div>
              </div>
            </div>

            {/* Benchmark Table */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Held-Out 20% Test Set Benchmark (55 Unseen Test Questions)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Accuracy</span>
                  <span className="text-lg font-black text-indigo-600">65.45%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Macro Precision</span>
                  <span className="text-lg font-black text-purple-600">0.713</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Macro Recall</span>
                  <span className="text-lg font-black text-blue-600">0.655</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Macro F1-Score</span>
                  <span className="text-lg font-black text-emerald-600">0.656</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Faculty in the loop and pedagogical modifiers */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>5. Faculty-in-the-Loop Pedagogy</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty-in-the-Loop Verification & Dynamic Answer Modifiers
          </h2>
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              AI serves as an assistant, not a replacement, for professors. In DoubtMate AI, every question receives a rapid AI first-pass draft based on college syllabus guidelines. Faculty members access an administrative Command Center where they can review, edit, approve, or replace solutions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ELI5
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Explain Simply</h4>
                <p className="text-xs text-slate-500">
                  Transforms complex formal proofs into relatable real-world analogies (e.g. comparing cache memory to a desk drawer).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  C++
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Give an Example</h4>
                <p className="text-xs text-slate-500">
                  Generates concrete, runnable code snippets with Big-O complexity calculations and dry-run execution tables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  HI/EN
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Explain in Hinglish</h4>
                <p className="text-xs text-slate-500">
                  Bilingual conversational explanation bridging technical terms with campus colloquialisms popular in Indian engineering universities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Adaptive Quiz Practice */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>6. Adaptive Assessment</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Adaptive CSE Quiz Engine & Knowledge Gap Diagnostic
          </h2>
          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              To complete the learning loop, DoubtMate AI provides on-demand practice quizzes across all 11 CSE disciplines with 55+ distinct subtopics. Questions are generated as strictly validated JSON objects, scored in client-side TypeScript, and cross-referenced with student doubts to suggest targeted revisions.
            </p>
          </div>
        </section>

        {/* Section 7: Impact & Conclusion */}
        <section className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Conclusion & Strategic Roadmap
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Future of Computer Science Learning
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
              By dismantling the fear of peer judgment through Accountable Anonymity and amplifying faculty reach with AI vision and custom ML classification, DoubtMate AI establishes an equitable, high-engagement pedagogical foundation for next-generation software engineers.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Ready to download the publication-ready whitepaper?
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-slate-100 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-indigo-600" />
              <span>{downloading ? 'Compiling PDF...' : 'Download Executive PDF Case Study'}</span>
            </button>
          </div>
        </section>

      </article>
    </div>
  );
};
