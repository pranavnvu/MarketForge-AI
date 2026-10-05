import re

with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx") as f:
    text = f.read()

return_idx = text.rfind('  return (')
text_to_check = text[return_idx:]

# Find all <div and </div with line numbers
lines = text_to_check.split('\n')
for i, line in enumerate(lines):
    o = len(re.findall(r'<div\b', line))
    c = len(re.findall(r'</div\b', line))
    if o != c:
        print(f"Line {i}: +{o} -{c}  =>  {line.strip()}")
