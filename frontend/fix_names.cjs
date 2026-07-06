const fs = require('fs');
let content = fs.readFileSync('src/components/Q15Booklet.tsx', 'utf-8');

// We want to replace all inputs that map to some kind of assessor_name field
// Currently they look like:
// <input type="text" className="w-full bg-transparent text-center focus:outline-none" value={compRecord['ka1_assessor_name'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'ka1_assessor_name': e.target.value })} readOnly={isStudent} />

content = content.replace(
  /<input type="text"([^>]*?)value=\{compRecord\['([^']+assessor_name)'\] \|\| ''\} onChange=\{\(e\) => !isStudent && setCompRecord\(\{ \.\.\.compRecord, '\2': e\.target\.value \}\)\} readOnly=\{isStudent\} \/>/g,
  (match, attrs) => {
    return `<input type="text"${attrs}value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />`;
  }
);

fs.writeFileSync('src/components/Q15Booklet.tsx', content, 'utf-8');
console.log("Names fixed successfully.");
