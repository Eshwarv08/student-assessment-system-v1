# ACTA College Assessment Portal – Implementation Progress

## Project Overview

**Framework:** React + TypeScript  
**Working Directory:** `/home/ganapathi/Pictures/clone/frontend/src`  
**Goal:** Make every question's assessor view display A4-sized pages with page numbers in the footer (matching the student view), and make the Download button generate a direct PDF file (no print dialog) for both student and assessor views.

---

## Architecture & Key Concepts

### A4 Page CSS Pattern
Every booklet component uses this CSS for each `.page` div:
```css
.qN-booklet-view .page {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  margin: 12mm auto;
  padding: 12mm 14mm 12mm 14mm;
  position: relative;
  box-shadow: 0 2px 12px rgba(0,0,0,.35);
  page-break-after: always;
  display: flex;
  flex-direction: column;
}
```

### Page Footer Pattern
Every page ends with:
```jsx
<div className="page-footer"><span></span><span>Page X of N</span></div>
```
With CSS:
```css
.page-footer {
  margin-top: auto;
  padding-top: 4mm;
  border-top: 1px solid #000;
  display: flex;
  justify-content: space-between;
  font-size: 8pt;
}
```

### PDF Download Utility
**File:** `/frontend/src/lib/downloadPdf.ts`  
Uses `html2canvas` + `jsPDF` to capture each `.page` div and assemble an A4 PDF directly without opening the print dialog. Falls back to `window.print()` if no pages found.

### isStudent Prop Pattern
- `isStudent={true}` → student view (grading controls read-only)
- `isStudent={false}` → assessor view (grading controls interactive)

### compRecord / setCompRecord Props
All booklet components (Q1–Q5) have optional external props:
```typescript
compRecord?: any;
setCompRecord?: (val: any) => void;
```
With internal `useState` fallback when not provided:
```typescript
const [internalCompRecord, setInternalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
const compRecord = externalCompRecord ?? internalCompRecord;
const setCompRecord = externalSetCompRecord ?? setInternalCompRecord;
```

### GradingPortal Early-Return Pattern
For each question, GradingPortal detects the token and renders a self-contained view:
```typescript
const isQuestionN = (submission?.assessment_id?.token || '').toLowerCase() === 'question-N';

if (isQuestionN && submission) {
  return (
    <div className="bg-[#eff6ff] print:bg-white min-h-screen pb-20 font-sans">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-50 bg-[#1e3a8a] text-white ...">
        <button onClick={markAllCorrect} className="... bg-amber-500 ...">Mark All Correct</button>
        <button onClick={() => saveMutation.mutate()} className="... bg-green-600 ...">Save Changes</button>
        <button onClick={() => { saveMutation.mutate(); setTimeout(() => handlePrint(), 500); }} className="... bg-blue-600 ...">Download</button>
      </div>
      <QNBooklet
        answers={studentAnswers}
        setAnswers={setStudentAnswers}
        onSubmit={handleDownload}
        submitting={saveMutation.isPending}
        studentName={submission.student_name}
        submitDate={submission.submitted_at}
        isStudent={false}
        compRecord={compRecord}
        setCompRecord={setCompRecord}
      />
    </div>
  );
}
```

### Student Name Fix (Q4 & Q5)
The student name is stored in `answers['st-name']`, NOT `answers['first_name']`. Use:
```typescript
studentName={answers['st-name'] || searchParams.get('st-name') || ''}
submitDate={new Date().toISOString()}
```

### handlePrint in GradingPortal
`handlePrint` already contains all booklet classes from q1 to q15:
```typescript
const bookletClasses = ['q1-booklet-view', 'q2-booklet-view', ..., 'q15-booklet-view'];
```
No changes needed here for new questions — it already handles them all.

---

## Files Modified (Reference)

| File | Purpose |
|------|---------|
| `/frontend/src/lib/downloadPdf.ts` | Shared PDF download utility (html2canvas + jsPDF) |
| `/frontend/src/pages/GradingPortal.tsx` | Assessor view — early-return blocks per question |
| `/frontend/src/pages/AssessmentForm.tsx` | Student view — booklet rendering + PDF download |
| `/frontend/src/components/Q1Booklet.tsx` | Q1 booklet with optional compRecord props |
| `/frontend/src/components/Q3Booklet.tsx` | Q3 booklet with optional compRecord/grades/taskResults/finalResult props |
| `/frontend/src/components/Q4Booklet.tsx` | Q4 booklet — 22 explicit A4 pages |
| `/frontend/src/components/Q5Booklet.tsx` | Q5 booklet — 14 explicit A4 pages |

