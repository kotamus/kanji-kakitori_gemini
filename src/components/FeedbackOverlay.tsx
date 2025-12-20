import React from 'react';
import { Circle, X } from 'lucide-react';

interface FeedbackOverlayProps {
    isVisible: boolean;
    isCorrect: boolean;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isVisible, isCorrect }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            {isCorrect ? (
                <Circle className="w-64 h-64 text-red-500 opacity-80 animate-bounce" strokeWidth={3} />
            ) : (
                <X className="w-64 h-64 text-blue-500 opacity-80 animate-pulse" strokeWidth={3} />
            )}
        </div>
    );
};
