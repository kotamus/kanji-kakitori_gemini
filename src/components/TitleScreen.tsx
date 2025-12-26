import React, { useState } from 'react';
import { BookOpen, Settings, Shuffle } from 'lucide-react';

interface TitleScreenProps {
    onSelectGrade: (grade: string, shuffle: boolean) => void;
    onSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onSelectGrade, onSettings }) => {
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    const grades = [
        { id: 'grade1', label: '1ねんせい', color: 'bg-pink-400 hover:bg-pink-500' },
        { id: 'grade2', label: '2ねんせい', color: 'bg-blue-400 hover:bg-blue-500' },
        { id: 'grade3', label: '3ねんせい', color: 'bg-green-400 hover:bg-green-500' },
        { id: 'grade4', label: '4ねんせい', color: 'bg-yellow-400 hover:bg-yellow-500' },
        { id: 'grade5', label: '5ねんせい', color: 'bg-teal-400 hover:bg-teal-500' },
        { id: 'grade6', label: '6ねんせい', color: 'bg-purple-400 hover:bg-purple-500' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-orange-50 relative">
            <button
                onClick={onSettings}
                className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                aria-label="Settings"
            >
                <Settings size={24} />
            </button>

            <div className="mb-8 text-center">
                <div className="inline-block p-4 mb-4 bg-white rounded-full shadow-lg">
                    <BookOpen className="w-16 h-16 text-orange-500" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 md:text-6xl tracking-wider">
                    かんじ<br />かきとり
                </h1>
            </div>

            {/* シャッフルボタン */}
            <button
                onClick={() => setShuffleEnabled(!shuffleEnabled)}
                className={`mb-6 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-md ${shuffleEnabled
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
            >
                <Shuffle size={20} />
                シャッフル {shuffleEnabled ? 'ON' : 'OFF'}
            </button>

            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                {grades.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => onSelectGrade(g.id, shuffleEnabled)}
                        className={`p-6 text-2xl font-bold text-white transition-transform transform rounded-2xl shadow-md active:scale-95 ${g.color}`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            <p className="mt-8 text-gray-400 text-sm">
                がくねんを えらんでね！
            </p>
        </div>
    );
};
