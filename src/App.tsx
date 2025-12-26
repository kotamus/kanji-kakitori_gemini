import { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { BattleScreen } from './components/BattleScreen';
import { SettingsScreen } from './components/SettingsScreen';

type Screen = 'title' | 'battle' | 'settings';

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

  if (screen === 'battle' && currentGrade) {
    return (
      <BattleScreen
        gradeId={currentGrade}
        shuffle={shuffleMode}
        onBack={handleBackToTitle}
      />
    );
  }

  if (screen === 'settings') {
    return <SettingsScreen onBack={handleBackToTitle} />;
  }

  return (
    <TitleScreen
      onSelectGrade={handleStart}
      onSettings={() => setScreen('settings')}
    />
  );
}

export default App;
