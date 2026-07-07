import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions8';

interface Q8BookletProps {
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
  <div className="page-footer"><span></span><span>Page {n} of 19</span></div>
);

export const Q8Booklet: React.FC<Q8BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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

  const admin = assessmentQuestions.adminInfo as any;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const task4 = assessmentQuestions.task4 as any;

  const renderDeclarations = (taskKey: string) => (
    <div className="mt-6" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '12px' }}>Comments/Feedback to Participant</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #888', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ width: '55%', borderRight: '2px solid #888', padding: '12px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
            </td>
            <td style={{ width: '45%', padding: '12px', fontSize: '10pt', verticalAlign: 'middle' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1px solid black', flex: 1, minHeight: '24px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord[`${taskKey}_student_date`] !== undefined ? compRecord[`${taskKey}_student_date`] : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ flex: 1, border: 'none', borderBottom: '1px solid black', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer' }} />
                  <div className="hidden print:block" style={{ borderBottom: '1px solid black', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord[`${taskKey}_student_date`] !== undefined ? compRecord[`${taskKey}_student_date`] : (submitDate || '')))}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ border: '2px solid #888', padding: '8px', minHeight: '100px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', fontFamily: "'Times New Roman', serif", fontSize: '10.5pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..." value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }} readOnly={isStudent} />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px', fontSize: '10.5pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '14pt' }}>
        Result: Satisfactory{' '}
        <span className={`relative inline-block mx-1 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '0 2px' }}>
          (S){compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '130%', height: '140%', pointerEvents: 'none' }}></span>}
        </span>
        <span style={{ margin: '0 4px' }}>/</span>
        {' '}Not Satisfactory{' '}
        <span className={`relative inline-block mx-1 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '0 2px' }}>
          (NS){compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '130%', height: '140%', pointerEvents: 'none' }}></span>}
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #888' }}>
        <tbody>
          <tr>
            <td style={{ width: '55%', borderRight: '2px solid #888', padding: '12px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
            </td>
            <td style={{ width: '45%', padding: '12px', fontSize: '10pt', verticalAlign: 'middle' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid black', flex: 1, minHeight: '24px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} disabled={isStudent} style={{ flex: 1, border: 'none', borderBottom: '1px solid black', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                  <span className="hidden print:block" style={{ borderBottom: '1px solid black', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(compRecord.assessment_date || '')}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
      <div key={q.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '2px solid #888', borderLeft: '2px solid #888', borderRight: '2px solid #888' }}>
        {/* Question row */}
        <div style={{ display: 'flex', borderBottom: '1px solid #aaa', padding: '8px', background: '#fff' }}>
          <div style={{ flex: 1, fontSize: '10pt', color: '#000' }}>
            {q.id}. {q.text}
          </div>
        </div>
        {/* Answer row */}
        <div style={{ padding: '0', background: '#fff' }}>
            {q.type === 'text' && (
              <>
                <textarea required={isStudent} className="no-print" value={answers[qKey] || ''} onChange={(e) => isStudent && setAnswers({ ...answers, [qKey]: e.target.value })} disabled={!isStudent} style={{ width: '100%', minHeight: '100px', border: 'none', background: 'transparent', outline: 'none', padding: '8px', fontSize: '10pt', resize: 'vertical' }} />
                <div className="hidden print:block" style={{ padding: '8px', minHeight: '100px', whiteSpace: 'pre-wrap', fontSize: '10pt' }}>{answers[qKey]}</div>
              </>
            )}
            {q.type === 'text_inputs' && (
              <div style={{ padding: '8px' }}>
                {q.image && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><img src={q.image} alt="Diagram" style={{ maxWidth: '100%', maxHeight: '250px' }} /></div>}
                {q.textInputs?.map((ti: any, tIdx: number) => (
                  <div key={tIdx} style={{ marginBottom: '8px', fontSize: '10pt', display: 'flex' }}>
                    <span style={{ marginRight: '4px' }}>{ti.placeholder}</span>
                    <input required={isStudent} type="text" className="no-print" value={answers[ti.name] || ''} onChange={(e) => isStudent && setAnswers({ ...answers, [ti.name]: e.target.value })} disabled={!isStudent} style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1 }} />
                    <div className="hidden print:block">{answers[ti.name] || ''}</div>
                  </div>
                ))}
              </div>
            )}
            {q.type !== 'text' && q.type !== 'text_inputs' && (
              <div style={{ padding: '8px' }}>
                <textarea required={isStudent} className="no-print" value={answers[qKey] || ''} onChange={(e) => isStudent && setAnswers({ ...answers, [qKey]: e.target.value })} disabled={!isStudent} style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', outline: 'none', fontSize: '10pt', resize: 'vertical' }} />
              </div>
            )}
        </div>
        {/* Assessor Footer */}
        <div style={{ display: 'flex', borderTop: '1px solid #000', fontSize: '9pt', fontWeight: 'bold' }}>
          <div style={{ width: '40%', padding: '6px 8px', color: '#1e3a8a', borderRight: '1px solid #000', display: 'flex', alignItems: 'center' }}>
            Assessor to tick (☑)
          </div>
          <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' })} style={{ width: '30%', padding: '6px 8px', color: '#1e3a8a', borderRight: '1px solid #000', background: '#fce4d6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', border: '1.5px solid #1e3a8a', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ color: 'red', fontSize: '16px', lineHeight: 1 }}>✓</span>}
            </div>
            Satisfactory (S)
          </div>
          <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' })} style={{ width: '30%', padding: '6px 8px', color: '#1e3a8a', background: '#fce4d6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', border: '1.5px solid #1e3a8a', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ color: 'red', fontSize: '16px', lineHeight: 1 }}>✓</span>}
            </div>
            Not Satisfactory (NS)
          </div>
        </div>
      </div>
    );
  };

  const q8Styles = `
      .q8-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q8-booklet-view * { box-sizing: border-box; }
      .q8-booklet-view .page {
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
      .q8-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q8-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q8-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q8-booklet-view h3.task-label { font-size: 10.5pt; font-weight: bold; text-align: center; margin: 1mm 0 3mm; }
      .q8-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q8-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q8-booklet-view table td, .q8-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q8-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q8-booklet-view .field-label-cell { font-weight: bold; background: #f0f0f0; width: 38%; border: 1px solid #555; padding: 5px 6px; }
      .q8-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q8-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q8-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q8-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q8-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q8-booklet-view .page-footer {
        margin-top: auto; padding-top: 4mm; border-top: 1px solid #000;
        display: flex; justify-content: space-between; font-size: 8pt;
      }
      .q8-booklet-view .inner-header { margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
      .q8-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q8-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q8-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q8-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q8-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q8-booklet-view .question-block { margin-bottom: 8mm; }
      .q8-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q8-booklet-view { background: #fff !important; padding: 0 !important; }
        .q8-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }

      @media screen and (max-width: 800px) {
        .q8-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q8-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q8-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q8-booklet-view .flex, .q8-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q8-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q8-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q8-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q8-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q8-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q8-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  `;

  return (
    <div className="q8-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q8Styles }} />

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
      <div className="page" style={{ padding: '8mm 10mm' }}>
        <div style={{ border: '3.5px solid #1a5fa8', padding: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="cover-inner-border" style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }} />
            <div className="cover-title" style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
            <div className="cover-subtitle" style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>{assessmentQuestions.metadata.code}</div>
            <div className="cover-subtitle" style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm', textAlign: 'center' }}>
              Work safely on live optical fibre<br />
              installations (release 1)
            </div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="cover-student-name-container" style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '100%', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>ACTA College Pty. Ltd</div>
            </div>
          </div>
        </div>
        <PageFooter n={1} />
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page" style={{ padding: '12mm 14mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
          <div style={{ paddingTop: '8px' }}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
              {assessmentQuestions.adminInfo.unitCodeName}
            </span>
          </div>
          <div>
            <img src="/assets/Skilscope.png" alt="Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', margin: '0 0 12px 0', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT COMPETENCY RECORD</h1>
        
        <div style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '8px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px', lineHeight: '1.4' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '16px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '30%' }}>Student's Name</td>
              <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessor's Name</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <input type="text" className="no-print" placeholder="Enter Assessor's Name" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{compRecord.assessor_name}</div>
              </td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Site</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <input type="text" className="no-print" placeholder="Enter Assessment Site" value={compRecord.assessment_site || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_site: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{compRecord.assessment_site}</div>
              </td>
            </tr>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Date</td>
              <td className="border-[1.5px] border-black p-0">
                <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block p-1">{formatDisplayDate(compRecord.assessment_date || '')}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '16px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td colSpan={4} style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
                Assessor Declaration
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid #000', padding: '6px 8px', lineHeight: '1.4' }}>
                In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '55%' }}>
                Evidence is Confirmed as:
              </td>
              <td colSpan={2} style={{ border: '1.5px solid #000', padding: '0' }}>
                <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_valid: !compRecord.evidence_valid })} style={{ flex: 1, borderRight: '1.5px solid #000', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_valid && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Valid
                  </div>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_sufficient: !compRecord.evidence_sufficient })} style={{ flex: 1, borderRight: '1.5px solid #000', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_sufficient && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Sufficient
                  </div>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_current: !compRecord.evidence_current })} style={{ flex: 1, borderRight: '1.5px solid #000', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_current && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Current
                  </div>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_authentic: !compRecord.evidence_authentic })} style={{ flex: 1, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord.evidence_authentic && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> Authentic
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ background: '#f2f2f2', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
                Please attach the following documentation to this form
              </td>
              <td style={{ background: '#f2f2f2', border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>
                Result
              </td>
              <td rowSpan={5} style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px 8px', width: '30%', textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>FINAL ASSESSMENT<br/>RESULT:</div>
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
            {[1,2,3,4].map((num) => (
              <tr key={num}>
                <td style={{ border: '1.5px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>
                  Assessment Task {num}
                </td>
                <td style={{ border: '1.5px solid #000', padding: '6px 8px', width: '30%' }}>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50 inline-flex'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task${num}_attached`]: !compRecord[`task${num}_attached`] })} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{compRecord[`task${num}_attached`] && <span style={{ color: 'red', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}</div> {num === 4 ? 'Questions and Answers' : 'Observation'}
                  </div>
                </td>
                <td style={{ border: '1.5px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task${num}_result_page2`]: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                      {compRecord[`task${num}_result_page2`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid red', borderRadius: '50%', width: '100%', height: '100%', pointerEvents: 'none' }}></span>}
                      S
                    </span>
                    / 
                    <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task${num}_result_page2`]: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                      {compRecord[`task${num}_result_page2`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid red', borderRadius: '50%', width: '110%', height: '110%', pointerEvents: 'none' }}></span>}
                      NS
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '16px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px', width: '15%' }}>Attempt</th>
              <th style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px', width: '25%' }}>Date</th>
              <th style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px', width: '60%' }}>Assessor's Feedback (as Required):</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(attempt => (
              <tr key={attempt}>
                <td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold' }}>{attempt}</td>
                <td className="border-[1.5px] border-black p-0 align-middle">
                  <input type="date" className="no-print" value={toDateInputValue(compRecord[`attempt_${attempt}_date`] || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_date`]: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }} />
                  <div className="hidden print:block text-center">{formatDisplayDate(compRecord[`attempt_${attempt}_date`] || '')}</div>
                </td>
                <td style={{ border: '1.5px solid #000', padding: '0' }}>
                  <textarea className="no-print" placeholder="Feedback..." value={compRecord[`attempt_${attempt}_feedback`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_feedback`]: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                  <div className="hidden print:block" style={{ padding: '6px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{compRecord[`attempt_${attempt}_feedback`]}</div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ background: '#d9d9d9', border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1.5px solid #000', padding: '0' }}>
                <textarea className="no-print" placeholder="Final Feedback..." value={compRecord.final_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, final_feedback: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', minHeight: '40px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                <div className="hidden print:block" style={{ padding: '6px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{compRecord.final_feedback}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px', fontFamily: '"Times New Roman", Times, serif', marginLeft: '12px' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '0' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '8px 12px', width: '60%', verticalAlign: 'top', lineHeight: '1.4' }}>
                <strong>Student:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1.5px solid #000', padding: '8px 12px', width: '40%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <span style={{ marginRight: '8px' }}>Signature:</span>
                    <span style={{ flex: 1, borderBottom: '1.5px dotted #aaa' }}>&nbsp;</span>
                    {answers.student_signature_url && <img src={answers.student_signature_url} style={{ height: '30px', position: 'absolute', left: '60px', bottom: 0, mixBlendMode: 'multiply' }} />}
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date:</span>
                    <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_page2 !== undefined ? compRecord.student_sig_date_page2 : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #aaa', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer' }} />
                    <span className="hidden print:block border-b-[1.5px] border-dotted border-[#aaa] flex-1 min-h-[20px]">{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_page2 !== undefined ? compRecord.student_sig_date_page2 : (submitDate || '')))}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid #000', padding: '8px 12px', verticalAlign: 'top', lineHeight: '1.4' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1.5px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <span style={{ marginRight: '8px' }}>Signature:</span>
                    <span style={{ flex: 1, borderBottom: '1.5px dotted #aaa' }}>&nbsp;</span>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} style={{ height: '30px', position: 'absolute', left: '60px', bottom: 0, mixBlendMode: 'multiply' }} />}
                    <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'comp')} style={{ position: 'absolute', inset: 0, cursor: isStudent ? 'default' : 'pointer' }}></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date:</span>
                    <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ flex: 1, border: 'none', borderBottom: '1.5px dotted #aaa', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                    <span className="hidden print:block border-b-[1.5px] border-dotted border-[#aaa] flex-1 min-h-[20px]">{formatDisplayDate(compRecord.assessment_date || '')}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={2} />
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px', fontSize: '10pt', marginTop: '16px' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', fontSize: '11pt' }}>
                Administrative use only:
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '35%' }}>
                Entered into Student Management Database
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })} style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.admin_entered && <span style={{ color: 'black', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ marginRight: '8px' }}>Signature/Initial</span>
                  <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid #000', minWidth: '100px', height: '24px' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', left: '10px', mixBlendMode: 'multiply' }} />}
                    <div className="no-print" onClick={() => !isStudent && openSigModal('assessor_signature', 'comp')} style={{ position: 'absolute', inset: 0, cursor: isStudent ? 'default' : 'pointer' }}></div>
                  </div>
                  <span style={{ marginLeft: '12px', marginRight: '8px' }}>Date:</span>
                  <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid #000', minWidth: '100px', height: '24px' }}>
                    <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                    <div className="hidden print:block">{formatDisplayDate(compRecord.assessment_date || '')}</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>ICTBWN308 - Work safely on live optical fibre installations (Release 1)</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <div style={{ marginBottom: '4px' }}>ICTBWN307 Use optical measuring instruments</div>
              <div>ICTWHS204 Follow work health and safety and environmental policy and procedures</div>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>N/A</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 12px 0' }}>This unit describes the skills and knowledge required to work safely on a live optical fibre installation to test and commission a wavelength division multiplexing (WDM) system and to connect a splitter for fibre to the x (FTTx) deployment.</p>
              <p style={{ margin: 0 }}>It applies to fibre technicians who engage in safe work practices as members of a team using emerging technologies to deliver very high-speed broadband capacity through the access network for the national broadband network (NBN) initiative.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>No licensing, legislative or certification requirements apply to this unit at the time of publication.</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Conditions and context of the assessments</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 4px 0' }}>This unit of competency falls into the definition of high risk work and should be delivered and assessed in accordance with the national standard.<br/>Skills must be assessed in a workplace or simulated environment where conditions are typical of those in a telecommunications work environment or workplace.</p>
              <p style={{ margin: '0 0 4px 0' }}>Access is required to:</p>
              <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'disc' }}>
                <li>a WDM system and relevant optical splitter</li>
                <li>tools, equipment and personal protective equipment currently used in industry</li>
                <li>relevant regulatory and equipment documentation that impacts on work activities</li>
              </ul>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Specific Resources Required</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '8px' }}>Learner Guide</li>
                <li style={{ marginBottom: '8px' }}>Assessment Booklet</li>
                <li style={{ marginBottom: '8px' }}>Practical Workshop</li>
                <li style={{ marginBottom: '8px' }}>Manufacturers Manuals and specifications</li>
                <li>Workplace policy and procedures</li>
              </ul>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 12px 0' }}>Students who are unsuccessful at achieving competency at the first attempt will be offered coaching, information and additional time (other needs if required) before a second and possibly a third attempt is made. If the student is not able to satisfactorily complete the assessment after the third attempt the student will be deemed Not Competent and resulted as such. The student may re-enrol in the qualification at a later to date to gain successful completion of the unit/s.</p>
              <p style={{ margin: 0 }}>For further details refer to ACTA College Assessment Policy and Procedure.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              ACTA College considers plagiarism and cheating as serious student misconduct and this may result either in a student’s exclusion from a unit or course or may have to complete a re-assessment depending on individual case.
            </td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN CONTINUED ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px', fontSize: '10pt', marginTop: '16px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top', width: '35%' }}>Complaints and appeal</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: 0 }}>Where a student wishes to appeal an assessment decision they are required to notify their assessor in the first instance. Where appropriate the assessor may decide to re-assess the student to ensure a fair and equitable decision is gained. The assessor shall complete a written report regarding the re-assessment outlining the reasons why assessment was or was not granted.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessors Intervention</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 8px 0' }}>Assessors are to check that the student is ready for assessment, and defer the assessment if they are not. It is important that assessors do not teach at the assessment but allow students to competence for themselves.</p>
              <p style={{ margin: '0 0 8px 0' }}>Feedback is to be given at the completion of the assessment using the feedback to student. If a student does not meet a standard, the assessor is to sit down with them and assist them in their understanding. Should you disagree with the assessment outcome, you can appeal the decision as stated in the Student Handbook.</p>
              <p style={{ margin: 0 }}>Your student record must indicate that you have all required skills and knowledge in completing the task. For each assessment, the assessor is to act as a supervisor and not interfere with the assessment. In the event that the assessment activities will impact on your safety or that of others, the assessment must be stopped immediately.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Attaching documents</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 8px 0' }}>Attached documents are accepted but must be labelled with the following information:</p>
              <p style={{ margin: 0 }}>Unit Name and Title, Students name, Student ID, Date of Submissions, Student signature.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Instruction</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 8px 0' }}>Assessment is mapped to the unit and must be completed by the end of each unit. This is a summative assessment, which requires each student to have adequate practice prior to undertaking this assessment</p>
              <p style={{ margin: '0 0 8px 0' }}>The assessment consists of four tasks. Assessment Task 1, Assessment Task 2, Assessment Task 3 and Assessment Task 4</p>
              <p style={{ margin: '0 0 4px 0' }}>Assessment Task 1 is Observation</p>
              <p style={{ margin: '0 0 4px 0' }}>Assessment Task 2 is Observation</p>
              <p style={{ margin: '0 0 4px 0' }}>Assessment Task 3 is Observation</p>
              <p style={{ margin: '0 0 8px 0' }}>Assessment Task 4 is Written questions and answers</p>
              <p style={{ margin: '0 0 8px 0' }}>For answers to written questions, reports and projects, you must:</p>
              <ul style={{ margin: '0 0 8px 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '4px' }}>Print clearly in black or blue pen or type it as a word document</li>
                <li style={{ marginBottom: '4px' }}>Answer each of the key points and /or follow instructions</li>
                <li>Assessments written in pencil or are illegible will not be accepted.</li>
              </ul>
              <p style={{ margin: 0 }}>Ask your assessor if you do not understand any part of the assessment. Whilst your assessor cannot tell you the answer, he/she may be able to re-word a question or instruction to assist in a better understanding for you.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 1:</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>Use of optical  power measurement equipment and optical source</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 2:</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>Practical Demonstration<br/>Connecting and Testing optical Spliter</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 3:</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>Conduct live tests measuring optical signals at three wavelength division multiplexing (WDM) wavelengths on optical devices</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 4:</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>Written questions and answers</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '6px 8px' }}>
              <p style={{ margin: '0 0 4px 0' }}>Student must satisfactorily complete each assessment tasks to be Competent (C) in the unit.</p>
              <p style={{ margin: 0 }}>Student with unsatisfactory completion of any of the assignment tasks will be deemed Not Yet Competent (NYC).</p>
            </td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – REASONABLE ADJUSTMENT & COVER SHEET ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '10pt', marginTop: '16px' }}>
          <thead>
            <tr>
              <th colSpan={3} style={{ background: '#b3b3b3', border: '1px solid #000', padding: '6px 8px', textAlign: 'left' }}>Reasonable adjustment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '8px 12px' }}>
                <p style={{ margin: '0 0 12px 0' }}>To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.</p>
                <p style={{ margin: 0 }}>ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Reasonable adjustment provided</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Reason for reasonable adjustment</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', fontWeight: 'bold', textAlign: 'center', width: '34%' }}>Outcome</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'ra_edu', label: 'Educational and bilingual support' },
                    { key: 'ra_oral', label: 'Presenting questions orally' },
                    { key: 'ra_diagram', label: 'Presenting work instructions in diagrammatic or pictorial form instead of words and sentences' },
                    { key: 'ra_extra', label: 'Extra time to complete a course or assessment' },
                    { key: 'ra_other', label: 'Others:' }
                  ].map(opt => (
                    <div key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [opt.key]: !compRecord[opt.key] })} style={{ width: '12px', height: '12px', border: '1px solid #000', flexShrink: 0, marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', position: 'relative' }}>
                        {compRecord[opt.key] && <span style={{ position: 'absolute', top: '-6px', left: '-1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                      </div>
                      <span style={{ lineHeight: '1.2' }}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <textarea className="no-print" value={compRecord.adjustment_reason || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, adjustment_reason: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '120px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '120px' }}>{compRecord.adjustment_reason}</div>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', verticalAlign: 'top' }}>
                <textarea className="no-print" value={compRecord.adjustment_outcome || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, adjustment_outcome: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '120px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '120px' }}>{compRecord.adjustment_outcome}</div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ background: '#b4c6e7', padding: '6px 12px', fontWeight: 'bold', fontSize: '12pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px', display: 'inline-block', width: '100%' }}>
          COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT
        </div>
        <p style={{ fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '12px' }}>A cover sheet must be included with each submission of work.</p>
        <p style={{ fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>Work submitted without a signed cover sheet will be returned unmarked.</p>
        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1 OBSERVATION INSTRUCTIONS ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '16px' }}>ASSESSMENT TASK 1 OBSERVATION (PC 1.1-1.6, 2.1-2.6)</div>
          <div style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '16px' }}>PRACTICAL DEMONSTRATION</div>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>Use of optical power measurement equipment and optical source</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px' }}>Student instructions:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>In this assessment the candidate need to demonstrate their skills in use optical power test equipment evaluate test results at a fibre termination point (FTP) such as fibre cabinet or an underground closure. As instructed by the assessor the candidate will have to work on the equipment depending on the FTP and the resources available.<br/>The candidate need to follow the instructions and carry out the task appropriately.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>The candidate must ensure that all work planned will be conducted in line with regulatory requirements and safety/OHS considerations.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '24px' }}>The time your facilitator/assessor allocates you to complete the task will depend on the type of cable being prepared and the environment in which you are undertaking the task.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Steps Involved:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>Participants are required to Connect and measure optical level od three deffernt wave length. You will need to:measure signal of 1310nm, 1490nm and 1550nm</p>
        <ol style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '24px', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '12px', paddingLeft: '8px' }}>Use PON network online testing PON Optical Power Meter &gt;2s PERM F/P VFL Mode Recall Save REF/ Enter dBm/dB Threshold Fiber Optical Splitter ONT OLT PON Optical Power Meter &gt;2s PERM F/P VFL Mode ReCall Save REF/ Enter dBm/dB</li>
          <li style={{ marginBottom: '12px', paddingLeft: '8px' }}>Threshold Fiber Optical Splitter ONT OLT Testing configuration diagram of OLT port sending optical power averagely Testing configuration diagram of ONT Port sending optical power averagely 8 PON optical power meter After entering PON power meter function, it will show a testing interface on the screen. PON power meter can measure uplink signal 1310nm, downlink data signal 1490nm and downlink video signal 1550nm in the PON network at the same time. HI and LOW mean the result is out of the testing range. 9 PON optical power meter - quick judgemRemove bindings (kevlar, etc.) And prepare tight buffered fibres for splicing.</li>
        </ol>
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>ASSESSMENT TASK 1 – ASSESSOR CHECKLIST</div>
        </div>

        <p style={{ fontStyle: 'italic', fontSize: '10pt', lineHeight: '1.4', marginBottom: '12px' }}>This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '16px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Assessor Instructions:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '16px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px' }}>The following was observed during the observations:</div>

        <div style={{ paddingLeft: '140px', marginBottom: '24px' }}>
          {[
            "Interpret technical documents",
            "Liaison with experts",
            "Communication skills",
            "Read equipment manuals",
            "Appropriate cable installation",
            "Taking measurements",
            "Identify signal strength loss",
            "Identify the faults",
            "Suggest remedies"
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '60px', marginBottom: '10px', fontSize: '10pt' }}>
              <div style={{ width: '180px' }}>{item}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_obs_ch_${idx}`]: !compRecord[`task1_obs_ch_${idx}`] })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                  {compRecord[`task1_obs_ch_${idx}`] && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                </div>
                <span>Observation 1</span>
              </div>
            </div>
          ))}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center' }}>Checklist</th>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center', width: '20%' }}>Case 1</th>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center', width: '25%' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', fontWeight: 'bold' }}>Date Observed:</td>
              <td style={{ border: '2px solid #888', padding: '0' }}>
                <input type="date" className="no-print" value={toDateInputValue(compRecord.task1_date_observed || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task1_date_observed: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '34px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }} />
                <div className="hidden print:block" style={{ padding: '8px', textAlign: 'center' }}>{formatDisplayDate(compRecord.task1_date_observed || '')}</div>
              </td>
              <td style={{ border: '2px solid #888', padding: '8px' }}></td>
            </tr>
            {[
              "Did the Student accessed and read job instructions, including specific method & process requirements",
              "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
              "Did the student apply precautions required to minimise hazard",
              "Did the student exhibit good communication skills",
              "Did the student liaise with internal and external personnel on technical and operational matters",
              "Did the student relate to work associates, supervisors, team members and clients",
              "Did the student exhibit skills in interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation"
            ].map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: '2px solid #888', padding: '8px', lineHeight: '1.4' }}>{item}</td>
                <td style={{ border: '2px solid #888', padding: '8px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_case1_${idx}`]: 'Yes' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {compRecord[`task1_case1_${idx}`] === 'Yes' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_case1_${idx}`]: 'No' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {compRecord[`task1_case1_${idx}`] === 'No' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '2px solid #888', padding: '0' }}>
                  <textarea className="no-print" value={compRecord[`task1_comment_${idx}`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task1_comment_${idx}`]: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '40px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                  <div className="hidden print:block" style={{ padding: '4px', whiteSpace: 'pre-wrap' }}>{compRecord[`task1_comment_${idx}`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1: checklistItems[7-18] + declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '16px', marginTop: '16px' }}>
          <tbody>
            {[
              "Did the student take measurements in a correct manner",
              "Did the student analyse the output",
              "Did the student identify the causes of signal strength loss in optical fibre",
              "Did the student explain the reasons for signal strength loss",
              "Did the student comply with all related health and safety requirements and work practices",
              "Did the Student recognise the features and operating requirements of test equipment",
              "Did the Student describe how to operate equipment according to a test specification",
              "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
              "Did the student undertake the task independently?",
              "Did the student demonstrate time management skill through the task?",
              "Did the student exhibit good communication skills?",
              "Did the student meet all the criteria for the task?"
            ].map((item, idx) => {
              const globalIdx = idx + 7;
              return (
                <tr key={globalIdx}>
                  <td style={{ border: '2px solid #888', padding: '8px', lineHeight: '1.4' }}>{item}</td>
                  <td style={{ border: '2px solid #888', padding: '8px', textAlign: 'center', width: '20%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_case1_${globalIdx}`]: 'Yes' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {compRecord[`task1_case1_${globalIdx}`] === 'Yes' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                        </div> Yes
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_case1_${globalIdx}`]: 'No' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {compRecord[`task1_case1_${globalIdx}`] === 'No' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                        </div> No
                      </div>
                    </div>
                  </td>
                  <td style={{ border: '2px solid #888', padding: '0', width: '25%' }}>
                    <textarea className="no-print" value={compRecord[`task1_comment_${globalIdx}`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task1_comment_${globalIdx}`]: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '40px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                    <div className="hidden print:block" style={{ padding: '4px', whiteSpace: 'pre-wrap' }}>{compRecord[`task1_comment_${globalIdx}`]}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {renderDeclarations('task1')}
        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 2: observation + sections ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '16px' }}>ASSESSMENT TASK 2 – OBSERVATION (PC 3.1-3.6)</div>
          <div style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '16px' }}>Practical Demonstration</div>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>Connecting and Testing optical Splitter</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px' }}>Assessment Description</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>In this assessment task the candidate should complete a installation of an optical splitter in a fibre enclosure as per manufactures instructions the assessment environment and the resources available. Based on the information provided by the assessor to demonstrate connection of input and output port of a optical splitter in an appropriate enclosure.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '24px' }}>You must ensure that all work planned will be conducted in line with regulatory requirements and safety/WHS considerations.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Procedure</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>This assessment task is divided into two stages for proper understanding.</p>
        <ol style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '40px', marginBottom: '16px', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Prepare splitter for WDM testing</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Place the splitter in an enclosure</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Prepare Optical Source and PON Meter ready for measurement.</li>
        </ol>

        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>Step by step process:</p>
        <ol style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '40px', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Connect the splitter input the optical Source</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Connect the splitter output the PON meter</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Record the values of Splitter Input and Out put</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Repeat the steps for selection three wavelengths</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>View the LCD display to check the Level and record</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Check the LCD display for estimated loss acceptance level – industry specification of less than 0.05 dB is an acceptable level – anything higher than that means that the joint will need to be re-spliced.</li>
          <li style={{ marginBottom: '8px', paddingLeft: '8px' }}>Record all power level reading at various weave length and analyse the performance of each components</li>
        </ol>

        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 2: equipment image + assessor checklist intro + observationItems ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px', marginTop: '16px' }}>Equipments Required :</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', width: '100%' }}>
          {task2.sections?.filter((s: any) => s.type === 'image').map((s: any, i: number) => (
            <img key={i} src={s.src} alt={s.caption || 'Equipments Required'} style={{ width: '85%', maxHeight: '500px', objectFit: 'contain' }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</div>
        </div>

        <p style={{ fontStyle: 'italic', fontSize: '10pt', lineHeight: '1.4', marginBottom: '12px' }}>This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '16px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Assessor Instructions:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '16px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>The following was observed during the observations:</div>
        <ol style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '40px', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Prepare splitter for testing.</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Place the splitter in an enclosure.</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Prepare Optical Source and PON Meter ready for measurement</li>
        </ol>

        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2: checklistItems[0-21] (all) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginTop: '16px' }}>
          <thead>
            <tr>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center' }}>Checklist</th>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center', width: '20%' }}>Case 1</th>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center', width: '25%' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', fontWeight: 'bold' }}>Date Observed:</td>
              <td style={{ border: '2px solid #888', padding: '0' }}>
                <input type="date" className="no-print" value={toDateInputValue(compRecord.task2_date_observed || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task2_date_observed: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '34px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }} />
                <div className="hidden print:block" style={{ padding: '8px', textAlign: 'center' }}>{formatDisplayDate(compRecord.task2_date_observed || '')}</div>
              </td>
              <td style={{ border: '2px solid #888', padding: '8px' }}></td>
            </tr>
            {[
              "Did the Student accessed and read job instructions, including specific method & process requirements",
              "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
              "Did the student apply precautions required to minimise hazard",
              "Did the student communicate with technical experts professionally",
              "Did the student interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation",
              "Did the student exhibit numeracy skills to take and analyse measurements",
              "Did the student select and use required personal protective equipment conforming to industry and OHS standards",
              "Did the student follow the safety procedures while setting the equipment",
              "Did the student install customer access network (CAN) cable",
              "Did the student operate test equipment to perform measurements on optical fibre",
              "Did the student perform fault clearance",
              "Did the student use diagnostic equipment",
              "Did the student use optical fibre jointing techniques",
              "Did the student use specialised tools and test equipment",
              "Did the Student exhibit knowledge in direct termination techniques",
              "Did the student exhibit knowledge in fusion splicing",
              "Did the student exhibit knowledge in mechanical splicing",
              "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
              "Did the student undertake the task independently?",
              "Did the student demonstrate time management skill through the task?",
              "Did the student exhibit good communication skills?",
              "Did the student meet all the criteria for the task?"
            ].map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: '2px solid #888', padding: '6px 8px', lineHeight: '1.2' }}>{item}</td>
                <td style={{ border: '2px solid #888', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_case1_${idx}`]: 'Yes' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {compRecord[`task2_case1_${idx}`] === 'Yes' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_case1_${idx}`]: 'No' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {compRecord[`task2_case1_${idx}`] === 'No' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '2px solid #888', padding: '0' }}>
                  <textarea className="no-print" value={compRecord[`task2_comment_${idx}`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task2_comment_${idx}`]: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                  <div className="hidden print:block" style={{ padding: '2px', whiteSpace: 'pre-wrap' }}>{compRecord[`task2_comment_${idx}`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2: declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        {renderDeclarations('task2')}
        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 3: observation + sections ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '8px' }}>ASSESSMENT TASK 3 – OBSERVATION (PC 3.4-3.6, PC 4.1-4.3)</div>
          <div style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '8px' }}>Practical Demonstration</div>
          <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>Conduct live tests measuring optical signals at three wavelength division multiplexing (WDM) wavelengths on optical devices</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Student Instructions:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '8px' }}>In this assessment task the candidate should complete a Live tests measuring optical signals at three (Wavelength Division Multiplexing) wavelengths on optical devices in a fibre enclosure as per manufactures instructions the assessment environment and the resources available. Based on the information provided by the assessor the fusion splice need to demonstrate on the appropriate cable.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '8px' }}>For better understanding the assessor will demonstrate of measurements for:</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '24px' }}>You must ensure that all work planned will be conducted in line with regulatory requirements and safety/WHS considerations.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Procedure</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>This assessment task is divided into three stages for proper understanding.</p>
        <ol style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '40px', marginBottom: '16px', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Prepare splitter for testing.</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Place the splitter in an enclosure!</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Prepare Optical Source and PON Meter ready for measurement.</li>
        </ol>

        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginBottom: '12px' }}>Step by step process:</p>
        <ol style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '40px', listStyleType: 'decimal' }}>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Connect the splitter input the optical Source</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Connect the splitter output the PON meter</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Record the values of Splitter Input and Out put</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Repeat the steps for selection three wavelengths</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>View the LCD display to check the Level and record</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>
            Check the LCD display for estimated loss acceptance level – industry specification of less than 0.05 dB is an acceptable level – anything higher than that means that the joint will need to be re-spliced:
            <ul style={{ listStyleType: 'square', paddingLeft: '24px', marginTop: '4px' }}>
              <li>
                conduct acceptance tests for commissioning that cover:
                <ul style={{ listStyleType: 'circle', paddingLeft: '24px', marginTop: '4px' }}>
                  <li>delay</li>
                  <li>dispersion</li>
                  <li>optical attenuation and loss measurements</li>
                  <li>optical power levels</li>
                  <li>phase</li>
                </ul>
              </li>
              <li style={{ marginTop: '4px' }}>complete connection recording</li>
            </ul>
          </li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Seal secures the enclosures.</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Remove waste and fibre off cuts and dispose them according to environmental and safe work method requirements.</li>
          <li style={{ marginBottom: '4px', paddingLeft: '8px' }}>Complete the job record and notify appropriate personal of job completion and obtain sign-off.</li>
        </ol>
        
        <p style={{ fontSize: '10pt', lineHeight: '1.5', marginTop: '24px' }}>You may wish to incorporate the group activities into this assessment task, in which case you should use the group activities to gather the evidence required for this task.</p>
        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 3: assessor checklist + observationItems + checklistItems[0-9] ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</div>
        </div>

        <p style={{ fontStyle: 'italic', fontSize: '10pt', lineHeight: '1.4', marginBottom: '12px' }}>This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '16px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Assessor Instructions:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '16px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px' }}>The following was observed during the observations:</div>

        <div style={{ paddingLeft: '140px', marginBottom: '24px' }}>
          {[
            "Prepare test equipment",
            "Operation of test equipment",
            "Perform measurement",
            "Record all test result",
            "Remove waste as per environmental requirements"
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '60px', marginBottom: '4px', fontSize: '10pt' }}>
              <div style={{ width: '320px' }}>{item}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div className={isStudent ? '' : 'cursor-pointer hover:bg-gray-50'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_obs_ch_${idx}`]: !compRecord[`task3_obs_ch_${idx}`] })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                  {compRecord[`task3_obs_ch_${idx}`] && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                </div>
                <span>Observation 1</span>
              </div>
            </div>
          ))}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center' }}>Checklist</th>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center', width: '20%' }}>Case 1</th>
              <th style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', textAlign: 'center', width: '25%' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ background: '#b3b3b3', border: '2px solid #888', padding: '8px', fontWeight: 'bold' }}>Date Observed:</td>
              <td style={{ border: '2px solid #888', padding: '0' }}>
                <input type="date" className="no-print" value={toDateInputValue(compRecord.task3_date_observed || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, task3_date_observed: e.target.value })} disabled={isStudent} style={{ width: '100%', height: '100%', minHeight: '34px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }} />
                <div className="hidden print:block" style={{ padding: '8px', textAlign: 'center' }}>{formatDisplayDate(compRecord.task3_date_observed || '')}</div>
              </td>
              <td style={{ border: '2px solid #888', padding: '8px' }}></td>
            </tr>
            {[
              "Did the Student accessed and read job instructions, including specific method & process requirements",
              "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
              "Did the student apply precautions required to minimise hazard",
              "Did the student communicate with technical experts professionally",
              "Did the student interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation",
              "Did the student exhibit numeracy skills to take and analyse measurements",
              "Did the student select and use required personal protective equipment conforming to industry and OHS standards",
              "Did the student follow the safety procedures while setting the equipment",
              "Did the student install customer access network (CAN) cable",
              "Did the student operate test equipment to perform measurements on optical fibre"
            ].map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: '2px solid #888', padding: '6px 8px', lineHeight: '1.2' }}>{item}</td>
                <td style={{ border: '2px solid #888', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_case1_${idx}`]: 'Yes' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {compRecord[`task3_case1_${idx}`] === 'Yes' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> Yes
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_case1_${idx}`]: 'No' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {compRecord[`task3_case1_${idx}`] === 'No' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '2px solid #888', padding: '0' }}>
                  <textarea className="no-print" value={compRecord[`task3_comment_${idx}`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task3_comment_${idx}`]: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                  <div className="hidden print:block" style={{ padding: '2px', whiteSpace: 'pre-wrap' }}>{compRecord[`task3_comment_${idx}`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PageFooter n={14} />
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 3: checklistItems[10-end] + declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginTop: '16px', marginBottom: '16px' }}>
          <tbody>
            {[
              "Did the student perform fault clearance",
              "Did the student use diagnostic equipment",
              "Did the student use optical fibre jointing techniques",
              "Did the student use specialised tools and test equipment",
              "Did the Student exhibit knowledge in direct termination techniques",
              "Did the student exhibit knowledge in mechanical splicing",
              "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
              "Did the student undertake the task independently?",
              "Did the student demonstrate time management skill through the task?",
              "Did the student exhibit good communication skills?",
              "Did the student meet all the criteria for the task?"
            ].map((item, idx) => {
              const globalIdx = idx + 10;
              return (
                <tr key={globalIdx}>
                  <td style={{ border: '2px solid #888', padding: '6px 8px', lineHeight: '1.2' }}>{item}</td>
                  <td style={{ border: '2px solid #888', padding: '6px 8px', textAlign: 'center', width: '20%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_case1_${globalIdx}`]: 'Yes' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {compRecord[`task3_case1_${globalIdx}`] === 'Yes' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                        </div> Yes
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task3_case1_${globalIdx}`]: 'No' })} style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {compRecord[`task3_case1_${globalIdx}`] === 'No' && <span style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                        </div> No
                      </div>
                    </div>
                  </td>
                  <td style={{ border: '2px solid #888', padding: '0', width: '25%' }}>
                    <textarea className="no-print" value={compRecord[`task3_comment_${globalIdx}`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`task3_comment_${globalIdx}`]: e.target.value })} disabled={isStudent} style={{ width: '100%', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                    <div className="hidden print:block" style={{ padding: '2px', whiteSpace: 'pre-wrap' }}>{compRecord[`task3_comment_${globalIdx}`]}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {renderDeclarations('task3')}
        <PageFooter n={15} />
      </div>

      {/* ═══════════════════ PAGE 16 – TASK 4: student instructions + Q1-4 ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>ASSESSMENT TASK 4: WRITTEN QUESTIONS AND ANSWERS</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Student Instructions:</div>
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '12px' }}>This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45-60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 4 in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.</p>
        
        <p style={{ fontSize: '10pt', lineHeight: '1.4', marginBottom: '8px' }}>Make sure you:</p>
        <ul style={{ fontSize: '10pt', lineHeight: '1.5', paddingLeft: '40px', listStyleType: 'disc', marginBottom: '24px' }}>
          <li>Answer all questions</li>
          <li>Print clearly</li>
          <li>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
          <li>Ask your assessor if you do not understand a question. Whist your assessor cannot tell you the answer, he/she may be able to re-word the question for you</li>
          <li>Do not talk to your classmates. If you are caught discussion the answers you will be asked to leave and your assessment will not be marked.</li>
          <li>Do not cheat. Anyone caught cheating will automatically be marked Not Competent for this unit. There are NO EXCEPTIONS to this rule.</li>
        </ul>
        
        <div style={{ borderTop: '2px solid #888' }}>
          <div style={{ background: '#5b9bd5', color: '#000', fontWeight: 'bold', textAlign: 'center', padding: '6px', fontSize: '11pt', borderLeft: '2px solid #888', borderRight: '2px solid #888', borderBottom: '2px solid #888' }}>
            Questions
          </div>
          {task4.questions?.slice(0, 4).map((q: any) => renderQ(q, 'task4'))}
        </div>
        <PageFooter n={16} />
      </div>

      {/* ═══════════════════ PAGE 17 – TASK 4: Q5-8 ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ borderTop: '2px solid #888', marginTop: '16px' }}>
          {task4.questions?.slice(4, 8).map((q: any) => renderQ(q, 'task4'))}
        </div>
        <PageFooter n={17} />
      </div>

      {/* ═══════════════════ PAGE 18 – TASK 4: Q9-15 ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ borderTop: '2px solid #888', marginTop: '16px' }}>
          {task4.questions?.slice(8, 15).map((q: any) => renderQ(q, 'task4'))}
        </div>
        <PageFooter n={18} />
      </div>

      {/* ═══════════════════ PAGE 19 – TASK 4: Q16-19 + declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ borderTop: '2px solid #888', marginTop: '16px', marginBottom: '16px' }}>
          {task4.questions?.slice(15).map((q: any) => renderQ(q, 'task4'))}
        </div>
        {renderDeclarations('task4')}
        <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '16px', fontSize: '11pt' }}>END OF ASSESSMENT</div>
        <PageFooter n={19} />
      </div>

    </div>
  );
};
