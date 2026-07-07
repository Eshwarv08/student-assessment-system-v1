import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions5';

const InnerHeader = () => (
  <div className="inner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
    <div style={{ marginTop: '12px' }}>
      <span style={{ textDecoration: 'underline', fontStyle: 'italic', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
        {assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}
      </span>
    </div>
    <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div className="page-footer" style={{ marginTop: 'auto', paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#555', fontFamily: '"Times New Roman", Times, serif' }}>
    <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V1.1</span>
    <span>Page {n} of 14</span>
  </div>
);

interface Q5BookletProps {
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

export const Q5Booklet: React.FC<Q5BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
    if (!d) return 'mm/dd/yyyy';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  };

  // ── Declarations block reused at end of each task ──
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
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '30px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? (
                      <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>
                    )}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '30px', paddingLeft: '4px' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'pointer' : 'default' }} className={!isStudent ? 'pointer-events-none' : ''}
                      value={answers.student_date || submitDate?.split('T')[0] || ''} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', paddingLeft: '4px', fontWeight: 'bold' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '120px', marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea
          className="no-print"
          style={{ width: '100%', minHeight: '90px', border: 'none', resize: 'vertical', fontFamily: "'Times New Roman', serif", fontSize: '10.5pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..."
          value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }}
          readOnly={isStudent}
        />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '90px', fontSize: '10.5pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '12.5pt' }}>
        Result:{' '}
        <span className={`cursor-pointer mx-2 ${isStudent ? 'cursor-default' : ''}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '4px' }}>
          Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>S{compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span className={`cursor-pointer mx-2 ${isStudent ? 'cursor-default' : ''}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          Not Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>NS{compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '30px', height: '30px', pointerEvents: 'none' }}></span>}</span>)
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
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '30px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                    )}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', paddingLeft: '4px' }}>
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

  // ── Single question block for task1 ──
  const renderQ1 = (q: any, isFirst: boolean = false) => (
    <React.Fragment key={q.id}>
      {isFirst && (
        <tr>
          <th colSpan={3} style={{ background: '#4a86e8', color: '#fff', textAlign: 'center', fontWeight: 'bold', padding: '6px', border: '1px solid #000' }}>Questions</th>
        </tr>
      )}
      <tr>
        <td colSpan={3} style={{ padding: '8px 12px', border: '1px solid #000', borderBottom: 'none' }}>
          {q.id}. &nbsp; {q.text}
        </td>
      </tr>
      <tr>
        <td colSpan={3} style={{ padding: '8px 12px', minHeight: '120px', border: '1px solid #000', borderTop: 'none' }}>
          {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
            <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input required={isStudent} type="radio" checked={answers[opt.name || `t1q${q.id}`] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || `t1q${q.id}`]: opt.value })} />
              <label>{opt.text}</label>
            </div>
          ))}
          {q.type === 'text' && (
            <textarea
              style={{ width: '100%', minHeight: '100px', resize: 'vertical', border: 'none', outline: 'none', background: 'transparent' }}
              value={answers[`t1q${q.id}`] || ''}
              onChange={(e) => setAnswers({ ...answers, [`t1q${q.id}`]: e.target.value })}
            />
          )}
        </td>
      </tr>
      <tr>
        <td style={{ width: '40%', padding: '6px 8px', fontWeight: 'bold', color: '#0000ff', border: '1px solid #000', background: '#fff' }}>Assessor to tick (☑)</td>
        <td style={{ width: '30%', padding: '6px 8px', background: '#fae3d9', color: '#0000ff', fontWeight: 'bold', border: '1px solid #000', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_q${q.id}_result`]: 'S' })}>
          <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '1.5px solid #0000ff', background: '#fff', color: 'red', textAlign: 'center', lineHeight: '14px', marginRight: '6px', verticalAlign: 'middle', fontWeight: 'bold' }}>
            {compRecord[`task1_q${q.id}_result`] === 'S' ? '✓' : ''}
          </span>
          Satisfactory (S)
        </td>
        <td style={{ width: '30%', padding: '6px 8px', background: '#fae3d9', color: '#0000ff', fontWeight: 'bold', border: '1px solid #000', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_q${q.id}_result`]: 'NS' })}>
          <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '1.5px solid #0000ff', background: '#fff', color: 'red', textAlign: 'center', lineHeight: '14px', marginRight: '6px', verticalAlign: 'middle', fontWeight: 'bold' }}>
            {compRecord[`task1_q${q.id}_result`] === 'NS' ? '✓' : ''}
          </span>
          Not Satisfactory (NS)
        </td>
      </tr>
    </React.Fragment>
  );

  // ── Checklist table header ──
  const ChecklistHead = () => (
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

  const renderObsRows = (items: string[]) => items.map((item, idx) => (
    <tr key={`obs-${idx}`}>
      <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
      <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_obs_${idx}`]: 'yes' })}>
        {compRecord[`task2_obs_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
      </td>
      <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_obs_${idx}`]: 'no' })}>
        {compRecord[`task2_obs_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
      </td>
    </tr>
  ));

  const renderChkRows = (items: string[], start: number, end: number) => items.slice(start, end).map((item, i) => {
    const idx = start + i;
    return (
      <tr key={`chk-${idx}`}>
        <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
        <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${idx}`]: 'yes' })}>
          {compRecord[`task2_chk_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
        </td>
        <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${idx}`]: 'no' })}>
          {compRecord[`task2_chk_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
        </td>
      </tr>
    );
  });

  const q5Styles = `
      .q5-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q5-booklet-view * {
        box-sizing: border-box;
      }
      .q5-booklet-view .page {
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
      .q5-booklet-view h1.section-title {
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
      .q5-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q5-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q5-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q5-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q5-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q5-booklet-view table td, .q5-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q5-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q5-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q5-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q5-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q5-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q5-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q5-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q5-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a;
      }
      .q5-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q5-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q5-booklet-view .page-footer {
        margin-top: auto;
      }
      .q5-booklet-view .inner-header {
      }
      .q5-booklet-view .inner-header .top-row {
      }
      .q5-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q5-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q5-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q5-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q5-booklet-view .question-block { margin-bottom: 8mm; }
      .q5-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q5-booklet-view { background: #fff !important; padding: 0 !important; }
        .q5-booklet-view .page {
          margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important;
        }
      }
  `;

  const admin = assessmentQuestions.adminInfo;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const qs = task1.questions as any[];

  return (
    <div className="q5-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q5Styles }} />

      {/* Signature Modal */}
      {sigModal?.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] text-white p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">
                {sigModal?.field === 'student_signature' ? 'Student Signature' : 'Assessor Signature'}
              </h3>
              <button onClick={closeSigModal} className="text-slate-400 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
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

      {/* ═══════════════════ PAGE 1 – COVER ═══════════════════ */}
      <div className="page" style={{ padding: '10mm' }}>
        <div style={{ border: '1px solid #8daac9', padding: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '3px double #8daac9', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '160px', height: 'auto', objectFit: 'contain', marginTop: '10mm' }} />
            <div style={{ color: '#8b0000', fontSize: '11pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', marginTop: '2mm', marginBottom: '10mm' }}>RTO NO: 40954</div>
            
            <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '3mm', letterSpacing: '0.5px' }}>Assessment Booklet</div>
            
            <div style={{ background: '#8daac9', height: '10px', width: '90%', marginBottom: '8mm' }}></div>
            
            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'center', marginBottom: '2mm' }}>
              ICTCBL254
            </div>
            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'center', lineHeight: 1.3 }}>
              Joint metallic conductor cable in<br />
              access network
            </div>
            
            <div style={{ width: '75%', marginTop: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: '40mm' }}>
              <div className="cover-student-name-container" style={{ fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.5px solid #888', flex: 1, minWidth: '60mm', paddingLeft: '8px', marginLeft: '6px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left', fontWeight: 'normal', height: '1.2em' }}>{studentName}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', color: '#555', position: 'absolute', bottom: '20mm', width: '100%' }}>ACTA College Pty. Ltd</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        
        <h1 className="section-title" style={{ textAlign: 'left', textTransform: 'uppercase', fontFamily: '"Times New Roman", Times, serif', fontSize: '13pt', margin: '0 0 4px 0' }}>ASSESSMENT COMPETENCY RECORD</h1>
        <div style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', marginBottom: '8px', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'justify' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', width: '20%' }}>Student ID and<br/>Name:</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', width: '40%' }}>{studentName}</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', width: '20%' }}>Final Assessment<br/>Date:</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', width: '20%' }}>{formatDisplayDate(compRecord.assessment_date)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #000', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <div style={{ background: '#d9d9d9', padding: '4px 6px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Assessor Declaration</div>
          <div style={{ padding: '6px 8px' }}>In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.</div>
          <div style={{ display: 'flex', borderTop: '1px solid #000', borderBottom: '1px solid #000', background: '#d9d9d9' }}>
            <div style={{ padding: '4px 6px', fontWeight: 'bold', flex: 1, borderRight: '1px solid #000' }}>Evidence is confirmed as:</div>
            <div style={{ padding: '4px 6px', display: 'flex', gap: '20px', background: '#fff', alignItems: 'center' }}>
              {['valid', 'sufficient', 'current', 'authentic'].map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`evidence_${type}`]: !compRecord[`evidence_${type}`] })}>
                  <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', position: 'relative' }}>
                    {compRecord[`evidence_${type}`] && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span> {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
            <tbody>
              <tr style={{ background: '#d9d9d9', fontWeight: 'bold' }}>
                <td colSpan={2} style={{ border: '1px solid #000', borderTop: 'none', borderLeft: 'none', padding: '4px 6px' }}>Please attach the following documentation to this form</td>
                <td style={{ border: '1px solid #000', borderTop: 'none', padding: '4px 6px', textAlign: 'center', width: '15%' }}>Result</td>
                <td rowSpan={4} style={{ border: '1px solid #000', borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '4px 6px', textAlign: 'center', verticalAlign: 'middle', width: '28%', background: '#d9d9d9' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>FINAL ASSESSMENT<br />RESULT:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', paddingLeft: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'C' })}>
                      <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '6px', position: 'relative', background: '#fff' }}>
                        {compRecord.final_result === 'C' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '16px' }}>✓</span>}
                      </span>
                      Competent (C)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'NC' })}>
                      <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '6px', position: 'relative', background: '#fff' }}>
                        {compRecord.final_result === 'NC' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '16px' }}>✓</span>}
                      </span>
                      Not Competent (NC)
                    </label>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', borderLeft: 'none', padding: '4px 6px', fontWeight: 'bold', width: '25%' }}>Assessment Task 1</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, doc_task1: !compRecord.doc_task1 })}>
                  <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', position: 'relative' }}>
                    {compRecord.doc_task1 && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span> Questions and Answers
                </td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}>
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'S' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    S {compRecord.task1_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '28px', height: '28px', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task1_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '28px', height: '28px', pointerEvents: 'none' }}></span>}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', borderLeft: 'none', padding: '4px 6px', fontWeight: 'bold' }}>Assessment Task 2</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, doc_task2: !compRecord.doc_task2 })}>
                  <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', position: 'relative' }}>
                    {compRecord.doc_task2 && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span> Observation
                </td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}>
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'S' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    S {compRecord.task2_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '28px', height: '28px', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task2_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '28px', height: '28px', pointerEvents: 'none' }}></span>}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', borderLeft: 'none', borderBottom: 'none', padding: '4px 6px', fontWeight: 'bold' }}>Assessment Task 3</td>
                <td style={{ border: '1px solid #000', borderBottom: 'none', padding: '4px 6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, doc_task3: !compRecord.doc_task3 })}>
                  <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', position: 'relative' }}>
                    {compRecord.doc_task3 && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span> Report
                </td>
                <td style={{ border: '1px solid #000', borderBottom: 'none', padding: '4px 6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}>
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'S' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    S {compRecord.task3_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '28px', height: '28px', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task3_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '28px', height: '28px', pointerEvents: 'none' }}></span>}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <thead>
            <tr style={{ background: '#d9d9d9' }}>
              <th style={{ border: '1px solid #000', padding: '4px 6px', width: '12%', fontWeight: 'bold' }}>Attempt</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', width: '15%', fontWeight: 'bold' }}>Date</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', width: '73%', fontWeight: 'bold' }}>Assessor's feedback (as required):</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', maxHeight: '30px', fontWeight: 'bold' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="date" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print" value={compRecord.attempts?.[0]?.date || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[0]) att[0] = { date: '', feedback: '' }; att[0].date = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} readOnly={isStudent} />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[0]?.date)}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="text" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5" value={compRecord.attempts?.[0]?.feedback || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[0]) att[0] = { date: '', feedback: '' }; att[0].feedback = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} placeholder="Provide attempt 1 feedback" readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', maxHeight: '30px', fontWeight: 'bold' }}>2</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="date" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print" value={compRecord.attempts?.[1]?.date || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[1]) att[1] = { date: '', feedback: '' }; att[1].date = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} readOnly={isStudent} />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[1]?.date)}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="text" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5" value={compRecord.attempts?.[1]?.feedback || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[1]) att[1] = { date: '', feedback: '' }; att[1].feedback = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} placeholder="Provide attempt 2 feedback" readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', maxHeight: '30px', fontWeight: 'bold' }}>3</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="date" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print" value={compRecord.attempts?.[2]?.date || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[2]) att[2] = { date: '', feedback: '' }; att[2].date = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} readOnly={isStudent} />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[2]?.date)}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="text" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5" value={compRecord.attempts?.[2]?.feedback || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[2]) att[2] = { date: '', feedback: '' }; att[2].feedback = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} placeholder="Provide attempt 3 feedback" readOnly={isStudent} />
              </td>
            </tr>
            <tr style={{ background: '#d9d9d9' }}>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px', background: '#fff' }}>
                <textarea className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs py-0.5" value={compRecord.final_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, final_feedback: e.target.value })} placeholder="Enter final summary feedback here..." readOnly={isStudent} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '9.5pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center', marginBottom: '4px' }}>DO NOT SIGN BELOW UNTIL FINAL ASSESSMENTS RESULT IS GRANTED BY THE ASSESSOR.</div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 10px', width: '60%', verticalAlign: 'top' }}>
                <p style={{ margin: '0 0 4px 0', lineHeight: '1.4' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px 10px', width: '40%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '12px' }}>
                  <span>Signature: </span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '12px' }}>
                  <span>Name: </span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px' }}>
                    <input type="text" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0 }}
                      value={compRecord.assessor_name || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessor_name: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px' }}>
                    {compRecord.assessor_name || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <span>Date: </span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '30px', marginLeft: '4px', textAlign: 'center' }}>
                    {formatDisplayDate(compRecord.assessment_date)}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 10px', verticalAlign: 'top' }}>
                <p style={{ margin: '0 0 4px 0', lineHeight: '1.4' }}><span style={{ fontWeight: 'bold' }}>Student:</span> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.</p>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px 10px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
                  <span>Signature: </span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <span>Date: </span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                      value={answers.student_date || submitDate?.split('T')[0] || ''} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '30px', marginLeft: '4px', textAlign: 'center' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={2} />
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            <tr style={{ background: '#d9d9d9' }}>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Administrative use only:</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', width: '35%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', marginRight: '4px', position: 'relative' }}>{compRecord.admin_entered && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold' }}>✓</span>}</span>
                    Signature/Initial:
                  </span>
                  <div onClick={() => !isStudent && openSigModal('assessor_signature', 'comp')} className="cursor-pointer inline-flex items-center justify-center w-[100px] min-h-[20px] border-b-[1.5px] border-black relative" style={{ cursor: isStudent ? 'default' : 'pointer' }}>
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="h-[30px] object-contain absolute bottom-0 mix-blend-multiply" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    Date:
                    <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '110px', display: 'inline-block', height: '18px', position: 'relative' }}>
                      <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }} className={isStudent ? 'pointer-events-none' : ''}
                        value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                    </span>
                    <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '110px', height: '16px' }}>
                      {formatDisplayDate(compRecord.assessment_date)}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>
              This unit describes the skills and knowledge required to joint metallic, conductor cable on the service provider side of the network boundary in communications applications, including digital and analog, telephony, data, video, digital broadcasting, computer networks, local area networks (LANs), wide area networks (WANs) and multimedia.<br/><br/>
              It applies to individuals working in technical roles who joint metallic conductor cable for indoor and outdoor installations on new installations and cable upgrades, and maintain infrastructure in domestic, commercial and industrial situations for service providers and asset owners.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Conditions and<br/>context of the<br/>assessments</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              Skills must be assessed in a workplace or simulated environment where conditions are typical of those in a telecommunications work environment or workplace.<br/><br/>
              Access is required to:<br/>
              <ul style={{ margin: '8px 0', paddingLeft: '40px' }}>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>site/s where jointing metallic conductor cable can be performed</li>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>cable testing equipment currently used in industry</li>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>relevant regulatory and equipment documentation that impacts on cable jointing activities.</li>
              </ul>
              Assessors of this unit must satisfy the requirements for assessors in applicable vocational education and training legislation, frameworks and/or standards. Refer also to the <i>Requirements for assessors</i> in the ICT Information and Communications Technology Training Package Companion Volume Implementation Guide.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Specific Resources<br/>Required</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <ul style={{ margin: '4px 0', paddingLeft: '40px' }}>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>Learner Guide</li>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>Assessment Booklet</li>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>Practical Workshop</li>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>Manufacturers Manuals and specifications</li>
                <li style={{ listStyleType: 'disc', marginBottom: '6px' }}>Workplace policy and procedures</li>
              </ul>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>
              Students who are unsuccessful at achieving competency at the first attempt will be offered coaching, information and additional time (other needs if required) before a second and possibly a third attempt is made. If the student is not able to satisfactorily complete the assessment after the third attempt the student will be deemed Not Competent and resulted as such. The student may re-enrol in the qualification at a later date to gain successful completion of the unit/s.<br/><br/>
              For further details refer to ACTA College Assessment Policy and Procedure.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.plagiarism}</td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN CONTINUED ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', width: '25%', verticalAlign: 'top' }}>Complaints and<br/>appeal</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.complaintsAndAppeals}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessors<br/>Intervention</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              Assessors are to check that the student is ready for assessment, and defer the assessment if they are not. It is important that assessors do not teach at the assessment but allow students to competence for themselves.<br/><br/>
              Feedback is to be given at the completion of the assessment using the feedback to student. If a student does not meet a standard, the assessor is to sit down with them and assist them in their understanding. Should you disagree with the assessment outcome, you can appeal the decision as stated in the Student Handbook.<br/><br/>
              Your student record must indicate that you have all required skills and knowledge in completing the task. For each assessment, the assessor is to act as a supervisor and not interfere with the assessment. In the event that the assessment activities will impact on your safety or that of others, the assessment must be stopped immediately.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Attaching<br/>documents</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              Attached documents are accepted but must be labelled with the following information:<br/><br/>
              Unit Name and Title, Students name, Student ID, Date of Submissions, Student signature.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment<br/>Instruction</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              Assessment is mapped to the unit and must be completed by the end of each unit. This is a summative assessment, which requires each student to have adequate practice prior to undertaking this assessment<br/><br/>
              The assessment consists of three tasks:<br/>
              Assessment Task 1 is Written questions and answers<br/>
              Assessment Task 2 is Observation<br/>
              Assessment Task 3 is Report<br/><br/>
              For answers to written questions, reports and projects, you must:<br/>
              <span style={{ fontSize: '14px', lineHeight: '1', verticalAlign: 'middle', marginRight: '4px' }}>•</span> Print clearly in black or blue pen or type it as a word document<br/>
              <span style={{ fontSize: '14px', lineHeight: '1', verticalAlign: 'middle', marginRight: '4px' }}>•</span> Answer each of the key points and /or follow instructions<br/>
              <span style={{ fontSize: '14px', lineHeight: '1', verticalAlign: 'middle', marginRight: '4px' }}>•</span> Assessments written in pencil or are illegible will not be accepted.<br/><br/>
              Ask your assessor if you do not understand any part of the assessment. Whilst your assessor cannot tell you the answer, he/she may be able to re-word a question or instruction to assist in a better understanding for you.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 1:</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.task1Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 2:</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>
              For this observation, students are required to demonstrate their skills on select and prepare a small copper joint with 1x 30 pair copper cable with 2x10 pair cables to inserted and joint them as per work instruction. The students need to analyse the situation and use appropriate tools and equipment required to carry out the work. Student would be allocated sufficient time for each component to conduct the practical task.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 3:</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.task3Description}</td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN CONTINUED ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt', marginBottom: '16px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', borderTop: 'none', padding: '4px 6px', width: '25%' }}></td><td style={{ border: '1px solid #000', borderTop: 'none', padding: '4px 6px' }}>
              Additionally, the student need to carry out a maintenance check on the tools and report faults to the assessor. This report should include the student's opinion about the condition of each tool.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency<br/>Decision</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <thead>
            <tr style={{ background: '#b0b0b0' }}>
              <th colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left', fontWeight: 'bold' }}>Reasonable adjustment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '8px' }}>
                To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.<br/><br/>
                ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.
              </td>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '6px', width: '35%', textAlign: 'center' }}>Reasonable adjustment provided</th>
              <th style={{ border: '1px solid #000', padding: '6px', width: '35%', textAlign: 'center' }}>Reason for reasonable adjustment</th>
              <th style={{ border: '1px solid #000', padding: '6px', width: '30%', textAlign: 'center' }}>Outcome</th>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top', lineHeight: '1.8' }}>
                <div style={{ paddingLeft: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_educational: !compRecord.ra_educational })}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', marginRight: '6px', position: 'relative' }}>{compRecord.ra_educational && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold' }}>✓</span>}</span> Educational and bilingual support
                </div>
                <div style={{ paddingLeft: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_oral: !compRecord.ra_oral })}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', marginRight: '6px', position: 'relative' }}>{compRecord.ra_oral && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold' }}>✓</span>}</span> Presenting questions orally
                </div>
                <div style={{ paddingLeft: '8px', lineHeight: '1.4', margin: '4px 0', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_diagrammatic: !compRecord.ra_diagrammatic })}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', marginRight: '6px', position: 'relative' }}>{compRecord.ra_diagrammatic && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold' }}>✓</span>}</span> Presenting work instructions in<br/>&nbsp;&nbsp;&nbsp;&nbsp;diagrammatic or pictorial form<br/>&nbsp;&nbsp;&nbsp;&nbsp;instead of words and sentences
                </div>
                <div style={{ paddingLeft: '8px', lineHeight: '1.4', margin: '4px 0', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_extratime: !compRecord.ra_extratime })}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', marginRight: '6px', position: 'relative' }}>{compRecord.ra_extratime && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold' }}>✓</span>}</span> Extra time to complete a course or<br/>&nbsp;&nbsp;&nbsp;&nbsp;assessment
                </div>
                <div style={{ paddingLeft: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_others: !compRecord.ra_others })}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', marginRight: '6px', position: 'relative' }}>{compRecord.ra_others && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold' }}>✓</span>}</span> Others:
                  <input type="text" className="no-print" style={{ borderBottom: '1px solid #000', background: 'transparent', outline: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginLeft: '6px', width: '100px' }} value={compRecord.ra_others_text || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_others_text: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', marginLeft: '6px', width: '100px' }}>{compRecord.ra_others_text}</span>
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                <textarea className="w-full bg-transparent border-none outline-none resize-none h-full min-h-[100px]" value={compRecord.ra_reason || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_reason: e.target.value })} readOnly={isStudent} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                <textarea className="w-full bg-transparent border-none outline-none resize-none h-full min-h-[100px]" value={compRecord.ra_outcome || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_outcome: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1 WRITTEN QUESTIONS: instructions + Q1-3 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ textAlign: 'center', fontSize: '13pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px' }}>ASSESSMENT Task 1 – WRITTEN QUESTIONS AND ANSWERS</h1>
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt', marginBottom: '16px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '6px' }}>Student instructions:</p>
          <p style={{ marginBottom: '12px' }}>This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45 - 60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 1 in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.</p>
          <p style={{ fontWeight: 'bold', marginBottom: '6px' }}>Make sure you:</p>
          <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Answer all questions</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Print clearly</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Ask your assessor if you do not understand a question. Whilst your assessor cannot tell you the answer, he/she may be able to re-word the question for you</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Do not talk to your classmates. If you are caught discussion the answers you will be asked to leave and your assessment will not be marked.</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Do not cheat. Anyone caught cheating will automatically be marked Not Competent for this unit. There are NO EXCEPTIONS to this rule.</li>
          </ul>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            {qs.slice(0, 3).map((q: any, idx: number) => renderQ1(q, idx === 0))}
          </tbody>
        </table>
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1 Q4-10 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt', marginTop: '10px' }}>
          <tbody>
            {qs.slice(3, 10).map((q: any) => renderQ1(q, false))}
          </tbody>
        </table>
        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1 Q11-17 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt', marginTop: '10px' }}>
          <tbody>
            {qs.slice(10, 17).map((q: any) => renderQ1(q, false))}
          </tbody>
        </table>
        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 1 Q18 + DECLARATIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt', marginTop: '10px' }}>
          <tbody>
            {qs.slice(17).map((q: any) => renderQ1(q, false))}
          </tbody>
        </table>
        {renderDeclarations('task1')}
        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 2 OBSERVATION SECTIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title" style={{ marginTop: '12px' }}>ASSESSMENT Task 2 – OBSERVATION</h1>
        <h1 className="section-title" style={{ marginTop: '0', marginBottom: '16px' }}>PRACTICAL DEMONSTRATION</h1>
        
        <h2 className="sub-title" style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '16px' }}>Makin a small joint with one input cable with two output cables jointed</h2>
        
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <p style={{ marginBottom: '16px' }}>For this observation, students are required to demonstrate their skills on connection of 30 pair exchange side cable with two 10 pair customer side cable in small sealed joint</p>
          
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Components:</p>
          <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>The candidate will be provided with a joint kit, cables and tools required for a cable jointer making a small copper joint in a PSTN network</p>
          
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Details:</p>
          <p style={{ marginBottom: '8px' }}>Before beginning the analysis, students must make adequate preparations for the task, including:</p>
          <ul style={{ margin: '0 0 16px 40px', padding: 0 }}>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Follow instructor's instructions to ensure exact requirements of the service are clearly understood. Instructions will include verbal & written instructions, as well as fault reporting and any site-specific instructions. Students should also consult relevant service instruction manuals to determine testing requirements, methods and required equipment</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Students must follow OH&S requirements at all times, including proper use of PPE</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Select and prepare all components, tooling and equipment necessary</li>
          </ul>

          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Details:</p>
          <p style={{ marginBottom: '8px' }}>Before beginning the analysis, students must make adequate preparations for the task, including:</p>
          <ul style={{ margin: '0 0 16px 40px', padding: 0 }}>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Follow instructor's instructions to ensure exact requirements of the service are clearly understood. Instructions will include verbal & written instructions, as well as fault reporting and any site-specific instructions. Students should also consult relevant service instruction manuals to determine testing requirements, methods and required equipment</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Students must follow OH&S requirements at all times, including proper use of PPE</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Select and prepare all components, tooling and equipment necessary</li>
          </ul>
          
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Once preparations have been made, students are to undertake the analysis following site-specific instructions and including, but not limited to the following steps:</p>
          <ul style={{ margin: '0 0 16px 40px', padding: 0 }}>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Safe handling of tools and sealant</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Equipment types, characteristics, technical capabilities and limitations</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>Features and operating requirements of hand and Jointing tools</li>
            <li style={{ listStyleType: 'disc', marginBottom: '4px' }}>General housekeeping policies and procedures</li>
          </ul>
        </div>
        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title" style={{ marginTop: '12px', marginBottom: '16px' }}>ASSESSMENT Task 2 – ASSESSOR CHECKLIST</h1>
        
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <p style={{ fontStyle: 'italic', marginBottom: '12px' }}>This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
          <p style={{ marginBottom: '12px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
          
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Assessor Instructions:</p>
          <p style={{ marginBottom: '16px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>
          
          <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>The following was observed during the observations:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', marginLeft: '0px' }}>
            {[
              "Identify the type of work", "Select appropriate tools", "Check tools and jointing aid for use",
              "Prepare cables correctly", "Follow industry procedures", "Use of safety equipment",
              "Follow safety standards", "Clean work area", "Inspection of hand and jointing tools"
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '45% 55%', alignItems: 'center' }}>
                <div>{item}</div>
                <div style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_obs_${idx}`]: compRecord[`task2_obs_${idx}`] === 'yes' ? 'no' : 'yes' })}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', position: 'relative', marginRight: '6px' }}>
                    {compRecord[`task2_obs_${idx}`] === 'yes' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span>
                  Observation 1
                </div>
              </div>
            ))}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
            <thead>
              <tr style={{ background: '#b0b0b0' }}>
                <th style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '55%' }}>Checklist</th>
                <th style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Case 1</th>
                <th style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '25%' }}>Comments</th>
              </tr>
              <tr style={{ background: '#b0b0b0' }}>
                <th style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Date Observed:</th>
                <th style={{ border: '1px solid #000', padding: '6px', background: '#fff' }}></th>
                <th style={{ border: '1px solid #000', padding: '6px', background: '#fff' }}></th>
              </tr>
            </thead>
            <tbody>
              {[
                "Did the Student accessed and read job instructions, including specific method & process requirements",
                "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
                "Did the student apply precautions required to minimise hazard",
                "Did the student select and use required PPE",
                "Did the student select and use appropriate hand and power tools",
                "Did the student identify the equipment types, characteristics, technical capabilities",
                "Did the student handle the power tools efficiently",
                "Did the student follow general housekeeping policies"
              ].map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', padding: '4px 6px' }}>{item}</td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center' }}>
                    <span style={{ cursor: isStudent ? 'default' : 'pointer', marginRight: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${idx}`]: 'yes' })}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', position: 'relative', marginRight: '4px' }}>
                        {compRecord[`task2_chk_${idx}`] === 'yes' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                      </span>
                      Yes
                    </span>
                    <span style={{ cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${idx}`]: 'no' })}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', position: 'relative', marginRight: '4px' }}>
                        {compRecord[`task2_chk_${idx}`] === 'no' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                      </span>
                      No
                    </span>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 6px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2 CHECKLIST CONTINUED + DECLARATIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', marginBottom: '24px' }}>
            <tbody>
              {[
                "Did the student acquire all the information required to operate the equipment",
                "Did the student follow the work procedure and policies",
                "Was the student aware about the manufacturers requirements for safe operation of equipment",
                "Did the student escalate unresolved faults to other parties for resolution",
                "Did the student comply with all related health and safety requirements and work practices?",
                "Did the Student recognise the features and operating requirements of test equipment",
                "Did the Student describe how to operate equipment according to a test specification",
                "Did the Student state the legislation, codes of practice and other formal agreements that impact on the work activity",
                "Did the student identify typical issues and challenges that occur on site",
                "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
                "Did the student undertake the task independently?",
                "Did the student demonstrate time management skill through the task?",
                "Did the student exhibit good communication skills?",
                "Did the student meet all the criteria for the task?"
              ].map((item, idx) => {
                const i = idx + 8; // offset from previous page
                return (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', width: '55%' }}>{item}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', width: '20%' }}>
                      <span style={{ cursor: isStudent ? 'default' : 'pointer', marginRight: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${i}`]: 'yes' })}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', position: 'relative', marginRight: '4px' }}>
                          {compRecord[`task2_chk_${i}`] === 'yes' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                        </span>
                        Yes
                      </span>
                      <span style={{ cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${i}`]: 'no' })}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', position: 'relative', marginRight: '4px' }}>
                          {compRecord[`task2_chk_${i}`] === 'no' && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                        </span>
                        No
                      </span>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '4px 6px', width: '25%' }}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2 style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>Comments/Feedback to Participant</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '55%' }}>
                  <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '45%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'task2')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px', cursor: 'pointer', position: 'relative' }}>
                      {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                    <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px', position: 'relative' }}>
                      {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Date:</span>
                    <span className="no-print" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                      <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                        value={answers.student_date || submitDate?.split('T')[0] || ''} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center' }}>
                      {formatDisplayDate(answers.student_date || submitDate || '')}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', minHeight: '100px' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Assessor's Feedback:</p>
                  <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', outline: 'none', background: 'transparent' }} value={compRecord.task2_feedback || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, task2_feedback: e.target.value }) }} readOnly={isStudent} />
                  <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px' }}>{compRecord.task2_feedback}</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', marginBottom: '16px' }}>
            Result:{' '}
            <span style={{ margin: '0 4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'S' })}>
              Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>S{compRecord.task2_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
            </span>
            {' '}/{' '}
            <span style={{ margin: '0 4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'NS' })}>
              Not Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>NS{compRecord.task2_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '30px', height: '30px', pointerEvents: 'none' }}></span>}</span>)
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '55%' }}>
                  <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '45%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                    <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px', position: 'relative' }}>
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Date:</span>
                    <span className="no-print" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                      <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                        value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center' }}>
                      {formatDisplayDate(compRecord.assessment_date)}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 3 REPORT ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title" style={{ marginTop: '12px', marginBottom: '16px' }}>ASSESSMENT Task 3 – Report</h1>
        
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <p style={{ marginBottom: '8px' }}>For this assessment the candidate needs to perform pressure dome test and air leakage test on a sealed joint provided by the assessor and create a record about the findings. Additionally, the student need to carry out a maintenance check on the tools and report faults to the assessor. This report should include the student's opinion about the condition of each tool.</p>
          <p style={{ marginBottom: '8px' }}>A weeks' time will be allotted to the students to carry out the task. Students can refer different articles and materials relevant to the topic in order to prepare the report.</p>
          <p style={{ marginBottom: '16px' }}>The student need to interpret the workplace policies and procedures before carrying out the task. Students can approach the instructor for information about the workshop safety policies.</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', width: '50%' }}>Test</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', width: '50%' }}>Value Pass/Fail</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Pressure Dome test</td><td style={{ border: '1px solid #000', padding: '6px' }}><input required={isStudent} type="text" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }} value={answers.task3_test1 || ''} onChange={e => setAnswers({ ...answers, task3_test1: e.target.value })} /></td></tr>
              <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Air leakage test</td><td style={{ border: '1px solid #000', padding: '6px' }}><input required={isStudent} type="text" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }} value={answers.task3_test2 || ''} onChange={e => setAnswers({ ...answers, task3_test2: e.target.value })} /></td></tr>
            </tbody>
          </table>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', width: '50%' }}>Tools</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', width: '50%' }}>Condition</th>
              </tr>
            </thead>
            <tbody>
              {["Wire cutter", "Wire striper", "Pair compression tool", "Jointing Jig", "Pressure dome kit"].map((tool, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{tool}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}><input required={isStudent} type="text" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }} value={answers[`task3_tool_${idx}`] || ''} onChange={e => setAnswers({ ...answers, [`task3_tool_${idx}`]: e.target.value })} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ border: '1px solid #000', width: '100%', height: '350px', padding: '8px' }}>
            <textarea
              className="no-print"
              style={{ width: '100%', height: '100%', border: 'none', resize: 'none', outline: 'none', background: 'transparent' }}
              value={answers['task3_report'] || ''}
              onChange={(e) => setAnswers({ ...answers, task3_report: e.target.value })}
            />
            <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', height: '100%' }}>{answers['task3_report']}</div>
          </div>
        </div>
        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 3 DECLARATIONS + END OF ASSESSMENT ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px', marginTop: '16px' }}>Comments/Feedback to Participant</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '55%' }}>
                  <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '45%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'task3')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px', cursor: 'pointer', position: 'relative' }}>
                      {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                    <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px', position: 'relative' }}>
                      {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Date:</span>
                    <span className="no-print" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                      <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                        value={answers.student_date || submitDate?.split('T')[0] || ''} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center' }}>
                      {formatDisplayDate(answers.student_date || submitDate || '')}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', minHeight: '100px' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Assessor's Feedback:</p>
                  <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', outline: 'none', background: 'transparent' }} value={compRecord.task3_feedback || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, task3_feedback: e.target.value }) }} readOnly={isStudent} />
                  <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px' }}>{compRecord.task3_feedback}</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', marginBottom: '16px' }}>
            Result:{' '}
            <span style={{ margin: '0 4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'S' })}>
              Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>S{compRecord.task3_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
            </span>
            {' '}/{' '}
            <span style={{ margin: '0 4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'NS' })}>
              Not Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>NS{compRecord.task3_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '30px', height: '30px', pointerEvents: 'none' }}></span>}</span>)
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '55%' }}>
                  <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '45%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '30px', marginLeft: '4px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                    <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '30px', marginLeft: '4px', position: 'relative' }}>
                      {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Date:</span>
                    <span className="no-print" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                      <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                        value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '100px', minHeight: '30px', marginLeft: '4px', textAlign: 'center' }}>
                      {formatDisplayDate(compRecord.assessment_date)}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic', fontSize: '13pt', marginTop: '48px', fontFamily: '"Times New Roman", Times, serif' }}>
          END OF ASSESSMENT
        </div>
        <PageFooter n={14} />
      </div>
    </div>
  );
};
