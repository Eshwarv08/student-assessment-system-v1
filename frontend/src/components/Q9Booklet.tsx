import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions9';

interface Q9BookletProps {
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
  <div className="page-footer"><span></span><span>Page {n} of 15</span></div>
);

export const Q9Booklet: React.FC<Q9BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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

  const clearSig = () => { if (sigPadRef.current) sigPadRef.current.clear(); };

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
      const pad = new SignaturePad(sigModalCanvasRef.current, { backgroundColor: 'rgb(255, 255, 255)', penColor: 'rgb(0, 0, 0)' });
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

  const toDateInputValue = (d: string) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '';
      return dt.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatDisplayDate = (d: string) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const admin = assessmentQuestions.adminInfo as any;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;

  // ... (Keeping renderStudentDecl, renderAssessorDecl, etc unchanged)

  const renderStudentDecl = (taskKey: string) => (
    <div className="mt-4">
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
                  <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord[`${taskKey}_student_date`] !== undefined ? compRecord[`${taskKey}_student_date`] : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ flex: 1, border: 'none', borderBottom: '1.5px solid black', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', fontWeight: 'bold' }} />
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', paddingLeft: '4px', fontWeight: 'bold' }}>{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord[`${taskKey}_student_date`] !== undefined ? compRecord[`${taskKey}_student_date`] : (submitDate || '')))}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderAssessorDecl = (taskKey: string) => (
    <div className="mt-4">
      <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '100px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', fontFamily: "'Times New Roman', serif", fontSize: '10.5pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..." value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }} readOnly={isStudent} />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px', fontSize: '10.5pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '12.5pt' }}>
        Result:{' '}
        <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '4px' }}>
          Satisfactory (S){compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>}
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          Not Satisfactory (NS){compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>}
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
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
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
    <>
      {renderStudentDecl(taskKey)}
      {renderAssessorDecl(taskKey)}
    </>
  );

  const ChkHead = () => (
    <thead>
      <tr>
        <th rowSpan={2} className="border-[1.5px] border-black bg-[#999] text-left px-3 py-2 text-black font-bold">Did the Candidate:</th>
        <th colSpan={2} className="border-[1.5px] border-black bg-[#999] text-left px-3 py-2 text-black font-bold">Satisfactory</th>
      </tr>
      <tr>
        <th className="border-[1.5px] border-black bg-[#aaa] text-left px-3 py-1.5 text-black font-bold w-[12%]">Yes</th>
        <th className="border-[1.5px] border-black bg-[#aaa] text-left px-3 py-1.5 text-black font-bold w-[12%]">No</th>
      </tr>
    </thead>
  );

  const renderObsRows = (taskKey: string, items: string[]) =>
    items.map((item, idx) => (
      <tr key={`obs-${idx}`}>
        <td className="border-[1.5px] border-black px-3 py-2 text-[9pt]">{item}</td>
        <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_obs_${idx}`]: 'yes' })}>
          {compRecord[`${taskKey}_obs_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
        </td>
        <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_obs_${idx}`]: 'no' })}>
          {compRecord[`${taskKey}_obs_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
        </td>
      </tr>
    ));

  const renderChkRows = (taskKey: string, items: string[], start: number, end: number) =>
    items.slice(start, end).map((item, i) => {
      const idx = start + i;
      return (
        <tr key={`chk-${idx}`}>
          <td className="border-[1.5px] border-black px-3 py-2 text-[9pt]">{item}</td>
          <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'yes' })}>
            {compRecord[`${taskKey}_chk_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
          <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'no' })}>
            {compRecord[`${taskKey}_chk_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
        </tr>
      );
    });

  const renderQ = (q: any, taskKey: string) => {
    const qKey = `t${taskKey.replace('task', '')}q${q.id}`;
    return (
      <div key={q.id} className="mb-4 border-[1.5px] border-black bg-white flex flex-col">
        <div className="p-3">
          <div className="flex gap-2 font-bold mb-2 text-[10pt]"><span>{q.id}.</span><span className="whitespace-pre-wrap">{q.text}</span></div>
          <div className="pl-0 mt-2">
            {q.type === 'text' && (
              <textarea required={isStudent} className="w-full border border-gray-300 p-2 min-h-[80px] resize-y" value={answers[qKey] || ''} onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })} placeholder="(No response)" />
            )}
            {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
              <div key={oIdx} className="flex gap-2 mb-2 items-center">
                <input required={isStudent} type="radio" checked={answers[opt.name || qKey] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })} />
                <label>{opt.text}</label>
              </div>
            ))}
            {(q.type === 'options' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
              const ansArray = answers[qKey] || [];
              const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
              return (
                <div key={oIdx} className="flex gap-2 mb-2 items-center">
                  <input type="checkbox" checked={checked} onChange={(e) => {
                    let newArr = [...(Array.isArray(answers[qKey]) ? answers[qKey] : [])];
                    if (e.target.checked) newArr.push(opt.value); else newArr = newArr.filter((v: any) => v !== opt.value);
                    setAnswers({ ...answers, [qKey]: newArr });
                  }} />
                  <label>{opt.text}</label>
                </div>
              );
            })}
            {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tIdx: number) => (
              <div key={tIdx} className="mb-3 border border-gray-200 p-2">
                {ti.image && <img src={ti.image} className="max-w-[200px] mb-2" alt="Diagram" />}
                <input required={isStudent} type="text" className="border-b border-black w-full outline-none p-1 bg-transparent" placeholder={ti.placeholder} value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] mt-auto">
          <div className="w-[40%] p-1 text-blue-800 border-r-[1.5px] border-black flex items-center">Assessor to tick (☑)</div>
          <div className={`w-[30%] p-1 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
            onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' }) }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
              {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
            </span>Satisfactory (S)
          </div>
          <div className={`w-[30%] p-1 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
            onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' }) }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
              {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
            </span>Not Satisfactory (NS)
          </div>
        </div>
      </div>
    );
  };

  const q9Styles = `
      .q9-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q9-booklet-view * { box-sizing: border-box; }
      .q9-booklet-view .page {
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
      .q9-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q9-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q9-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q9-booklet-view h3.task-label { font-size: 10.5pt; font-weight: bold; text-align: center; margin: 1mm 0 3mm; }
      .q9-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q9-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q9-booklet-view table td, .q9-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q9-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q9-booklet-view .field-label-cell { font-weight: bold; background: #f0f0f0; width: 38%; border: 1px solid #555; padding: 5px 6px; }
      .q9-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q9-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q9-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q9-booklet-view .evidence-row { display: flex; align-items: center; gap: 18px; padding: 3px 0; font-size: 9pt; }
      .q9-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q9-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q9-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q9-booklet-view .page-footer {
        margin-top: auto; padding-top: 4mm; border-top: 1px solid #000;
        display: flex; justify-content: space-between; font-size: 8pt;
      }
      .q9-booklet-view .inner-header { margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
      .q9-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q9-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q9-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q9-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q9-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q9-booklet-view .question-block { margin-bottom: 8mm; }
      .q9-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q9-booklet-view { background: #fff !important; padding: 0 !important; }
        .q9-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }

      @media screen and (max-width: 800px) {
        .q9-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q9-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q9-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q9-booklet-view .flex, .q9-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q9-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q9-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q9-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q9-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q9-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q9-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  `;

  return (
    <div className="q9-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q9Styles }} />

      {/* Signature Modal */}
      {sigModal?.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] text-white p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">{sigModal?.field === 'student_signature' ? 'Student Signature' : 'Assessor Signature'}</h3>
              <button onClick={closeSigModal} className="text-slate-400 hover:text-white transition-colors"><XCircle size={24} /></button>
            </div>
            <div className="p-4 sm:p-8">
              <div ref={sigModalContainerRef} className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden mb-6 flex justify-center h-[250px]">
                <canvas ref={sigModalCanvasRef} className="w-full h-full cursor-crosshair" style={{ touchAction: 'none' }} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={clearSig} className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"><RotateCcw size={18} /> CLEAR</button>
                <button onClick={saveSignature} className="flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm"><CheckCircle2 size={18} /> SAVE SIGNATURE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ PAGE 1 – COVER ═══════════════════ */}
      <div className="page" style={{ padding: '0', display: 'flex' }}>
        <div style={{ flex: 1, border: '5px solid #00b0f0', margin: '30px', padding: '3px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1px solid #00b0f0', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '240px', height: 'auto', objectFit: 'contain', marginTop: '70px' }} />
            <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#903030', fontFamily: 'Arial, sans-serif', marginTop: '10px' }}>RTO NO: 40954</div>
            <div className="cover-title" style={{ fontSize: '46pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '20px' }}>Assessment Booklet</div>
            <div style={{ background: '#00b0f0', height: '16px', width: '92%', marginTop: '20px', marginBottom: '30px' }}></div>
            <div className="cover-subtitle" style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '10px', textAlign: 'center', lineHeight: '1.4' }}>
              {assessmentQuestions.metadata.code}<br />
              {assessmentQuestions.metadata.course}<br />
              (Release 1)
            </div>

            <div style={{ width: '100%', marginTop: 'auto', marginBottom: '80px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ fontSize: '16pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.5px solid #888', width: '320px', fontWeight: 'bold', color: '#3b5998', fontFamily: '"Times New Roman", Times, serif', fontSize: '13pt', textAlign: 'center', paddingBottom: '2px', textTransform: 'uppercase' }}>{studentName}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '60px' }}>ACTA College Pty. Ltd</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '12px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT COMPETENCY RECORD</h1>

        <div style={{ border: '1.5px solid #000', padding: '6px 8px', background: '#d9d9d9', fontSize: '9pt', marginBottom: '16px', lineHeight: '1.4' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '35%', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Student's Name</td>
              <td style={{ width: '65%', border: '1.5px solid #000', padding: '6px 8px', color: '#1e3a8a', fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Assessor's Name</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <input type="text" className="no-print" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{compRecord.assessor_name}</div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Assessment Site</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <input type="text" className="no-print" value={compRecord.assessment_site || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_site: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{compRecord.assessment_site}</div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Assessment Date</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{formatDisplayDate(compRecord.assessment_date)}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={6} style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={6} style={{ border: '1.5px solid #000', padding: '6px 8px' }}>
                In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '50%' }}>Evidence is Confirmed as:</td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', width: '12.5%' }}>
                <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_valid: !compRecord.evidence_valid })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_valid && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Valid
                </div>
              </td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', width: '12.5%' }}>
                <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_sufficient: !compRecord.evidence_sufficient })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_sufficient && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Sufficient
                </div>
              </td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', width: '12.5%' }}>
                <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_current: !compRecord.evidence_current })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_current && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Current
                </div>
              </td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', width: '12.5%' }}>
                <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_authentic: !compRecord.evidence_authentic })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_authentic && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Authentic
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Please attach the following documentation to this form</td>
              <td style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', textAlign: 'center' }}>Result</td>
              <td colSpan={2} rowSpan={4} style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '12px', verticalAlign: 'middle', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>FINAL ASSESSMENT<br />RESULT:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', paddingLeft: '10%' }}>
                  <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'C' })} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.final_result === 'C' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Competent (C)
                  </div>
                  <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'NC' })} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.final_result === 'NC' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Not Competent (NC)
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 1</td>
              <td colSpan={2} style={{ border: '1.5px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t1: !compRecord.tasks?.t1 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t1 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Observation
                </div>
              </td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task1_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task1_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 2</td>
              <td colSpan={2} style={{ border: '1.5px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t2: !compRecord.tasks?.t2 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t2 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Observation
                </div>
              </td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task2_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task2_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 3</td>
              <td colSpan={2} style={{ border: '1.5px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t3: !compRecord.tasks?.t3 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t3 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Questions and Answers
                </div>
              </td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task3_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task3_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', width: '15%', textAlign: 'center' }}>Attempt</td>
              <td style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', width: '25%', textAlign: 'center' }}>Date</td>
              <td style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', width: '60%', textAlign: 'center' }}>Assessor's Feedback (as Required):</td>
            </tr>
            {[1, 2, 3].map(attempt => (
              <tr key={attempt}>
                <td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>{attempt}</td>
                <td style={{ border: '1.5px solid #000', padding: '0', verticalAlign: 'middle' }}>
                  <input type="date" className="no-print" value={toDateInputValue(compRecord[`attempt_${attempt}_date`] || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_date`]: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }} />
                  <div className="hidden print:block text-center">{formatDisplayDate(compRecord[`attempt_${attempt}_date`] || '')}</div>
                </td>
                <td style={{ border: '1.5px solid #000', padding: '0' }}>
                  <textarea className="no-print" placeholder="" value={compRecord[`attempt_${attempt}_feedback`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_feedback`]: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                  <div className="hidden print:block" style={{ padding: '6px', minHeight: '30px' }}>{compRecord[`attempt_${attempt}_feedback`]}</div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ background: '#c0c0c0', border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <textarea className="no-print" placeholder="" value={compRecord.final_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, final_feedback: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', minHeight: '40px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                <div className="hidden print:block" style={{ padding: '6px', minHeight: '40px' }}>{compRecord.final_feedback}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '8px' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Student:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1.5px solid #000', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ flex: 1, borderBottom: '1.5px solid #888', minHeight: '24px', position: 'relative', cursor: 'pointer' }}>
                      {answers.student_signature_url ? <img src={answers.student_signature_url} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? 'Click to sign' : ''}</span>}
                    </div>
                    <div className="hidden print:block" style={{ flex: 1, borderBottom: '1.5px solid #888', height: '24px', position: 'relative' }}>
                      {answers.student_signature_url && <img src={answers.student_signature_url} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_page2 !== undefined ? compRecord.student_sig_date_page2 : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ flex: 1, border: 'none', borderBottom: '1.5px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }} />
                    <div className="hidden print:block border-b-[1.5px] border-[#888] flex-1 text-[#1e3a8a] font-bold text-center min-h-[20px]">{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_page2 !== undefined ? compRecord.student_sig_date_page2 : (submitDate || '')))}</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '8px', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1.5px solid #000', padding: '8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'comp')} style={{ flex: 1, borderBottom: '1.5px solid #888', minHeight: '24px', position: 'relative', cursor: isStudent ? 'default' : 'pointer' }}>
                      {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? '' : 'Click to sign'}</span>}
                    </div>
                    <div className="hidden print:block" style={{ flex: 1, borderBottom: '1.5px solid #888', height: '24px', position: 'relative' }}>
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ flex: 1, border: 'none', borderBottom: '1.5px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#cc0000', fontWeight: 'bold' }} />
                    <div className="hidden print:block border-b-[1.5px] border-[#888] flex-1 text-[#cc0000] font-bold text-center min-h-[20px]">{formatDisplayDate(compRecord.assessment_date || '')}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={2} />
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN (unit info through re-assessment) ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td colSpan={2} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', fontSize: '10pt' }}>Administrative use only:</td></tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '30%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>{compRecord.admin_entered && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Signature/Initial
                  </div>
                  <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'comp')} style={{ width: '150px', borderBottom: '1px solid #000', height: '24px', position: 'relative', cursor: isStudent ? 'default' : 'pointer', margin: '0 8px' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '10px', bottom: '0', mixBlendMode: 'multiply' }} /> : ''}
                  </div>
                  <div className="hidden print:block" style={{ width: '150px', borderBottom: '1px solid #000', height: '24px', position: 'relative', margin: '0 8px' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '10px', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <span style={{ marginRight: '8px' }}>Date:</span>
                  <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '120px', border: 'none', borderBottom: '1px solid #000', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#cc0000', fontWeight: 'bold' }} />
                  <div className="hidden print:block text-[#cc0000] font-bold border-b border-[#000] w-[120px] text-center">{formatDisplayDate(compRecord.assessment_date || '')}</div>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>N/A</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>N/A</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.unitSummary}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Conditions and context of the assessments</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.conditionsAndContext}</td></tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Specific Resources Required</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <ul style={{ margin: 0, paddingLeft: '24px', lineHeight: '1.4' }}>
                  <li>Learner Guide</li>
                  <li>Assessment Booklet</li>
                  <li>Practical Workshop</li>
                  <li>Manufacturers Manuals and specifications</li>
                  <li>Workplace policy and procedures</li>
                </ul>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.reAssessment}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.plagiarism}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Complaints and appeal</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.complaintsAndAppeals}</td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN (assessors intervention through competency decision) ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '30%', verticalAlign: 'top' }}>Assessors Intervention</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessorsIntervention}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Attaching documents</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.attachingDocuments}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Instruction</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessmentInstruction}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 1:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.task1Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 2:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.task2Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 3:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.task3Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN (reasonable adjustment + cover sheet) ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td colSpan={3} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Reasonable adjustment</td></tr>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', lineHeight: '1.4' }}>
                To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.<br />
                ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '40%', textAlign: 'center' }}>Reasonable adjustment provided</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '30%', textAlign: 'center' }}>Reason for reasonable adjustment</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '30%', textAlign: 'center' }}>Outcome</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, adj_educational: !compRecord.adj_educational }); } }}>
                      {compRecord.adj_educational && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span>Educational and bilingual support</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, adj_presenting_orally: !compRecord.adj_presenting_orally }); } }}>
                      {compRecord.adj_presenting_orally && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span>Presenting questions orally</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, adj_diagrammatic: !compRecord.adj_diagrammatic }); } }}>
                      {compRecord.adj_diagrammatic && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span>Presenting work instructions in diagrammatic or pictorial form instead of words and sentences</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, adj_extra_time: !compRecord.adj_extra_time }); } }}>
                      {compRecord.adj_extra_time && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span>Extra time to complete a course or assessment</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, adj_others: !compRecord.adj_others }); } }}>
                      {compRecord.adj_others && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span>Others: <input type="text" className="no-print" value={compRecord.adj_others_text || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, adj_others_text: e.target.value })} disabled={isStudent} style={{ border: 'none', borderBottom: '1px solid #000', outline: 'none', background: 'transparent' }} /><span className="hidden print:inline-block border-b border-black min-w-[50px]">{compRecord.adj_others_text}</span></span>
                  </label>
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="no-print" value={compRecord.adj_reason || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, adj_reason: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '120px', border: 'none', padding: '6px 8px', outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block p-2 whitespace-pre-wrap">{compRecord.adj_reason}</div>
              </td>
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="no-print" value={compRecord.adj_outcome || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, adj_outcome: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '120px', border: 'none', padding: '6px 8px', outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block p-2 whitespace-pre-wrap">{compRecord.adj_outcome}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#99c2ff', padding: '8px 16px', fontWeight: 'bold', fontSize: '14pt', display: 'inline-block', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</div>
        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '8px' }}>A cover sheet must be included with each submission of work.</div>
        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px' }}>Work submitted without a signed cover sheet will be returned unmarked.</div>

        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1: observation + student instructions + steps ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 1 OBSERVATION (PC 1.1-1.5, 2.1-2.3)</h1>
        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>PRACTICAL DEMONSTRATION</h2>
        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontFamily: '"Times New Roman", Times, serif' }}>Select and use of optical power measurement equipment's and optical source</h2>

        <div style={{ fontSize: '10pt', lineHeight: '1.5' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Student instructions:</div>
          <div style={{ marginBottom: '16px' }}>
            In this assessment the candidate needs to demonstrate their skills in use of optical measurement test equipment evaluate test results at a fibre termination point (FTP) such as fibre cabinet or an underground closure or a simulated environment. As instructed by the assessor the candidate will have to work on the equipment depending on the FTP and the resources available. The candidate need to follow the instructions and carry out the task appropriately.<br /><br />
            The candidate must ensure that all work planned will be conducted in line with regulatory requirements and safety/WHS considerations.<br /><br />
            The time your facilitator/assessor allocates you to complete the task will depend on the type of cable being prepared and the environment in which you are undertaking the task.
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Steps Involved:</div>
          <div style={{ marginBottom: '16px' }}>
            Participants are required to Connect and measure optical signal at three different power level with using of a PON meter You will need to :measure signal of -20dBm/dB, 0.0dBm/dB and +2.0dBm/ db from optical power source
          </div>
          <ol style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>Select appropriate hand-held optical power meter and the optical power source check for calibration and functional specification.</li>
            <li>Test the optical cale and patch cords with Handheld optical fiber identifier (OFI-FTTx)</li>
            <li>Selection of tools and cleaning aids to clean input output ports and patch cords</li>
            <li>Connect the Power meter and the hand held optical source with a patch cord</li>
            <li>Use of Optical Loss test set (OLTS)to measure different power level in different wave length selected from the optical power source to determine the amount of Insertion loss in db in each connecters and spliced joints</li>
            <li>Use appropriate PPE and follow safety procedures. during connection and disconnection optical source and terminating end connectors</li>
            <li>Record the result and compare selected output level of the optical source and input level measured by the Passive optical network( PON )meter</li>
            <li>Replace the connection with deferent length of patch cord with active optical network termination (ONT) detector and record the results</li>
            <li>Compare the result with calculated values and actual measured values by the PON meter</li>
          </ol>
        </div>

        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1: assessor checklist + observationItems + checklistItems[0-7] ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 1 – ASSESSOR CHECKLIST</h1>

        <div style={{ fontSize: '9.5pt', fontStyle: 'italic', marginBottom: '12px' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </div>
        <div style={{ fontSize: '9.5pt', marginBottom: '12px' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginBottom: '8px' }}>Assessor Instructions:</div>
        <div style={{ fontSize: '9.5pt', marginBottom: '16px' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>The following was observed during the observations:</div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10pt' }}>
            {[
              { id: 'obs_ch_1', text: 'Interpret technical documents' },
              { id: 'obs_ch_2', text: 'Liaison with experts' },
              { id: 'obs_ch_3', text: 'Communication skills' },
              { id: 'obs_ch_4', text: 'Read equipment manuals' },
              { id: 'obs_ch_5', text: 'Appropriate cable installation' },
              { id: 'obs_ch_6', text: 'Taking measurements' },
              { id: 'obs_ch_7', text: 'Identify signal strength loss' },
              { id: 'obs_ch_8', text: 'Identify the faults' },
              { id: 'obs_ch_9', text: 'Suggest remedies' },
            ].map(obs => (
              <div key={obs.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '220px' }}>{obs.text}</div>
                <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_${obs.id}`]: !compRecord[`task1_${obs.id}`] })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                    {compRecord[`task1_${obs.id}`] && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <span>Observation 1</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', width: '60%' }}>Checklist</th>
              <th style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', width: '15%' }}>Case 1</th>
              <th style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', width: '25%' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
                Date Observed: <input type="date" className="no-print" value={toDateInputValue(compRecord.task1_date_obs || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task1_date_obs: e.target.value })} disabled={isStudent} style={{ width: '120px', border: 'none', outline: 'none', background: 'transparent', color: '#cc0000', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'normal' }} />
                <span className="hidden print:inline-block text-[#cc0000] ml-2 font-normal">{formatDisplayDate(compRecord.task1_date_obs || '')}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            {[
              { id: 'case1_1', text: 'Did the Student accessed and read job instructions, including specific method & process requirements' },
              { id: 'case1_2', text: 'Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work' },
              { id: 'case1_3', text: 'Did the student apply precautions required to minimise hazard' },
              { id: 'case1_4', text: 'Did the student exhibit good communication skills' },
              { id: 'case1_5', text: 'Did the student liaise with internal and external personnel on technical and operational matters' },
              { id: 'case1_6', text: 'Did the student relate to work associates, supervisors, team members and clients' },
              { id: 'case1_7', text: 'Did the student exhibit skills in interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation' },
            ].map(item => (
              <tr key={item.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{item.text}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_${item.id}`]: 'Yes' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task1_${item.id}`] === 'Yes' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_${item.id}`]: 'No' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task1_${item.id}`] === 'No' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '1px solid #000', padding: '0' }}>
                  <textarea className="no-print" value={compRecord[`task1_${item.id}_comment`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task1_${item.id}_comment`]: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', padding: '4px', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
                  <div className="hidden print:block p-1 whitespace-pre-wrap">{compRecord[`task1_${item.id}_comment`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1: checklistItems[8-end] + declarations ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '24px' }}>
          <tbody>
            {[
              { id: 'case1_8', text: 'Did the student take measurements in a correct manner' },
              { id: 'case1_9', text: 'Did the student analyse the output' },
              { id: 'case1_10', text: 'Did the student identify the causes of signal strength loss in optical fibre' },
              { id: 'case1_11', text: 'Did the student explain the reasons for signal strength loss' },
              { id: 'case1_12', text: 'Did the student comply with all related health and safety requirements and work practices' },
              { id: 'case1_13', text: 'Did the Student recognise the features and operating requirements of test equipment' },
              { id: 'case1_14', text: 'Did the Student describe how to operate equipment according to a test specification' },
              { id: 'case1_15', text: 'Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions' },
              { id: 'case1_16', text: 'Did the student undertake the task independently?' },
              { id: 'case1_17', text: 'Did the student demonstrate time management skill through the task?' },
              { id: 'case1_18', text: 'Did the student exhibit good communication skills?' },
              { id: 'case1_19', text: 'Did the student meet all the criteria for the task?' },
            ].map(item => (
              <tr key={item.id}>
                <td style={{ border: '1.5px solid #888', padding: '6px', width: '60%' }}>{item.text}</td>
                <td style={{ border: '1.5px solid #888', padding: '6px', textAlign: 'center', width: '15%' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_${item.id}`]: 'Yes' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task1_${item.id}`] === 'Yes' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_${item.id}`]: 'No' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task1_${item.id}`] === 'No' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '1.5px solid #888', padding: '0', width: '25%' }}>
                  <textarea className="no-print" value={compRecord[`task1_${item.id}_comment`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task1_${item.id}_comment`]: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', padding: '4px', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
                  <div className="hidden print:block p-1 whitespace-pre-wrap">{compRecord[`task1_${item.id}_comment`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '8px' }}>Comments/Feedback to Participant</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'task1')} style={{ flex: 1, borderBottom: '1px solid #888', minHeight: '24px', position: 'relative', cursor: 'pointer' }}>
                      {answers.student_signature_url ? <img src={answers.student_signature_url} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? 'Click to sign' : ''}</span>}
                    </div>
                    <div className="hidden print:block border-b border-[#888] flex-1 min-h-[24px] relative">
                      {answers.student_signature_url && <img src={answers.student_signature_url} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_task1 !== undefined ? compRecord.student_sig_date_task1 : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ width: '120px', border: 'none', borderBottom: '1px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }} />
                    <div className="hidden print:block border-b border-[#888] w-[120px] text-[#1e3a8a] font-bold text-center min-h-[20px]">{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_task1 !== undefined ? compRecord.student_sig_date_task1 : (submitDate || '')))}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid #888', padding: '8px', minHeight: '80px', marginBottom: '24px', fontSize: '9.5pt', position: 'relative' }}>
          <strong style={{ position: 'absolute', top: '8px', left: '8px' }}>Assessor's Feedback:</strong>
          <textarea className="no-print" value={compRecord.task1_assessor_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task1_assessor_feedback: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', marginTop: '24px', minHeight: '50px', border: 'none', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
          <div className="hidden print:block mt-[24px] whitespace-pre-wrap">{compRecord.task1_assessor_feedback}</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center', marginBottom: '16px' }}>Result: Satisfactory (S)/Not Satisfactory (NS)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'task1')} style={{ flex: 1, borderBottom: '1px solid #888', minHeight: '24px', position: 'relative', cursor: isStudent ? 'default' : 'pointer' }}>
                      {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? '' : 'Click to sign'}</span>}
                    </div>
                    <div className="hidden print:block border-b border-[#888] flex-1 min-h-[24px] relative">
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '120px', border: 'none', borderBottom: '1px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#cc0000', fontWeight: 'bold' }} />
                    <div className="hidden print:block border-b border-[#888] w-[120px] text-[#cc0000] font-bold text-center min-h-[20px]">{formatDisplayDate(compRecord.assessment_date || '')}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 2: observation + text sections ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 2 – OBSERVATION (PC1.2-1.4, 2.1-2.4)</h1>
        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>Practical Demonstration</h2>
        <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontFamily: '"Times New Roman", Times, serif' }}>Connecting VFL and Testing optical Patch Cord</h2>

        <div style={{ fontSize: '10pt', lineHeight: '1.5' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Assessment Description</div>
          <div style={{ marginBottom: '16px' }}>
            In this assessment task the candidate should use of Visual fault locator in a fibre optical patch cord as per manufactures instructions the assessment environment and the resources available. Based on the information provided by the assessor<br /><br />
            For better understanding the assessor will demonstrate the connection and identifying patch cord at termination point<br /><br />
            You must ensure that all work planned will be conducted in line with regulatory requirements and safety/OHS considerations.
          </div>

          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Procedure</div>
          <div style={{ marginBottom: '16px' }}>
            This assessment task is divided into three stages for proper understanding.
          </div>
          <ol style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <li>Prepare Patch cord for testing</li>
            <li>Connect VFL to on end of the patch cord from an enclosure</li>
            <li>Check and identify the correct patch cord has visual light out put at the far end of the patch cord</li>
          </ol>

          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Equipment's Required :</div>
          <ol style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>Visual Fault locator</li>
            <li>Patch cord</li>
          </ol>
        </div>

        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 2: equipment images ═══════════════════ */}
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', width: '100%' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', flex: 1, marginTop: '20px', width: '100%' }}>
          {task2.sections?.filter((s: any) => s.type === 'image').map((s: any, i: number) => {
            return <img key={i} src={s.src} alt={s.caption || 'Equipment'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
          })}
        </div>

        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2: assessor checklist + observationItems + checklistItems[0-11] ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</h1>

        <div style={{ fontSize: '9.5pt', fontStyle: 'italic', marginBottom: '12px' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </div>
        <div style={{ fontSize: '9.5pt', marginBottom: '12px' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </div>
        <div style={{ fontWeight: 'bold', fontSize: '9.5pt', marginBottom: '8px' }}>Assessor Instructions:</div>
        <div style={{ fontSize: '9.5pt', marginBottom: '16px' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>The following was observed during the observations:</div>

        <ol style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10pt', marginBottom: '16px' }}>
          <li>Prepare Patch cord for testing.</li>
          <li>Connect the VFL to the Patch cord</li>
          <li>Check and identify the correct end of the patch cord with Visual light from VFL</li>
          <li>Identify any fault in the patch cord</li>
        </ol>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#c0c0c0', border: '1.5px solid #888', padding: '6px', width: '60%' }}>Checklist</th>
              <th style={{ background: '#c0c0c0', border: '1.5px solid #888', padding: '6px', width: '15%' }}>Case 1</th>
              <th style={{ background: '#c0c0c0', border: '1.5px solid #888', padding: '6px', width: '25%' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #888', padding: '6px', fontWeight: 'bold' }}>
                Date Observed: <input type="date" className="no-print" value={toDateInputValue(compRecord.task2_date_obs || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task2_date_obs: e.target.value })} disabled={isStudent} style={{ width: '120px', border: 'none', outline: 'none', background: 'transparent', color: '#cc0000', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'normal' }} />
                <span className="hidden print:inline-block text-[#cc0000] ml-2 font-normal">{formatDisplayDate(compRecord.task2_date_obs || '')}</span>
              </td>
              <td style={{ border: '1.5px solid #888', padding: '6px' }}></td>
              <td style={{ border: '1.5px solid #888', padding: '6px' }}></td>
            </tr>
            {[
              { id: 'case2_1', text: 'Did the Student accessed and read job instructions, including specific method & process requirements' },
              { id: 'case2_2', text: 'Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work' },
              { id: 'case2_3', text: 'Did the student apply precautions required to minimise hazard' },
              { id: 'case2_4', text: 'Did the student communicate with technical experts professionally' },
              { id: 'case2_5', text: 'Did the student interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation' },
              { id: 'case2_6', text: 'Did the student exhibit numeracy skills to take and analyse measurements' },
              { id: 'case2_7', text: 'Did the student select and use required personal protective equipment conforming to industry and OHS standards' },
              { id: 'case2_8', text: 'Did the student follow the safety procedures while setting the equipment' },
              { id: 'case2_9', text: 'Did the student install customer access network (CAN) cable' },
              { id: 'case2_10', text: 'Did the student operate test equipment to perform measurements on optical fibre' },
              { id: 'case2_11', text: 'Did the student perform fault clearance' },
            ].map(item => (
              <tr key={item.id}>
                <td style={{ border: '1.5px solid #888', padding: '6px' }}>{item.text}</td>
                <td style={{ border: '1.5px solid #888', padding: '6px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_${item.id}`]: 'Yes' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task2_${item.id}`] === 'Yes' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_${item.id}`]: 'No' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task2_${item.id}`] === 'No' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '1.5px solid #888', padding: '0' }}>
                  <textarea className="no-print" value={compRecord[`task2_${item.id}_comment`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task2_${item.id}_comment`]: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', padding: '4px', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
                  <div className="hidden print:block p-1 whitespace-pre-wrap">{compRecord[`task2_${item.id}_comment`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2: checklistItems[11-end] + declarations ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '24px' }}>
          <tbody>
            {[
              { id: 'case2_12', text: 'Did the student use diagnostic equipment' },
              { id: 'case2_13', text: 'Did the student use optical fibre jointing techniques' },
              { id: 'case2_14', text: 'Did the student use specialised tools and test equipment' },
              { id: 'case2_15', text: 'Did the Student exhibit knowledge in direct termination techniques' },
              { id: 'case2_16', text: 'Did the student exhibit knowledge in fusion splicing' },
              { id: 'case2_17', text: 'Did the student exhibit knowledge in mechanical splicing' },
              { id: 'case2_18', text: 'Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions' },
              { id: 'case2_19', text: 'Did the student undertake the task independently?' },
              { id: 'case2_20', text: 'Did the student demonstrate time management skill through the task?' },
              { id: 'case2_21', text: 'Did the student exhibit good communication skills?' },
              { id: 'case2_22', text: 'Did the student meet all the criteria for the task?' },
            ].map(item => (
              <tr key={item.id}>
                <td style={{ border: '1.5px solid #888', padding: '6px', width: '60%' }}>{item.text}</td>
                <td style={{ border: '1.5px solid #888', padding: '6px', textAlign: 'center', width: '15%' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_${item.id}`]: 'Yes' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task2_${item.id}`] === 'Yes' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-100'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_${item.id}`]: 'No' })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                        {compRecord[`task2_${item.id}`] === 'No' && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '1.5px solid #888', padding: '0', width: '25%' }}>
                  <textarea className="no-print" value={compRecord[`task2_${item.id}_comment`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task2_${item.id}_comment`]: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '30px', border: 'none', padding: '4px', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
                  <div className="hidden print:block p-1 whitespace-pre-wrap">{compRecord[`task2_${item.id}_comment`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '8px' }}>Comments/Feedback to Participant</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'task2')} style={{ flex: 1, borderBottom: '1px solid #888', minHeight: '24px', position: 'relative', cursor: 'pointer' }}>
                      {answers.student_signature_url ? <img src={answers.student_signature_url} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? 'Click to sign' : ''}</span>}
                    </div>
                    <div className="hidden print:block border-b border-[#888] flex-1 min-h-[24px] relative">
                      {answers.student_signature_url && <img src={answers.student_signature_url} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_task2 !== undefined ? compRecord.student_sig_date_task2 : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ width: '120px', border: 'none', borderBottom: '1px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }} />
                    <div className="hidden print:block border-b border-[#888] w-[120px] text-[#1e3a8a] font-bold text-center min-h-[20px]">{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_task2 !== undefined ? compRecord.student_sig_date_task2 : (submitDate || '')))}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid #888', padding: '8px', minHeight: '80px', marginBottom: '24px', fontSize: '9.5pt', position: 'relative' }}>
          <strong style={{ position: 'absolute', top: '8px', left: '8px' }}>Assessor's Feedback:</strong>
          <textarea className="no-print" value={compRecord.task2_assessor_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task2_assessor_feedback: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', marginTop: '24px', minHeight: '50px', border: 'none', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
          <div className="hidden print:block mt-[24px] whitespace-pre-wrap">{compRecord.task2_assessor_feedback}</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center', marginBottom: '16px' }}>Result: Satisfactory (S)/Not Satisfactory (NS)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'task2')} style={{ flex: 1, borderBottom: '1px solid #888', minHeight: '24px', position: 'relative', cursor: isStudent ? 'default' : 'pointer' }}>
                      {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? '' : 'Click to sign'}</span>}
                    </div>
                    <div className="hidden print:block border-b border-[#888] flex-1 min-h-[24px] relative">
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '120px', border: 'none', borderBottom: '1px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#cc0000', fontWeight: 'bold' }} />
                    <div className="hidden print:block border-b border-[#888] w-[120px] text-[#cc0000] font-bold text-center min-h-[20px]">{formatDisplayDate(compRecord.assessment_date || '')}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 3: student instructions + Q1-4 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task3.title || 'ASSESSMENT TASK 3 – WRITTEN QUESTIONS AND ANSWERS'}</h1>
        {task3.sections?.map((s: any, i: number) => (
          <div key={i} className="mb-3">{s.title && <h3 className="font-bold mb-1">{s.title}</h3>}<p className="whitespace-pre-wrap text-[9pt]">{s.content}</p></div>
        ))}
        <div className="mt-2">{task3.questions?.slice(0, 4).map((q: any) => renderQ(q, 'task3'))}</div>
        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 3: Q5-10 + student declaration ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div className="mt-2 mb-4">{task3.questions?.slice(4, 10).map((q: any) => renderQ(q, 'task3'))}</div>
        {renderStudentDecl('task3')}
        <PageFooter n={14} />
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 3: assessor feedback + result + assessor declaration + end checklist ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', textDecoration: 'underline' }}>{assessmentQuestions.metadata.code}- {assessmentQuestions.metadata.course} (Release 1)</div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        <div style={{ border: '1.5px solid #888', padding: '8px', minHeight: '120px', marginBottom: '24px', fontSize: '9.5pt', position: 'relative', marginTop: '60px' }}>
          <strong style={{ position: 'absolute', top: '8px', left: '8px' }}>Assessor's Feedback:</strong>
          <textarea className="no-print" value={compRecord.task3_assessor_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task3_assessor_feedback: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', marginTop: '24px', minHeight: '90px', border: 'none', outline: 'none', resize: 'vertical', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit' }} />
          <div className="hidden print:block mt-[24px] whitespace-pre-wrap">{compRecord.task3_assessor_feedback}</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center', marginBottom: '16px' }}>Result: Satisfactory (S)/Not Satisfactory (NS)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '60px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1.5px solid #888', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px', minWidth: '60px' }}>Signature:</span>
                    <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'task3')} style={{ flex: 1, borderBottom: '1px solid #888', minHeight: '24px', position: 'relative', cursor: isStudent ? 'default' : 'pointer' }}>
                      {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '10px', color: '#aaa', position: 'absolute', bottom: '2px', left: '4px' }}>{isStudent ? '' : 'Click to sign'}</span>}
                    </div>
                    <div className="hidden print:block border-b border-[#888] flex-1 min-h-[24px] relative">
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} style={{ height: '25px', position: 'absolute', left: '20px', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '60px' }}>Date:</span>
                    <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '120px', border: 'none', borderBottom: '1px solid #888', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', color: '#cc0000', fontWeight: 'bold' }} />
                    <div className="hidden print:block border-b border-[#888] w-[120px] text-[#cc0000] font-bold text-center min-h-[20px]">{formatDisplayDate(compRecord.assessment_date || '')}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontWeight: 'bold', fontSize: '16pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center', marginBottom: '24px' }}>END OF ASSESSMENT</div>

        <div style={{ fontSize: '10pt', paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{ marginBottom: '12px' }}>Before you hand in your assessment, make sure that you:</div>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Re-check your answers and make sure you are happy with your responses.</li>
            <li>Have written your Name on the first page and signed the student declaration below</li>
            <li>If you are submitting this assessment as a separate attachment, please attached an Assessment Submission Sheet available from the Student Administration or the ACTA intranet.</li>
          </ol>
        </div>

        <PageFooter n={15} />
      </div>

    </div>
  );
};
