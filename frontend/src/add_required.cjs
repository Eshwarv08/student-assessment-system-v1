const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';

for (let i = 1; i <= 15; i++) {
  const filePath = path.join(dir, `Q${i}Booklet.tsx`);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // We want to add required={isStudent} to any <input> or <textarea> that has setAnswers
  // We can do this with regex replacing, but safely.

  // Regex to match <input ... onChange={(e) => setAnswers(...) ... />
  // This is tricky because the element can span multiple lines.
  
  // A simpler approach: find "setAnswers" in the same line or element.
  // Actually, we can just replace `<input ` with `<input required={isStudent} `
  // BUT only if `setAnswers` is present on the same line, OR we just do it for textareas and text inputs that don't have it.
  
  let lines = content.split('\n');
  let changed = false;
  for (let j = 0; j < lines.length; j++) {
      if ((lines[j].includes('<input') || lines[j].includes('<textarea')) && lines[j].includes('setAnswers') && !lines[j].includes('required={')) {
          // If it's an input or textarea that modifies answers, make it required for students
          lines[j] = lines[j].replace(/<input /g, '<input required={isStudent} ');
          lines[j] = lines[j].replace(/<textarea /g, '<textarea required={isStudent} ');
          changed = true;
      } else if (lines[j].includes('<input') && lines[j].includes('type="radio"') && lines[j].includes('setAnswers') && !lines[j].includes('required={')) {
          lines[j] = lines[j].replace(/<input /g, '<input required={isStudent} ');
          changed = true;
      }
  }

  if (changed) {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Updated required fields in Q${i}Booklet.tsx`);
  }
}
