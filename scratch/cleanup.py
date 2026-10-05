with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "r") as f:
    text = f.read()

import re

# Remove unused imports
text = re.sub(r"import \{.*?TerminalIcon.*?\n", "", text) # this might be tricky, let's just delete the specific unused variables instead

# The easiest way to pass tsc is to just remove the lines containing them, since they are state variables for tabs I deleted.
lines_to_delete = [
    "const [tasks, setTasks]",
    "const [newTaskTitle, setNewTaskTitle]",
    "const [newTaskAgent, setNewTaskAgent]",
    "const handleMoveTask =",
    "const handleAddTask =",
    "const [terminalHistory, setTerminalHistory]",
    "const [terminalInput, setTerminalInput]",
    "const handleRunTerminalCommand =",
    "const agentStatuses =",
    "const handleToggleAgent =",
    "const handleEnableAllAgents =",
    "const handleRunSingleNode =",
    "const [logFilterAgent, setLogFilterAgent]",
    "const [logFilterLevel, setLogFilterLevel]",
    "const filteredLogs =",
    "const handleSimulateLog =",
    "const handleClearLogs =",
    "const handleDownloadLogs ="
]

new_lines = []
skip = False
open_braces = 0

lines = text.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    
    # If we are skipping a block (like a function)
    if skip:
        open_braces += line.count('{') - line.count('}')
        if open_braces <= 0:
            skip = False
            open_braces = 0
        i += 1
        continue

    should_skip = False
    for pat in lines_to_delete:
        if pat in line:
            should_skip = True
            break
            
    if should_skip:
        # If it's a function declaration, skip until braces balance
        if "const handle" in line and "=> {" in line:
            skip = True
            open_braces = line.count('{') - line.count('}')
            if open_braces <= 0:
                skip = False
        # If it's a state declaration, just skip this line
        i += 1
        continue
        
    new_lines.append(line)
    i += 1

with open("frontend/src/pages/dashboard/ProjectWorkspace.tsx", "w") as f:
    f.write('\n'.join(new_lines))

