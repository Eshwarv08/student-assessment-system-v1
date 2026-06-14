const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/Q1Booklet.tsx', 'utf8');

content = content.replace(/Q1Booklet/g, 'Q4Booklet');
content = content.replace(/q1-booklet/g, 'q4-booklet');
content = content.replace(/q1Styles/g, 'q4Styles');
content = content.replace(/..\/data\/questions/g, '../data/questions4');

content = content.replace(/ICTCBL246 & ICTCBL247/g, 'ICTCBL320');
content = content.replace(/Install, maintain and modify customer premises communications cabling/g, 'Jumper metallic conductor cable in the access network');

// Remove Task 6 from the Competency Record table
content = content.replace(/<tr><td className="font-bold">Assessment Task 6<\/td><td className="text-center">S \/ NS<\/td><\/tr>/g, '');

// Remove Task 6 from the Admin Info table
content = content.replace(/<tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 6<\/td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>\{assessmentQuestions.adminInfo.task6Description\}<\/td><\/tr>/g, '');

fs.writeFileSync('frontend/src/components/Q4Booklet.tsx', content);
console.log('Q4Booklet.tsx generated!');
