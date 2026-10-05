with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx") as f:
    text = f.read()

# Let's count { and } in the file
def count_brackets(text):
    open_b = 0
    close_b = 0
    for char in text:
        if char == '{': open_b += 1
        elif char == '}': close_b += 1
    return open_b, close_b

print("Total brackets:", count_brackets(text))
