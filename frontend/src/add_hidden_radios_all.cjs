const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';

for (let i = 1; i <= 15; i++) {
  const filePath = path.join(dir, `Q${i}Booklet.tsx`);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  // We look for onClick={() => setAnswers({ ...answers, 'FIELD': VAL })}> 
  // followed by an optional space/newline and then <span
  content = content.replace(/onClick={\(\)\s*=>\s*setAnswers\(\{\s*\.\.\.answers,\s*'([^']+)'\s*:\s*([^ }]+)\s*\}\)}>\s*<span/g, (match, p1, p2) => {
      // If it already has our hidden radio, skip
      if (match.includes('hidden-validation-radio')) return match;
      count++;
      return `onClick={() => setAnswers({ ...answers, '${p1}': ${p2} })}>
                      <input type="radio" name="${p1}" required={isStudent} checked={answers['${p1}'] === ${p2} || (answers['${p1}'] || '').toLowerCase() === ${p2} || (answers['${p1}'] || '').toLowerCase() === String(${p2}).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span`;
  });

  if (count > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`Replaced ${count} custom radio buttons in Q${i}Booklet.`);
  }
}
