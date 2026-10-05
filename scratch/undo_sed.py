with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "r") as f:
    text = f.read()

# I replaced `  );` with `    </div>\n  );`
# The exact string I replaced was: '  );' -> '    </div>\n  );'
# Note that my sed command was `s/  );/    <\/div>\n  );/g`
# This means every occurrence of `  );` was replaced.

# Let's replace '    </div>\n  );' back to '  );' for the whole file EXCEPT the last occurrence!
# Wait, actually we can just replace ALL of them back to `  );`, and then only add one `</div>` at the very end of the file.

import re

# Count how many replacements we are undoing
count = text.count('    </div>\n  );')
print(f"Found {count} injected tags to undo")

text = text.replace('    </div>\n  );', '  );')

# Now, we know there was 1 missing div BEFORE the sed.
# The end of the file should look like:
#   );
# }
# So let's find the LAST `  );` and insert `    </div>\n` before it.

last_idx = text.rfind('  );')
if last_idx != -1:
    text = text[:last_idx] + '    </div>\n' + text[last_idx:]
    with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "w") as f:
        f.write(text)
    print("Undo successful and single div injected at the end.")
else:
    print("Could not find ); at the end")
