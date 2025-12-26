import { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { BattleScreen } from './components/BattleScreen';
import { SettingsScreen } from './components/SettingsScreen';

type Screen = 'title' | 'battle' | 'settings';

import { AnimatePresence } from 'framer-motion';

function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [currentGrade, setCurrentGrade] = useState<string | null>(null);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [skipSolvedMode, setSkipSolvedMode] = useState(false);
  const [solvedKanji, setSolvedKanji] = useState<Set<string>>(new Set());

  const handleStart = (gradeId: string, shuffle: boolean, skipSolved: boolean) => {
    setCurrentGrade(gradeId);
    setShuffleMode(shuffle);
    setSkipSolvedMode(skipSolved);
    setScreen('battle');
  };

  const handleSolved = (problemId: string) => {
    setSolvedKanji(prev => new Set(prev).add(problemId));
  };

  const handleBackToTitle = () => {
    setScreen('title');
    setCurrentGrade(null);
    setShuffleMode(false);
  };

  return (
    <AnimatePresence mode="wait">
      {screen === 'battle' && currentGrade ? (
        <BattleScreen
          key="battle"
          gradeId={currentGrade}
          shuffle={shuffleMode}
          skipSolvedMode={skipSolvedMode}
          solvedKanji={solvedKanji}
          onSolved={handleSolved}
          onBack={handleBackToTitle}
        />
      ) : screen === 'settings' ? (
        <SettingsScreen key="settings" onBack={handleBackToTitle} />
      ) : (
        <TitleScreen
          key="title"
          onSelectGrade={handleStart}
          onSettings={() => setScreen('settings')}
        />
      )}
    </AnimatePresence>
  );
}

export default App;
