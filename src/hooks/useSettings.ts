import { useState, useEffect } from 'react';

const SKIP_KEY = 'kanji_skip_enabled';
const COUNT_KEY = 'kanji_problem_count';

export const useSettings = () => {
    const [skipEnabled, setSkipEnabled] = useState(true);
    const [problemCount, setProblemCount] = useState(5);

    useEffect(() => {
        const storedSkip = localStorage.getItem(SKIP_KEY);
        if (storedSkip !== null) {
            setSkipEnabled(storedSkip === 'true');
        }

        const storedCount = localStorage.getItem(COUNT_KEY);
        if (storedCount !== null) {
            setProblemCount(parseInt(storedCount, 10));
        }
    }, []);

    const updateSkip = (enabled: boolean) => {
        setSkipEnabled(enabled);
        localStorage.setItem(SKIP_KEY, enabled.toString());
    };

    const updateCount = (count: number) => {
        const clamped = Math.max(2, Math.min(10, count));
        setProblemCount(clamped);
        localStorage.setItem(COUNT_KEY, clamped.toString());
    };

    return {
        skipEnabled,
        updateSkip,
        problemCount,
        updateCount
    };
};
