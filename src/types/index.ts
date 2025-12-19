export interface Problem {
    id: string;       // Unique ID generated from sentence or content
    sentence: string; // The full sentence with bracket notation, e.g., "[にち]ようび"
    reading: string;  // Extracted reading, e.g., "にち"
    kanji: string;    // The correct kanji, e.g., "日"
    pre: string;      // Part before the target, e.g. ""
    post: string;     // Part after the target, e.g. "ようび"
}

export interface GradeData {
    grade: string;
    problems: Problem[];
}
