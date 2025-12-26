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

  const handleStart = (gradeId: string, shuffle: boolean) => {
    setCurrentGrade(gradeId);
    setShuffleMode(shuffle);
    setScreen('battle');
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
