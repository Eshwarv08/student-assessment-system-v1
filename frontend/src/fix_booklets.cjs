const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';

for (let i = 2; i <= 15; i++) {
  const filePath = path.join(dir, `Q${i}Booklet.tsx`);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has media query
  if (content.includes('@media screen and (max-width: 800px)')) {
    console.log(`Skipping Q${i}Booklet.tsx, already has mobile media query.`);
    continue;
  }

  // 1. Outer border
  content = content.replace(/<div style={{ border: '([^']+)', padding: '([^']+)', minHeight: '277mm'/g, '<div className="cover-outer-border" style={{ border: \'$1\', padding: \'$2\', minHeight: \'277mm\'');

  // 2. Inner border
  content = content.replace(/<div style={{ border: '([^']+)', padding: '([^']+)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}/g, '<div className="cover-inner-border" style={{ border: \'$1\', padding: \'$2\', width: \'100%\', display: \'flex\', flexDirection: \'column\', alignItems: \'center\', flex: 1 }}');

  // 3. Cover title (match 40pt to 49pt)
  content = content.replace(/<div style={{ fontSize: '(4[0-9]pt)'/g, '<div className="cover-title" style={{ fontSize: \'$1\'');
  
  // 4. Cover subtitle (match 20pt to 29pt)
  content = content.replace(/<div style={{ fontSize: '(2[0-9]pt)'/g, '<div className="cover-subtitle" style={{ fontSize: \'$1\'');

  // 5. Cover student name container (match 13pt or 14pt with Times New Roman)
  content = content.replace(/<div style={{ fontSize: '(1[34]pt)', fontFamily: '"Times New Roman"/g, '<div className="cover-student-name-container" style={{ fontSize: \'$1\', fontFamily: \'"Times New Roman"');
  
  // Also force student name inner span to be full width
  content = content.replace(/<span style={{ display: 'inline-block', borderBottom: '([^']+)', width: '110mm'/g, '<span style={{ display: \'inline-block\', borderBottom: \'$1\', width: \'100%\'');

  // 6. Inject CSS
  const css = `
      @media screen and (max-width: 800px) {
        .q${i}-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q${i}-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q${i}-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q${i}-booklet-view .flex, .q${i}-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q${i}-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q${i}-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q${i}-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q${i}-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q${i}-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q${i}-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  \`;`;

  // Find the closing backtick for the styles string
  const regex = new RegExp(`const q${i}Styles = \`[\\s\\S]*?\\n\\s*\\n\\s*\\\`;`);
  const match = content.match(regex);
  if (match) {
    // We can also just replace `  `;\n\n  return (` with `\n${css}\n\n  return (`
    content = content.replace(/ {4}\`;\n\n {2}return \(/, `${css}\n\n  return (`);
  } else {
    // Try simpler replacement
    content = content.replace(/ {2}\`;\n\n {2}return \(/, `${css}\n\n  return (`);
    content = content.replace(/\`;\n\n {2}return \(/, `${css}\n\n  return (`);
  }

  // Handle the edge case where `@media screen and (max-width: 240mm)` exists right before the closing backtick
  // By splitting by ``;` and inserting before it.
  const parts = content.split('`;\n\n  return (');
  if (parts.length === 2 && !content.includes(css)) {
     content = parts[0] + css + '\n\n  return (' + parts[1];
  } else if (!content.includes(css)) {
     const parts2 = content.split('`;\n  return (');
     if (parts2.length === 2) {
         content = parts2[0] + css + '\n  return (' + parts2[1];
     }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Processed Q${i}Booklet.tsx`);
}