---

## Completed Questions

---

### ✅ Question 1 (Q1Booklet)

**Status:** Complete  
**Booklet class:** `q1-booklet-view`  
**Component:** `/frontend/src/components/Q1Booklet.tsx`

**Changes made:**
- Added optional `compRecord` / `setCompRecord` props with `useState` fallback
- Replaced dummy const variables with the internal/external fallback pattern
- Already had `.page` divs with page numbers in footer — no restructuring needed
- GradingPortal: added `isQuestion1` detection + early-return block with Mark All Correct (amber), Save Changes (green), Download (blue) toolbar
- AssessmentForm: PDF download uses `q1-booklet-view` class

**Fix applied:** "Mark All Correct" button was missing in Q1 assessor toolbar — added amber button matching Q15's layout.

---

### ✅ Question 3 (Q3Booklet)

**Status:** Complete  
**Booklet class:** `q3-booklet-view`  
**Component:** `/frontend/src/components/Q3Booklet.tsx`

**Changes made:**
- Added optional props: `compRecord`, `setCompRecord`, `grades`, `setGrades`, `taskResults`, `setTaskResults`, `finalResult`, `setFinalResult`
- Changed internal `handleDownload` from `window.print()` to `onSubmit()`
- GradingPortal: added `isQuestion3` detection + early-return block
- Passes all grade/task/result state from GradingPortal into the booklet

---

### ✅ Question 4 (Q4Booklet)

**Status:** Complete  
**Booklet class:** `q4-booklet-view`  
**Component:** `/frontend/src/components/Q4Booklet.tsx`  
**Data file:** `/frontend/src/data/questions4.ts`  
**Total pages:** 22

**Changes made:**
- Added optional `compRecord` / `setCompRecord` props with `useState` fallback
- Restructured from dynamic `.map()` loop into **22 explicit A4 `.page` divs**
- Added `Page X of 22` footer to every page
- Fixed bug: figures (images) not showing in student view — added `q.image` + `q.imageCaption` rendering in `type === 'text'` question block
- Reduced image size by 50% (`width: 210px`) to prevent PDF overflow
- GradingPortal: added `isQuestion4` detection + early-return block
- AssessmentForm: fixed `studentName` to use `answers['st-name']`

**Page layout (22 pages):**
| Pages | Content |
|-------|---------|
| 1 | Cover page |
| 2 | Assessment Competency Record |
| 3 | Admin: unit code, pre-req, co-req, unit summary |
| 4 | Admin: target group, conditions, resources, re-assessment |
| 5 | Admin: assessment instruction, task 1–5 descriptions |
| 6 | Task 1 – Observation sections |
| 7 | Task 1 – Assessor Checklist items 0–6 |
| 8 | Task 1 – Checklist items 7–12 + declarations |
| 9 | Task 2 – Observation sections |
| 10 | Task 2 – Oral questions + performance items 0–7 |
| 11 | Task 2 – Performance items 8–12 + declarations |
| 12 | Task 3 – Observation sections |
| 13 | Task 3 – Oral questions + performance items 0–3 |
| 14 | Task 3 – Performance items 4–7 + declarations |
| 15 | Task 4 – Intro + required docs + knowledge Q1–5 |
| 16 | Task 4 – Knowledge Q6–15 + report textarea |
| 17 | Task 4 – Assessor checklist + declarations |
| 18 | Task 5 – Student instructions + Q1–4 (MCQ) |
| 19 | Task 5 – Q5–7 (with Fig 1 image) |
| 20 | Task 5 – Q8–14 (with Fig 2 + cable image) |
| 21 | Task 5 – Q15–21 (with tool images) |
| 22 | Task 5 – Q22–24 + declarations + END OF ASSESSMENT |

**Helper pattern used (defined outside component):**
```jsx
const InnerHeader = () => ( ... ); // shared header on every page except cover
const PageFooter = ({ n }) => (
  <div className="page-footer"><span></span><span>Page {n} of 22</span></div>
);
```

