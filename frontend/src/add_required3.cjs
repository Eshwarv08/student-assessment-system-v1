const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';

for (let i = 1; i <= 15; i++) {
  const filePath = path.join(dir, `Q${i}Booklet.tsx`);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We want to find <input ... onChange={...setAnswers...} ... />
  // We can use a regex that matches `<input` then anything up to `>` but we have to be careful with `>` inside `{ }`.
  // Since JSX can have `>`, let's just match from `<input` to `onChange={` to `setAnswers` to `/>` or `>`.
  
  // A much simpler way: replace `<input ` with `<input required={isStudent} ` ONLY if we can verify it's a student input.
  // We already did a single-line replace. What about multi-line?
  
  // Let's just find the exact string we saw in Q1Booklet:
  // <input 
  //   type="radio" 
  //   name={ansKey}
  //   checked={isChecked} 
  //   onChange={() => setAnswers({ ...answers, [ansKey]: opt.value })} 
  
  content = content.replace(/<input([^>]*?)onChange={\s*\([^)]*\)\s*=>\s*setAnswers/g, (match, p1) => {
      if (match.includes('required={isStudent}')) return match;
      changed = true;
      return `<input required={isStudent} ${p1}onChange={(e) => setAnswers`; // e might be () or (e) we just use the original match? Wait.
  });

  // Better replacement strategy:
  content = content.replace(/<input([\s\S]*?)onChange={\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*setAnswers/g, (match, p1) => {
      if (p1.includes('>')) return match; // We crossed boundary of an element
      if (match.includes('required={isStudent}')) return match;
      changed = true;
      return match.replace('<input ', '<input required={isStudent} ');
  });

  content = content.replace(/<textarea([\s\S]*?)onChange={\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*setAnswers/g, (match, p1) => {
      if (p1.includes('>')) return match;
      if (match.includes('required={isStudent}')) return match;
      changed = true;
      return match.replace('<textarea ', '<textarea required={isStudent} ');
  });

  if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated multi-line required fields in Q${i}Booklet.tsx`);
  }
}
