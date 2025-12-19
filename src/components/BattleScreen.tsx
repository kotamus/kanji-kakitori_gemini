import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Problem } from '../types';
import { parseCSV } from '../utils/csvParser';
import { WritingArea } from './WritingArea';
import { ResultScreen } from './ResultScreen';

interface BattleScreenProps {
    gradeId: string;
    onBack: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ gradeId, onBack }) => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        // Load data
        fetch(`/data/${gradeId}.csv`)
            .then(res => res.text())
            .then(text => {
                const parsed = parseCSV(text);
                // Shuffle problems? For now just take first 5
                setProblems(parsed.slice(0, 5));
                setItemsLoaded(true);
            })
            .catch(err => console.error("Failed to load data", err));
    }, [gradeId]);

    const handleCorrect = () => {
        // Ping pong sound (placeholder)
        // const audio = new Audio('/sounds/correct.mp3'); audio.play();
        console.log("Ping Pong!");

        setScore(prev => prev + 1);
        setTimeout(() => {
            handleNext();
        }, 1000); // Wait 1 sec before next
    };

    const handleMistake = () => {
        // Vibration or visual cue
        console.log("Mistake!");
    };

    const handleNext = () => {
        if (currentIndex < problems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    if (!itemsLoaded) return <div className="p-10 text-center">Loading...</div>;

    if (showResult) {
        return (
            <ResultScreen
                score={score}
                total={problems.length}
                onRetry={() => {
                    setScore(0);
                    setCurrentIndex(0);
                    setShowResult(false);
                    // Maybe reshuffle here
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
            <div className="flex-1 flex justify-center items-center w-full">
                <WritingArea
                    key={currentProblem.id} // Re-mount on problem change
                    kanji={currentProblem.kanji}
                    onCorrect={handleCorrect}
                    onMistake={handleMistake}
                />
            </div>

            <div className="h-10" />
        </div>
    );
};
