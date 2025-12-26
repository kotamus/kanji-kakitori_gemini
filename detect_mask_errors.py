import json
import csv
import glob
import os
import re

def load_all_grade_data():
    all_words = []
    # Load all words
    for grade in range(1, 7):
        json_path = f'問題集/grade{grade}.json'
        if not os.path.exists(json_path): continue
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data.get('questions', []):
                all_words.append({'word': q['word'], 'reading': q['reading']})
    return all_words

def check_csv_data(all_words):
    issues = []
    csv_files = sorted(glob.glob('public/data/grade*.csv'))
    
    for csv_path in csv_files:
        grade_name = os.path.basename(csv_path)
        print(f"Checking {grade_name}...")
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            line = line.strip()
            if not line or line.startswith('#'): continue
            parts = line.split(',')
            if len(parts) < 2: continue
            
            question = parts[0]
            answer = parts[1].strip()
            
            # Match 1: [mask]...
            # Match 2: ...[mask]...
            match = re.search(r'([^\[]*)\[([^\]]+)\]([^\[]*)', question)
            if not match: continue
            
            pre = match.group(1)
            mask = match.group(2)
            post = match.group(3)
            
            # Construct a "Search Reading" to find the context in dictionary words
            # We assume the user's sentence reading around the mask matches the dictionary word reading
            
            # Try to match a word W that:
            # 1. Contains 'answer' kanji
            # 2. Contains the 'mask' reading in its reading
            # 3. Matches surrounding context (pre/post) roughly
            
            candidates = [w for w in all_words if answer in w['word']]
            
            for w_obj in candidates:
                word = w_obj['word']
                reading = w_obj['reading']
                
                # Filter strict: The 'reading' must contain 'mask'
                if mask not in reading: continue
                
                # Check Answer Kanji Position
                try:
                    kanji_idx = word.index(answer)
                except ValueError: continue
                
                # Check Mask Position in Reading
                # Note: 'mask' might appear multiple times, finding first for now
                mask_idx = reading.find(mask)
                
                # RULE 1: First Char Check
                # If Answer is the FIRST char of the word, Mask MUST start at 0.
                if kanji_idx == 0:
                    if mask_idx > 0:
                        # Found an issue!
                        # e.g. Word="図書館" (としょかん), Answer="図" (0)
                        # Mask="しょ" (1) -> Error.
                        issues.append({
                            'location': f"{grade_name}:{i+1}",
                            'question': question,
                            'answer': answer,
                            'mask': mask,
                            'ref_word': word,
                            'ref_reading': reading,
                            'details': "Answer is 1st char, but mask starts later."
                        })
                        break # Found issue for this line, verify next line
                        
                # RULE 2: Last Char Check
                # If Answer is the LAST char of the word, Mask MUST end at the end of reading.
                if kanji_idx == len(word) - 1:
                    mask_end_idx = mask_idx + len(mask)
                    if mask_end_idx < len(reading):
                        # e.g. Word="図書館", Answer="館" (Last)
                        # Mask="しょ" (End 3) vs Len(5) -> Error.
                        # Wait, what if Mask="としょ"? Ends at 3. Error. Correct.
                        issues.append({
                            'location': f"{grade_name}:{i+1}",
                            'question': question,
                            'answer': answer,
                            'mask': mask,
                            'ref_word': word,
                            'ref_reading': reading,
                            'details': "Answer is last char, but mask ends earlier."
                        })
                        break

    return issues

def main():
    all_words = load_all_grade_data()
    issues = check_csv_data(all_words)
    
    # De-duplicate issues (same line might trigger multiple word matches? break ensures 1 per line)
    print(f"Found {len(issues)} issues.")
    for issue in issues:
        print(f"[{issue['location']}] Q:{issue['question']} (Ans:{issue['answer']})")
        print(f"  Target Word seems to be: {issue['ref_word']} ({issue['ref_reading']})")
        print(f"  Error: {issue['details']}")
        print("-" * 30)

if __name__ == "__main__":
    main()
