// TensorFlow.js Kanji Recognition Utility
// Model: https://ichisadashioko.github.io/kanji-recognition/

let tf: typeof import('@tensorflow/tfjs') | null = null;
let model: any | null = null;
let labelDict: string[] = [];
let isInitialized = false;
let initPromise: Promise<void> | null = null;

const MODEL_URL = 'https://ichisadashioko.github.io/kanji-recognition/kanji-model-v3-tfjs/model.json';
const LABEL_URL = 'https://raw.githubusercontent.com/ichisadashioko/kanji-recognition/gh-pages/label.js';

export interface RecognitionResult {
    char: string;
    score: number;
}

/**
 * Initialize the kanji recognition model (lazy load)
 */
export async function initRecognizer(): Promise<void> {
    if (isInitialized) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // Dynamically import TensorFlow.js
            tf = await import('@tensorflow/tfjs');

            // Load labels
            const labelResponse = await fetch(LABEL_URL);
            const labelText = await labelResponse.text();
            const match = labelText.match(/kanji_dict\s*=\s*\{([\s\S]*?)\}/);
            if (match) {
                const entries: { char: string; index: number }[] = [];
                const regex = /'([^']+)':\s*(\d+)/g;
                let m;
                while ((m = regex.exec(match[1])) !== null) {
                    entries.push({ char: m[1], index: parseInt(m[2]) });
                }
                entries.sort((a, b) => a.index - b.index);
                labelDict = entries.map(e => e.char);
            }
            console.log('Kanji labels loaded:', labelDict.length);

            // Load model
            model = await tf.loadLayersModel(MODEL_URL);
            console.log('Kanji recognition model loaded');

            isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize kanji recognizer:', error);
            throw error;
        }
    })();

    return initPromise;
}

/**
 * Check if the recognizer is ready
 */
export function isRecognizerReady(): boolean {
    return isInitialized;
}

/**
 * Recognize kanji from a canvas element
 * @param canvas - The canvas element with the handwritten character
 * @param topN - Number of top candidates to return
 * @returns Array of recognition results sorted by confidence
 */
export async function recognizeKanji(
    canvas: HTMLCanvasElement,
    topN: number = 5
): Promise<RecognitionResult[]> {
    if (!isInitialized || !tf || !model) {
        throw new Error('Recognizer not initialized. Call initRecognizer() first.');
    }

    // Create a temporary canvas for resizing to 64x64
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 64;
    tempCanvas.height = 64;
    const tempCtx = tempCanvas.getContext('2d')!;

    // Fill with white and draw resized image
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, 64, 64);
    tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 64, 64);

    // Convert to grayscale and invert (white background black text -> black background white text)
    const imageData = tempCtx.getImageData(0, 0, 64, 64);
    const data = imageData.data;
    const grayData = new Float32Array(64 * 64);

    for (let i = 0; i < 64 * 64; i++) {
        const avg = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
        grayData[i] = (255 - avg) / 255.0; // Invert and normalize
    }

    // Convert to tensor
    const inputTensor = tf.tensor4d(grayData, [1, 64, 64, 1]);

    // Predict
    const prediction = model.predict(inputTensor) as any;
    const predArray = await prediction.array();

    // Sort results by confidence
    const results: RecognitionResult[] = [];
    for (let i = 0; i < predArray[0].length; i++) {
        results.push({ char: labelDict[i], score: predArray[0][i] * 100 });
    }
    results.sort((a, b) => b.score - a.score);

    // Cleanup
    inputTensor.dispose();
    prediction.dispose();

    return results.slice(0, topN);
}

/**
 * Check if target kanji is in the top results
 * @param results - Recognition results
 * @param target - Target kanji to match
 * @returns true if target is found in results
 */
export function isMatch(results: RecognitionResult[], target: string): boolean {
    return results.some(r => r.char === target);
}
