import json
import csv
import glob
import os
import re

# Known Jukujikun list or heuristic.
# Since we don't have a database, we can just flag suspicious alignments.
# But we can also explicitly list some common Jukujikun from the Grade list if we want.
# For now, we will rely on a list of words that are inherently inseparable in reading.
JUKUJIKUN_WORDS = {
    "明日": "あした",
    "大人": "おとな",
    "七夕": "たなばた",
    "梅雨": "つゆ",
    "五月雨": "さみだれ",
    "二十日": "はつか",
    "今日": "きょう",
    "今年": "ことし"
}

def load_grade_kanji_set(grade_num):
    json_path = f'問題集/grade{grade_num}.json'
    if not os.path.exists(json_path):
        return set(), []
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    allowed_kanji = set()
    
    # Priority 1: kanjiList
    if 'kanjiList' in data:
        for char in data['kanjiList']:
            allowed_kanji.add(char)
            
    # Priority 2: wordCategories
    categories = data.get('wordCategories', {})
    for cat_list in categories.values():
        for char in cat_list:
            if len(char) == 1: allowed_kanji.add(char)
            
    return allowed_kanji, data.get('questions', [])

def check_grade_data():
    issues = []
    csv_files = sorted(glob.glob('public/data/grade*.csv'))
    
    for csv_path in csv_files:
        basename = os.path.basename(csv_path)
        match = re.search(r'grade(\d+)', basename)
        if not match: continue
        grade_num = match.group(1)
        
        allowed_kanji, master_questions = load_grade_kanji_set(grade_num)
        
        # We also want to detect if an Answer belongs to a known Jukujikun word
        # AND that word is being used in the question.
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            line = line.strip()
            if not line or line.startswith('#'): continue
            parts = line.split(',')
            if len(parts) < 2: continue
            
            question = parts[0]
            answer = parts[1].strip()
            
            # --- Check 4: Jukujikun Detection ---
            # Extract basic word context?
            # It's hard without parsing, but we can look at our Master Questions list for matches.
            
            inferred_word = None
            inferred_reading = None
            
            # Find matching word in master list
            if master_questions:
                match_mask = re.search(r'([^\[]*)\[([^\]]+)\]([^\[]*)', question)
                if match_mask:
                     mask_val = match_mask.group(2)
                     # fuzzy search
                     for entry in master_questions:
                         if answer in entry['word']:
                             # Check if reading contains mask
                             if mask_val in entry['reading']:
                                 inferred_word = entry['word']
                                 inferred_reading = entry['reading']
                                 break
            
            if inferred_word:
                # Is this word a known Jukujikun?
                if inferred_word in JUKUJIKUN_WORDS:
                     issues.append({
                         'type': 'Potential Jukujikun',
                         'location': f"{basename}:{i+1}",
                         'details': f"Word '{inferred_word}' is a Jukujikun. Asking for single char '{answer}' is valid only if reading split is standard (unlikely)."
                     })
            
            # Jukujikun Heuristic:
            # If the inferred word is 2+ chars, and the reading length is way different 
            # or known not to map.
            # E.g. 明日 (2 chars) -> あした (3 chars). 'あ' doesn't map to 明 neatly in this context?
            # (Actually 'あ' maps to nothing standard for 明).
            
            # --- Check 1: Validity ---
            if allowed_kanji and answer not in allowed_kanji:
                 issues.append({
                     'type': 'Out-of-Grade',
                     'location': f"{basename}:{i+1}",
                     'details': f"Answer '{answer}' is not in Grade {grade_num} master list."
                 })
                 
            # --- Check 2: Masking ---
            match_mask = re.search(r'([^\[]*)\[([^\]]+)\]([^\[]*)', question)
            if not match_mask: continue
            pre, mask, post = match_mask.groups()
            
            if inferred_word:
                 # Check word alignment (First/Last)
                 word = inferred_word
                 reading = inferred_reading
                 try:
                    kanji_idx = word.index(answer)
                    mask_idx = reading.find(mask)
                    
                    if kanji_idx == 0 and mask_idx > 0:
                        issues.append({
                            'type': 'Mask Alignment',
                            'location': f"{basename}:{i+1}",
                            'details': f"Answer '{answer}' is 1st char of '{word}', but mask '{mask}' is not start of '{reading}'."
                        })
                    elif kanji_idx == len(word) - 1:
                        mask_end = mask_idx + len(mask)
                        if mask_end < len(reading):
                             issues.append({
                                'type': 'Mask Alignment',
                                'location': f"{basename}:{i+1}",
                                'details': f"Answer '{answer}' is last char of '{word}', but mask '{mask}' is not end of '{reading}'."
                             })
                 except ValueError: pass

    return issues

def main():
    issues = check_grade_data()
    print(f"Found {len(issues)} issues.")
    for issue in issues:
        print(f"[{issue['type']}] {issue['location']}")
        print(f"  -> {issue['details']}")

if __name__ == "__main__":
    main()
