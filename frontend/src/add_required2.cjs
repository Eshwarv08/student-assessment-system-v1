const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';

for (let i = 1; i <= 15; i++) {
  const filePath = path.join(dir, `Q${i}Booklet.tsx`);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We want to find <input ... onChange={...setAnswers...} ... />
  // Since JSX can span multiple lines, we can match:
  // <input[^>]*?onChange={[^\}]*?setAnswers[^\}]*?\}[^>]*?>
  
  // Wait, if it already has required={isStudent}, we should skip it.
  content = content.replace(/<input([^>]*?)onChange={([^>]*?setAnswers[^>]*?)}([^>]*?)>/g, (match, p1, p2, p3) => {
      if (match.includes('required={isStudent}')) return match;
      changed = true;
      return `<input required={isStudent} ${p1}onChange={${p2}}${p3}>`;
  });

  content = content.replace(/<textarea([^>]*?)onChange={([^>]*?setAnswers[^>]*?)}([^>]*?)>/g, (match, p1, p2, p3) => {
      if (match.includes('required={isStudent}')) return match;
      changed = true;
      return `<textarea required={isStudent} ${p1}onChange={${p2}}${p3}>`;
  });

  if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated multi-line required fields in Q${i}Booklet.tsx`);
  }
}
