const fs = require('fs');
let content = fs.readFileSync('src/components/Q15Booklet.tsx', 'utf-8');

const regex = /<div className="mb-2 text-\[10\.5pt\]">\s*<span className="cursor-pointer hover:bg-gray-50 relative inline-block pr-6" onClick=\{\(\) => setAnswers\(\{ \.\.\.answers, '([^']+)'\s*:\s*'([^']+)' \}\)\}>\s*([\s\S]*?)\s*\{answers\['\1'\] === '\2' && <span className="absolute right-0 -top-1 text-red-600 font-bold text-2xl leading-none z-10 pointer-events-none">✓<\/span>\}\s*<\/span>\s*<\/div>/g;

content = content.replace(regex, (match, qId, val, text) => {
  return `<div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input type="radio" checked={answers['${qId}'] === '${val}'} onChange={() => setAnswers({ ...answers, '${qId}': '${val}' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, '${qId}': '${val}' })}>
                  ${text.trim()}
                </label>
              </div>`;
});

fs.writeFileSync('src/components/Q15Booklet.tsx', content, 'utf-8');
console.log("Done");
