import React from 'react';
import { Trophy, ArrowLeft, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultScreenProps {
    score: number;
    total: number;
    onRetry: () => void;
    onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, onRetry, onHome }) => {
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
