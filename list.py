import os

def print_tree(startpath, exclude_dirs):
    with open('temp_tree.txt', 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(startpath):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            level = root.replace(startpath, '').count(os.sep)
            indent = '  ' * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = '  ' * (level + 1)
            for file in files:
                f.write(f"{subindent}{file}\n")

print_tree('.', ['.git', 'node_modules', '__pycache__', 'venv', 'env', '.gemini', '.venv'])
