#!/usr/bin/env python3
import os
import re

def fix_imports(file_path):
    """Fix versioned imports in a file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix @radix-ui imports
    content = re.sub(r'@radix-ui/([a-z-]+)@[\d.]+', r'@radix-ui/\1', content)
    
    # Fix class-variance-authority
    content = re.sub(r'class-variance-authority@[\d.]+', r'class-variance-authority', content)
    
    # Fix lucide-react
    content = re.sub(r'lucide-react@[\d.]+', r'lucide-react', content)
    
    # Fix sonner (special case - we want to keep it without version for now)
    content = re.sub(r'sonner@[\d.]+', r'sonner', content)
    
    # Fix next-themes
    content = re.sub(r'next-themes@[\d.]+', r'next-themes', content)
    
    # Only write if changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    # Fix all .tsx and .ts files in components/ui
    ui_dir = 'components/ui'
    fixed_count = 0
    
    for filename in os.listdir(ui_dir):
        if filename.endswith(('.tsx', '.ts')):
            file_path = os.path.join(ui_dir, filename)
            if fix_imports(file_path):
                print(f'Fixed: {file_path}')
                fixed_count += 1
    
    print(f'\nDone! Fixed {fixed_count} files.')
    print('Note: react-hook-form should keep version @7.55.0 per project guidelines.')

if __name__ == '__main__':
    main()
