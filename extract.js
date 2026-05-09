const fs = require('fs');
const content = fs.readFileSync('/home/ganapathi/.gemini/antigravity/brain/ee3f9605-d57f-4e31-bd3a-285cc1cd17e3/.system_generated/logs/overview.txt', 'utf8');
const lines = content.split('\n');
let fileContent = [];
let capturing = false;
let foundAtLeastOne = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('File Path: `file:///home/ganapathi/Pictures/clone/student-assessment-system-v1-main/frontend/src/pages/GradingPortal.tsx`')) {
    capturing = true;
    fileContent = [];
    foundAtLeastOne = true;
    // Skip down to "The following code has been modified"
    while (i < lines.length && !lines[i].includes('The following code has been modified')) {
      i++;
    }
    continue;
  }
  if (capturing) {
    if (lines[i].includes('The above content shows the entire')) {
      capturing = false;
    } else {
      // Remove the line number prefix (e.g. "1: ")
      const match = lines[i].match(/^\d+:\s?(.*)$/);
      if (match) {
        fileContent.push(match[1]);
      } else {
        fileContent.push(lines[i]);
      }
    }
  }
}

if (foundAtLeastOne) {
  fs.writeFileSync('restored_GradingPortal.tsx', fileContent.join('\n'));
  console.log('Restored to restored_GradingPortal.tsx');
} else {
  console.log('Could not find file content');
}
