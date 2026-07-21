import os
import re

TARGET_DIR = r"c:\Users\danushnarayan.s\Downloads\E-Commerce Project_final\frontend\src"

REPLACEMENTS = [
    (r'bg-white(?!\s+dark:bg-[^\s]+)', r'bg-white dark:bg-gray-800'),
    (r'bg-gray-50(?!\s+dark:bg-[^\s]+)(?!\/50)', r'bg-gray-50 dark:bg-gray-900'),
    (r'bg-gray-100(?!\s+dark:bg-[^\s]+)', r'bg-gray-100 dark:bg-gray-800'),
    (r'text-gray-900(?!\s+dark:text-[^\s]+)', r'text-gray-900 dark:text-white'),
    (r'text-gray-800(?!\s+dark:text-[^\s]+)', r'text-gray-800 dark:text-gray-100'),
    (r'text-gray-600(?!\s+dark:text-[^\s]+)', r'text-gray-600 dark:text-gray-300'),
    (r'text-gray-500(?!\s+dark:text-[^\s]+)', r'text-gray-500 dark:text-gray-400'),
    (r'border-gray-200(?!\s+dark:border-[^\s]+)', r'border-gray-200 dark:border-gray-700'),
    (r'border-gray-100(?!\s+dark:border-[^\s]+)', r'border-gray-100 dark:border-gray-700'),
    (r'hover:bg-gray-50(?!\s+dark:hover:bg-[^\s]+)', r'hover:bg-gray-50 dark:hover:bg-gray-700'),
    (r'hover:bg-gray-100(?!\s+dark:hover:bg-[^\s]+)', r'hover:bg-gray-100 dark:hover:bg-gray-700'),
    (r'hover:text-gray-900(?!\s+dark:hover:text-[^\s]+)', r'hover:text-gray-900 dark:hover:text-white'),
]

for root, _, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, repl in REPLACEMENTS:
                new_content = re.sub(pattern, repl, new_content)
                
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")
