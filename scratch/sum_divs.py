import re

with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx") as f:
    text = f.read()

return_idx = text.rfind('  return (')
text_to_check = text[return_idx:]

lines = text_to_check.split('\n')
depth = 0
for i, line in enumerate(lines):
    o = len(re.findall(r'<div\b', line))
    c = len(re.findall(r'</div\b', line))
    depth += o - c
    if o != c:
        print(f"Line {i}: depth {depth} | {line.strip()}")
print(f"Final depth: {depth}")
