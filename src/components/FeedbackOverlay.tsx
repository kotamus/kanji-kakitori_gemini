import React from 'react';
import { Circle, X } from 'lucide-react';

interface FeedbackOverlayProps {
    isVisible: boolean;
    isCorrect: boolean;
    kanji?: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isVisible, isCorrect, kanji }) => {
    if (!isVisible) return null;

    return (
        <>
            {/* 正解の漢字を枠の上に大きく表示（正解時のみ） */}
            {isCorrect && kanji && (
                <div className="absolute -top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl px-6 py-4 shadow-2xl animate-bounce">
                        <div className="text-7xl font-bold text-white drop-shadow-lg" style={{ fontFamily: '"Klee One", serif' }}>
                            {kanji}
                        </div>
                    </div>
                </div>
            )}

            {/* 正解/不正解マーク */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                {isCorrect ? (
                    <Circle className="w-48 h-48 text-red-500 opacity-80 animate-pulse" strokeWidth={3} />
                ) : (
                    <X className="w-64 h-64 text-blue-500 opacity-80 animate-pulse" strokeWidth={3} />
                )}
            </div>
        </>
    );
};
