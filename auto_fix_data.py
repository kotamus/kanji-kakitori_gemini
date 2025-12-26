import json
import csv
import glob
import os
import re

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
    if 'kanjiList' in data:
        for char in data['kanjiList']:
            allowed_kanji.add(char)
            
    categories = data.get('wordCategories', {})
    for cat_list in categories.values():
        for char in cat_list:
            if len(char) == 1: allowed_kanji.add(char)
            
    return allowed_kanji, data.get('questions', [])

def fix_grade_data():
    csv_files = sorted(glob.glob('public/data/grade*.csv'))
    
    total_removed = 0
    
    for csv_path in csv_files:
        basename = os.path.basename(csv_path)
        match = re.search(r'grade(\d+)', basename)
        if not match: continue
        grade_num = match.group(1)
        
        allowed_kanji, master_questions = load_grade_kanji_set(grade_num)
        
        if not allowed_kanji:
             print(f"Skipping {basename}: No master kanji list detected.")
             continue
             
        print(f"Processing {basename} (Grade {grade_num})...")
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        new_lines = []
        removed_in_file = 0
        
        for i, line in enumerate(lines):
            line_str = line.strip()
            if not line_str or line_str.startswith('#'):
                new_lines.append(line) # Keep comments/empty
                continue
                
            parts = line_str.split(',')
            if len(parts) < 2:
                new_lines.append(line)
                continue
                
            question = parts[0]
            answer = parts[1].strip()
            
            # CHECK 1: Out of Grade
            if answer not in allowed_kanji:
                print(f"  Removing at line {i+1}: {line_str} (Answer '{answer}' not in Grade {grade_num})")
                removed_in_file += 1
                continue
            
            # CHECK 2: Jukujikun
            is_jukujikun = False
            match_mask = re.search(r'([^\[]*)\[([^\]]+)\]([^\[]*)', question)
            if match_mask:
                 mask_val = match_mask.group(2)
                 for entry in master_questions:
                     if answer in entry['word']:
                         if mask_val in entry['reading']:
                             inferred_word = entry['word']
                             if inferred_word in JUKUJIKUN_WORDS:
                                 is_jukujikun = True
                                 print(f"  Removing at line {i+1}: {line_str} (Jukujikun '{inferred_word}')")
                                 break
            
            if is_jukujikun:
                removed_in_file += 1
                continue
                
            # If passes, keep it
            new_lines.append(line)
            
        if removed_in_file > 0:
            with open(csv_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"  -> Removed {removed_in_file} lines from {basename}")
            total_removed += removed_in_file
        else:
            print(f"  -> No changes for {basename}")
            
    print(f"Cleanup complete. Total lines removed: {total_removed}")

if __name__ == "__main__":
    fix_grade_data()
