import React, { useState, useRef } from 'react';
import { 
  PlusCircle, 
  EyeOff, 
  Image as ImageIcon, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Upload,
  X,
  FileText,
  ScanLine,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { useDoubts } from '../context/DoubtsContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { NavigationPage } from '../types/index.ts';
import { getAliasGradient, getAliasInitials } from '../utils/alias.ts';
import { CSE_SUBJECTS, getSubjectConfig, getSubjectSubTopics } from '../constants/subjects.ts';

interface AskDoubtProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AskDoubt: React.FC<AskDoubtProps> = ({ onNavigate }) => {
  const { askDoubt } = useDoubts();
  const { profile } = useAuth();

  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState(CSE_SUBJECTS[0].name);
  const [subTopic, setSubTopic] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [extractingImage, setExtractingImage] = useState(false);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentAlias = profile?.alias || 'Curious Panda 42';

  const handleFileUpload = async (file: File) => {
    setError(null);
    setExtractedNotice(null);

    // 1. Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please upload a valid JPG or PNG image.');
      return;
    }

    // 2. Validate file size (5 MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit. Please choose a smaller image.`);
      return;
    }

    // 3. Read file as Base64 data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setImageUrl(base64Data); // Instant preview
      setExtractingImage(true);

      try {
        const res = await fetch('/api/gemini/extract-image-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type
          })
        });

        const data = await res.json();

        if (data.imageUrl) {
          setImageUrl(data.imageUrl); // Clean server URL
        }

        if (data.success && data.extractedText) {
          setQuestionText(data.extractedText);
          setExtractedNotice('Question extracted from image! Please review and correct the text below before submitting.');
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 200);
        } else {
          // Extraction did not find a college question or failed
          setError(
            data.message || 
            "We couldn't clearly detect an academic question in this image. Please type your doubt in the box below instead!"
          );
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 200);
        }
      } catch (err: unknown) {
        console.error('Extraction error:', err);
        setError('Could not scan image. Please type your question manually in the text box.');
      } finally {
        setExtractingImage(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read image file.');
      setExtractingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = questionText.trim();
    if (cleanText.length < 5) {
      setError('Please describe your doubt in at least 5 characters.');
      return;
    }
    if (cleanText.length > 3000) {
      setError('Question text exceeds the 3000-character limit.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const createdId = await askDoubt({
        questionText: cleanText,
        subject,
        subTopic: subTopic.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isAnonymous
      });
      setSuccessId(createdId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not submit your doubt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setQuestionText('');
    setSubTopic('');
    setImageUrl('');
    setSuccessId(null);
    setError(null);
    setExtractedNotice(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Ask Confidently Without Hesitation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ask a Doubt
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload a problem photo or type your question. Gemini Vision extracts the text automatically so you can edit before posting.
        </p>
      </div>

      {successId ? (
        <div className="p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Doubt Posted Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your question has been added to the Community Doubts feed, and our AI Tutor is formulating an explanation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto flex items-center justify-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getAliasGradient(currentAlias)} text-white flex items-center justify-center font-bold text-xs`}>
              {getAliasInitials(currentAlias)}
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800">
                {isAnonymous ? `Posted as: ${currentAlias}` : 'Posted with public student name'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isAnonymous ? 'Your real name is hidden from peers.' : 'Public author name visible.'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('feed')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-2"
            >
              <span>View in Community Feed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Ask Another Doubt
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          
          {/* Subject & Optional Sub-Topic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Academic Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Academic Subject *</span>
                {(() => {
                  const cfg = getSubjectConfig(subject);
                  const Icon = cfg.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText} border ${cfg.chipBorder}`}>
                      <Icon className="w-3 h-3" />
                      <span>{cfg.shortName}</span>
                    </span>
                  );
                })()}
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  const newSubj = e.target.value;
                  setSubject(newSubj);
                  setSubTopic('');
                }}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-colors font-medium text-slate-800"
              >
                {CSE_SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Optional Sub-Topic Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Sub-Topic (Optional)</span>
                <span className="text-[11px] text-slate-400 font-normal">Optional</span>
              </label>
              <select
                value={subTopic}
                onChange={(e) => setSubTopic(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-colors font-medium text-slate-800"
              >
                <option value="">-- General / Any Sub-topic --</option>
                {getSubjectSubTopics(subject).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload Area with Drag & Drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload Problem Image (JPG / PNG up to 5 MB)</span>
              </label>
              <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto OCR with Gemini Vision
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imageUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to upload photo or drag & drop here
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Snap a textbook problem, handwritten notes, or test diagram (JPG or PNG up to 5 MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900/5 shrink-0 border border-slate-200 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Uploaded question preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Attached Problem Image</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Uploaded
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Will be displayed on your question for classmates & faculty.
                  </p>
                  {extractingImage && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 pt-1 animate-pulse">
                      <ScanLine className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Gemini Vision is scanning and extracting text...</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setExtractedNotice(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* AI Extracted Text Notification Banner */}
          {extractedNotice && (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Extracted by Gemini Vision:</span>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {extractedNotice}
                </p>
              </div>
            </div>
          )}

          {/* Question Text Input (Editable) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Question Statement (Editable) *</span>
              </label>
              <span className={`text-[11px] font-semibold ${
                questionText.length > 2800 ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {questionText.length}/3000
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="State your doubt clearly. If you uploaded an image, the extracted text will appear here automatically for you to review and edit..."
              rows={6}
              maxLength={3000}
              className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              The AI answer and faculty review will use this text. Minimum 5 characters.
            </p>
          </div>

          {/* Anonymity Shield Checkbox */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Post Anonymously (Recommended)
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-200/70 text-indigo-800">
                    Privacy Shield
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  When enabled, other students on the community feed will only see your generated scholar alias, never your real name or college email.
                </p>
              </div>
            </label>

            {/* Visual Alias Tag Preview */}
            <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Your Identity Preview:</span>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-indigo-200/60 shadow-xs">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getAliasGradient(currentAlias)} text-white flex items-center justify-center text-[9px] font-bold`}>
                  {getAliasInitials(currentAlias)}
                </div>
                <span className="font-bold text-slate-800 text-[11px]">
                  {isAnonymous ? currentAlias : (profile?.name || 'Your Public Name')}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {isAnonymous ? '(Hidden from peers)' : '(Public)'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('feed')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || extractingImage || questionText.trim().length < 5}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Posting Doubt...' : 'Post Doubt'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
