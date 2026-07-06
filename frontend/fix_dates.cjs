const fs = require('fs');
let content = fs.readFileSync('src/components/Q15Booklet.tsx', 'utf-8');

// 1. Fix learner_dec_date
content = content.replace(
  /<input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value=\{compRecord\['learner_dec_date'\] \|\| \(submitDate \? submitDate\.split\('T'\)\[0\] : ''\)\} onChange=\{\(e\) => !isStudent && setCompRecord\(\{ \.\.\.compRecord, 'learner_dec_date': e\.target\.value \}\)\} readOnly=\{isStudent\} \/>/g,
  `<input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={answers['student_decl_date'] || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'student_decl_date': e.target.value })} disabled={!isStudent} />`
);

// 2. Fix all OTHER type="date" inputs that have readOnly={isStudent}
content = content.replace(
  /<input type="date"([^>]*?)value=\{compRecord\['([^']+)'\] \|\| ''\} onChange=\{\(e\) => !isStudent && setCompRecord\(\{ \.\.\.compRecord, '\2': e\.target\.value \}\)\} readOnly=\{isStudent\} \/>/g,
  (match, attrs, field) => {
    if (field === 'date_submitted' || field === 'cohort') {
      return match;
    }
    return `<input type="date"${attrs}value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />`;
  }
);

content = content.replace(
  /<input type="date"([^>]*?)value=\{compRecord\[`\$\{prefix\}_([^`]+)`\] \|\| ''\} onChange=\{\(e\) => !isStudent && setCompRecord\(\{ \.\.\.compRecord, \[`\$\{prefix\}_\2`\]: e\.target\.value \}\)\} readOnly=\{isStudent\} \/>/g,
  (match, attrs) => {
    return `<input type="date"${attrs}value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />`;
  }
);

fs.writeFileSync('src/components/Q15Booklet.tsx', content, 'utf-8');
console.log("Dates fixed successfully.");
