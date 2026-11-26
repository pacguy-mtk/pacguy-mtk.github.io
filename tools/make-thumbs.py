#!/usr/bin/env python3
"""Make small gallery thumbnails for room.html. Run after adding gallery media (needs ffmpeg).

Writes post/thumbs/<file name>.webp for every item in data/gallery.js and rewrites
data/thumbs.js (source path -> [width, height] of the thumbnail).
Existing thumbnails are kept; delete one to rebuild it.
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
js = open('data/gallery.js', encoding='utf-8').read()
data = json.loads(js[js.index('window.GALLERY = {') + len('window.GALLERY = '):].strip().rstrip(';'))
os.makedirs('post/thumbs', exist_ok=True)


def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout.strip()


def encode(src, out, at=None):
    seek = [] if at is None else ['-ss', '%.2f' % at]
    run('ffmpeg', '-v', 'error', '-y', *seek, '-i', src, '-frames:v', '1',
        '-vf', "scale='min(600,iw)':-2", '-c:v', 'libwebp', '-quality', '78', out)


def make(src, out, video):
    if not video:
        return encode(src, out)
    # Try frames across the clip and keep the most detailed one (the largest file):
    # black fades and motion blur compress to almost nothing.
    length = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src))
    tries = []
    for n, part in enumerate((.04, .12, .2, .3, .4, .5, .6, .7, .8, .9)):
        tmp = out + '.%d.webp' % n
        encode(src, tmp, length * part)
        if os.path.exists(tmp):
            tries.append(tmp)
    os.replace(max(tries, key=os.path.getsize), out)
    for tmp in tries:
        if os.path.exists(tmp):
            os.remove(tmp)


sizes = {}
for item in data['items']:
    src = item['src']
    out = 'post/thumbs/' + os.path.basename(src) + '.webp'
    if not os.path.exists(out):
        make(src, out, item['type'] == 'video')
    w, h = run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
               'stream=width,height', '-of', 'csv=p=0', out).split(',')[:2]
    sizes[src] = [int(w), int(h)]

with open('data/thumbs.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* written by tools/make-thumbs.py, do not edit by hand */\nwindow.THUMBS = '
            + json.dumps(sizes, separators=(',', ':')) + ';\n')
print(len(sizes), 'thumbnails ready')
