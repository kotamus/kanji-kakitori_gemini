import React from 'react';
import { Trophy, ArrowLeft, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

import type { BattleResult } from './BattleScreen';

interface ResultScreenProps {
    score: number;
    total: number;
    results: BattleResult[];
    onRetry: () => void;
    onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, results, onRetry, onHome }) => {
    React.useEffect(() => {
        if (score === total) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [score, total]);

    const percentage = (score / total) * 100;
    let message = "がんばったね！";
    if (percentage === 100) message = "たいへんよくできました！";
    else if (percentage >= 80) message = "すごい！";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-orange-50 text-center">
            <Trophy className={`w-24 h-24 mb-6 ${percentage === 100 ? 'text-yellow-400' : 'text-gray-300'}`} />

            <h2 className="text-3xl font-bold text-gray-800 mb-2">{message}</h2>
            <p className="text-6xl font-black text-orange-500 mb-8">
                {score} <span className="text-2xl text-gray-400">/ {total}</span>
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-5 gap-4 mb-10 w-full max-w-2xl">
                {results.map((r, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className={`w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 ${r.isCorrect ? 'bg-white border-orange-200 text-gray-800' : 'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                            {r.problem.kanji}
                        </div>
                        <div className="mt-1">
                            {r.isCorrect ? (
                                <span className="text-red-500 font-bold">⚪︎</span>
                            ) : (
                                <span className="text-blue-500 font-bold">×</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onHome}
                    className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                >
                    <ArrowLeft size={24} />
                    もどる
                </button>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-8 py-3 text-lg font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-lg"
                >
                    <RotateCw size={24} />
                    もういっかい
                </button>
            </div>
        </div>
    );
};
