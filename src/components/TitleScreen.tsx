import React from 'react';
import { BookOpen } from 'lucide-react';

interface TitleScreenProps {
    onSelectGrade: (grade: string) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onSelectGrade }) => {
    const grades = [
        { id: 'grade1', label: '1ねんせい', color: 'bg-pink-400 hover:bg-pink-500' },
        // Can add more later
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-orange-50">
            <div className="mb-12 text-center">
                <div className="inline-block p-4 mb-4 bg-white rounded-full shadow-lg">
                    <BookOpen className="w-16 h-16 text-orange-500" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 md:text-6xl tracking-wider">
                    かんじ<br />かきとり
                </h1>
            </div>

            <div className="grid gap-4 w-full max-w-sm">
                {grades.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => onSelectGrade(g.id)}
                        className={`p-6 text-2xl font-bold text-white transition-transform transform rounded-2xl shadow-md active:scale-95 ${g.color}`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            <p className="mt-12 text-gray-400 text-sm">
                Challenge yourself with daily Kanji practice!
            </p>
        </div>
    );
};
