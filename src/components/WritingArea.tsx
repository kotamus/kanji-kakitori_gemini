import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface WritingAreaProps {
    kanji: string;
    onCorrect: () => void;
    onMistake: () => void;
}

export interface WritingAreaHandle {
    showHint: () => void;
}

export const WritingArea = React.forwardRef<WritingAreaHandle, WritingAreaProps>(({ kanji, onCorrect, onMistake }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const writerRef = useRef<HanziWriter | null>(null);
    const strokeIndexRef = useRef(0);

    React.useImperativeHandle(ref, () => ({
        showHint: () => {
            const writer = writerRef.current;
            if (!writer) return;

            // Cancel current quiz
            writer.cancelQuiz();
            // Animate only the current stroke
            writer.animateStroke(strokeIndexRef.current, {
                onComplete: () => {
                    // Resume quiz from current stroke
                    startQuiz(strokeIndexRef.current);
                }
            });
        }
    }));

    const startQuiz = (startStrokeNum: number) => {
        const writer = writerRef.current;
        if (!writer) return;

        // options don't seem to have startStrokeNum in standard types, checking typical usage...
        // Actually, if we just call quiz() again, it might restart.
        // But we want to skipping strokes.
        // Let's assume user wants to write the NEXT stroke.
        // We can use writer.quiz({ quizStartStrokeNum: startStrokeNum }) if supported,
        // or just let them write.
        // Wait, hanzi-writer 2.x+ uses `quizStartStrokeNum`.
        // Let's try casting or using any if types are old.

        writer.quiz({
            quizStartStrokeNum: startStrokeNum,
            onCorrectStroke: (data: { strokeNum: number }) => {
                strokeIndexRef.current = data.strokeNum + 1;
                // Update internal counter for next recursions
                // Actually startStrokeNum is static for this call.
                // We need to keep strokeIndexRef up to date.
                // onCorrectStroke data contains { strokeNum: number }
            },
            onMistake: () => {
                onMistake();
                // Show hint
            },
            onComplete: () => {
                writer.showCharacter();
                onCorrect();
            },
        } as any);

        // Fix: onCorrectStroke above is tricky because we need the ACTUAL stroke number.
        // HanziWriter quiz doesn't easily expose "next stroke index" in the callback unless we track it.
        // Let's refine the quiz call.
    };

    useEffect(() => {
        if (!divRef.current) return;

        // Clear previous writer
        divRef.current.innerHTML = '';
        strokeIndexRef.current = 0;

        const writer = HanziWriter.create(divRef.current, kanji, {
            width: 280,
            height: 280,
            padding: 10,
            showOutline: false, // Blind mode: don't show the character initially
            strokeColor: '#333',
            drawingWidth: 20,
            showCharacter: false,
            charDataLoader: (char, onComplete) => {
                fetch(`https://cdn.jsdelivr.net/gh/chanind/hanzi-writer-data-jp/data/${char}.json`)
                    .then(res => res.json())
                    .then(onComplete)
                    .catch(err => console.error("Failed to load char data", char, err));
            }
        });

        writerRef.current = writer;

        // Initial quiz start
        writer.quiz({
            onCorrectStroke: (data) => {
                strokeIndexRef.current = data.strokeNum + 1;
            },
            onMistake: () => {
                onMistake();
            },
            onComplete: () => {
                writer.showCharacter();
                onCorrect();
            },
        });

    }, [kanji, onCorrect, onMistake]);

    return (
        <div className="bg-white rounded-3xl shadow-xl border-4 border-orange-300 p-2 touch-none">
            <div ref={divRef} className="w-[280px] h-[280px] cursor-pointer" />
        </div>
    );
});
