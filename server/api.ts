import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ai, COLLEGE_TUTOR_SYSTEM_INSTRUCTION } from './gemini.ts';
import { DoubtClassifier } from './ml/classifier.ts';

export const apiRouter = Router();

// Server-side allowlists for role enforcement
// The owner/user is automatically registered as admin
export const ADMIN_EMAILS: string[] = [
  'shouryagoyal2006@gmail.com',
  'admin@doubtmate.edu'
];

export const TEACHER_EMAILS: string[] = [
  'teacher@doubtmate.edu',
  'prof.shourya@doubtmate.edu',
  'faculty@doubtmate.edu'
];

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'DoubtMate AI',
    timestamp: new Date().toISOString()
  });
});

// Role verification endpoint - server authoritative
apiRouter.post('/auth/verify-role', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    let role = 'student';

    if (ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalizedEmail)) {
      role = 'admin';
    } else if (TEACHER_EMAILS.map(e => e.toLowerCase()).includes(normalizedEmail)) {
      role = 'teacher';
    }

    res.json({
      email: normalizedEmail,
      role,
      isAdmin: role === 'admin',
      isTeacher: role === 'teacher' || role === 'admin',
      isAllowlisted: role !== 'student'
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal error';
    res.status(500).json({ error: errorMsg });
  }
});

// Allowlist management endpoint (for Teachers/Admins to inspect or add emails)
apiRouter.get('/admin/allowlist', (_req: Request, res: Response) => {
  res.json({
    admins: ADMIN_EMAILS,
    teachers: TEACHER_EMAILS
  });
});

apiRouter.post('/admin/allowlist', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  const cleanEmail = email.trim().toLowerCase();
  if (role === 'admin') {
    if (!ADMIN_EMAILS.includes(cleanEmail)) ADMIN_EMAILS.push(cleanEmail);
  } else if (role === 'teacher') {
    if (!TEACHER_EMAILS.includes(cleanEmail)) TEACHER_EMAILS.push(cleanEmail);
  } else {
    res.status(400).json({ error: 'Role must be admin or teacher' });
    return;
  }
  res.json({ success: true, admins: ADMIN_EMAILS, teachers: TEACHER_EMAILS });
});

// App configuration metadata
apiRouter.get('/config', (_req: Request, res: Response) => {
  res.json({
    tagline: 'Ask Freely. Learn Confidently. Grow Together.',
    subjects: [
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Data Science & AI',
      'Economics & Finance'
    ],
    maxQuestionLength: 3000,
    maxAnswerLength: 5000
  });
});

// GEMINI API SERVER ROUTES
// 1. AI Tutor Interactive Chat with conversation history & modifiers
apiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, modifier } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Conversation messages array is required.' });
      return;
    }

    // Format conversation history for Gemini API
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // If a modifier was requested on the latest prompt
    if (modifier && contents.length > 0) {
      const last = contents[contents.length - 1];
      let prefix = '';
      if (modifier === 'simple') prefix = '[Instruction: Explain this concept simply using an everyday intuitive analogy (ELI5).]\n\n';
      else if (modifier === 'example') prefix = '[Instruction: Provide a concrete, practical code or mathematical real-world example with step-by-step breakdown.]\n\n';
      else if (modifier === 'hinglish') prefix = '[Instruction: Explain this concept in a friendly, conversational Hinglish (Hindi + English) style commonly spoken by college students.]\n\n';
      
      last.parts[0].text = `${prefix}${last.parts[0].text}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: COLLEGE_TUTOR_SYSTEM_INSTRUCTION,
      }
    });

    const reply = response.text || 'I could not generate an explanation for this query. Please check with your teacher!';
    res.json({ reply });
  } catch (err: unknown) {
    console.error('Gemini chat error:', err);
    const errStr = err instanceof Error ? err.message : String(err);
    const isRateLimit = errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate');
    
    res.status(isRateLimit ? 429 : 500).json({
      error: isRateLimit
        ? 'DoubtMate AI Tutor is experiencing high college traffic right now. Your question has been saved—please try again in a few moments, or ask your course instructor!'
        : 'AI Tutor is momentarily unavailable. Your question was kept safe—please try again shortly.',
      rateLimited: isRateLimit
    });
  }
});

// 2. Auto-generate AI answer when doubt is posted
apiRouter.post('/gemini/auto-answer', async (req: Request, res: Response) => {
  try {
    const { questionText, subject } = req.body;
    if (!questionText || typeof questionText !== 'string') {
      res.status(400).json({ error: 'Question text is required.' });
      return;
    }

    const prompt = `A college student posted the following doubt in their ${subject || 'coursework'} course:
"${questionText.trim()}"

Provide a structured, step-by-step, educational answer:
1. Core Concept & Direct Answer
2. Step-by-Step Breakdown / Derivation / Key Insight
3. Common Pitfalls / Things to Remember
4. Concluding note reminding them they can ask a teacher if anything remains unclear.
Keep formatting clean with markdown headings and bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: COLLEGE_TUTOR_SYSTEM_INSTRUCTION,
      }
    });

    const answerText = response.text || 'Step-by-step AI explanation generated.';
    res.json({ answerText });
  } catch (err: unknown) {
    console.error('Gemini auto-answer error:', err);
    res.status(500).json({
      error: 'Could not auto-generate AI answer. Student question was saved successfully.',
    });
  }
});

