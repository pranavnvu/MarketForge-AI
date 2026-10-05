import re

with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx") as f:
    text = f.read()

# Only consider the text after `return (`
return_idx = text.rfind('  return (')
text_to_check = text[return_idx:]

open_divs = len(re.findall(r'<div', text_to_check))
close_divs = len(re.findall(r'</div', text_to_check))

print(f"Open divs: {open_divs}, Close divs: {close_divs}")
