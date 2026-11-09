#!/usr/bin/env python3
"""Copy the Oracle's system prompt from backend.js into owner-proxy/worker.js so the two never drift.
Run after editing the prompt:  python tools/sync-prompt.py"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
b = (root / 'backend.js').read_text(encoding='utf-8')
m = re.search(r"const DEFAULT_SYSTEM_PROMPT = (`.*?`);\n\s*// PROMPT-END", b, re.S)
if not m: raise SystemExit('prompt markers not found in backend.js')
w_path = root / 'owner-proxy' / 'worker.js'
w = w_path.read_text(encoding='utf-8')
w2, n = re.subn(r"const SYSTEM_PROMPT = `.*?`;", lambda _: 'const SYSTEM_PROMPT = ' + m.group(1) + ';', w, count=1, flags=re.S)
if n != 1: raise SystemExit('SYSTEM_PROMPT not found in worker.js')
w_path.write_text(w2, encoding='utf-8')
print('worker.js prompt updated')
