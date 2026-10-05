const fs = require('fs');
const code = fs.readFileSync('frontend/src/pages/dashboard/ProjectWorkspace.tsx', 'utf8');
const lines = code.split('\n');
let depth = 0;
for (let i = 659; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  depth += opens - closes;
}
console.log("Depth at end:", depth);
