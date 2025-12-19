# Implementation Plan - Kanji Kakitori App

## Goal
Initialize and build the MVP of the "Kanji Kakitori" application based on the requirements.
The app is a React-based web application for elementary school students to practice Kanji writing in a quiz format.

## User Review Required
> [!IMPORTANT]
> - Tailwind CSS v4 will be used as requested.
> - Data will be managed via CSV files in `public/data/` or `src/data/` to allow easy editing.
> - `hanzi-writer` requires stroke order data. We will fetch this from a CDN or include a subset locally. For MVP, we'll try CDN first (e.g., jsdelivr for hanzi-writer-data).

## Proposed Changes

### Project Initialization
- Initialize with `vite-app` (React + TypeScript).
- Setup `tailwind` (v4 alpha or latest compatible) with `@tailwindcss/vite`.

### Dependencies
- `hanzi-writer`: For kanji writing recognition.
- `papaparse`: For parsing CSV data.
- `lucide-react`: For icons (optional but good for UI).
- `canvas-confetti`: For celebration effects (optional).

### Directory Structure
```
src/
  components/
    TitleScreen.tsx
    BattleScreen.tsx
    WritingArea.tsx
    ResultScreen.tsx
  data/
    grade1.csv (Sample data)
  types/
    index.ts (Problem, Grade defs)
  utils/
    csvParser.ts
  App.tsx
  main.tsx
  index.css
```

### Data Format (CSV)
`question,answer`
Example: `[にち]ようび,日`

### Component Logic
#### TitleScreen
- Simple grade selection buttons.

#### BattleScreen
- Manages game state (current question index, score).
- Displays the sentence with the target word hidden or highlighted.
- Integration with `WritingArea`.

#### WritingArea
- Wraps `HanziWriter`.
- Handles `quiz()` mode for inputs.
- Provides feedback events (correct, mistake).

#### ResultScreen
- Shows score and "Great Job" message.
- "Back to Title" button.

## Verification Plan

### Automated Tests
- `npm run build`: Verify no build errors.
- `npm run lint`: Verify code quality.

### Manual Verification
1.  **Start App**: `npm run dev`
2.  **Grade Selection**: Click "Grade 1" on title screen.
3.  **Quiz Flow**:
    -   Verify sentence is shown.
    -   Verify Writing Area appears.
    -   Write the correct Kanji.
    -   Verify "Ping Pong" sound or visual feedback.
    -   Verify transition to next question.
    -   Make a mistake and verify hint (stroke) appears.
4.  **Completion**: Finish all questions and verify Result Screen appears.
