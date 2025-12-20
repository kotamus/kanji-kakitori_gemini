# 漢字書き取りアプリ (Kanji Kakitori)

小学生向けの漢字書き取り練習Webアプリケーションです。「ドリル」ではなく「クイズ」感覚で楽しく学習できるように設計されています。

## 特徴

*   **「書き」の判定**: `HanziWriter` を使用し、書き順まで正確に判定します。
*   **文脈学習**: 単語単体ではなく、短文の中で漢字の使い方を学びます。
*   **直感的なUI**: 子供でも分かりやすい、シンプルで大きなボタンとテキスト。
*   **わかりやすいフィードバック**: 正解・不正解を音と視覚効果で明確に伝えます。

## 技術スタック

*   **Frontend**: React (Vite), TypeScript
*   **Styling**: Tailwind CSS v4
*   **Libraries**:
    *   `hanzi-writer`: 漢字の書き取り判定・描画
    *   `papaparse`: 問題データ(CSV)の読み込み
    *   `lucide-react`: アイコン
    *   `canvas-confetti`: 結果発表のエフェクト

## 始め方

### 1. プロジェクトのセットアップ

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 遊び方

1.  **学年を選ぶ**: タイトル画面で「1ねんせい」を選んでください。
2.  **問題を解く**:
    *   表示された文章の、**強調された部分**の漢字を書きます。
    *   画面下の枠内に大きく書いてください。
    *   正解すると「ピンポン！」と鳴り、次の問題に進みます。
3.  **結果**: 5問正解するとクリアです！

## ドキュメント

詳細な情報は以下のファイルをご確認ください（プロジェクトルートにあります）。

*   [WALKTHROUGH.md](./WALKTHROUGH.md): アプリの使い方と検証手順
*   [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md): 実装計画書
*   [TASK_STATUS.md](./TASK_STATUS.md): タスク状況

## ディレクトリ構成

*   `src/components`: UIコンポーネント
*   `src/data`: データ定義（CSVなど）
*   `src/utils`: ユーティリティ関数
*   `public/data`: 本番用問題データ (CSV)

## ライセンス

MIT License
