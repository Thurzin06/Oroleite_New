import os
import re

root = os.path.dirname(os.path.abspath(__file__))
files = ['index.html', 'style.css']
pattern = re.compile(r'(?:src=|url\(|href=)["\']([^"\')]+\.(?:png|jpg|jpeg|webp|svg))', re.IGNORECASE)
missing = []
for filename in files:
    path = os.path.join(root, filename)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for m in pattern.finditer(text):
        p = m.group(1)
        if p.startswith('http') or p.startswith('//'):
            continue
        target = os.path.join(root, p.replace('/', os.sep))
        if not os.path.exists(target):
            missing.append((filename, p, target))

if missing:
    print('Missing image references:')
    for f, p, t in missing:
        print(f, p, t)
else:
    print('No missing image references found.')
