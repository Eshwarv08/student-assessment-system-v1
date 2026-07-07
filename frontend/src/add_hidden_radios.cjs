const fs = require('fs');
const path = require('path');

const filePath = '/home/ganapathi/Pictures/clone/frontend/src/components/Q2Booklet.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Also handle the signature empty check correctly. 
// For now, let's just do the radio buttons.
let count = 0;
content = content.replace(/onClick={\(\)\s*=>\s*setAnswers\(\{\s*\.\.\.answers,\s*'([^']+)'\s*:\s*([^ }]+)\s*\}\)}>\s*<span/g, (match, p1, p2) => {
    count++;
    return `onClick={() => setAnswers({ ...answers, '${p1}': ${p2} })}>
                      <input type="radio" name="${p1}" required={isStudent} checked={answers['${p1}'] === ${p2} || (answers['${p1}'] || '').toLowerCase() === ${p2} || (answers['${p1}'] || '').toLowerCase() === String(${p2}).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span`;
});

console.log(`Replaced ${count} custom radio buttons in Q2Booklet.`);
if (count > 0) {
    fs.writeFileSync(filePath, content);
}

