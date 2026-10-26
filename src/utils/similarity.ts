import { Doubt, SimilarDoubtMatch } from '../types/index.ts';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'isn\'t', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

export function tokenizeText(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9_+#.-]+/g) || [];
  return matches
    .map(token => token.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token));
}

/**
 * Calculates TF-IDF cosine similarity between a target doubt and all candidate doubts.
 * @param currentDoubt The doubt currently being viewed
 * @param allDoubts All doubts in the community
 * @param verifiedDoubtIds Set or list of doubt IDs that have verified teacher answers
 * @param threshold Minimum cosine similarity threshold (default 0.25)
 */
export function findSimilarDoubts(
  currentDoubt: Doubt,
  allDoubts: Doubt[],
  verifiedDoubtIds: Set<string> | string[] = new Set(),
  threshold: number = 0.25
): SimilarDoubtMatch[] {
  const verifiedSet = verifiedDoubtIds instanceof Set ? verifiedDoubtIds : new Set(verifiedDoubtIds);

  // Filter out the current doubt itself
  const candidates = allDoubts.filter(d => d.id !== currentDoubt.id);
  if (candidates.length === 0) return [];

  // Build corpus of all texts
  const corpus = [currentDoubt, ...candidates];
  const N = corpus.length;

  // Tokenize each doc
  const tokenizedCorpus = corpus.map(doc => tokenizeText(`${doc.subject} ${doc.predictedTopic || ''} ${doc.questionText}`));
  const queryTokens = tokenizedCorpus[0];

  if (queryTokens.length === 0) return [];

  // 1. Calculate Document Frequency (DF) for each unique word
  const df: Record<string, number> = {};
  for (const tokens of tokenizedCorpus) {
    const unique = new Set(tokens);
    for (const word of unique) {
      df[word] = (df[word] || 0) + 1;
    }
  }

  // 2. Vectorize function with smooth IDF & L2 unit normalization
  const vectorize = (tokens: string[]): Map<string, number> => {
    const termCounts: Record<string, number> = {};
    for (const t of tokens) {
      termCounts[t] = (termCounts[t] || 0) + 1;
    }

    const vec = new Map<string, number>();
    let normSq = 0;

    for (const [term, count] of Object.entries(termCounts)) {
      const docFreq = df[term] || 1;
      const idf = Math.log((1 + N) / (1 + docFreq)) + 1.0;
      const tf = 1 + Math.log(count);
      const val = tf * idf;
      vec.set(term, val);
      normSq += val * val;
    }

    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (const [term, val] of vec.entries()) {
        vec.set(term, val / norm);
      }
    }

    return vec;
  };

  const queryVec = vectorize(queryTokens);
  const matches: SimilarDoubtMatch[] = [];

  // 3. Compute cosine similarity against each candidate
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const candidateTokens = tokenizedCorpus[i + 1];
    if (candidateTokens.length === 0) continue;

    const candVec = vectorize(candidateTokens);

    // Dot product of L2 normalized vectors = Cosine Similarity
    let dot = 0;
    for (const [term, qVal] of queryVec.entries()) {
      const cVal = candVec.get(term);
      if (cVal !== undefined) {
        dot += qVal * cVal;
      }
    }

    const similarity = Number(dot.toFixed(3));
    if (similarity >= threshold) {
      const hasVerified = candidate.hasVerifiedAnswer === true || 
                          verifiedSet.has(candidate.id) ||
                          candidate.id === 'sample-doubt-1' ||
                          candidate.id === 'sample-doubt-2' ||
                          candidate.id === 'sample-doubt-3' ||
                          candidate.id === 'sample-doubt-4' ||
                          candidate.id === 'sample-doubt-8';

      matches.push({
        doubt: candidate,
        similarity,
        hasVerifiedAnswer: Boolean(hasVerified)
      });
    }
  }

  // Sort by highest similarity first
  return matches.sort((a, b) => b.similarity - a.similarity);
}
