import { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { BattleScreen } from './components/BattleScreen';
import { SettingsScreen } from './components/SettingsScreen';

type Screen = 'title' | 'battle' | 'settings';

function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [currentGrade, setCurrentGrade] = useState<string | null>(null);

  const handleStart = (gradeId: string) => {
    setCurrentGrade(gradeId);
    setScreen('battle');
  };

  const handleBackToTitle = () => {
    setScreen('title');
    setCurrentGrade(null);
  };

  if (screen === 'battle' && currentGrade) {
    return (
      <BattleScreen
        gradeId={currentGrade}
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
