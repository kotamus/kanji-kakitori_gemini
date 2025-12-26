import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Eraser, Check, SkipForward } from 'lucide-react';
import type { Problem } from '../types';
import { parseCSV } from '../utils/csvParser';
import { WritingArea, type WritingAreaHandle } from './WritingArea';
import { ResultScreen } from './ResultScreen';
import { initRecognizer, recognizeKanji, isMatch, isRecognizerReady } from '../utils/kanjiRecognizer';

import { soundManager } from '../utils/SoundManager';
import { FeedbackOverlay } from './FeedbackOverlay';
import { useSettings } from '../hooks/useSettings';

interface BattleScreenProps {
    gradeId: string;
    shuffle: boolean;
    skipSolvedMode: boolean;
    solvedKanji: Set<string>;
    onSolved: (problemId: string) => void;
    onBack: () => void;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export type BattleResult = {
    problem: Problem;
    isCorrect: boolean;
};

import { motion } from 'framer-motion';

export const BattleScreen: React.FC<BattleScreenProps> = ({ gradeId, shuffle, skipSolvedMode, solvedKanji, onSolved, onBack }) => {
    // ... (existing hooks)
    const { problemCount } = useSettings();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'none'>('none');
    const [results, setResults] = useState<BattleResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const [loadError, setLoadError] = useState<string | null>(null);

    const writingAreaRef = useRef<WritingAreaHandle>(null);

    // Initializer
    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                setLoadError(null);
                await initRecognizer();
                if (isMounted) setModelReady(true);
            } catch (err) {
                console.error('Failed to initialize recognizer:', err);
                if (isMounted) setLoadError('AIモデルの読み込みに失敗しました。');
            }
        };
        init();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        setItemsLoaded(false);
        fetch(`data/${gradeId}.csv`) // Use relative path for GitHub Pages compatibility
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.text();
            })
            .then(text => {
                let parsed = parseCSV(text);

                // Filter out solved problems if mode is enabled
                if (skipSolvedMode) {
                    parsed = parsed.filter(p => !solvedKanji.has(p.id));
                }

                if (shuffle) {
                    parsed = shuffleArray(parsed);
                }
                setProblems(parsed.slice(0, problemCount));
                setItemsLoaded(true);
            })
        setLoadError('問題データの読み込みに失敗しました。');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [gradeId, problemCount]);

const handleNext = useCallback(() => {
    if (currentIndex < problems.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setTimeout(() => {
            writingAreaRef.current?.clearCanvas();
        }, 100);
    } else {
        setShowResult(true);
    }
}, [currentIndex, problems.length]);

const handlePredict = useCallback(async (canvas: HTMLCanvasElement) => {
    if (!isRecognizerReady() || isProcessing) return;

    setIsProcessing(true);
    try {
        const targetKanji = problems[currentIndex].kanji;
        const results = await recognizeKanji(canvas, 5);
        console.log('Recognition results:', results);
        console.log('Target:', targetKanji);

        if (isMatch(results, targetKanji)) {
            soundManager.playCorrect();
            setFeedback('correct');
            setScore(prev => prev + 1);
            setResults(prev => [...prev, { problem: problems[currentIndex], isCorrect: true }]);
            onSolved(problems[currentIndex].id); // Mark as solved

            setTimeout(() => {
                setFeedback('none');
                handleNext();
            }, 2000);
        } else {
            soundManager.playIncorrect();
            setFeedback('incorrect');
            setTimeout(() => {
                setFeedback('none');
                setIsProcessing(false);
            }, 1000);
            return;
        }
    } catch (error) {
        console.error('Recognition error:', error);
    }
    setIsProcessing(false);
}, [currentIndex, problems, handleNext, isProcessing]);

const handleClear = useCallback(() => { }, []);
const handleClearButton = () => writingAreaRef.current?.clearCanvas();
const handlePredictButton = () => writingAreaRef.current?.predict();
const handleSkip = useCallback(() => {
    setResults(prev => [...prev, { problem: problems[currentIndex], isCorrect: false }]);
    handleNext();
}, [currentIndex, problems, handleNext]);

