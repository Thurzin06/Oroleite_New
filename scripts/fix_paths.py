import os
import re

files = ['brands/bauducco.html', 'brands/galbani.html', 'brands/life.html', 'brands/nestle.html', 'brands/notco.html', 'brands/peccin.html', 'brands/puri.html', 'brands/viscont.html', 'brands/zinho.html']

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        content = re.sub(r'\.\./img/icons/', '../icons/', content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)