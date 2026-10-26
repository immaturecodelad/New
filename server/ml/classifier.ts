import fs from 'fs';
import path from 'path';

export interface DatasetItem {
  text: string;
  category: string;
}

export interface ModelMetrics {
  datasetSize: number;
  trainSize: number;
  testSize: number;
  categoryCounts: Record<string, number>;
  splitMethod: string;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  perClassMetrics: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
  confusionMatrix: {
    labels: string[];
    matrix: number[][]; // rows: true label, cols: predicted label
  };
  trainedAt: string;
}

export interface ModelWeightsFile {
  vocabulary: Record<string, number>;
  idf: number[];
  classes: string[];
  weights: number[][]; // K x D
  biases: number[]; // K
  metrics: ModelMetrics;
}

export interface PredictionResult {
  predictedTopic: string;
  topicConfidence: number;
  isUncertain: boolean;
  displayBadge: string;
  allProbabilities: Record<string, number>;
}

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

// Deterministic Pseudo-Random Generator (Lehmer LCG with seed=42)
export function createRng(seed: number = 42) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9_+#.-]+/g) || [];
  return matches
    .map(token => token.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token));
}

export class DoubtClassifier {
  private static instance: DoubtClassifier | null = null;
  private modelData: ModelWeightsFile | null = null;

  private constructor() {
    this.loadOrTrainModel();
  }

  public static getInstance(): DoubtClassifier {
    if (!DoubtClassifier.instance) {
      DoubtClassifier.instance = new DoubtClassifier();
    }
    return DoubtClassifier.instance;
  }

  public loadOrTrainModel(): ModelWeightsFile {
    const weightsPath = path.resolve(process.cwd(), 'server/ml/model_weights.json');
    if (fs.existsSync(weightsPath)) {
      try {
        const raw = fs.readFileSync(weightsPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.classes && parsed.classes.length === 11 && parsed.metrics?.datasetSize >= 220) {
          this.modelData = parsed;
          return this.modelData!;
        }
      } catch (e) {
        console.warn('Error reading model_weights.json, retraining...', e);
      }
    }
    return this.train();
  }

