import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  where,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { Doubt, Answer, DoubtStatus, DoubtReport, ReportStatus } from '../types/index.ts';
import { INITIAL_SAMPLE_DOUBTS, INITIAL_SAMPLE_ANSWERS } from '../data/sampleDoubts.ts';
import { useAuth } from './AuthContext.tsx';

interface DoubtsContextType {
  doubts: Doubt[];
  loading: boolean;
  askDoubt: (data: {
    questionText: string;
    subject: string;
    subTopic?: string;
    imageUrl?: string;
    isAnonymous: boolean;
  }) => Promise<string>;
  getAnswersForDoubt: (doubtId: string) => Promise<Answer[]>;
  addAnswer: (doubtId: string, answerText: string) => Promise<void>;
  updateDoubtStatus: (doubtId: string, status: DoubtStatus) => Promise<void>;
  rateAnswer: (doubtId: string, answerId: string, rating: 'up' | 'down') => Promise<void>;
  requestTeacherReview: (doubtId: string) => Promise<void>;
  modifyAIAnswer: (
    doubtId: string, 
    answerId: string, 
    questionText: string, 
    currentText: string, 
    mode: 'simple' | 'example' | 'hinglish'
  ) => Promise<string>;
  submitReport: (doubtId: string, reason: string) => Promise<void>;
  reports: DoubtReport[];
  updateReportStatus: (reportId: string, status: ReportStatus) => Promise<void>;
  seedSamplesIfEmpty: () => Promise<void>;
}

const DoubtsContext = createContext<DoubtsContextType | undefined>(undefined);

