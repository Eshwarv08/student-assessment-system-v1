import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions13';

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
  <div className="page-footer"><span></span><span>Page {n} of 14</span></div>
);

interface Q13BookletProps {
  answers: any;
  setAnswers: (val: any) => void;
  onSubmit: (e?: React.FormEvent) => void | Promise<void>;
  submitting: boolean;
  studentName?: string;
  submitDate?: string;
  isStudent?: boolean;
  compRecord?: any;
  setCompRecord?: (val: any) => void;
}

export const Q13Booklet: React.FC<Q13BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
  const [internalCompRecord, setInternalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
  const compRecord = externalCompRecord ?? internalCompRecord;
  const setCompRecord = externalSetCompRecord ?? setInternalCompRecord;

  const [sigModal, setSigModal] = useState<{ field: string, type: string, open: boolean } | null>(null);
  const sigModalCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigModalContainerRef = useRef<HTMLDivElement>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);

  const openSigModal = (field: string, type: string) => {
    if (isStudent && field === 'assessor_signature') return;
    setSigModal({ field, type, open: true });
  };

  const closeSigModal = () => {
    setSigModal(null);
    if (sigPadRef.current) sigPadRef.current.clear();
  };

  const clearSig = () => {
    if (sigPadRef.current) sigPadRef.current.clear();
  };

  const saveSignature = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.toDataURL();
      if (sigModal?.field === 'student_signature') {
        setAnswers({ ...answers, student_signature_url: dataUrl });
      } else {
        setCompRecord({ ...compRecord, [sigModal!.field]: dataUrl });
      }
      closeSigModal();
    }
  };

  useEffect(() => {
    if (sigModal?.open && sigModalCanvasRef.current) {
      const pad = new SignaturePad(sigModalCanvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
      sigPadRef.current = pad;
      const resizeCanvas = () => {
        if (sigModalCanvasRef.current && sigModalContainerRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          sigModalCanvasRef.current.width = sigModalContainerRef.current.offsetWidth * ratio;
          sigModalCanvasRef.current.height = sigModalContainerRef.current.offsetHeight * ratio;
          sigModalCanvasRef.current.getContext("2d")?.scale(ratio, ratio);
          pad.clear();
        }
      };
      setTimeout(resizeCanvas, 100);
      window.addEventListener("resize", resizeCanvas);
      return () => { window.removeEventListener("resize", resizeCanvas); pad.off(); };
    }
  }, [sigModal?.open]);

  const formatDisplayDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

  const q13Styles = `
      .q13-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q13-booklet-view * {
        box-sizing: border-box;
      }
      .q13-booklet-view .page {
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
      .q13-booklet-view h1.section-title {
        font-size: 13.5pt;
        font-weight: bold;
        text-align: center;
        margin: 5mm 0 4mm;
        text-transform: uppercase;
        letter-spacing: .3px;
        background: transparent !important;
        color: #000 !important;
        padding: 0 !important;
      }
      .q13-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q13-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q13-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q13-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q13-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q13-booklet-view table td, .q13-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q13-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q13-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q13-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q13-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q13-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q13-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q13-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q13-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a;
      }
      .q13-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q13-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q13-booklet-view .page-footer {
        margin-top: auto;
        padding-top: 4mm;
        border-top: 1px solid #000;
        display: flex;
        justify-content: space-between;
        font-size: 8pt;
      }
      .q13-booklet-view .inner-header {
        margin-bottom: 4mm;
        border-bottom: 2px solid #000;
        padding-bottom: 2mm;
      }
      .q13-booklet-view .inner-header .top-row {
        display: flex; justify-content: space-between; align-items: flex-start;
      }
      .q13-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q13-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q13-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q13-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q13-booklet-view .question-block { margin-bottom: 8mm; }
      .q13-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q13-booklet-view { background: #fff !important; padding: 0 !important; }
        .q13-booklet-view .page {
          margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important;
        }
      }
  `;

  const admin = assessmentQuestions.adminInfo;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const task4 = assessmentQuestions.task4 as any;

  // Split Task 4 questions
  const task4qs = task4.questions || [];
  const q1_4 = task4qs.slice(0, 4);
  const q5_8 = task4qs.slice(4, 8);
  const q9_10 = task4qs.slice(8, 10);

  const renderDeclarations = (taskKey: string) => (
    <div className="mt-8" style={{ pageBreakInside: 'avoid' }}>
      <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '12px' }}>Comments/Feedback to Participant</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', position: 'relative', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '24px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? (
                      <img src={answers.student_signature_url} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                    )}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '20px', paddingLeft: '4px', fontWeight: 'bold' }}>
                    {formatDisplayDate(submitDate || '')}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '80px', marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea
          className="no-print"
          style={{ width: '100%', minHeight: '60px', border: 'none', resize: 'vertical', fontFamily: "'Times New Roman', serif", fontSize: '10.5pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..."
          value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }}
          readOnly={isStudent}
        />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '60px', fontSize: '10.5pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '12.5pt' }}>
        Result:{' '}
        <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '4px' }}>
          Satisfactory (S)
          {compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>}
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          Not Satisfactory (NS)
          {compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>}
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', position: 'relative', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '24px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                    )}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', paddingLeft: '4px' }}>
                    {compRecord.assessment_date ? formatDisplayDate(compRecord.assessment_date) : ''}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const ChecklistHead = () => (
    <thead>
      <tr>
        <th rowSpan={2} className="border-[1.5px] border-black bg-[#999] text-left px-3 py-2 text-black font-bold">Did the Candidate:</th>
        <th colSpan={2} className="border-[1.5px] border-black bg-[#999] text-center px-3 py-2 text-black font-bold">Satisfactory</th>
      </tr>
      <tr>
        <th className="border-[1.5px] border-black bg-[#aaa] text-center px-3 py-1.5 text-black font-bold w-[12%]">Yes</th>
        <th className="border-[1.5px] border-black bg-[#aaa] text-center px-3 py-1.5 text-black font-bold w-[12%]">No</th>
      </tr>
    </thead>
  );

  const renderOralRows = (taskKey: string, oralItems: string[]) => (
    <>
      <tr>
        <td className="border-[1.5px] border-black bg-[#e0e0e0] italic px-3 py-1.5 text-[8.5pt]" colSpan={3}>
          *See assessment task details for specific oral questions
        </td>
      </tr>
      {oralItems.map((item: string, idx: number) => (
        <tr key={`oral-${idx}`}>
          <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
          <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}`]: 'yes' })}>
            {compRecord[`${taskKey}_oral_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
          <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}`]: 'no' })}>
            {compRecord[`${taskKey}_oral_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
        </tr>
      ))}
    </>
  );

  const renderPerfRows = (taskKey: string, items: string[], startIdx: number, endIdx: number) => (
    <>
      {startIdx === 0 && (
        <tr>
          <td colSpan={3} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
            Evidence of Performance: Did The Candidate Satisfactorily:
          </td>
        </tr>
      )}
      {items.slice(startIdx, endIdx).map((item: string, i: number) => {
        const idx = startIdx + i;
        return (
          <tr key={`perf-${idx}`}>
            <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
            <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'yes' })}>
              {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
            </td>
            <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'no' })}>
              {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
            </td>
          </tr>
        );
      })}
    </>
  );

  const renderChkRows = (taskKey: string, items: string[], startIdx: number, endIdx: number) => (
    <>
      {startIdx === 0 && (
        <tr>
          <td colSpan={3} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
            Evidence of Performance: Did The Candidate Satisfactorily:
          </td>
        </tr>
      )}
      {items.slice(startIdx, endIdx).map((item: string, i: number) => {
        const idx = startIdx + i;
        return (
          <tr key={`chk-${idx}`}>
            <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
            <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'yes' })}>
              {compRecord[`${taskKey}_chk_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
            </td>
            <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'no' })}>
              {compRecord[`${taskKey}_chk_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
            </td>
          </tr>
        );
      })}
    </>
  );

  const renderQ = (q: any, taskKey: string) => {
    const qKey = `t${taskKey.replace('task','')}q${q.id}`;
    return (
      <div key={q.id} className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
        <div className="p-3 sm:p-4">
          <div className="flex gap-2 font-bold mb-3 text-[10pt]">
            <span>{q.id}.</span>
            <span className="whitespace-pre-wrap">{q.text}</span>
          </div>
          <div className="pl-0 sm:pl-6 mt-2">
            {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
              <div key={oIdx} className="flex gap-2 mb-2 items-center">
                <input type="radio" checked={answers[opt.name || qKey] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })} className="mt-0.5" />
                <label>{opt.text}</label>
              </div>
            ))}
            {q.type === 'options' && q.options?.map((opt: any, oIdx: number) => (
              <div key={oIdx} className="flex gap-2 mb-2 items-center">
                <input type="radio" checked={answers[qKey] === opt.value} onChange={() => setAnswers({ ...answers, [qKey]: opt.value })} className="mt-0.5" />
                <label>{opt.text}</label>
              </div>
            ))}
            {q.type === 'text' && (
              <textarea
                className="w-full border border-gray-300 p-2 min-h-[80px] resize-y"
                value={answers[qKey] || ''}
                onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })}
                placeholder="(No response)"
              />
            )}
            {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tIdx: number) => (
              <div key={tIdx} className="mb-4 border border-gray-200 p-2">
                {ti.image && <img src={ti.image} className="max-w-[200px] mb-2" alt="Diagram" />}
                <input type="text" className="border-b border-black w-full outline-none p-1 bg-transparent" placeholder={ti.placeholder} value={answers[ti.name] || ''} onChange={(e) => setAnswers({...answers, [ti.name]: e.target.value})} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
          <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">Assessor to tick (☑)</div>
          <div className={`w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
            onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' }) }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
              {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
            </span>
            Satisfactory (S)
          </div>
          <div className={`w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
            onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' }) }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
              {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
            </span>
            Not Satisfactory (NS)
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="q13-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q13Styles }} />

      {/* Signature Modal */}
      {sigModal?.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] text-white p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">
                {sigModal?.field === 'student_signature' ? 'Student Signature' : 'Assessor Signature'}
              </h3>
              <button onClick={closeSigModal} className="text-slate-400 hover:text-white transition-colors"><XCircle size={24} /></button>
            </div>
            <div className="p-4 sm:p-8">
              <div ref={sigModalContainerRef} className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden mb-6 flex justify-center h-[250px]">
                <canvas ref={sigModalCanvasRef} className="w-full h-full cursor-crosshair" style={{ touchAction: 'none' }} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={clearSig} className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm">
                  <RotateCcw size={18} /> CLEAR
                </button>
                <button onClick={saveSignature} className="flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm">
                  <CheckCircle2 size={18} /> SAVE SIGNATURE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 1: Cover */}
      <div className="page" style={{ padding: '8mm 10mm' }}>
        <div style={{ border: '3.5px solid #1a5fa8', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }} />
            <div style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
            <div style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>{assessmentQuestions.metadata.code}</div>
            <div style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>{assessmentQuestions.metadata.course}</div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '110mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>ACTA College Pty. Ltd</div>
            </div>
          </div>
        </div>
        <PageFooter n={1} />
      </div>

      {/* PAGE 2: Assessor's Marking Guide Instructions (Prior to Conducting / Conducting the Assessment / Reasonable Adjustment / Making the Decision) */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title text-center text-blue-900 font-bold my-4">MARKING GUIDE</h1>
        
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[0].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[0].content}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[1].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[1].content}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Reasonable Adjustment</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.reasonableAdjustment}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[2].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[2].content.split('\n\n')[0] || admin.markingGuide[2].content}</p>
        </div>
        <PageFooter n={2} />
      </div>

      {/* PAGE 3: Making the Decision (continued) / After the Assessment / Assessors Intervention / Assessors Value Judgement / Competency Decision / Assessment Tasks Overview */}
      <div className="page">
        <InnerHeader />
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[3].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[3].content}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[4].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[4].content}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[5].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[5].content}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">{admin.markingGuide[6].label}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.markingGuide[6].content}</p>
        </div>
        
        <h1 className="section-title text-center text-blue-900 font-bold mt-6 mb-4">{admin.tasksOverview.title}</h1>
        <p className="whitespace-pre-wrap text-sm mb-2">{admin.tasksOverview.intro}</p>
        <ul className="list-disc pl-5 mb-4 text-sm">
          {admin.tasksOverview.elements.map((el: string, idx: number) => <li key={idx}>{el}</li>)}
        </ul>
        <PageFooter n={3} />
      </div>

      {/* PAGE 4: Assessment Tasks Overview (continued) / Recording an Assessment / Assessment of Competency */}
      <div className="page">
        <InnerHeader />
        <p className="whitespace-pre-wrap text-sm mb-2 mt-4">{admin.tasksOverview.evidenceIntro}</p>
        <ul className="list-disc pl-5 mb-4 text-sm">
          {admin.tasksOverview.evidenceItems.map((el: string, idx: number) => <li key={idx}>{el}</li>)}
        </ul>
        <p className="whitespace-pre-wrap text-sm mb-4">{admin.tasksOverview.summary}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            {admin.tasksOverview.tasks.map((task: any, idx: number) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #555', padding: '4px', fontWeight: 'bold', width: '25%' }}>{task.id}<br />({task.type})</td>
                <td style={{ border: '1px solid #555', padding: '4px', whiteSpace: 'pre-wrap' }}>{task.text}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-4 mt-6">
          <h3 className="font-bold text-sm mb-1">{admin.recordingAssessment.title}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.recordingAssessment.content}</p>
        </div>
        <div className="mb-4 mt-6">
          <h3 className="font-bold text-sm mb-1">{admin.competencyAssessment.title}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.competencyAssessment.content}</p>
          <ul className="list-disc pl-5 mb-4 text-sm mt-2">
            {admin.competencyAssessment.criteria.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
          </ul>
        </div>
        <PageFooter n={4} />
      </div>

      {/* PAGE 5: Assessment of Competency (continued) / Assessor Feedback / Cover Sheet for Submission of Work */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', marginTop: '16px' }}>
          <tbody>
            {admin.competencyAssessment.codes.map((c: any, idx: number) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #555', padding: '4px', fontWeight: 'bold', width: '20%' }}>{c.code}</td>
                <td style={{ border: '1px solid #555', padding: '4px' }}>{c.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="whitespace-pre-wrap text-sm mb-6">{admin.competencyAssessment.footer}</p>

        <div className="mb-6">
          <h3 className="font-bold text-sm mb-1">{admin.assessorFeedback.title}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.assessorFeedback.content}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-sm mb-1">{admin.coverSheet.title}</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.coverSheet.content}</p>
        </div>

        {/* Since "Assessment Competency Record" doesn't have a specific page mentioned in blueprint, and page 5 implies it wraps up the admin section, let's include the table here. */}
        <div className="mt-8">
          <h1 className="section-title text-center font-bold mb-4">ASSESSMENT COMPETENCY RECORD</h1>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
            <tbody>
              <tr>
                <th style={{ border: '1px solid #555', padding: '4px', textAlign: 'left', background: '#f0f0f0' }}>Please attach the following documentation to this form</th>
                <th style={{ border: '1px solid #555', padding: '4px', width: '15%', background: '#f0f0f0' }}>Result</th>
                <th style={{ border: '1px solid #555', padding: '4px', width: '25%', background: '#f0f0f0' }}>FINAL RESULT:</th>
              </tr>
              <tr><td className="font-bold">Assessment Task 1</td><td className="text-center">S / NS</td>
                <td rowSpan={4} style={{ verticalAlign: 'middle' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label><input type="checkbox" disabled /> Competent (C)</label>
                     <label><input type="checkbox" disabled /> Not Competent (NC)</label>
                   </div>
                </td>
              </tr>
              <tr><td className="font-bold">Assessment Task 2</td><td className="text-center">S / NS</td></tr>
              <tr><td className="font-bold">Assessment Task 3</td><td className="text-center">S / NS</td></tr>
              <tr><td className="font-bold">Assessment Task 4</td><td className="text-center">S / NS</td></tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={5} />
      </div>

      {/* PAGE 6: Assessment Task 1 — Observation / Student Instructions / Required Documents */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task1.observationTitle}</h1>
        {task1.observationSubtitle && <h2 className="sub-title mb-4">{task1.observationSubtitle}</h2>}
        {task1.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
            {section.type === 'image' && (
              <div className="flex justify-center my-4">
                <img src={section.src} alt={section.title} className="max-w-full border border-gray-300" style={{ maxHeight: '300px' }} />
              </div>
            )}
          </div>
        ))}
        <PageFooter n={6} />
      </div>

      {/* PAGE 7: Assessment Task 1 — Instructions for Assessor / Assessor Checklist / Oral Assessment Questions */}
      <div className="page">
        <InnerHeader />
        <h2 className="sub-title" style={{ marginBottom: '4px' }}>{task1.checklistTitle}</h2>
        <p className="whitespace-pre-wrap text-[9pt] mb-2">{task1.checklistIntro}</p>
        <p className="whitespace-pre-wrap text-[9pt] italic mb-4">{task1.assessorInstructions}</p>
        
        <div className="font-bold text-sm mb-2">{task1.checklistLabel}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt]">
          <ChecklistHead />
          <tbody>
            {renderOralRows('task1', task1.checklistItems)}
          </tbody>
        </table>
        <PageFooter n={7} />
      </div>

      {/* PAGE 8: Assessment Task 1 — Record of Performance / Assessment Task 2 — Observation / Student Steps / Required Documents */}
      <div className="page">
        <InnerHeader />
        <h2 className="sub-title" style={{ marginBottom: '6px' }}>{task1.checklistTitle} (continued)</h2>
        <div className="font-bold text-sm mb-2 mt-4">{task1.performanceHeader}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-8">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task1', task1.performance, 0, task1.performance.length)}
          </tbody>
        </table>

        {renderDeclarations('task1')}

        <h1 className="section-title mt-4">{task2.observationTitle}</h1>
        {task2.observationSubtitle && <h2 className="sub-title mb-4">{task2.observationSubtitle}</h2>}
        {task2.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
          </div>
        ))}
        <PageFooter n={8} />
      </div>

      {/* PAGE 9: Assessment Task 2 — Instructions for Assessor / Assessor Checklist / Oral Assessment / Record of Performance (start) */}
      <div className="page">
        <InnerHeader />
        <h2 className="sub-title mt-6" style={{ marginBottom: '4px' }}>{task2.checklistTitle}</h2>
        <p className="whitespace-pre-wrap text-[9pt] mb-2">{task2.checklistIntro}</p>
        <p className="whitespace-pre-wrap text-[9pt] italic mb-4">{task2.assessorInstructions}</p>
        
        <div className="font-bold text-sm mb-2">{task2.checklistLabel}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-4">
          <ChecklistHead />
          <tbody>
            {renderOralRows('task2', task2.checklistItems)}
          </tbody>
        </table>
        
        <div className="font-bold text-sm mb-2">{task2.performanceHeader}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task2', task2.performance, 0, 3)}
          </tbody>
        </table>
        <PageFooter n={9} />
      </div>

      {/* PAGE 10: Assessment Task 2 — Record of Performance (continued) / Assessment Task 3 — Observation / Required Documents / Instructions for Assessor / Assessor Checklist */}
      <div className="page">
        <InnerHeader />
        <h2 className="sub-title" style={{ marginBottom: '6px' }}>{task2.checklistTitle} (continued)</h2>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task2', task2.performance, 3, task2.performance.length)}
          </tbody>
        </table>

        {renderDeclarations('task2')}

        <h1 className="section-title mt-4">{task3.observationTitle}</h1>
        {task3.observationSubtitle && <h2 className="sub-title mb-4">{task3.observationSubtitle}</h2>}
        {task3.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
          </div>
        ))}
        
        <h2 className="sub-title mt-6" style={{ marginBottom: '4px' }}>{task3.checklistTitle}</h2>
        <p className="whitespace-pre-wrap text-[9pt] mb-2">{task3.checklistIntro}</p>
        <p className="whitespace-pre-wrap text-[9pt] italic mb-4">{task3.assessorInstructions}</p>
        <PageFooter n={10} />
      </div>

      {/* PAGE 11: Assessment Task 3 — Oral Assessment / Record of Performance / Assessment Task 4 — Written Questions and Answers / Student Instructions */}
      <div className="page">
        <InnerHeader />
        <div className="font-bold text-sm mb-2">{task3.checklistLabel}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-4">
          <ChecklistHead />
          <tbody>
            {renderOralRows('task3', task3.checklistItems)}
          </tbody>
        </table>

        <h2 className="sub-title" style={{ marginBottom: '6px' }}>{task3.checklistTitle} (continued)</h2>
        <div className="font-bold text-sm mb-2">{task3.performanceHeader}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task3', task3.performance, 0, task3.performance.length)}
          </tbody>
        </table>

        {renderDeclarations('task3')}

        <h1 className="section-title mt-8">{task4.title}</h1>
        {task4.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
          </div>
        ))}
        <PageFooter n={11} />
      </div>

      {/* PAGE 12: Task 4 Questions 1-4 */}
      <div className="page">
        <InnerHeader />
        {q1_4.map((q: any) => renderQ(q, 'task4'))}
        <PageFooter n={12} />
      </div>

      {/* PAGE 13: Task 4 Questions 5-8 */}
      <div className="page">
        <InnerHeader />
        {q5_8.map((q: any) => renderQ(q, 'task4'))}
        <PageFooter n={13} />
      </div>

      {/* PAGE 14: Task 4 Questions 9-10 / End of Assessment */}
      <div className="page">
        <InnerHeader />
        {q9_10.map((q: any) => renderQ(q, 'task4'))}
        {renderDeclarations('task4')}
        <PageFooter n={14} />
      </div>

    </div>
  );
};
