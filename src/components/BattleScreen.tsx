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
    onBack: () => void;
}

export type BattleResult = {
    problem: Problem;
    isCorrect: boolean;
};

export const BattleScreen: React.FC<BattleScreenProps> = ({ gradeId, onBack }) => {
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

    const writingAreaRef = useRef<WritingAreaHandle>(null);

    // Initialize recognizer
    useEffect(() => {
        initRecognizer()
            .then(() => setModelReady(true))
            .catch(err => console.error('Failed to initialize recognizer:', err));
    }, []);

    // Load problems
    useEffect(() => {
        fetch(`/data/${gradeId}.csv`)
            .then(res => res.text())
            .then(text => {
                const parsed = parseCSV(text);
                setProblems(parsed.slice(0, problemCount));
                setItemsLoaded(true);
            })
            .catch(err => console.error("Failed to load data", err));
    }, [gradeId, problemCount]);

    const handleNext = useCallback(() => {
        if (currentIndex < problems.length - 1) {
            setCurrentIndex(prev => prev + 1);
            // Clear canvas for next problem
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
                // Correct!
                soundManager.playCorrect();
                setFeedback('correct');
                setScore(prev => prev + 1);
                setResults(prev => [...prev, { problem: problems[currentIndex], isCorrect: true }]);

                setTimeout(() => {
                    setFeedback('none');
                    handleNext();
                }, 2000);
            } else {
                // Incorrect
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

    const handleClear = useCallback(() => {
        // Canvas cleared
    }, []);

    const handleClearButton = () => {
        writingAreaRef.current?.clearCanvas();
    };

    const handlePredictButton = () => {
        writingAreaRef.current?.predict();
    };

    const handleSkip = useCallback(() => {
        // スキップは不正解として記録
        setResults(prev => [...prev, { problem: problems[currentIndex], isCorrect: false }]);
        handleNext();
    }, [currentIndex, problems, handleNext]);

    if (!itemsLoaded || !modelReady) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 p-4">
                <div className="text-2xl font-bold text-orange-600 mb-4">
                    ⏳ {!modelReady ? 'AIモデル読み込み中...' : '問題読み込み中...'}
                </div>
                <div className="text-gray-500">しばらくお待ちください</div>
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
        <div className="flex flex-col items-center min-h-screen bg-orange-50 p-4">
            {/* Header */}
            <div className="w-full max-w-lg flex justify-between items-center mb-8">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <div className="text-xl font-bold text-orange-600">
                    もんだい {currentIndex + 1} / {problems.length}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Problem Text - Answer is hidden! Only show reading hint */}
            <div className="mb-10 text-center">
                <p className="text-3xl md:text-5xl font-bold text-gray-800 leading-relaxed">
                    {currentProblem.pre}
                    <span className="inline-block px-2 text-orange-500 border-b-4 border-orange-500 mx-1">
                        {currentProblem.reading}
                    </span>
                    {currentProblem.post}
                </p>
                <p className="mt-4 text-lg text-gray-500">
                    よみがなを見て、漢字を書いてね！
                </p>
            </div>

            {/* Writing Area */}
            <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div className="relative">
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
                <div className="mt-6 flex gap-4 flex-wrap justify-center">
                    <button
                        onClick={handleClearButton}
                        className="px-5 py-3 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-colors flex items-center gap-2"
                        disabled={isProcessing}
                    >
                        <Eraser size={20} /> けす
                    </button>
                    <button
                        onClick={handlePredictButton}
                        className="px-5 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
                        disabled={isProcessing}
                    >
                        <Check size={20} /> はんてい
                    </button>
                    <button
                        onClick={handleSkip}
                        className="px-5 py-3 bg-gray-200 text-gray-600 font-bold rounded-full hover:bg-gray-300 transition-colors flex items-center gap-2"
                        disabled={isProcessing}
                    >
                        <SkipForward size={20} /> スキップ
                    </button>
                </div>
            </div>

            <div className="h-10" />
        </div>
    );
};
