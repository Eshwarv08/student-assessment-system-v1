const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';
const files = fs.readdirSync(dir).filter(f => f.match(/^Q\d+Booklet\.tsx$/));

const replacement = `  const formatDisplayDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return \`\${String(date.getMonth() + 1).padStart(2, '0')}/\${String(date.getDate()).padStart(2, '0')}/\${date.getFullYear()}\`;
  };`;

files.forEach(file => {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  
  let changed = false;
  // single line
  if (content.match(/  const formatDisplayDate = \(d: string\) => [^;]+;/)) {
    content = content.replace(/  const formatDisplayDate = \(d: string\) => [^;]+;/, replacement);
    changed = true;
  }
  // multi line
  else if (content.match(/  const formatDisplayDate = \(d: string\) => \{[\s\S]*?  \};/)) {
    content = content.replace(/  const formatDisplayDate = \(d: string\) => \{[\s\S]*?  \};/, replacement);
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated ' + file);
  }
});
console.log('done');
