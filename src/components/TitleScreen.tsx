import React, { useState } from 'react';
import { Settings, Shuffle } from 'lucide-react';
import mascotImg from '../assets/mascot.png';
import sakuraBg from '../assets/sakura_bg.png';

interface TitleScreenProps {
    onSelectGrade: (grade: string, shuffle: boolean) => void;
    onSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onSelectGrade, onSettings }) => {
    const [shuffleEnabled, setShuffleEnabled] = useState(false);

    const grades = [
        { id: 'grade1', label: '1ねんせい', color: 'bg-pink-400 hover:bg-pink-500', shadow: 'shadow-pink-600', text: 'text-white', numColor: 'text-pink-500' },
        { id: 'grade2', label: '2ねんせい', color: 'bg-blue-400 hover:bg-blue-500', shadow: 'shadow-blue-600', text: 'text-white', numColor: 'text-blue-500' },
        { id: 'grade3', label: '3ねんせい', color: 'bg-green-400 hover:bg-green-500', shadow: 'shadow-green-600', text: 'text-white', numColor: 'text-green-600' },
        { id: 'grade4', label: '4ねんせい', color: 'bg-yellow-400 hover:bg-yellow-500', shadow: 'shadow-yellow-600', text: 'text-white', numColor: 'text-yellow-600' },
        { id: 'grade5', label: '5ねんせい', color: 'bg-teal-400 hover:bg-teal-500', shadow: 'shadow-teal-600', text: 'text-white', numColor: 'text-teal-600' },
        { id: 'grade6', label: '6ねんせい', color: 'bg-purple-400 hover:bg-purple-500', shadow: 'shadow-purple-600', text: 'text-white', numColor: 'text-purple-600' },
    ];

    return (
        <div
            className="flex flex-col items-center min-h-[100dvh] w-full relative overflow-hidden"
            style={{
                backgroundImage: `url(${sakuraBg})`,
                backgroundSize: '300px',
                backgroundRepeat: 'repeat'
            }}
        >
            {/* Background Overlay for readability */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-0"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center px-4 py-8 h-full min-h-[100dvh]">

                <button
                    onClick={onSettings}
                    className="absolute top-4 right-4 p-3 bg-white/80 rounded-full shadow-lg text-gray-500 hover:text-orange-500 hover:scale-110 transition-all duration-300"
                    aria-label="せってい"
                >
                    <Settings size={32} />
                </button>

                {/* Header Section with Mascot */}
                {/* Header Section with Mascot */}
                <div className="flex flex-col items-center mt-2 mb-6 w-full">
                    {/* Mascot with white background container to handle masking issues */}
                    <div className="relative group cursor-pointer bg-white rounded-full p-6 shadow-xl border-4 border-orange-100 overflow-hidden">
                        <img
                            src={mascotImg}
                            alt="Mascot"
                            className="w-32 h-32 md:w-48 md:h-48 object-contain animate-bounce-slow"
                        />
                    </div>

                    <h1 className="mt-6 text-6xl md:text-8xl text-orange-500 tracking-widest"
                        style={{
                            fontFamily: '"M PLUS Rounded 1c", sans-serif',
                            fontWeight: 900,
                            textShadow: '0 0 0 #fff, 4px 4px 0px #fff, 8px 8px 0px rgba(0,0,0,0.15)',
                            WebkitTextStroke: '3px #fff'
                        }}>
                        かんじ<br className="hidden" />かきとり
                    </h1>
                </div>

                {/* Shuffle Toggle */}
                <button
                    onClick={() => setShuffleEnabled(!shuffleEnabled)}
                    className={`
                        mb-8 px-6 py-3 rounded-full font-bold text-xl flex items-center gap-3 
                        transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border-4
                        ${shuffleEnabled
                            ? 'bg-yellow-400 border-yellow-500 text-yellow-900 rotate-1'
                            : 'bg-white border-gray-200 text-gray-500 -rotate-1'
                        }
                    `}
                >
                    <Shuffle size={28} className={shuffleEnabled ? 'animate-spin-slow' : ''} />
                    <span>シャッフル {shuffleEnabled ? 'ON!' : 'OFF'}</span>
                </button>

                {/* Grades Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 w-full max-w-2xl px-2">
                    {grades.map((g, index) => {
                        const gradeNum = g.label.replace('ねんせい', '');
                        return (
                            <button
                                key={g.id}
                                onClick={() => onSelectGrade(g.id, shuffleEnabled)}
                                className={`
                                    relative group overflow-hidden
                                    flex flex-col items-center justify-center
                                    h-36 md:h-44 rounded-3xl
                                    ${g.color}
                                    transition-all duration-300 transform 
                                    hover:-translate-y-2 hover:shadow-xl active:translate-y-1 active:scale-95
                                    border-b-8 border-r-4 border-black/10
                                `}
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                {/* Icon-like Circle for Number */}
                                <div className="bg-white rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shadow-inner mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <span className={`text-5xl md:text-6xl font-[900] ${g.numColor}`}
                                        style={{ fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>
                                        {gradeNum}
                                    </span>
                                </div>

                                <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md pb-1"
                                    style={{ fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>
                                    ねんせい
                                </span>

                                {/* Decorative elements */}
                                <div className="absolute top-2 right-2 opacity-50">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto pt-8 pb-4 text-center">
                    <p className="text-gray-500 font-bold bg-white/80 px-6 py-2 rounded-full shadow-sm">
                        がくねんを えらんで スタートしてね！
                    </p>
                </div>
            </div>
        </div>
    );
};