**Inner helpers (defined inside component, close over state):**
```typescript
const renderDeclarations = (taskKey: string) => ( ... );
const renderQ5 = (q: any) => ( ... ); // renders single task5 question block
const ChecklistHead = () => ( ... );
const renderOralRows = (taskKey, items) => ( ... );
const renderPerfRows = (taskKey, items, start, end) => ( ... );
const renderChkRows = (taskKey, items, start, end) => ( ... );
```

---

### ✅ Question 5 (Q5Booklet)

**Status:** Complete  
**Booklet class:** `q5-booklet-view`  
**Component:** `/frontend/src/components/Q5Booklet.tsx`  
**Data file:** `/frontend/src/data/questions5.ts`  
**Total pages:** 14

**Changes made:**
- Added optional `compRecord` / `setCompRecord` props with `useState` fallback
- Restructured from dynamic `.map()` loop into **14 explicit A4 `.page` divs**
- Added `Page X of 14` footer to every page
- GradingPortal: added `isQuestion5` detection + early-return block
- AssessmentForm: fixed `studentName` to use `answers['st-name']`

**Page layout (14 pages):**
| Pages | Content |
|-------|---------|
| 1 | Cover page |
| 2 | Assessment Competency Record |
| 3 | Admin: unit code, pre-req, co-req, summary, target group, conditions, resources, re-assessment, plagiarism |
| 4 | Admin: complaints, assessors intervention, attaching docs, assessment instruction, task 1 & 2 descriptions |
| 5 | Admin: task 3 description, competency decision, reasonable adjustment, cover sheet |
| 6 | Task 1 – Student instructions + Q1–3 |
| 7 | Task 1 – Q4–10 |
| 8 | Task 1 – Q11–17 |
| 9 | Task 1 – Q18 + declarations |
| 10 | Task 2 – Observation sections (all 4) |
| 11 | Task 2 – Assessor checklist: observation items + checklist[0–11] |
| 12 | Task 2 – Checklist[12–21] + declarations |
| 13 | Task 3 – Text section + test results table + tool condition table + report textarea |
| 14 | Task 3 – Declarations + END OF ASSESSMENT |

**Helper pattern used (same as Q4):**
```jsx
const InnerHeader = () => ( ... );
const PageFooter = ({ n }) => (
  <div className="page-footer"><span></span><span>Page {n} of 14</span></div>
);
const renderDeclarations = (taskKey: string) => ( ... );
const renderQ1 = (q: any) => ( ... ); // renders single task1 question block
const ChecklistHead = () => ( ... );
const renderObsRows = (items) => ( ... );
const renderChkRows = (items, start, end) => ( ... );
```

---

## Remaining Work — Questions 6 to 15

### ⬜ Questions NOT Yet Done

| Question | Component File | Data File | Status |
|----------|---------------|-----------|--------|
| Q6 | `/frontend/src/components/Q6Booklet.tsx` | `/frontend/src/data/questions6.ts` | ❌ Pending |
| Q7 | `/frontend/src/components/Q7Booklet.tsx` | `/frontend/src/data/questions7.ts` | ❌ Pending |
| Q8 | `/frontend/src/components/Q8Booklet.tsx` | `/frontend/src/data/questions8.ts` | ❌ Pending |
| Q9 | `/frontend/src/components/Q9Booklet.tsx` | `/frontend/src/data/questions9.ts` | ❌ Pending |
| Q10 | `/frontend/src/components/Q10Booklet.tsx` | `/frontend/src/data/questions10.ts` | ❌ Pending |
| Q11 | `/frontend/src/components/Q11Booklet.tsx` | `/frontend/src/data/questions11.ts` | ❌ Pending |
| Q12 | `/frontend/src/components/Q12Booklet.tsx` | `/frontend/src/data/questions12.ts` | ❌ Pending |
| Q13 | `/frontend/src/components/Q13Booklet.tsx` | `/frontend/src/data/questions13.ts` | ❌ Pending |
| Q14 | `/frontend/src/components/Q14Booklet.tsx` | `/frontend/src/data/questions14.ts` | ❌ Pending |
| Q15 | Already done (was the original reference implementation) | — | ✅ Done |

---

## Implementation Rule for Q6–Q14

> **"I am using Option C to fix the Q(no)Booklet component. The total page count is (no). Please wrap the existing content in Q(no)Booklet into separate .page divs, with each page sized exactly to A4 dimensions (210mm × 297mm), and add a footer at the bottom of every page showing 'Page X of (no)'. Do not rewrite or change any existing content — only wrap it within the correct page boundaries. Do not affect any existing UI or functionality. The exact content for each page is available in the provided text file. Apply this for both student and assessor views."**