// 3. Modifier for an existing AI answer ("Explain simply", "Give an example", "Explain in Hinglish")
apiRouter.post('/gemini/modify-answer', async (req: Request, res: Response) => {
  try {
    const { originalAnswer, questionText, mode } = req.body;
    if (!originalAnswer || !mode) {
      res.status(400).json({ error: 'originalAnswer and mode are required.' });
      return;
    }

    let instruction = '';
    if (mode === 'simple') {
      instruction = 'Re-explain this answer in a much simpler, intuitive way using an everyday relatable analogy that a first-year college student can instantly grasp without heavy mathematical or technical jargon.';
    } else if (mode === 'example') {
      instruction = 'Provide a concrete, real-world practical code example or mathematical numerical walkthrough illustrating this exact explanation step-by-step.';
    } else if (mode === 'hinglish') {
      instruction = 'Re-explain this concept in friendly, clear Hinglish (conversational mix of Hindi and English like college students speak in campus labs). Keep technical terms in English, but explain intuition in Hindi phrases (e.g. "Basically ye process tab trigger hota hai jab...").';
    } else {
      instruction = 'Provide a clearer breakdown of this explanation.';
    }

    const prompt = `Context Question: "${questionText || 'Concept'}"

Current Explanation:
"${originalAnswer}"

Instruction: ${instruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: COLLEGE_TUTOR_SYSTEM_INSTRUCTION,
      }
    });

    const modifiedText = response.text || originalAnswer;
    res.json({ modifiedText });
  } catch (err: unknown) {
    console.error('Gemini modify-answer error:', err);
    res.status(500).json({
      error: 'Could not generate alternative explanation at this moment.',
    });
  }
});

// 4. Image Upload & Gemini Vision Question Text Extraction
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
apiRouter.use('/uploads', express.static(uploadsDir));

apiRouter.post('/gemini/extract-image-question', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: 'imageBase64 and mimeType are required.' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      res.status(400).json({
        error: 'Invalid file format. Only JPG and PNG image files are supported.'
      });
      return;
    }

    // Extract raw base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // 5 MB limit validation (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      res.status(400).json({
        error: `Image size (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit. Please upload an image under 5 MB.`
      });
      return;
    }

    // Save image to static uploads folder
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileId = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const filePath = path.join(uploadsDir, fileId);
    fs.writeFileSync(filePath, buffer);
    const imageUrl = `/api/uploads/${fileId}`;

    // Call Gemini Vision to extract question text
    const imagePart = {
      inlineData: {
        mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
        data: cleanBase64,
      },
    };

    const promptPart = {
      text: `You are an academic OCR and college exam question extraction assistant.
Look carefully at this image.
1. Determine if this image contains a college, university, high-school, or STEM academic question, mathematical equation, whiteboard derivation, circuit diagram, chemistry reaction, coding problem, or lecture assignment prompt.
2. If this image is NOT an academic question (e.g. personal selfie, pet, scenery, meal, funny meme, random object, or completely unreadable blur), you MUST start your response with:
INVALID_IMAGE: <brief friendly explanation of why it is not an academic question>
3. If it IS an academic question, accurately extract and transcribe the complete problem statement, preserving:
- Numerical constants, variables, mathematical notation, and equations
- Chemical formulas or molecular names
- Code snippets or algorithm pseudocode
- Multiple-choice options (A, B, C, D) if present
- The exact question directive / what needs to be solved
Output ONLY the clean transcribed question text with no conversational preamble or solution.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, promptPart] }
    });

    const extractedText = (response.text || '').trim();

    if (extractedText.startsWith('INVALID_IMAGE:') || extractedText.length < 5) {
      const reason = extractedText.replace('INVALID_IMAGE:', '').trim() || 'No recognizable college academic question found.';
      res.json({
        success: false,
        isAcademicQuestion: false,
        imageUrl,
        reason,
        message: "We couldn't detect a clear college question in this image. Please type your doubt in the box below instead!"
      });
      return;
    }

    res.json({
      success: true,
      isAcademicQuestion: true,
      extractedText,
      imageUrl
    });
  } catch (err: unknown) {
    console.error('Gemini vision extraction error:', err);
    res.status(500).json({
      success: false,
      error: 'Vision OCR extraction failed. Please type your question manually in the box.',
      message: 'Image extraction failed. Please type your question in the text box.'
    });
  }
});

