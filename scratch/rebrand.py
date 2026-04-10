import os

src_dir = os.path.join(os.path.dirname(__file__), '../client/src')

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.css'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf8') as file:
                content = file.read()
            
            # Direct string replacement
            new_content = content.replace('var(--color-mint-green)', 'var(--color-basil-green)')
            
            if new_content != content:
                with open(path, 'w', encoding='utf8') as file:
                    file.write(new_content)
                print(f"Updated: {path}")

print("Done")
