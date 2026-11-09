#!/usr/bin/env python3
"""
Convert finished card illustrations (big PNGs) into small WebP files for the game.

  python convert-art.py <source-folder> [--size 520] [--quality 82]

Source files must be named by card id (0.png, 1.png, ... 77.png).
Output goes to ../assets/<id>.webp. The game tries .webp first, then falls back to .png,
so you can convert a few cards at a time. A 1.3 MB PNG typically becomes ~40-80 KB.
Requires Pillow:  pip install pillow
"""
import argparse, pathlib, sys
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('--size', type=int, default=520, help='output width in px (height keeps the ratio)')
ap.add_argument('--quality', type=int, default=82)
a = ap.parse_args()

out = pathlib.Path(__file__).resolve().parent.parent / 'assets'
out.mkdir(exist_ok=True)
done = 0
for f in sorted(pathlib.Path(a.src).glob('*.png')):
    if not f.stem.isdigit():
        print(f'skip {f.name} (name must be the card id, e.g. 12.png)')
        continue
    im = Image.open(f).convert('RGBA' if 'A' in Image.open(f).getbands() else 'RGB')
    h = round(im.height * a.size / im.width)
    im = im.resize((a.size, h), Image.LANCZOS)
    dest = out / f'{f.stem}.webp'
    im.save(dest, 'WEBP', quality=a.quality, method=6)
    print(f'{f.name}: {f.stat().st_size//1024} KB -> {dest.name} {dest.stat().st_size//1024} KB')
    done += 1
print(f'{done} converted into {out}')
