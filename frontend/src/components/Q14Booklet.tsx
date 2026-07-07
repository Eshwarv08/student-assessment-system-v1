import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions14';

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
  <div className="page-footer"><span></span><span>Page {n} of 16</span></div>
);

interface Q14BookletProps {
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

export const Q14Booklet: React.FC<Q14BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
  const [internalCompRecord, setInternalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
  const compRecord = externalCompRecord ?? internalCompRecord;
  const _setCompRecord = externalSetCompRecord ?? setInternalCompRecord;
  const setCompRecord = (val: any) => { if (!isStudent) _setCompRecord(val); };

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
      } else if (sigModal?.field === 'assessor_signature' || sigModal?.field === 'admin_signature') {
        setCompRecord({ ...compRecord, assessor_signature: dataUrl, admin_signature: dataUrl });
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

  const formatDisplayDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const q14Styles = `
      .q14-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q14-booklet-view * { box-sizing: border-box; }
      .q14-booklet-view .page {
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
      .q14-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q14-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q14-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q14-booklet-view h3.task-label { font-size: 10.5pt; font-weight: bold; text-align: center; margin: 1mm 0 3mm; }
      .q14-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q14-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q14-booklet-view table td, .q14-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q14-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q14-booklet-view .field-label-cell { font-weight: bold; background: #f0f0f0; width: 38%; border: 1px solid #555; padding: 5px 6px; }
      .q14-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q14-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q14-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q14-booklet-view .evidence-row { display: flex; align-items: center; gap: 18px; padding: 3px 0; font-size: 9pt; }
      .q14-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q14-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q14-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q14-booklet-view .page-footer {
        margin-top: auto; padding-top: 4mm; border-top: 1px solid #000;
        display: flex; justify-content: space-between; font-size: 8pt;
      }
      .q14-booklet-view .inner-header {
        margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm;
      }
      .q14-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q14-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q14-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q14-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q14-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      @media print {
        .q14-booklet-view { background: #fff !important; padding: 0 !important; }
        .q14-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }
  `;

  const admin = assessmentQuestions.adminInfo;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const task4 = assessmentQuestions.task4 as any;

  // Split Task 1 questions based on the blueprint
  const t1qs = task1.questions || [];
  const q1_2 = t1qs.slice(0, 2);
  const q3 = t1qs[2];
  const q5 = t1qs[4];
  const q6 = t1qs[5];
  const q7_11 = t1qs.slice(6, 11);
  const q12 = t1qs[11];

  const renderStudentDecl = (taskKey: string) => (
    <div className="mt-4" style={{ pageBreakInside: 'avoid' }}>
      <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '10px' }}>Comments/Feedback to Participant</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '24px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_decl_date || (submitDate ? new Date(submitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])} 
                      onChange={(e) => setAnswers({ ...answers, student_decl_date: e.target.value })} 
                      max={new Date().toISOString().split('T')[0]} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(answers.student_decl_date || submitDate || new Date().toISOString().split('T')[0])}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderAssessorDecl = (taskKey: string) => (
    <div className="mt-4" style={{ pageBreakInside: 'avoid' }}>
      <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '100px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', fontFamily: "'Times New Roman', serif", fontSize: '10.5pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..." value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }} readOnly={isStudent} />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px', fontSize: '10.5pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '12.5pt' }}>
        Result: Satisfactory{' '}
        <span className={`relative inline-block ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '4px' }}>
          (S){compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '35px', height: '35px', pointerEvents: 'none' }}></span>}
        </span>
        <span style={{ margin: '0 4px' }}>/</span>
        Not Satisfactory{' '}
        <span className={`relative inline-block ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          (NS){compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '45px', height: '35px', pointerEvents: 'none' }}></span>}
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '24px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                    <input type="date" disabled={isStudent} style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })}   max={new Date().toISOString().split('T')[0]} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', paddingLeft: '4px' }}>{compRecord.assessment_date ? formatDisplayDate(compRecord.assessment_date) : ''}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderDeclarations = (taskKey: string) => (
    <>{renderStudentDecl(taskKey)}{renderAssessorDecl(taskKey)}</>
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

  const renderQ = (q: any, taskKey: string) => {
    const qKey = `t${taskKey.replace('task','')}_q${q.id}`;
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
                <input required={isStudent} type="radio" checked={answers[opt.name || qKey] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })} className="mt-0.5" />
                <label>{opt.text}</label>
              </div>
            ))}
            {q.type === 'options' && q.options?.map((opt: any, oIdx: number) => {
              if (opt.type === 'checkbox') {
                 const ansArray = answers[qKey] || [];
                 const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                 return (
                   <div key={oIdx} className="flex gap-2 mb-2 items-center">
                     <input type="checkbox" checked={checked} onChange={(e) => {
                        let newArr = [...(Array.isArray(answers[qKey]) ? answers[qKey] : [])];
                        if (e.target.checked) newArr.push(opt.value);
                        else newArr = newArr.filter(v => v !== opt.value);
                        setAnswers({...answers, [qKey]: newArr});
                     }} className="mt-0.5" />
                     <label>{opt.text}</label>
                   </div>
                 );
              } else {
                 return (
                   <div key={oIdx} className="flex gap-2 mb-2 items-center">
                     <input required={isStudent} type="radio" checked={answers[qKey] === opt.value} onChange={() => setAnswers({ ...answers, [qKey]: opt.value })} className="mt-0.5" />
                     <label>{opt.text}</label>
                   </div>
                 );
              }
            })}
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
                <input required={isStudent} type="text" className="border-b border-black w-full outline-none p-1 bg-transparent" placeholder={ti.placeholder} value={answers[ti.name] || ''} onChange={(e) => setAnswers({...answers, [ti.name]: e.target.value})} />
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
    <div className="q14-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q14Styles }} />

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
        <div style={{ border: '3.5px solid #82b1d6', padding: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="cover-inner-border" style={{ border: '1.2px solid #82b1d6', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '220px', height: 'auto', objectFit: 'contain', marginBottom: '2mm', marginTop: '10mm' }} />
            <div style={{ fontSize: '13pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#8b0000', marginBottom: '8mm' }}>RTO NO: 40954</div>
            
            <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '3mm', letterSpacing: '1px' }}>Assessment Booklet</div>
            
            <div style={{ background: '#82b1d6', height: '14px', width: '100%', margin: '4mm 0', marginBottom: '8mm' }}></div>
            
            <div className="cover-subtitle" style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '4mm', letterSpacing: '0.6px', textAlign: 'center' }}>{assessmentQuestions.metadata.code}</div>
            
            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm', textAlign: 'center', padding: '0 10mm' }}>{assessmentQuestions.metadata.course}</div>
            
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '13.5pt', fontFamily: '"Times New Roman", Times, serif', color: '#333', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', width: '85%', margin: '0 auto' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1px solid #555', flex: 1, marginLeft: '8px', fontWeight: 'bold', paddingLeft: '8px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left', minHeight: '24px', color: '#000' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '22mm' }}>ACTA College Pty. Ltd</div>
            </div>
          </div>
        </div>
        <PageFooter n={1} />
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
          <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
            <div style={{ textDecoration: 'underline' }}>Assessment book</div>
            <div style={{ textDecoration: 'underline' }}>{assessmentQuestions.metadata.code} - {assessmentQuestions.metadata.course}</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '4mm', textTransform: 'uppercase' }}>ASSESSMENT COMPETENCY RECORD</h1>
        
        <div style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontSize: '10pt', marginBottom: '6mm', textAlign: 'justify', lineHeight: '1.4' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '6mm', fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Student's Name</td>
              <td style={{ width: '70%', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessor's Name</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="text" className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px 8px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} />
                <div className="hidden print:block" style={{ padding: '6px 8px', minHeight: '30px' }}>{compRecord.assessor_name}</div>
              </td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Site</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="text" className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px 8px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.assessment_site || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_site: e.target.value })} disabled={isStudent} />
                <div className="hidden print:block" style={{ padding: '6px 8px', minHeight: '30px' }}>{compRecord.assessment_site}</div>
              </td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Date/s</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="date" disabled={isStudent} className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px 8px', fontFamily: '"Times New Roman", Times, serif', cursor: isStudent ? 'default' : 'pointer' }} value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })}   max={new Date().toISOString().split('T')[0]} />
                <div className="hidden print:block" style={{ padding: '6px 8px', minHeight: '30px' }}>{formatDisplayDate(compRecord.assessment_date || new Date().toISOString().split('T')[0])}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '6mm', fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td colSpan={5} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px', lineHeight: '1.4' }}>
                In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
              </td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold', width: '30%' }}>Evidence is Confirmed as:</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '17.5%', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_valid: !compRecord.evidence_valid })}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.evidence_valid && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}
                  </div>
                  Valid
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '17.5%', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_sufficient: !compRecord.evidence_sufficient })}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.evidence_sufficient && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}
                  </div>
                  Sufficient
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '17.5%', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_current: !compRecord.evidence_current })}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.evidence_current && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}
                  </div>
                  Current
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '17.5%', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_authentic: !compRecord.evidence_authentic })}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.evidence_authentic && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}
                  </div>
                  Authentic
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Please attach the following documentation to this form</td>
              <td colSpan={2} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold', textAlign: 'center' }}>Result</td>
              <td rowSpan={5} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '4px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>FINAL ASSESSMENT<br />RESULT:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', marginLeft: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, final_result: 'C' }); } }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {compRecord.final_result === 'C' && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>Competent (C)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, final_result: 'NC' }); } }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {compRecord.final_result === 'NC' && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>Not Competent (NC)</span>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 1</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px', width: '30%' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t1: !compRecord.tasks?.t1 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t1 && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  Questions and Answers
                </div>
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                  S{compRecord.task1_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
                <span style={{ margin: '0 8px' }}>/</span>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                  NS{compRecord.task1_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Assessment Task 2</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t2: !compRecord.tasks?.t2 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t2 && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  Observation
                </div>
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                  S{compRecord.task2_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
                <span style={{ margin: '0 8px' }}>/</span>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                  NS{compRecord.task2_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Assessment Task 3</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t3: !compRecord.tasks?.t3 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t3 && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  Observation
                </div>
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                  S{compRecord.task3_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
                <span style={{ margin: '0 8px' }}>/</span>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                  NS{compRecord.task3_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Assessment Task 4</td>
              <td style={{ border: '1px solid #000', padding: '4px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t4: !compRecord.tasks?.t4 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t4 && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  Report
                </div>
              </td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                  S{compRecord.task4_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
                <span style={{ margin: '0 8px' }}>/</span>
                <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                  NS{compRecord.task4_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '6mm', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px', width: '12%', fontWeight: 'bold', textAlign: 'center' }}>Attempt</th>
              <th style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px', width: '20%', fontWeight: 'bold', textAlign: 'center' }}>Date</th>
              <th style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px', width: '68%', fontWeight: 'bold', textAlign: 'center' }}>Assessor's Feedback (as Required):</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(attempt => (
              <tr key={attempt}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{attempt}</td>
                <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                  <input type="date" disabled={isStudent} className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px', fontFamily: '"Times New Roman", Times, serif', cursor: isStudent ? 'default' : 'pointer' }} value={compRecord[`attempt_${attempt}_date`] || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_date`]: e.target.value })}   max={new Date().toISOString().split('T')[0]} />
                  <div className="hidden print:block text-center p-1.5">{formatDisplayDate(compRecord[`attempt_${attempt}_date`] || new Date().toISOString().split('T')[0])}</div>
                </td>
                <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                  <textarea className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px', resize: 'vertical', minHeight: '30px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord[`attempt_${attempt}_feedback`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_feedback`]: e.target.value })} disabled={isStudent} />
                  <div className="hidden print:block p-1.5" style={{ whiteSpace: 'pre-wrap', minHeight: '30px' }}>{compRecord[`attempt_${attempt}_feedback`]}</div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px', resize: 'vertical', minHeight: '30px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.final_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, final_feedback: e.target.value })} disabled={isStudent} />
                <div className="hidden print:block p-1.5" style={{ whiteSpace: 'pre-wrap', minHeight: '30px' }}>{compRecord.final_feedback}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2mm', paddingLeft: '4mm' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <p style={{ margin: 0, lineHeight: '1.4' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
              </td>
              <td style={{ width: '40%', border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '20px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                      {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
                    </div>
                    <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', position: 'relative' }}>
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date:</span>
                    <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, display: 'inline-block', height: '20px', position: 'relative' }}>
                      <input type="date" disabled={isStudent} style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                        value={compRecord.assessor_sig_date_page2 || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_sig_date_page2: e.target.value })}   max={new Date().toISOString().split('T')[0]} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(compRecord.assessor_sig_date_page2 || new Date().toISOString().split('T')[0])}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ width: '60%', border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <p style={{ margin: 0, lineHeight: '1.4' }}><span style={{ fontWeight: 'bold' }}>Student:</span> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.</p>
              </td>
              <td style={{ width: '40%', border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '20px', cursor: 'pointer', position: 'relative' }}>
                      {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}
                    </div>
                    <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', position: 'relative' }}>
                      {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date:</span>
                    <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, display: 'inline-block', height: '20px', position: 'relative' }}>
                      <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                        value={answers.student_decl_date || (submitDate ? new Date(submitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])} 
                        onChange={(e) => setAnswers({ ...answers, student_decl_date: e.target.value })}   max={new Date().toISOString().split('T')[0]} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(answers.student_decl_date || submitDate || new Date().toISOString().split('T')[0])}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 2 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 2 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN (Unit Code → Re-assessment) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ background: '#b3b3b3', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Administrative Use Only:</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '12px 8px', width: '40%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #000', padding: '12px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.admin_entered && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <span>Signature/Initial</span>
                  <div className="no-print" onClick={() => openSigModal('admin_signature', 'comp')} style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '20px', cursor: 'pointer', position: 'relative', margin: '0 8px' }}>
                    {(compRecord.admin_signature || compRecord.assessor_signature) ? <img src={compRecord.admin_signature || compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : ''}
                  </div>
                  <div className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '120px', height: '20px', position: 'relative', margin: '0 8px' }}>
                    {(compRecord.admin_signature || compRecord.assessor_signature) && <img src={compRecord.admin_signature || compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', width: '100px', display: 'inline-block', height: '20px', position: 'relative', margin: '0 8px' }}>
                    <input type="date" disabled={isStudent} style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.admin_sig_date || compRecord.assessor_sig_date_page2 || compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, admin_sig_date: e.target.value })}  max={new Date().toISOString().split('T')[0]} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '100px', height: '20px', margin: '0 8px' }}>{formatDisplayDate(compRecord.admin_sig_date || compRecord.assessor_sig_date_page2 || compRecord.assessment_date || new Date().toISOString().split('T')[0])}</span>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.unitSummary}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Conditions and Context of the Assessments</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.conditionsAndContext}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Specific Resources Required</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.specificResources}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.reAssessment}</td></tr>
          </tbody>
        </table>
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 3 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 3 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN (Plagiarism → Assessment Task 1) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt', marginBottom: '20px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.plagiarism}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Complaints and Appeal</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.complaintsAndAppeals}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessors Intervention</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessorsIntervention}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Attaching Documents</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.attachingDocuments}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Instruction</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessmentInstruction}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 1:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.task1Description}</td></tr>
          </tbody>
        </table>
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 4 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 4 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN (Assessment Tasks 2,3,4 → Cover Sheet) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt', marginBottom: '20px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 2:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.task2Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 3:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.task3Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 4:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.task4Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th colSpan={3} style={{ background: '#b3b3b3', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textAlign: 'left' }}>Reasonable Adjustment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', lineHeight: '1.4' }}>
                To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.<br/><br/>ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '33%', textAlign: 'center' }}>Reasonable Adjustment Provided</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '33%', textAlign: 'center' }}>Reason for Reasonable Adjustment</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '33%', textAlign: 'center' }}>Outcome</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCompRecord({ ...compRecord, ra_educational: !compRecord.ra_educational })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.ra_educational && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}</div>
                    Educational and bilingual support
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCompRecord({ ...compRecord, ra_orally: !compRecord.ra_orally })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.ra_orally && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}</div>
                    Presenting questions orally
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCompRecord({ ...compRecord, ra_diagrammatic: !compRecord.ra_diagrammatic })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.ra_diagrammatic && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}</div>
                    <span style={{ lineHeight: '1.2' }}>Presenting work instructions in<br />diagrammatic or pictorial form<br />instead of words and sentences</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCompRecord({ ...compRecord, ra_extra_time: !compRecord.ra_extra_time })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.ra_extra_time && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}</div>
                    <span style={{ lineHeight: '1.2' }}>Extra time to complete a course or<br />assessment</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCompRecord({ ...compRecord, ra_others: !compRecord.ra_others })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.ra_others && <span style={{ color: 'red', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-4px', left: '1px' }}>✓</span>}</div>
                    Others:
                  </label>
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px', resize: 'none', minHeight: '150px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.ra_reason || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_reason: e.target.value })} />
                <div className="hidden print:block p-1.5" style={{ whiteSpace: 'pre-wrap', minHeight: '150px' }}>{compRecord.ra_reason}</div>
              </td>
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px', resize: 'none', minHeight: '150px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.ra_outcome || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_outcome: e.target.value })} />
                <div className="hidden print:block p-1.5" style={{ whiteSpace: 'pre-wrap', minHeight: '150px' }}>{compRecord.ra_outcome}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#9bc2e6', padding: '8px 12px', fontWeight: 'bold', fontSize: '14pt', textTransform: 'uppercase', marginBottom: '12px' }}>
          COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT
        </div>
        <div style={{ fontSize: '11pt', fontWeight: 'bold', lineHeight: '1.5' }}>
          <div>A cover sheet must be included with each submission of work.</div>
          <div>Work submitted without a signed cover sheet will be returned unmarked.</div>
        </div>
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 5 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 5 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 6 – ASSESSMENT TASK 1 (Questions 1-2) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>{task1.title}</h1>
        {task1.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} style={{ marginBottom: '16px' }}>
            {section.title && <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '8px' }}>{section.title}</h3>}
            {section.type === 'text' && <div style={{ whiteSpace: 'pre-wrap', fontSize: '10.5pt', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />}
          </div>
        ))}
        
        <div style={{ background: '#4b82c6', color: '#fff', padding: '8px', border: '1.5px solid #000', fontSize: '12pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' }}>Questions</div>
        
        {q1_2.map((q: any) => renderQ(q, 'task1'))}
        
        <div style={{ border: '1.5px solid black', padding: '12px', fontSize: '10pt', display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontWeight: 'normal' }}>3.</span>
          <span style={{ fontWeight: 'normal' }}>Two of the standards that apply to coaxial cabling are <i>AS/CA S009: 2013</i> and <i>AS/CA S008: 2010</i> Choose the right definition for each of these coaxial cables.</span>
        </div>

        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 6 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 6 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 7 – Assessment Task 1 (Questions 3-5) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontSize: '10pt', marginBottom: '24px' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', padding: '8px', textAlign: 'left', width: '25%' }}>Coaxial cabling</th>
              <th style={{ border: '1.5px solid black', padding: '8px', textAlign: 'left', width: '75%' }}>Definition, choose the best definition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>AS/CA S009: 2013</td>
              <td style={{ border: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <div className="no-print" style={{ marginTop: '2px' }}><input required={isStudent} type="checkbox" checked={answers['t1_q3'] === 'a'} onChange={() => setAnswers({...answers, t1_q3: 'a'})} /></div>
                    <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', justifyContent: 'center', alignItems: 'center' }}>{answers['t1_q3'] === 'a' && <div style={{ width: '8px', height: '8px', background: '#000' }}></div>}</div>
                    <div style={{ lineHeight: '1.3' }}>
                      Handling lead- in cables<br/>
                      Building main distribution frames<br/>
                      Installing internal cables, separation from hazardous and<br/>
                      harmful services, securing cables, minimum bending radius,<br/>
                      recommended maximum of cables in conduits.<br/>
                      Installing external underground and aerial cables
                    </div>
                  </label>
                  <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <div className="no-print" style={{ marginTop: '2px' }}><input required={isStudent} type="checkbox" checked={answers['t1_q3'] === 'e'} onChange={() => setAnswers({...answers, t1_q3: 'e'})} /></div>
                    <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', justifyContent: 'center', alignItems: 'center' }}>{answers['t1_q3'] === 'e' && <div style={{ width: '8px', height: '8px', background: '#000' }}></div>}</div>
                    <div style={{ lineHeight: '1.3' }}>
                      Identifying cabling products<br/>
                      Cable and cable types<br/>
                      Interconnection devices
                    </div>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>AS/CA S008: 2010</td>
              <td style={{ border: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <div className="no-print" style={{ marginTop: '2px' }}><input required={isStudent} type="checkbox" checked={answers['t1_q4'] === 'a'} onChange={() => setAnswers({...answers, t1_q4: 'a'})} /></div>
                    <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', justifyContent: 'center', alignItems: 'center' }}>{answers['t1_q4'] === 'a' && <div style={{ width: '8px', height: '8px', background: '#000' }}></div>}</div>
                    <div style={{ lineHeight: '1.3' }}>
                      Handling lead- in cables<br/>
                      Building main distribution frames<br/>
                      Installing internal cables, separation from hazardous and<br/>
                      harmful services, securing cables, minimum bending radius,<br/>
                      recommended maximum of cables in conduits.<br/>
                      Installing external underground and aerial cables
                    </div>
                  </label>
                  <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <div className="no-print" style={{ marginTop: '2px' }}><input required={isStudent} type="checkbox" checked={answers['t1_q4'] === 'e'} onChange={() => setAnswers({...answers, t1_q4: 'e'})} /></div>
                    <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', justifyContent: 'center', alignItems: 'center' }}>{answers['t1_q4'] === 'e' && <div style={{ width: '8px', height: '8px', background: '#000' }}></div>}</div>
                    <div style={{ lineHeight: '1.3' }}>
                      Identifying cabling products<br/>
                      Cable and cable types<br/>
                      Interconnection devices
                    </div>
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: 0, border: 'none' }}>
                <div style={{ display: 'flex', borderTop: '1.5px solid black', fontWeight: 'bold', fontSize: '9pt' }}>
                  <div style={{ width: '30%', padding: '6px 8px', color: '#1e3a8a', borderRight: '1.5px solid black', display: 'flex', alignItems: 'center', background: '#fce4d6' }}>Assessor to tick (☑)</div>
                  <div style={{ width: '35%', padding: '6px 8px', color: '#1e3a8a', borderRight: '1.5px solid black', background: '#fce4d6', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}
                    onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task1_q3_result: 'S', task1_q4_result: 'S' }) }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                      {(compRecord.task1_q3_result === 'S' || compRecord.task1_q4_result === 'S') && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                    </span>Satisfactory (S)
                  </div>
                  <div style={{ width: '35%', padding: '6px 8px', color: '#1e3a8a', background: '#fce4d6', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}
                    onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task1_q3_result: 'NS', task1_q4_result: 'NS' }) }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                      {(compRecord.task1_q3_result === 'NS' || compRecord.task1_q4_result === 'NS') && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                    </span>Not Satisfactory (NS)
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {renderQ(q5, 'task1')}
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 7 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 7 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 8 – Assessment Task 1 (Questions 6-11) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        {renderQ(q6, 'task1')}
        {q7_11.map((q: any) => renderQ(q, 'task1'))}
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 8 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 8 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 9 – Assessment Task 1 (Question 12 / Declarations) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        {renderQ(q12, 'task1')}
        {renderDeclarations('task1')}
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 9 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 9 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 10 – Assessment Task 2 — Observation ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase' }}>{task2.observationTitle}</h1>
        {task2.observationSubtitle && <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>{task2.observationSubtitle}</h2>}
        <div style={{ fontSize: '11pt', lineHeight: '1.6', marginBottom: '24px' }}>
          This assessment task requires candidates to carry out the following tasks in a real cabling situation or simulation as outlined above.<br/><br/>
          AT 2.1 Use online skills to obtain access to relevant cabling regulations e.g. TS009/2013 and obtain relevant manufacturers requirements for testing coaxial cable print two pages of relevant regulations to demonstrate online skills.<br/><br/>
          AT 2.2 explain how to obtain access to a cabling situations such as a home or small business.<br/><br/>
          AT 2.3 Identify and report a safety risk to your assessor. Complete a JSA for the risk.<br/><br/>
          AT 2.4 select cables and hardware suitable for the task and the client needs. Explain selections to the assessor using a range of coaxial cable samples. Include mention of the transmission of RF signals on coaxial cables.<br/><br/>
          AT 2.5 discuss and agree on a cable route with a customer or the assessor checking for required bend radii. Record cable route on a floor plan or a sketch.<br/><br/>
          AT 2.6 test cable drum for continuity and for signs of damage. Notify the assessor of any faults.<br/><br/>
          AT 2.7 review preparation with client or assessor. Summarise the job verbally.
        </div>
        
        <h3 style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '16px' }}>Required Documents and Equipment</h3>
        <ul style={{ listStyleType: 'disc', marginLeft: '64px', fontSize: '10.5pt', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>A cabling scenario similar to a home, small factory, shop or office with cavity walls</li>
          <li>Access to the internet.</li>
          <li>Access to cabling regulations.</li>
          <li>Cable stripping tool.</li>
          <li>General hand tools particularly drill, screw driver.</li>
          <li>Samples of cable – RG6, RG59, RG11.</li>
          <li>PPE for working with cable</li>
          <li>Cable support hardware</li>
        </ul>
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 10 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 10 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 11 – Assessment Task 2 — Checklist / Record of Performance (start) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', marginTop: '16px', textTransform: 'uppercase' }}>{task2.checklistTitle}</div>
        
        <div style={{ fontStyle: 'italic', fontSize: '11pt', marginBottom: '16px', lineHeight: '1.5' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </div>
        
        <div style={{ fontSize: '11pt', marginBottom: '24px', lineHeight: '1.5' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </div>
        
        <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '12px' }}>Assessor Instructions:</div>
        <div style={{ fontSize: '11pt', marginBottom: '20px', lineHeight: '1.5' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </div>
        
        <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '12px' }}>Oral Assessment:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt', marginBottom: '24px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold' }}>Oral Assessment Questions</th>
              <th colSpan={2} style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '20%' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold' }}>Note any additional questions</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '10%' }}>Yes</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '10%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {task2.checklistItems.map((item: string, idx: number) => (
              <tr key={`oral-${idx}`}>
                <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_oral_${idx}`]: 'yes' })}>
                  {compRecord[`task2_oral_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_oral_${idx}`]: 'no' })}>
                  {compRecord[`task2_oral_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '12px' }}>Record of Performance:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', textAlign: 'left', padding: '6px 8px' }}></th>
              <th colSpan={2} style={{ border: '1px solid black', textAlign: 'left', padding: '6px 8px', fontWeight: 'normal', width: '20%' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '12pt' }}>Did the Candidate:</th>
              <th style={{ border: '1px solid black', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '12pt', width: '10%' }}>Yes</th>
              <th style={{ border: '1px solid black', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '12pt', width: '10%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {task2.performance.slice(0, 3).map((item: string, i: number) => {
              const idx = 0 + i;
              return (
                <tr key={`perf-${idx}`}>
                  <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                  <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_perf_${idx}`]: 'yes' })}>
                    {compRecord[`task2_perf_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_perf_${idx}`]: 'no' })}>
                    {compRecord[`task2_perf_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 11 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 11 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 12 – Assessment Task 2 — Record of Performance (continued) / Declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt', marginBottom: '32px' }}>
          <tbody>
            {task2.performance.slice(3).map((item: string, i: number) => {
              const idx = 3 + i;
              return (
                <tr key={`perf-${idx}`}>
                  <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                  <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center', width: '10%' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_perf_${idx}`]: 'yes' })}>
                    {compRecord[`task2_perf_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center', width: '10%' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_perf_${idx}`]: 'no' })}>
                    {compRecord[`task2_perf_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {renderDeclarations('task2')}
        
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 12 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 12 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 13 – Assessment Task 3 — Observation / Checklist ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase' }}>{task3.observationTitle}</div>
        {task3.observationSubtitle && <div style={{ fontSize: '13pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>{task3.observationSubtitle}</div>}
        
        <div style={{ fontSize: '11pt', lineHeight: '1.6', marginBottom: '24px' }}>
          This assessment task requires candidate to carry out the following tasks in the real cabling situation or the simulation.<br/><br/>
          AT 3.1 select cable support hardware so that cable is not damaged and manufacturers minimum bend radius is maintained. Photograph the support hardware.<br/><br/>
          AT 3.2 install cable support hardware ensuring industry standard segregations. Photograph the support hardware<br/><br/>
          AT 3.3 install cable safely with no damage to cable and all manufacturer requirements met.<br/><br/>
          AT 3.4 terminate cable demonstrating correct methods for three different terminators. Demonstrate your termination technique to the assessor.
        </div>
        
        <div style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '16px' }}>Required Documents and Equipment</div>
        <ul style={{ listStyleType: 'disc', marginLeft: '64px', fontSize: '10.5pt', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
          <li>A cabling scenario similar to a home, small factory, shop or office with the cavity walls.</li>
          <li>Multiple cable types for termination – RG6, RG59, RG11.</li>
          <li>PPE for working with the cable.</li>
          <li>Cable stripping tool.</li>
          <li>Crimping, compression and/ or screw terminations.</li>
          <li>Manufacturers' guidelines/ specifications for all tools and machinery.</li>
        </ul>
        
        <div style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', textTransform: 'uppercase' }}>{task3.checklistTitle}</div>
        
        <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '12px' }}>Oral Assessment:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold' }}>Oral assessment questions</th>
              <th colSpan={2} style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '20%' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold' }}>Note any additional questions</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '10%' }}>Yes</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '10%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {task3.checklistItems.map((item: string, idx: number) => (
              <tr key={`oral-${idx}`}>
                <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_oral_${idx}`]: 'yes' })}>
                  {compRecord[`task3_oral_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_oral_${idx}`]: 'no' })}>
                  {compRecord[`task3_oral_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 13 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 13 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 14 – Assessment Task 3 — Record of Performance / Declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '12px' }}>Record of Performance:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt', marginBottom: '32px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px' }}></th>
              <th colSpan={2} style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '20%' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '12pt' }}>Did the candidate:</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '12pt', width: '10%' }}>Yes</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '12pt', width: '10%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {task3.performance.map((item: string, idx: number) => (
              <tr key={`perf-${idx}`}>
                <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_perf_${idx}`]: 'yes' })}>
                  {compRecord[`task3_perf_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_perf_${idx}`]: 'no' })}>
                  {compRecord[`task3_perf_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {renderDeclarations('task3')}
        
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 14 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 14 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 15 – Assessment Task 4 — Report / Checklist ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase' }}>ASSESSMENT TASK 4- REPORT</h1>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Mechanical Splice</div>
        
        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '16px' }}>This Assessment Task Requires Candidates to:</div>
        <div style={{ fontSize: '10.5pt', lineHeight: '1.6', marginBottom: '24px' }}>
          AT 4.1 test at least three examples of cable termination and cable continuity for signal level. Tests should include short circuit, open circuit, functionality. Re-cable, repair or re-terminate if loss exceeds manufacturer specifications<br/><br/>
          AT 4.2 record all work using a TCA and floor plan, sketch or notes. Explain the job to the assessor including test results and work done to achieve manufacturer performance level.<br/><br/>
          AT 4.3 explain where over voltage protection would be installed on the cabling system.<br/><br/>
          AT 4.4 restore the work site to original standard by cleaning and removing waste.<br/><br/>
          AT 4.5 role play showing the client the completed work and signing off the job. Assessor can role play client.
        </div>
        
        <div style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '16px' }}>Required Documents and Equipment</div>
        <ul style={{ listStyleType: 'disc', marginLeft: '64px', fontSize: '10.5pt', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
          <li>A cabling scenario similar to a home, small factory, shop or office with the cavity walls.</li>
          <li>Coaxial cable tester</li>
          <li>Testing device (DMM-Digital Multimeter)</li>
          <li>TDR (time domain reflect meter)</li>
          <li>PPE for working with the cable.</li>
          <li>Termination connectors.</li>
          <li>Manufacturers' guidelines/ specifications for all tools and machinery.</li>
        </ul>
        
        <div style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', textTransform: 'uppercase' }}>{task4.checklistTitle}</div>
        
        <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '12px' }}>Oral Assessment:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold' }}>Oral Assessment Questions</th>
              <th colSpan={2} style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '20%' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold' }}>Note any additional questions</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '10%' }}>Yes</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '10%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {task4.checklistItems.map((item: string, idx: number) => (
              <tr key={`oral-${idx}`}>
                <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task4_oral_${idx}`]: 'yes' })}>
                  {compRecord[`task4_oral_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task4_oral_${idx}`]: 'no' })}>
                  {compRecord[`task4_oral_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 15 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 15 of 16</span></div>
      </div>

      {/* ═══════════════════ PAGE 16 – Assessment Task 4 — Record of Performance / End of Assessment ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '12px' }}>Record of Performance:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10pt', marginBottom: '32px' }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', verticalAlign: 'top', fontWeight: 'bold', fontSize: '11pt' }}>Did The Candidate:</th>
              <th colSpan={2} style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', width: '20%' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '11pt', width: '10%' }}>Yes</th>
              <th style={{ border: '1px solid black', background: '#999', textAlign: 'left', padding: '6px 8px', fontWeight: 'bold', fontSize: '11pt', width: '10%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {task4.performance.map((item: string, idx: number) => (
              <tr key={`perf-${idx}`}>
                <td style={{ border: '1px solid black', padding: '6px 8px' }}>{item}</td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task4_perf_${idx}`]: 'yes' })}>
                  {compRecord[`task4_perf_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task4_perf_${idx}`]: 'no' })}>
                  {compRecord[`task4_perf_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt' }}>✓</span> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {renderDeclarations('task4')}
        
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16pt', marginTop: '32px', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>END OF ASSESSMENT</div>
        
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 16 of 16</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.2 | 2023</span><span>Page 16 of 16</span></div>
      </div>

    </div>
  );
};