export const DoubtsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, isTeacher } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>(INITIAL_SAMPLE_DOUBTS);
  const [reports, setReports] = useState<DoubtReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Doubts
  useEffect(() => {
    let unsubscribeDoubts: (() => void) | undefined;
    try {
      const q = query(collection(db, 'doubts'), orderBy('createdAt', 'desc'));
      unsubscribeDoubts = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const loaded = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Doubt, 'id'>),
            }));
            setDoubts(loaded);
          } else {
            setDoubts(INITIAL_SAMPLE_DOUBTS);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Realtime doubts subscription error, falling back to cached samples:', error);
          setDoubts(INITIAL_SAMPLE_DOUBTS);
          setLoading(false);
        }
      );
    } catch {
      setDoubts(INITIAL_SAMPLE_DOUBTS);
      setLoading(false);
    }

    return () => {
      if (unsubscribeDoubts) unsubscribeDoubts();
    };
  }, []);

  // Load Reports for Teachers/Admins
  useEffect(() => {
    if (!isTeacher) {
      setReports([]);
      return;
    }

    let unsubReports: (() => void) | undefined;
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      unsubReports = onSnapshot(
        q,
        (snapshot) => {
          const loaded = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<DoubtReport, 'id'>),
          }));
          setReports(loaded);
        },
        (err) => {
          console.warn('Reports read restricted or unavailable:', err);
        }
      );
    } catch {
      // Ignore in non-admin contexts
    }

    return () => {
      if (unsubReports) unsubReports();
    };
  }, [isTeacher]);

  const seedSamplesIfEmpty = async () => {
    try {
      const snap = await getDocs(collection(db, 'doubts'));
      if (snap.empty) {
        for (const doubt of INITIAL_SAMPLE_DOUBTS) {
          const { id, ...data } = doubt;
          await setDoc(doc(db, 'doubts', id), data);
        }
        for (const ans of INITIAL_SAMPLE_ANSWERS) {
          const { id, ...data } = ans;
          await setDoc(doc(db, 'answers', id), data);
        }
      }
    } catch (e) {
      console.warn('Notice: Sample auto-seed was handled locally:', e);
    }
  };

  const askDoubt = async (data: {
    questionText: string;
    subject: string;
    subTopic?: string;
    imageUrl?: string;
    isAnonymous: boolean;
  }): Promise<string> => {
    const text = data.questionText.trim();
    if (text.length < 5 || text.length > 3000) {
      throw new Error('Question must be between 5 and 3000 characters.');
    }
    if (!data.subject) {
      throw new Error('Please select a subject.');
    }

    const currentUserId = user ? user.uid : (profile ? profile.id : 'anonymous_student');
    const studentAlias = profile?.alias || 'Inquisitive Scholar';

    // Predict topic using server-side TF-IDF & Logistic Regression model
    let predictedTopic = `${data.subject} Core Concept`;
    let topicConfidence = 0.85;

    try {
      const predRes = await fetch('/api/classifier/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (predRes.ok) {
        const predData = await predRes.json();
        topicConfidence = predData.topicConfidence;
        if (topicConfidence < 0.40) {
          predictedTopic = 'Topic uncertain';
        } else {
          predictedTopic = predData.predictedTopic;
        }
      }
    } catch (e) {
      console.warn('Classifier prediction fallback:', e);
    }

    const newDoubt: Omit<Doubt, 'id'> = {
      userId: currentUserId,
      questionText: text,
      subject: data.subject,
      subTopic: data.subTopic?.trim() || undefined,
      predictedTopic,
      topicConfidence,
      imageUrl: data.imageUrl?.trim() || undefined,
      isAnonymous: data.isAnonymous,
      authorAlias: studentAlias,
      authorName: data.isAnonymous ? undefined : (profile?.name || studentAlias),
      authorEmail: profile?.email || 'student@college.edu',
      status: 'open',
      createdAt: new Date().toISOString(),
      answersCount: 0
    };

    let createdId = '';
    try {
      if (user) {
        const docRef = await addDoc(collection(db, 'doubts'), newDoubt);
        createdId = docRef.id;
      } else {
        createdId = `doubt_${Date.now()}`;
        const created: Doubt = { id: createdId, ...newDoubt };
        setDoubts((prev) => [created, ...prev]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'doubts');
    }

    // Auto-generate AI answer via server Gemini endpoint
    try {
      const autoRes = await fetch('/api/gemini/auto-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: text,
          subject: data.subject
        })
      });

      if (autoRes.ok) {
        const autoData = await autoRes.json();
        if (autoData.answerText) {
          const aiAnswer: Omit<Answer, 'id'> = {
            doubtId: createdId,
            userId: 'doubtmate_ai',
            authorName: 'DoubtMate AI Tutor',
            answerText: autoData.answerText,
            source: 'ai',
            isVerified: false,
            createdAt: new Date().toISOString()
          };

          if (user) {
            await addDoc(collection(db, 'answers'), aiAnswer);
            await updateDoc(doc(db, 'doubts', createdId), {
              status: 'answered',
              answersCount: 1
            });
          } else {
            INITIAL_SAMPLE_ANSWERS.push({ id: `ans_${Date.now()}`, ...aiAnswer });
            setDoubts((prev) =>
              prev.map((d) =>
                d.id === createdId ? { ...d, status: 'answered', answersCount: 1 } : d
              )
            );
          }
        }
      }
    } catch (e) {
      console.warn('AI auto-answer generation failed gracefully:', e);
    }

    return createdId;
  };

  const getAnswersForDoubt = async (doubtId: string): Promise<Answer[]> => {
    try {
      const q = query(
        collection(db, 'answers'),
        where('doubtId', '==', doubtId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreAnswers = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Answer, 'id'>),
        }));
        return firestoreAnswers.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    } catch (e) {
      console.warn('Could not read answers from Firestore:', e);
    }
    return INITIAL_SAMPLE_ANSWERS.filter((a) => a.doubtId === doubtId);
  };

  const addAnswer = async (doubtId: string, answerText: string) => {
    const text = answerText.trim();
    if (text.length < 2 || text.length > 5000) {
      throw new Error('Answer must be between 2 and 5000 characters.');
    }

    const currentUserId = user ? user.uid : (profile ? profile.id : 'faculty_member');
    const authorName = profile?.name ? `${profile.name} (Faculty)` : 'Faculty Instructor';

    const newAnswer: Omit<Answer, 'id'> = {
      doubtId,
      userId: currentUserId,
      authorName,
      answerText: text,
      source: 'teacher',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    try {
      if (user) {
        await addDoc(collection(db, 'answers'), newAnswer);
        const doubtRef = doc(db, 'doubts', doubtId);
        await updateDoc(doubtRef, { status: 'answered' });
      } else {
        const localAns: Answer = { id: `ans_${Date.now()}`, ...newAnswer };
        INITIAL_SAMPLE_ANSWERS.push(localAns);
        setDoubts((prev) =>
          prev.map((d) =>
            d.id === doubtId
              ? { ...d, status: 'answered', answersCount: (d.answersCount || 0) + 1 }
              : d
          )
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'answers');
    }
  };

  const rateAnswer = async (doubtId: string, answerId: string, rating: 'up' | 'down') => {
    try {
      if (user) {
        const answerRef = doc(db, 'answers', answerId);
        await updateDoc(answerRef, { rating });
        // If thumbs-down, set doubt status to "needs teacher review"
        if (rating === 'down') {
          const doubtRef = doc(db, 'doubts', doubtId);
          await updateDoc(doubtRef, { status: 'needs teacher review' });
        }
      }
      // Update local state
      setDoubts((prev) =>
        prev.map((d) => (d.id === doubtId && rating === 'down' ? { ...d, status: 'needs teacher review' } : d))
      );
      const target = INITIAL_SAMPLE_ANSWERS.find((a) => a.id === answerId);
      if (target) target.rating = rating;
    } catch (e) {
      console.warn('Rating save error:', e);
    }
  };

  const requestTeacherReview = async (doubtId: string) => {
    try {
      if (user) {
        const doubtRef = doc(db, 'doubts', doubtId);
        await updateDoc(doubtRef, { status: 'needs teacher review' });
      }
      setDoubts((prev) =>
        prev.map((d) => (d.id === doubtId ? { ...d, status: 'needs teacher review' } : d))
      );
    } catch (e) {
      console.warn('Teacher review request error:', e);
    }
  };

  const modifyAIAnswer = async (
    doubtId: string, 
    answerId: string, 
    questionText: string, 
    currentText: string, 
    mode: 'simple' | 'example' | 'hinglish'
  ): Promise<string> => {
    const res = await fetch('/api/gemini/modify-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalAnswer: currentText,
        questionText,
        mode
      })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to modify answer');
    }
    const data = await res.json();
    return data.modifiedText;
  };

  const updateDoubtStatus = async (doubtId: string, status: DoubtStatus) => {
    try {
      if (user) {
        const doubtRef = doc(db, 'doubts', doubtId);
        await updateDoc(doubtRef, { status });
      }
      setDoubts((prev) =>
        prev.map((d) => (d.id === doubtId ? { ...d, status } : d))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `doubts/${doubtId}`);
    }
  };

  const submitReport = async (doubtId: string, reason: string) => {
    const cleanReason = reason.trim();
    if (cleanReason.length < 3 || cleanReason.length > 500) {
      throw new Error('Report reason must be between 3 and 500 characters.');
    }

    const currentUserId = user ? user.uid : (profile ? profile.id : 'reporter');
    const newReport: Omit<DoubtReport, 'id'> = {
      doubtId,
      userId: currentUserId,
      reason: cleanReason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      if (user) {
        await addDoc(collection(db, 'reports'), newReport);
      } else {
        const localRep: DoubtReport = { id: `rep_${Date.now()}`, ...newReport };
        setReports((prev) => [localRep, ...prev]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    }
  };

  const updateReportStatus = async (reportId: string, status: ReportStatus) => {
    try {
      if (user) {
        const reportRef = doc(db, 'reports', reportId);
        await updateDoc(reportRef, { status });
      }
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  return (
    <DoubtsContext.Provider
      value={{
        doubts,
        loading,
        askDoubt,
        getAnswersForDoubt,
        addAnswer,
        updateDoubtStatus,
        rateAnswer,
        requestTeacherReview,
        modifyAIAnswer,
        submitReport,
        reports,
        updateReportStatus,
        seedSamplesIfEmpty
      }}
    >
      {children}
    </DoubtsContext.Provider>
  );
};

export function useDoubts() {
  const context = useContext(DoubtsContext);
  if (!context) {
    throw new Error('useDoubts must be used within DoubtsProvider');
  }
  return context;
}
