import { DoubtClassifier } from './classifier.ts';

console.log('--- Training Doubt Topic Classifier ---');
const classifier = DoubtClassifier.getInstance();
const result = classifier.train();

console.log(`Training Complete!`);
console.log(`Dataset size: ${result.metrics.datasetSize} (${result.metrics.trainSize} train, ${result.metrics.testSize} test)`);
console.log(`Accuracy on held-out test set: ${(result.metrics.accuracy * 100).toFixed(1)}%`);
console.log(`Macro F1: ${result.metrics.macroF1}`);
console.log(`Model weights saved to server/ml/model_weights.json`);
