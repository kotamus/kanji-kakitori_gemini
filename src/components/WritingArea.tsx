import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface WritingAreaProps {
    kanji: string;
    onCorrect: () => void;
    onMistake: () => void;
}

export const WritingArea: React.FC<WritingAreaProps> = ({ kanji, onCorrect, onMistake }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const writerRef = useRef<HanziWriter | null>(null);

    useEffect(() => {
        if (!divRef.current) return;

        // Clear previous writer
        divRef.current.innerHTML = '';

        const writer = HanziWriter.create(divRef.current, kanji, {
            width: 280,
            height: 280,
            padding: 10,
            showOutline: false, // Blind mode: don't show the character initially
            strokeColor: '#333',
            drawingWidth: 20,
            showCharacter: false,
        });

        writerRef.current = writer;

        writer.quiz({
            onMistake: () => {
                onMistake();
                // Show hint
            },
            onComplete: () => {
                onCorrect();
            },
        });

    }, [kanji, onCorrect, onMistake]);

    return (
        <div className="bg-white rounded-3xl shadow-xl border-4 border-orange-300 p-2 touch-none">
            <div ref={divRef} className="w-[280px] h-[280px] cursor-pointer" />
        </div>
    );
};
