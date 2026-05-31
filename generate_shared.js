const fs = require('fs');

const grading = fs.readFileSync('frontend/src/pages/GradingPortal.tsx', 'utf8');

// We'll just create a single giant component that renders the body of the grading portal.
// It will take all the necessary state as props.

const componentCode = `import React from 'react';
import { Loader2, CheckCircle2, Save, Printer } from 'lucide-react';

export const SharedAssessmentUI = ({
  isQuestion2Assessment,
  isQuestion15,
  currentAssessmentQuestions,
  submission,
  studentAnswers,
  setStudentAnswers,
  grades,
  setGrades,
  compRecord,
  setCompRecord,
  openSigModal,
  formatDisplayDate,
  handlePrint,
  saveMutation,
  isStudentMode = false
}: any) => {

// INJECT renderAssessmentHeader
// INJECT renderQuestionReview
// INJECT renderFinalResultBlock
// INJECT renderQuestion2Booklet
// INJECT main return
};
`;

// we need to extract from GradingPortal
// The UI logic starts at `const formatDisplayDate` ... wait, I'll just pass formatDisplayDate as prop.
// `const renderAssessmentHeader = () => {`
// Let's find this.

const getFunction = (name) => {
  const startStr = \`const \${name} = \`;
  let startIdx = grading.indexOf(startStr);
  if (startIdx === -1) return '';
  
  // To find the end, we count braces.
  let openBraces = 0;
  let idx = startIdx + startStr.length;
  let foundFirst = false;
  
  while(idx < grading.length) {
    if (grading[idx] === '{') { openBraces++; foundFirst = true; }
    if (grading[idx] === '}') openBraces--;
    
    idx++;
    if (foundFirst && openBraces === 0) {
      return grading.substring(startIdx, idx);
    }
  }
  return '';
};

const renderAssessmentHeader = getFunction('renderAssessmentHeader');
const renderQuestionReview = getFunction('renderQuestionReview');
const renderFinalResultBlock = getFunction('renderFinalResultBlock');
const renderQuestion2Booklet = getFunction('renderQuestion2Booklet');

// Now we need the main return.
// The main return is in GradingPortal, after `if (isQuestion2Assessment && submission) { return renderQuestion2Booklet(); }`
// Actually, it's easier: I'll just extract everything from `return (` at the bottom of GradingPortal.
// wait, the main return of GradingPortal is:
// return (
//   <div className="min-h-screen bg-slate-50 ...">
// ...
// )

const mainReturnIdx = grading.lastIndexOf('return (');
let mainReturn = grading.substring(mainReturnIdx);
// strip the last 3 lines (which are typically \n}\n\nexport default GradingPortal\n)
mainReturn = mainReturn.replace(/}\n*\s*export default GradingPortal;?\n*$/, '');

const fullCode = componentCode
  .replace('// INJECT renderAssessmentHeader', renderAssessmentHeader)
  .replace('// INJECT renderQuestionReview', renderQuestionReview)
  .replace('// INJECT renderFinalResultBlock', renderFinalResultBlock)
  .replace('// INJECT renderQuestion2Booklet', renderQuestion2Booklet)
  .replace('// INJECT main return', mainReturn);

fs.writeFileSync('frontend/src/components/SharedAssessmentUI.tsx', fullCode);
console.log("Created SharedAssessmentUI.tsx");
