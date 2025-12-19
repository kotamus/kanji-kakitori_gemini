import { useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { BattleScreen } from './components/BattleScreen';

function App() {
  const [currentGrade, setCurrentGrade] = useState<string | null>(null);

  if (currentGrade) {
    return (
      <BattleScreen
        gradeId={currentGrade}
        onBack={() => setCurrentGrade(null)}
      />
    );
  }

  return (
    <TitleScreen onSelectGrade={(grade) => setCurrentGrade(grade)} />
  );
}

export default App;