  public train(): ModelWeightsFile {
    const datasetPath = path.resolve(process.cwd(), 'server/ml/dataset.json');
    const rawDataset = fs.readFileSync(datasetPath, 'utf-8');
    const dataset: DatasetItem[] = JSON.parse(rawDataset);

    const classes = Array.from(new Set(dataset.map(d => d.category))).sort();
    const classToIndex: Record<string, number> = Object.create(null);
    classes.forEach((c, i) => { classToIndex[c] = i; });

    const categoryCounts: Record<string, number> = Object.create(null);
    for (const item of dataset) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    // Stratified 80/20 train/test split with fixed random seed (seed = 42)
    const rng = createRng(42);
    const byCategory: Record<string, DatasetItem[]> = Object.create(null);
    for (const c of classes) byCategory[c] = [];
    for (const item of dataset) byCategory[item.category].push(item);

    const trainSet: DatasetItem[] = [];
    const testSet: DatasetItem[] = [];

    for (const c of classes) {
      const items = [...byCategory[c]];
      // Fisher-Yates shuffle with fixed seed
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      const splitIdx = Math.floor(items.length * 0.8);
      trainSet.push(...items.slice(0, splitIdx));
      testSet.push(...items.slice(splitIdx));
    }

    // Shuffle trainSet across categories with fixed seed
    for (let i = trainSet.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [trainSet[i], trainSet[j]] = [trainSet[j], trainSet[i]];
    }

    // 1. Build Vocabulary from Train Set (DF >= 1)
    const docFrequencies: Record<string, number> = Object.create(null);
    const trainTokens = trainSet.map(item => {
      const tokens = tokenize(item.text);
      const uniqueTokens = new Set(tokens);
      for (const t of uniqueTokens) {
        docFrequencies[t] = (docFrequencies[t] || 0) + 1;
      }
      return tokens;
    });

    const sortedWords = Object.keys(docFrequencies).sort();
    const vocabulary: Record<string, number> = Object.create(null);
    sortedWords.forEach((word, idx) => {
      vocabulary[word] = idx;
    });

    const vocabSize = sortedWords.length;
    const numTrainDocs = trainSet.length;

    // 2. Compute IDF vector
    const idf: number[] = new Array(vocabSize);
    for (let i = 0; i < vocabSize; i++) {
      const word = sortedWords[i];
      const df = docFrequencies[word] || 0;
      idf[i] = Math.log((1 + numTrainDocs) / (1 + df)) + 1.0;
    }

    // Vectorize helper
    const vectorize = (tokens: string[]): number[] => {
      const counts: Record<string, number> = Object.create(null);
      for (const t of tokens) {
        if (vocabulary[t] !== undefined) {
          counts[t] = (counts[t] || 0) + 1;
        }
      }
      const vec = new Array(vocabSize).fill(0);
      let normSq = 0;
      for (const [t, count] of Object.entries(counts)) {
        const idx = vocabulary[t];
        const tf = 1 + Math.log(count);
        const val = tf * idf[idx];
        vec[idx] = val;
        normSq += val * val;
      }
      const norm = Math.sqrt(normSq);
      if (norm > 0) {
        for (let i = 0; i < vocabSize; i++) {
          vec[i] /= norm;
        }
      }
      return vec;
    };

    const X_train = trainTokens.map(tokens => vectorize(tokens));
    const y_train = trainSet.map(item => classToIndex[item.category]);

    // 3. Multinomial Logistic Regression (Softmax Regression via SGD)
    const K = classes.length;
    const D = vocabSize;
    const weights: number[][] = Array.from({ length: K }, () => new Array(D).fill(0));
    const biases: number[] = new Array(K).fill(0);

    const epochs = 60;
    const learningRate = 0.8;
    const l2Lambda = 0.0001;

    // Training Loop (Stochastic Gradient Descent)
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < numTrainDocs; i++) {
        const x = X_train[i];
        const trueLabel = y_train[i];

        const nonZeros: number[] = [];
        for (let j = 0; j < D; j++) {
          if (x[j] !== 0) nonZeros.push(j);
        }

        // Compute logits
        const logits = new Array(K);
        let maxLogit = -Infinity;
        for (let k = 0; k < K; k++) {
          let dot = biases[k];
          for (const j of nonZeros) {
            dot += weights[k][j] * x[j];
          }
          logits[k] = dot;
          if (dot > maxLogit) maxLogit = dot;
        }

        // Softmax with numerical stability
        let sumExp = 0;
        const probs = new Array(K);
        for (let k = 0; k < K; k++) {
          probs[k] = Math.exp(logits[k] - maxLogit);
          sumExp += probs[k];
        }
        for (let k = 0; k < K; k++) {
          probs[k] /= sumExp;
        }

        // Stochastic update
        for (let k = 0; k < K; k++) {
          const target = k === trueLabel ? 1 : 0;
          const error = probs[k] - target;
          biases[k] -= 0.05 * error;
          for (const j of nonZeros) {
            weights[k][j] -= learningRate * (error * x[j] + l2Lambda * weights[k][j]);
          }
        }
      }
    }

    // 4. Evaluation on Held-Out Test Set (20%)
    const X_test = testSet.map(item => vectorize(tokenize(item.text)));
    const y_test = testSet.map(item => classToIndex[item.category]);

    const confusionMatrix: number[][] = Array.from({ length: K }, () => new Array(K).fill(0));
    let correctCount = 0;

    for (let i = 0; i < testSet.length; i++) {
      const x = X_test[i];
      const trueLabel = y_test[i];

      // Predict
      const logits = new Array(K);
      let maxLogit = -Infinity;
      for (let k = 0; k < K; k++) {
        let dot = biases[k];
        for (let j = 0; j < D; j++) {
          if (x[j] !== 0) dot += weights[k][j] * x[j];
        }
        logits[k] = dot;
        if (dot > maxLogit) maxLogit = dot;
      }

      let bestK = 0;
      let bestVal = -Infinity;
      for (let k = 0; k < K; k++) {
        if (logits[k] > bestVal) {
          bestVal = logits[k];
          bestK = k;
        }
      }

      confusionMatrix[trueLabel][bestK]++;
      if (bestK === trueLabel) correctCount++;
    }

    const testAccuracy = Number((correctCount / testSet.length).toFixed(4));

    // Per-class metrics
    const perClassMetrics: Record<string, { precision: number; recall: number; f1: number; support: number }> = {};
    let sumPrec = 0;
    let sumRec = 0;
    let sumF1 = 0;

    for (let k = 0; k < K; k++) {
      const className = classes[k];
      const tp = confusionMatrix[k][k];
      let fp = 0;
      let fn = 0;
      for (let i = 0; i < K; i++) {
        if (i !== k) {
          fp += confusionMatrix[i][k];
          fn += confusionMatrix[k][i];
        }
      }
      const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
      const support = tp + fn;

      perClassMetrics[className] = {
        precision: Number(precision.toFixed(3)),
        recall: Number(recall.toFixed(3)),
        f1: Number(f1.toFixed(3)),
        support
      };

      sumPrec += precision;
      sumRec += recall;
      sumF1 += f1;
    }

    const macroPrecision = Number((sumPrec / K).toFixed(3));
    const macroRecall = Number((sumRec / K).toFixed(3));
    const macroF1 = Number((sumF1 / K).toFixed(3));

    const metrics: ModelMetrics = {
      datasetSize: dataset.length,
      trainSize: trainSet.length,
      testSize: testSet.length,
      categoryCounts,
      splitMethod: 'Stratified 80/20 train/test split with fixed random seed (seed=42)',
      accuracy: testAccuracy,
      macroPrecision,
      macroRecall,
      macroF1,
      perClassMetrics,
      confusionMatrix: {
        labels: classes,
        matrix: confusionMatrix
      },
      trainedAt: new Date().toISOString()
    };

    const modelWeights: ModelWeightsFile = {
      vocabulary,
      idf,
      classes,
      weights,
      biases,
      metrics
    };

    // Save to server/ml/model_weights.json
    const weightsPath = path.resolve(process.cwd(), 'server/ml/model_weights.json');
    fs.mkdirSync(path.dirname(weightsPath), { recursive: true });
    fs.writeFileSync(weightsPath, JSON.stringify(modelWeights, null, 2));

    this.modelData = modelWeights;
    return modelWeights;
  }

  public predict(text: string): PredictionResult {
    if (!this.modelData) {
      this.loadOrTrainModel();
    }

    const { vocabulary, idf, classes, weights, biases } = this.modelData!;
    const tokens = tokenize(text);
    const vocabSize = idf.length;
    const K = classes.length;

    // Vectorize
    const counts: Record<string, number> = Object.create(null);
    for (const t of tokens) {
      if (vocabulary[t] !== undefined) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }

    const vec = new Array(vocabSize).fill(0);
    let normSq = 0;
    for (const [t, count] of Object.entries(counts)) {
      const idx = vocabulary[t];
      const tf = 1 + Math.log(count);
      const val = tf * idf[idx];
      vec[idx] = val;
      normSq += val * val;
    }
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < vocabSize; i++) {
        vec[i] /= norm;
      }
    }

    // Softmax inference
    const logits = new Array(K);
    let maxLogit = -Infinity;
    for (let k = 0; k < K; k++) {
      let dot = biases[k];
      for (let j = 0; j < vocabSize; j++) {
        if (vec[j] !== 0) dot += weights[k][j] * vec[j];
      }
      logits[k] = dot;
      if (dot > maxLogit) maxLogit = dot;
    }

    let sumExp = 0;
    const probs = new Array(K);
    for (let k = 0; k < K; k++) {
      probs[k] = Math.exp(logits[k] - maxLogit);
      sumExp += probs[k];
    }
    for (let k = 0; k < K; k++) {
      probs[k] /= sumExp;
    }

    let bestK = 0;
    let maxProb = -Infinity;
    const allProbabilities: Record<string, number> = {};

    for (let k = 0; k < K; k++) {
      const prob = Number(probs[k].toFixed(4));
      allProbabilities[classes[k]] = prob;
      if (prob > maxProb) {
        maxProb = prob;
        bestK = k;
      }
    }

    const predictedTopic = classes[bestK];
    const topicConfidence = Number(maxProb.toFixed(2));
    const isUncertain = topicConfidence < 0.40;

    const displayBadge = isUncertain 
      ? 'Topic uncertain' 
      : `${predictedTopic} (${Math.round(topicConfidence * 100)}%)`;

    return {
      predictedTopic: isUncertain ? 'Topic uncertain' : predictedTopic,
      topicConfidence,
      isUncertain,
      displayBadge,
      allProbabilities
    };
  }

  public getMetrics(): ModelMetrics {
    if (!this.modelData) {
      this.loadOrTrainModel();
    }
    return this.modelData!.metrics;
  }

  public vectorize(text: string): Map<number, number> {
    if (!this.modelData) this.loadOrTrainModel();
    const { vocabulary, idf } = this.modelData!;
    const tokens = tokenize(text);
    const counts: Record<string, number> = Object.create(null);
    for (const t of tokens) {
      if (vocabulary[t] !== undefined) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    const sparse = new Map<number, number>();
    let normSq = 0;
    for (const [t, count] of Object.entries(counts)) {
      const idx = vocabulary[t];
      const tf = 1 + Math.log(count);
      const val = tf * idf[idx];
      sparse.set(idx, val);
      normSq += val * val;
    }
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (const [idx, val] of sparse.entries()) {
        sparse.set(idx, val / norm);
      }
    }
    return sparse;
  }

  public findSimilar(queryText: string, candidates: Array<{ id: string; text: string }>, threshold: number = 0.25): Array<{ id: string; similarity: number }> {
    const qVec = this.vectorize(queryText);
    if (qVec.size === 0) return [];

    const results: Array<{ id: string; similarity: number }> = [];

    for (const candidate of candidates) {
      const cVec = this.vectorize(candidate.text);
      if (cVec.size === 0) continue;

      let dot = 0;
      for (const [idx, qVal] of qVec.entries()) {
        const cVal = cVec.get(idx);
        if (cVal !== undefined) {
          dot += qVal * cVal;
        }
      }

      const sim = Number(dot.toFixed(4));
      if (sim >= threshold) {
        results.push({ id: candidate.id, similarity: sim });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }
}

export const doubtClassifier = DoubtClassifier.getInstance();