Each question requires:
1. A blueprint `.txt` file in `/home/ganapathi/Pictures/clone/question-pdf/question(N).txt` — user provides this
2. Reading the current `Q(N)Booklet.tsx` and its data file `questions(N).ts` to understand existing structure
3. Adding optional `compRecord` / `setCompRecord` props with `useState` fallback
4. Restructuring dynamic `.map()` task loops into explicit `.page` divs with footers
5. Adding GradingPortal early-return block for assessor view
6. Verifying `npx tsc --noEmit` passes with zero errors

---

## Step-by-Step Checklist for Each New Question (Q6–Q14)

For each question number N:

### Step 1 — Update QNBooklet.tsx props interface
```typescript
interface QNBookletProps {
  // ... existing props ...
  compRecord?: any;
  setCompRecord?: (val: any) => void;
}

export const QNBooklet: React.FC<QNBookletProps> = ({
  ...,
  compRecord: externalCompRecord,
  setCompRecord: externalSetCompRecord
}) => {
  const [internalCompRecord, setInternalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
  const compRecord = externalCompRecord ?? internalCompRecord;
  const setCompRecord = externalSetCompRecord ?? setInternalCompRecord;
  // ... rest of component
```

### Step 2 — Add InnerHeader and PageFooter helpers (outside component)
```jsx
const InnerHeader = () => (
  <div className="inner-header">
    <div className="top-row">
      <div>
        <span className="underline-bold">Assessment book</span><br />
        <span className="underline-bold">{assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}</span>
      </div>
      <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
    </div>
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div className="page-footer"><span></span><span>Page {n} of TOTAL</span></div>
);
```

### Step 3 — Replace dynamic task `.map()` with explicit `.page` divs
Each page follows this structure:
```jsx
<div className="page">
  <InnerHeader />
  {/* page content here */}
  <PageFooter n={X} />
</div>
```

### Step 4 — Add to GradingPortal.tsx
```typescript
// 1. Import at top
import { QNBooklet } from '../components/QNBooklet'

// 2. Detection constant (near line 69)
const isQuestionN = (submission?.assessment_id?.token || '').toLowerCase() === 'question-N';

// 3. Early-return block (insert before isQuestion15 block)
if (isQuestionN && submission) {
  return (
    <div className="bg-[#eff6ff] print:bg-white min-h-screen pb-20 font-sans">
      <div className="sticky top-0 z-50 bg-[#1e3a8a] text-white px-3 sm:px-4 py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between shadow-xl no-print gap-2 md:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-black text-sm sm:text-base leading-none uppercase tracking-tight m-0 p-0 border-none text-left truncate">Reviewing: {submission.student_name}</div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest truncate">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:flex md:w-auto">
          <button onClick={markAllCorrect} title="Mark all answers as correct" className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-amber-900/20 col-span-2 sm:col-span-1">
            <CheckCircle2 size={14} /><span className="whitespace-nowrap">Mark All Correct</span>
          </button>
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 col-span-1">
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            <span className="whitespace-nowrap">Save Changes</span>
          </button>
          <button onClick={() => { saveMutation.mutate(); setTimeout(() => handlePrint(), 500); }} disabled={saveMutation.isPending} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 col-span-1">
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Printer size={14} />}
            <span className="whitespace-nowrap">Download</span>
          </button>
        </div>
      </div>
      <QNBooklet
        answers={studentAnswers}
        setAnswers={setStudentAnswers}
        onSubmit={handleDownload}
        submitting={saveMutation.isPending}
        studentName={submission.student_name}
        submitDate={submission.submitted_at}
        isStudent={false}
        compRecord={compRecord}
        setCompRecord={setCompRecord}
      />
    </div>
  );
}
```

### Step 5 — Verify AssessmentForm.tsx passes correct studentName
For Q6–Q14, check AssessmentForm.tsx renders the booklet with:
```typescript
studentName={answers['st-name'] || searchParams.get('st-name') || ''}
submitDate={new Date().toISOString()}
isStudent={true}
```

### Step 6 — TypeScript check
```bash
cd /home/ganapathi/Pictures/clone/frontend && npx tsc --noEmit
```
Must return no output (zero errors).

### Step 7 — Verify page count
```bash
grep -c 'className="page"' /frontend/src/components/QNBooklet.tsx
grep -c '<PageFooter n=' /frontend/src/components/QNBooklet.tsx
```
Both counts must equal the total page number from the blueprint.

