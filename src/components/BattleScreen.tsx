import React, { useState, useEffect } from 'react';
import { ArrowLeft, FastForward } from 'lucide-react';
import type { Problem } from '../types';
import { parseCSV } from '../utils/csvParser';
import { WritingArea, type WritingAreaHandle } from './WritingArea';
import { ResultScreen } from './ResultScreen';

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
    const { problemCount, skipEnabled } = useSettings();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'none'>('none');
    const [results, setResults] = useState<BattleResult[]>([]);

    const writingAreaRef = React.useRef<WritingAreaHandle>(null);

    useEffect(() => {
        // Load data
        fetch(`/data/${gradeId}.csv`)
            .then(res => res.text())
            .then(text => {
                const parsed = parseCSV(text);
                setProblems(parsed.slice(0, problemCount));
                setItemsLoaded(true);
            })
            .catch(err => console.error("Failed to load data", err));
    }, [gradeId, problemCount]);

    const handleNext = React.useCallback(() => {
        if (currentIndex < problems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    }, [currentIndex, problems.length]);

    const handleCorrect = React.useCallback(() => {
        soundManager.playCorrect();
        setFeedback('correct');
        setScore(prev => prev + 1);

        setResults(prev => [...prev, { problem: problems[currentIndex], isCorrect: true }]);

        // Wait 2 seconds before next
        setTimeout(() => {
            setFeedback('none');
            handleNext();
        }, 2000);
    }, [handleNext, currentIndex, problems]);

    const handleMistake = React.useCallback(() => {
        soundManager.playIncorrect();
        // Option: Show X briefly
        setFeedback('incorrect');
        // Clear feedback after 1s so they can try again
        setTimeout(() => {
            setFeedback('none');
        }, 1000);
    }, []);

    const handleSkip = React.useCallback(() => {
        // Mark as skipped (record as incorrect for now in results tracker, or add 'skipped' status later)
        setResults(prev => [...prev, { problem: problems[currentIndex], isCorrect: false }]);
        handleNext();
    }, [handleNext, currentIndex, problems]);

    const handleShowHint = () => {
        writingAreaRef.current?.showHint();
    };

    if (!itemsLoaded) return <div className="p-10 text-center">Loading...</div>;

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

            {/* Problem Text */}
            <div className="mb-10 text-center">
                <p className="text-3xl md:text-5xl font-bold text-gray-800 leading-relaxed">
                    {currentProblem.pre}
                    <span className="inline-block px-2 text-orange-500 border-b-4 border-orange-500 mx-1">
                        {currentProblem.reading}
                    </span>
                    {currentProblem.post}
                </p>
            </div>

            {/* Writing Area */}
            <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div className="relative">
                    <WritingArea
                        ref={writingAreaRef}
                        key={currentProblem.id} // Re-mount on problem change
                        kanji={currentProblem.kanji}
                        onCorrect={handleCorrect}
                        onMistake={handleMistake}
                    />
                    <FeedbackOverlay isVisible={feedback !== 'none'} isCorrect={feedback === 'correct'} />
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-4">
                    {skipEnabled && (
                        <button
                            onClick={handleSkip}
                            className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <FastForward size={20} /> スキップ
                        </button>
                    )}
                    <button
                        onClick={handleShowHint}
                        className="px-6 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-full hover:bg-yellow-200 transition-colors flex items-center gap-2"
                    >
                        <span className="text-xl">💡</span> ヒント
                    </button>
                </div>
            </div>

            <div className="h-10" />
        </div>
    );
};
