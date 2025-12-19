import Papa from 'papaparse';
import type { Problem } from '../types';

export const parseProblem = (sentenceRaw: string, kanji: string): Problem | null => {
    // Expected format: "[reading]context", "Kanji"
    // Regex to capture: (pre)[reading](post)
    const match = sentenceRaw.match(/^(.*?)\[(.*?)\](.*?)$/);
    if (!match) {
        console.warn(`Invalid format: ${sentenceRaw}`);
        return null;
    }

    const [_, pre, reading, post] = match;

    return {
        id: Math.random().toString(36).substring(7),
        sentence: sentenceRaw,
        reading,
        kanji: kanji.trim(),
        pre,
        post
    };
};

export const parseCSV = (csvText: string): Problem[] => {
    const parsed = Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        comments: "#"
    });

    const problems: Problem[] = [];

    parsed.data.forEach((row: any) => {
        if (Array.isArray(row) && row.length >= 2) {
            const sentence = row[0];
            const kanji = row[1];
            if (sentence && kanji) {
                const p = parseProblem(sentence, kanji);
                if (p) problems.push(p);
            }
        }
    });

    return problems;
};