---

## Key Notes for Next Session

### What NOT to change
- Do not touch `downloadPdf.ts` — already handles all questions via booklet class detection
- Do not touch `handlePrint` in GradingPortal — already lists all q1–q15 booklet classes
- Do not change any question rendering logic (radio buttons, textareas, tables) — only wrap in `.page` divs
- Do not modify the CSS styles inside each booklet's `qNStyles` string — already correct

### Common Pitfalls
1. **Student name not showing on cover:** Always use `answers['st-name'] || searchParams.get('st-name') || ''` — never `answers['first_name']`
2. **Images too large in PDF:** If a question has images, set `width: '210px'` (or appropriate fixed size) instead of `max-w-[420px]`
3. **compRecord dummy variables:** Current booklets (Q6–Q14) likely have `const compRecord = {}` and `const setCompRecord = () => {}` as dummy — replace with `useState` fallback pattern
4. **Insert GradingPortal block in correct position:** Always insert BEFORE the `if (isQuestion15 && submission)` block
5. **Declaration blocks per task:** Each task's last page needs the declarations section (student sig, assessor feedback, result, assessor sig). Extract as `renderDeclarations(taskKey)` helper inside the component

### Blueprint Files Location
All page layout blueprint files are at:
```
/home/ganapathi/Pictures/clone/question-pdf/question(N).txt
```
e.g., `question6.txt`, `question7.txt`, etc.

### GradingPortal.tsx insertion point
Insert new `isQuestionN` detection constant near **line 69–70** (after `isQuestion4`/`isQuestion5`).  
Insert new early-return block **before** the `if (isQuestion15 && submission)` block (currently around line 3724 but will shift with each addition).

### AssessmentForm.tsx Q6–Q14 location
Each question's booklet render is in the long ternary chain around **line 934+**. Each follows this pattern:
```tsx
) : isQ6 ? (
  <Q6Booklet
    answers={answers}
    setAnswers={setAnswers}
    onSubmit={handleSubmit}
    submitting={submitting}
    studentName={answers['st-name'] || searchParams.get('st-name') || ''}
    submitDate={new Date().toISOString()}
    isStudent={true}
  />
```
These are likely already correct for Q6–Q14 (they were fine for Q6–Q15 originally). Only Q4 and Q5 needed the student name fix.

---

## Continuation Starting Point

**Next task: Question 6 (Q6Booklet)**

To start, the user will provide the page blueprint file at:
```
/home/ganapathi/Pictures/clone/question-pdf/question6.txt
```

Then run the implementation rule:
> "I am using Option C to fix the Q6Booklet component. The total page count is (N). Please wrap the existing content in Q6Booklet into separate .page divs, with each page sized exactly to A4 dimensions (210mm × 297mm), and add a footer at the bottom of every page showing 'Page X of (N)'. Do not rewrite or change any existing content — only wrap it within the correct page boundaries. Do not affect any existing UI or functionality. The exact content for each page is available in this text file: /home/ganapathi/Pictures/clone/question-pdf/question6.txt. Apply this for both student and assessor views."

Follow the 7-step checklist above for each question.

---

## Quick Reference — GradingPortal.tsx Detection Constants

```typescript
// Already added (lines ~66-70):
const isQuestion15 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-15';
const isQuestion1  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-1';
const isQuestion3  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-3';
const isQuestion4  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-4';
const isQuestion5  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-5';

// To add for Q6–Q14:
const isQuestion6  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-6';
const isQuestion7  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-7';
const isQuestion8  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-8';
const isQuestion9  = (submission?.assessment_id?.token || '').toLowerCase() === 'question-9';
const isQuestion10 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-10';
const isQuestion11 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-11';
const isQuestion12 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-12';
const isQuestion13 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-13';
const isQuestion14 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-14';
```

## Quick Reference — GradingPortal.tsx Imports Already Present

```typescript
import { Q1Booklet } from '../components/Q1Booklet'
import { Q3Booklet } from '../components/Q3Booklet'
import { Q4Booklet } from '../components/Q4Booklet'
import { Q5Booklet } from '../components/Q5Booklet'
import { downloadBookletAsPdf } from '../lib/downloadPdf'
```

Add for each new question:
```typescript
import { Q6Booklet } from '../components/Q6Booklet'
// ... etc
```