// 5. Doubt Classifier ML Endpoints
apiRouter.get('/admin/model-metrics', (_req: Request, res: Response) => {
  try {
    const metrics = DoubtClassifier.getInstance().getMetrics();
    res.json(metrics);
  } catch (err: unknown) {
    console.error('Model metrics error:', err);
    res.status(500).json({ error: 'Could not load classifier metrics' });
  }
});

apiRouter.post('/admin/retrain-model', (_req: Request, res: Response) => {
  try {
    const result = DoubtClassifier.getInstance().train();
    res.json({ success: true, metrics: result.metrics });
  } catch (err: unknown) {
    console.error('Model retrain error:', err);
    res.status(500).json({ error: 'Model training failed' });
  }
});

apiRouter.post('/classifier/predict', (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text string is required for prediction' });
      return;
    }
    const result = DoubtClassifier.getInstance().predict(text);
    res.json(result);
  } catch (err: unknown) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// 6. TF-IDF Cosine Similarity for Similar Doubts
apiRouter.post('/classifier/similar', (req: Request, res: Response) => {
  try {
    const { queryText, candidates, threshold } = req.body;
    if (!queryText || !Array.isArray(candidates)) {
      res.status(400).json({ error: 'queryText and candidates array are required' });
      return;
    }
    const th = typeof threshold === 'number' ? threshold : 0.25;
    const results = DoubtClassifier.getInstance().findSimilar(queryText, candidates, th);
    res.json({ results });
  } catch (err: unknown) {
    console.error('Similar doubts error:', err);
    res.status(500).json({ error: 'Failed to compute similarity' });
  }
});

// 7. Quiz Practice Generation
export interface RawQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function validateQuizQuestions(data: unknown): RawQuizQuestion[] | null {
  if (!Array.isArray(data) || data.length < 5) return null;
  const questions: RawQuizQuestion[] = [];
  for (let i = 0; i < 5; i++) {
    const item = data[i];
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.question !== 'string' ||
      item.question.trim().length < 5 ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      !item.options.every((opt: unknown) => typeof opt === 'string' && opt.trim().length > 0) ||
      typeof item.correctIndex !== 'number' ||
      !Number.isInteger(item.correctIndex) ||
      item.correctIndex < 0 ||
      item.correctIndex > 3 ||
      typeof item.explanation !== 'string' ||
      item.explanation.trim().length < 5
    ) {
      return null;
    }
    questions.push({
      question: item.question.trim(),
      options: item.options.map((o: string) => o.trim()),
      correctIndex: item.correctIndex,
      explanation: item.explanation.trim()
    });
  }
  return questions;
}

apiRouter.post('/quiz/generate', async (req: Request, res: Response) => {
  const { topic, subTopic, difficulty } = req.body;
  const cleanTopic = typeof topic === 'string' && topic.trim() ? topic.trim() : 'Data Structures & Algorithms';
  const cleanSubTopic = typeof subTopic === 'string' && subTopic.trim() ? subTopic.trim() : '';
  const cleanDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';

  const systemInstruction = `You are an expert college computer science & engineering (CSE) academic examiner.
Generate exactly 5 high quality multiple-choice questions (MCQs) for undergraduate CSE college students on the specified core subject/topic and difficulty level.
You MUST output STRICT JSON ONLY: a JSON array containing exactly 5 objects.
Each object must have the following exact schema:
[
  {
    "question": "string problem statement",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctIndex": 0,
    "explanation": "clear step-by-step conceptual explanation of why the correct option is right and others are incorrect"
  }
]
correctIndex MUST be an integer between 0 and 3.
Ensure the questions test genuine conceptual understanding, algorithmic derivation, complexity analysis, code output, or problem-solving rather than mere trivial recall.`;

  const prompt = `Core CSE Subject: ${cleanTopic}${cleanSubTopic ? `\nFocus Sub-Topic: ${cleanSubTopic}` : ''}
Difficulty level: ${cleanDifficulty}

Generate 5 rigorous, diverse undergraduate college multiple-choice questions for this CSE topic and difficulty.
Return ONLY the raw JSON array.`;

  const generateAttempt = async (): Promise<RawQuizQuestion[] | null> => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      return validateQuizQuestions(parsed);
    } catch {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          return validateQuizQuestions(parsed);
        } catch {
          return null;
        }
      }
      return null;
    }
  };

  try {
    // Attempt 1
    let questions = await generateAttempt();

    // Retry once if invalid
    if (!questions) {
      console.warn('Quiz generation attempt 1 failed validation. Retrying once...');
      questions = await generateAttempt();
    }

    if (!questions) {
      res.status(502).json({
        error: 'Could not generate valid quiz questions. Please try again or select another topic.'
      });
      return;
    }

    res.json({
      topic: cleanTopic,
      difficulty: cleanDifficulty,
      questions,
      notice: 'AI-generated answer keys may contain errors.'
    });
  } catch (err: unknown) {
    console.error('Quiz generation error:', err);
    res.status(500).json({
      error: 'Failed to contact AI quiz generator. Please try again shortly.'
    });
  }
});




