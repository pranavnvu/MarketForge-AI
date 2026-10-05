with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "r") as f:
    text = f.read()

# The file currently ends with:
#     </div>
#     </div>
# }
# And we need to fix it to properly balance the divs.
# Let's count divs from `return (`.
return_idx = text.rfind('  return (')
text_to_check = text[return_idx:]

import re
open_divs = len(re.findall(r'<div\b', text_to_check))
close_divs = len(re.findall(r'</div\b', text_to_check))

print(f"Open: {open_divs}, Close: {close_divs}")

# We need close_divs to exactly equal open_divs.
# Let's strip all closing divs and braces from the very end of the file, then append exactly what's needed.
import string
text = text.rstrip(string.whitespace + '};)/<divr>') # strip anything that looks like closing tags, braces, parens

# Now find how many divs are actually left open
return_idx = text.rfind('  return (')
text_to_check = text[return_idx:]
open_divs = len(re.findall(r'<div\b', text_to_check))
close_divs = len(re.findall(r'</div\b', text_to_check))
missing_divs = open_divs - close_divs
print(f"Missing divs: {missing_divs}")

for _ in range(missing_divs):
    text += "\n</div>"
text += "\n  );\n}\n"

with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "w") as f:
    f.write(text)