if (loadError) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50 p-4">
            <div className="text-xl font-bold text-red-600 mb-4 text-center">
                ⚠️ {loadError}
            </div>
            <p className="text-gray-500 mb-6 text-sm text-center">
                ネットワーク接続を確認してください。<br />
                (GitHub Pagesの場合、初回の読み込みに時間がかかることがあります)
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white border-2 border-orange-200 text-orange-600 font-bold rounded-full shadow-md active:scale-95"
            >
                再読み込み
            </button>
            <button
                onClick={onBack}
                className="mt-4 text-gray-400 underline text-sm"
            >
                タイトルに戻る
            </button>
        </div>
    );
}

if (!itemsLoaded || !modelReady) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-orange-50 p-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-4"
            >
                ⏳
            </motion.div>
            <div className="text-xl font-bold text-orange-600 mb-4">
                {!modelReady ? 'AIモデル読み込み中...' : '問題読み込み中...'}
            </div>
            <div className="text-gray-500 text-sm">しばらくお待ちください</div>
        </div>
    );
}

if (showResult) {
    return (
        <ResultScreen
            score={score}
            total={problems.length}
            results={results}
            onRetry={() => {
                setScore(0);
                setCurrentIndex(0);
                setResults([]);
                setShowResult(false);
            }}
            onHome={onBack}
        />
    );
}

const currentProblem = problems[currentIndex];

return (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col items-center min-h-[100dvh] bg-orange-50 p-4 touch-none"
    >
        {/* Header */}
        <div className="w-full max-w-lg flex justify-between items-center mb-4 mt-2">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="p-3 bg-white rounded-full shadow hover:bg-gray-100"
                aria-label="タイトルへ戻る"
            >
                <ArrowLeft className="text-gray-600" size={24} />
            </motion.button>
            <div className="text-xl font-bold text-orange-600">
                もんだい {currentIndex + 1} / {problems.length}
            </div>
            <div className="w-12" />
        </div>

        {/* Problem Text */}
        <div className="mb-6 text-center flex-shrink-0">
            <motion.div
                key={currentProblem.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <p className="text-3xl md:text-5xl font-bold text-gray-800 leading-relaxed break-keep">
                    {currentProblem.pre}
                    <span className="inline-block px-2 text-orange-500 border-b-4 border-orange-500 mx-1">
                        {currentProblem.reading}
                    </span>
                    {currentProblem.post}
                </p>
            </motion.div>
            <p className="mt-2 text-lg text-gray-500">
                よみがなを見て、漢字を書いてね！
            </p>
        </div>

        {/* Writing Area */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md">
            <div className="relative mb-6">
                <WritingArea
                    ref={writingAreaRef}
                    key={currentProblem.id}
                    onPredict={handlePredict}
                    onClear={handleClear}
                />
                <FeedbackOverlay
                    isVisible={feedback !== 'none'}
                    isCorrect={feedback === 'correct'}
                    kanji={currentProblem.kanji}
                />
            </div>

            {/* Buttons */}
            <div className="w-full grid grid-cols-3 gap-3">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClearButton}
                    className="py-4 bg-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-200 transition-colors flex flex-col items-center justify-center gap-1 shadow-sm"
                    disabled={isProcessing}
                    aria-label="けす"
                >
                    <Eraser size={24} />
                    <span>けす</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePredictButton}
                    className="py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-colors flex flex-col items-center justify-center gap-1 shadow-md"
                    disabled={isProcessing}
                    aria-label="はんてい"
                >
                    <Check size={28} />
                    <span>はんてい</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSkip}
                    className="py-4 bg-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-300 transition-colors flex flex-col items-center justify-center gap-1 shadow-sm"
                    disabled={isProcessing}
                    aria-label="スキップ"
                >
                    <SkipForward size={24} />
                    <span>スキップ</span>
                </motion.button>
            </div>
        </div>

        <div className="h-4" />
    </motion.div>
);
};
