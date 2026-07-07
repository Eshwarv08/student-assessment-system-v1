import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions4';

const InnerHeader = () => (
  <div className="flex justify-between items-start mb-4">
    <div className="text-[9pt] font-bold italic" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <div style={{ textDecoration: 'underline', marginBottom: '2px' }}>Assessment Book</div>
      <div style={{ textDecoration: 'underline' }}>ICTCBL320 Jumper metallic conductor cable in the access network</div>
    </div>
    <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '60px', height: 'auto', objectFit: 'contain' }} />
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div className="flex justify-between items-center text-[9pt] text-[#555] mt-auto pt-6" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
    <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.5/25</span>
    <span>Page {n} of 22</span>
  </div>
);

interface Q4BookletProps {
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

export const Q4Booklet: React.FC<Q4BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    } catch (e) {
      return d;
    }
  };

  // ── Declarations / feedback block (bottom of each task's final page) ──
  const renderDeclarations = (taskKey: string) => (
    <div className="mt-8" style={{ pageBreakInside: 'avoid' }}>
      <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '12px', textAlign: 'left' }}>Comments/Feedback to Participant</h3>
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
                      <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>
                    )}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print flex-1" style={{ borderBottom: '1.5px solid black', minHeight: '18px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', fontWeight: 'bold', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:block font-bold flex-1" style={{ borderBottom: '1.5px solid black', minHeight: '18px', paddingLeft: '4px', fontSize: '10pt' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
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
                      <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                    )}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print flex-1" style={{ borderBottom: '1.5px solid black', minHeight: '18px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', fontWeight: 'bold', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }} className={isStudent ? 'pointer-events-none' : ''}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:block font-bold flex-1" style={{ borderBottom: '1.5px solid black', minHeight: '18px', paddingLeft: '4px', fontSize: '10pt' }}>
                    {formatDisplayDate(compRecord.assessment_date || '')}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ── Single question row for task5 table ──
  const renderT5Row = (q: any) => {
    const showImage = q.image && ![8, 9, 10, 11].includes(q.id);
    return (
      <React.Fragment key={q.id}>
        <tr>
          <td className="border-[1.5px] border-black p-2 sm:p-3">
            <div className="flex gap-4">
              <span className="font-normal w-4 text-right">{q.id}.</span>
              <div className="flex-1">
                <span className="whitespace-pre-wrap font-normal">{q.text}</span>
                {q.type === 'radio' && q.options && (
                  <div className="mt-2 ml-4 flex flex-col gap-0.5">
                    {q.options.map((opt: any, oIdx: number) => (
                      <div key={oIdx} className="flex gap-2 items-start">
                        <span className="w-4 text-right">{opt.value})</span>
                        <label className="flex items-center gap-2 cursor-pointer relative top-[-1px]">
                          <input required={isStudent} type="radio" checked={answers[opt.name || `t5q${q.id}`] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || `t5q${q.id}`]: opt.value })} />
                          {opt.text}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {showImage && (
                  <div className="mt-4 flex justify-center">
                    <img src={q.image} alt={q.imageCaption || `Question ${q.id} diagram`} style={{ maxWidth: '300px', height: 'auto' }} />
                  </div>
                )}
                {q.id === 17 && (
                  <div className="mt-2 text-[9pt]">
                    <div>Tool A: <input required={isStudent} type="text" className="border-none outline-none w-64 ml-2 bg-transparent border-b border-black/20" value={answers[`t5q17_a`] || ''} onChange={e => setAnswers({ ...answers, t5q17_a: e.target.value })} /></div>
                    <div className="mt-1">Tool B: <input required={isStudent} type="text" className="border-none outline-none w-64 ml-2 bg-transparent border-b border-black/20" value={answers[`t5q17_b`] || ''} onChange={e => setAnswers({ ...answers, t5q17_b: e.target.value })} /></div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td className="border-[1.5px] border-black p-0 h-10">
            <div className="flex flex-col h-full min-h-[32px]">
              <div className="p-2 flex-1">
                {q.type === 'text' && q.id !== 17 && (
                  <textarea
                    className="w-full border-none min-h-[24px] resize-y bg-transparent outline-none m-0 p-0"
                    value={answers[`t5q${q.id}`] || ''}
                    onChange={(e) => setAnswers({ ...answers, [`t5q${q.id}`]: e.target.value })}
                    placeholder=""
                  />
                )}
              </div>
              <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] w-full mt-auto">
                <div className="w-[40%] p-1 sm:p-2 text-[#1e3a8a] border-r-[1.5px] border-black flex justify-center items-center bg-[#fae8db]">Assessor to tick (☑)</div>
                <div className={`w-[30%] p-1 sm:p-2 text-[#1e3a8a] border-r-[1.5px] border-black bg-[#fae8db] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                  onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`task5_q${q.id}_result`]: 'S' }) }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                    {compRecord[`task5_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                  </span>
                  Satisfactory (S)
                </div>
                <div className={`w-[30%] p-1 sm:p-2 text-[#1e3a8a] bg-[#fae8db] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                  onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`task5_q${q.id}_result`]: 'NS' }) }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                    {compRecord[`task5_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                  </span>
                  Not Satisfactory (NS)
                </div>
              </div>
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  const q4Styles = `
      .q4-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q4-booklet-view * {
        box-sizing: border-box;
      }
      .q4-booklet-view .page {
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
      .q4-booklet-view h1.section-title {
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
      .q4-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q4-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q4-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q4-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q4-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q4-booklet-view table td, .q4-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q4-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q4-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q4-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q4-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q4-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q4-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q4-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q4-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a;
      }
      .q4-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q4-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q4-booklet-view .page-footer {
        margin-top: auto;
        padding-top: 4mm;
        border-top: 1px solid #000;
        display: flex;
        justify-content: space-between;
        font-size: 8pt;
      }
      .q4-booklet-view .inner-header {
        margin-bottom: 4mm;
        border-bottom: 2px solid #000;
        padding-bottom: 2mm;
      }
      .q4-booklet-view .inner-header .top-row {
        display: flex; justify-content: space-between; align-items: flex-start;
      }
      .q4-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q4-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q4-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q4-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q4-booklet-view .question-block { margin-bottom: 8mm; }
      .q4-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q4-booklet-view { background: #fff !important; padding: 0 !important; }
        .q4-booklet-view .page {
          margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important;
        }
      }
  `;

  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const task4 = assessmentQuestions.task4 as any;
  const task5 = assessmentQuestions.task5 as any;
  const admin = assessmentQuestions.adminInfo;

  // Split task4 knowledge evidence questions text at Q6
  const kqFull: string = task4.sections?.[1]?.content || '';
  const kqSplit = kqFull.indexOf('\n6. ');
  const kqPage15 = kqSplit > -1 ? kqFull.slice(0, kqSplit) : kqFull;
  const kqPage16 = kqSplit > -1 ? kqFull.slice(kqSplit + 1) : '';

  // Checklist table header rows (reused across pages)
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

  const qs5 = task5.questions as any[];

  return (
    <div className="q4-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q4Styles }} />

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
      <div className="page" style={{ padding: '8mm 10mm' }}>
        <div style={{ border: '2px solid #00b0f0', padding: '3px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1px solid #00b0f0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '10mm 15mm' }}>
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '220px', height: 'auto', objectFit: 'contain', marginTop: '10mm' }} />
            <div style={{ color: '#8b0000', fontWeight: 'bold', fontSize: '12pt', marginTop: '10px', fontFamily: 'Arial, sans-serif' }}>RTO NO: 40954</div>

            <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '20mm', marginBottom: '8mm' }}>Assessment Booklet</div>

            <div style={{ background: '#00b0f0', height: '14px', width: '100%', marginBottom: '15mm' }}></div>

            <div className="cover-subtitle" style={{ fontSize: '24pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '10px' }}>ICTCBL320</div>

            <div className="cover-subtitle" style={{ fontSize: '20pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'center', lineHeight: 1.3 }}>Jumper metallic conductor cable in<br />the access network</div>

            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="cover-student-name-container" style={{ fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', width: '85%', marginBottom: '40mm' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.5px solid #000', flex: 1, marginLeft: '8px', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '10mm' }}>ACTA College Pty. Ltd</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div style={{ fontWeight: 'bold', fontSize: '12pt', textAlign: 'center', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', marginTop: '10px' }}>
          ASSESSMENT COMPETENCY RECORD
        </div>

        <div style={{ background: '#d9d9d9', border: '1.5px solid black', padding: '6px', fontSize: '9pt', marginBottom: '12px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'justify' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '12px', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', width: '35%', background: '#d9d9d9', fontWeight: 'bold' }}>Student's Name</td><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold' }}>{studentName}</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold' }}>Assessor's Name</td><td style={{ border: '1.5px solid black', padding: '4px' }}></td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold' }}>Assessment Site</td><td style={{ border: '1.5px solid black', padding: '4px' }}></td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold' }}>Assessment Date</td><td style={{ border: '1.5px solid black', padding: '4px' }}></td></tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '12px', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid black', padding: '4px', textAlign: 'justify' }}>In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold', width: '40%' }}>Evidence Is Confirmed as:</td>
              {[
                { k: 'evidence_valid', l: 'Valid' },
                { k: 'evidence_sufficient', l: 'Sufficient' },
                { k: 'evidence_current', l: 'Current' },
                { k: 'evidence_authentic', l: 'Authentic' }
              ].map((ev, i) => (
                <td key={i} style={{ border: '1.5px solid black', padding: '4px', width: '15%' }}>
                  <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [ev.k]: compRecord[ev.k] === 'yes' ? '' : 'yes' }) }}>
                    <div style={{ width: '16px', height: '16px', border: '1px solid black', position: 'relative' }}>
                      {compRecord[ev.k] === 'yes' && <span style={{ position: 'absolute', top: '-8px', left: '1px', color: '#c00000', fontSize: '20px' }}>✓</span>}
                    </div> {ev.l}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '12px', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1.5px solid black', padding: '6px', fontWeight: 'bold', width: '50%', background: '#f2f2f2' }}>Please attach the following documentation to this form</td>
              <td style={{ border: '1.5px solid black', padding: '6px', fontWeight: 'bold', width: '20%', textAlign: 'center', background: '#f2f2f2' }}>Result</td>
              <td rowSpan={6} style={{ border: '1.5px solid black', padding: '6px', width: '30%', background: '#a6a6a6', textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>FINAL ASSESSMENT<br />RESULT:</div>
                <div className="flex flex-col gap-3 text-left pl-6">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, final_assessment_result: 'C' }) }}>
                    <div style={{ width: '12px', height: '12px', border: '1.5px solid black', position: 'relative', backgroundColor: 'white' }}>
                      {compRecord.final_assessment_result === 'C' && <span style={{ position: 'absolute', top: '-9px', left: '-1px', color: '#c00000', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>Competent (C)</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, final_assessment_result: 'NC' }) }}>
                    <div style={{ width: '12px', height: '12px', border: '1.5px solid black', position: 'relative', backgroundColor: 'white' }}>
                      {compRecord.final_assessment_result === 'NC' && <span style={{ position: 'absolute', top: '-9px', left: '-1px', color: '#c00000', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>Not Competent (NC)</span>
                  </div>
                </div>
              </td>
            </tr>
            {[
              { t: 'Assessment Task 1', c: 'Observation', tk: 'task1_result', dk: 'task1_doc_attached' },
              { t: 'Assessment Task 2', c: 'Observation', tk: 'task2_result', dk: 'task2_doc_attached' },
              { t: 'Assessment Task 3', c: 'Observation', tk: 'task3_result', dk: 'task3_doc_attached' },
              { t: 'Assessment Task 4', c: 'Report', tk: 'task4_result', dk: 'task4_doc_attached' },
              { t: 'Assessment Task 5', c: 'Questions and Answers', tk: 'task5_result', dk: 'task5_doc_attached' }
            ].map((task, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px', fontWeight: 'bold', width: '25%' }}>
                  {task.t}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', width: '25%' }}>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [task.dk]: compRecord[task.dk] === 'yes' ? '' : 'yes' }) }}>
                    <div style={{ width: '12px', height: '12px', border: '1.5px solid black', position: 'relative' }}>
                      {compRecord[task.dk] === 'yes' && <span style={{ position: 'absolute', top: '-9px', left: '-1px', color: '#c00000', fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    {task.c}
                  </div>
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', textAlign: 'center' }}>
                  <div className="inline-flex items-center justify-center gap-3 relative text-[10pt]">
                    <span className="relative cursor-pointer" onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [task.tk]: 'S' }) }}>
                      S
                      {compRecord[task.tk] === 'S' && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', border: '2px solid #c00000', borderRadius: '50%' }}></div>}
                    </span>
                    /
                    <span className="relative cursor-pointer" onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [task.tk]: 'NS' }) }}>
                      NS
                      {compRecord[task.tk] === 'NS' && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '20px', border: '2px solid #c00000', borderRadius: '50%' }}></div>}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '12px', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', width: '10%' }}>Attempt</th>
              <th style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', width: '20%' }}>Date</th>
              <th style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', width: '70%' }}>Assessor's Feedback (as Required):</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ border: '1.5px solid black', padding: '7px', textAlign: 'center', fontWeight: 'bold' }}>1</td><td style={{ border: '1.5px solid black', padding: '7px' }}></td><td style={{ border: '1.5px solid black', padding: '7px' }}></td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '7px', textAlign: 'center', fontWeight: 'bold' }}>2</td><td style={{ border: '1.5px solid black', padding: '7px' }}></td><td style={{ border: '1.5px solid black', padding: '7px' }}></td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '7px', textAlign: 'center', fontWeight: 'bold' }}>3</td><td style={{ border: '1.5px solid black', padding: '7px' }}></td><td style={{ border: '1.5px solid black', padding: '7px' }}></td></tr>
            <tr><td colSpan={2} style={{ border: '1.5px solid black', padding: '7px', background: '#d9d9d9', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td><td style={{ border: '1.5px solid black', padding: '7px' }}></td></tr>
          </tbody>
        </table>

        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '4px', fontFamily: '"Times New Roman", Times, serif' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontSize: '8.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '6px', width: '60%', textAlign: 'justify', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Student:</span> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1.5px solid black', padding: '6px', width: '40%', verticalAlign: 'middle' }}>
                <div className="flex items-center gap-1 mb-3">
                  Signature:
                  <div onClick={() => openSigModal('student_signature', 'comp')} className="cursor-pointer inline-flex items-center justify-center flex-1 min-h-[20px] border-b-[1.5px] border-black" style={{ cursor: isStudent ? 'pointer' : 'default' }}>
                    {answers.student_signature_url ? (
                      <img src={answers.student_signature_url} className="max-h-[20px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  Date:
                  <span className="no-print border-b-[1.5px] border-black flex-1 min-h-[16px] relative inline-block">
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block border-b-[1.5px] border-black flex-1 min-h-[16px] font-bold text-center">
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '6px', width: '60%', textAlign: 'justify', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1.5px solid black', padding: '6px', width: '40%', position: 'relative', verticalAlign: 'middle' }}>
                <div className="flex items-center gap-1 mb-3 relative">
                  Signature:
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="cursor-pointer inline-flex items-center justify-center flex-1 min-h-[20px] border-b-[1.5px] border-black" style={{ cursor: isStudent ? 'default' : 'pointer' }}>
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[20px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  Date:
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} className={isStudent ? 'pointer-events-none' : ''} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', flex: 1, height: '16px' }}>
                    {formatDisplayDate(compRecord.assessment_date)}
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
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold', fontSize: '9.5pt' }}>Administrative use only:</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '4px', width: '40%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1.5px solid black', padding: '4px', width: '60%' }}>
                <div className="flex items-center gap-4 relative">
                  <span className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {compRecord.admin_entered && <span style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div> Signature/Initial:
                  </span>
                  <div onClick={() => !isStudent && openSigModal('assessor_signature', 'comp')} className="cursor-pointer inline-flex items-center justify-center w-[100px] min-h-[20px] border-b-[1.5px] border-black" style={{ cursor: isStudent ? 'default' : 'pointer' }}>
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[20px] max-w-[100px] object-contain inline-block mix-blend-multiply" />
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
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Unit Summary</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.unitSummary}</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Target Group</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Conditions and<br />context of the<br />assessments</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              Gather evidence to demonstrate consistent performance in conditions that are safe and replicate the workplace. Noise levels, production flow, interruptions and time variances must be typical of those experienced in the telecommunications – cabling field of work and include access to:
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '4px', marginBottom: '4px' }}>
                <li>sites where metallic conductor cable may be terminated</li>
                <li>colour codes for visual inspections or wire-mappers for 4 pair cable tests</li>
                <li>regulatory and cabling documentation that impacts on cable terminating activities.</li>
              </ul>
              Assessors of this unit must satisfy the requirements for assessors in applicable vocational education and training legislation, frameworks and/or standards.
            </td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Specific Resources<br />Required</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '0', marginBottom: '0' }}>
                <li>Learner Guide</li>
                <li>Assessment Booklet</li>
                <li>Practical Workshop</li>
                <li>Manufacturers Manuals and specifications</li>
                <li>Workplace policy and procedures</li>
              </ul>
            </td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Re-assessment</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>Students who are unsuccessful at achieving competency at the first attempt will be offered coaching, information and additional time (other needs if required) before a second and possibly a third attempt is made. If the student is not able to satisfactorily complete the assessment after the third attempt the student will be deemed Not Competent and resulted as such. The student may re-enrol in the qualification at a later to date to gain successful completion of the unit/s.<br />For further details refer to ACTA College Assessment Policy and Procedure.</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Plagiarism</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>ACTA College considers plagiarism and cheating as serious student misconduct and this may result either in a student's exclusion from a unit or course or may have to complete a re-assessment depending on individual case.</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Complaints and<br />appeal</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>Where a student wishes to appeal an assessment decision they are required to notify their assessor in the first instance. Where appropriate the assessor may decide to re-assess the student to ensure a fair and equitable decision is gained. The assessor shall complete a written report regarding the re-assessment outlining the reasons why assessment was or was not granted.</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessors<br />Intervention</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>Assessors are to check that the student is ready for assessment, and defer the assessment if they are not. It is important that assessors do not teach at the assessment but allow students to competence for themselves.</td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN CONT ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', width: '30%', verticalAlign: 'top' }}></td><td style={{ border: '1.5px solid black', padding: '4px', width: '70%', textAlign: 'justify' }}>Feedback is to be given at the completion of the assessment using the feedback to student. If a student does not meet a standard, the assessor is to sit down with them and assist them in their understanding. Should you disagree with the assessment outcome, you can appeal the decision as stated in the Student Handbook.<br /><br />Your student record must indicate that you have all required skills and knowledge in completing the task. For each assessment, the assessor is to act as a supervisor and not interfere with the assessment. In the event that the assessment activities will impact on your safety or that of others, the assessment must be stopped immediately.</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Attaching<br />documents</td><td style={{ border: '1.5px solid black', padding: '4px', textAlign: 'justify' }}>Attached documents are accepted but must be labelled with the following information:<br />Unit Name and Title, Students name, Student ID, Date of Submissions, Student signature.</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment<br />Instruction</td><td style={{ border: '1.5px solid black', padding: '4px', textAlign: 'justify' }}>
              Assessment is mapped to the unit and must be completed by the end of each unit. This is a summative assessment, which requires each student to have adequate practice prior to undertaking this assessment<br />
              The assessment consists of five tasks:<br />
              Assessment Task 1 is Observation<br />
              Assessment Task 2 is Observation<br />
              Assessment Task 3 is Observation<br />
              Assessment Task 4 is Report<br />
              Assessment Task 5 is Written questions and answers<br />
              For answers to written questions, reports and projects, you must:<br />
              • Print clearly in black or blue pen or type it as a word document<br />
              • Answer each of the key points and /or follow instructions<br />
              • Assessments written in pencil or are illegible will not be accepted.<br />
              Ask your assessor if you do not understand any part of the assessment. Whist your assessor cannot tell you the answer, he/she may be able to re-word a question or instruction to assist in a better understanding for you.
            </td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 1:</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>In this assessment task candidate will install cable at a distribution fame using termination tools and terminal blocks</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 2:</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>In this assessment candidate will terminate Jumber cable according to cable distribution plan</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 3:</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>In this assessment candidate will install earthing to a cabling distribution system according to regulations and industry practices and oversee the final steps in the cabling process.</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 4:</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>In this assessment candidate will prepare a short report that will summarize the basic knowledge required to jumper metallic conductor cable in the access net work</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 5:</td><td style={{ border: '1.5px solid black', padding: '4px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>Written questions and answers</td></tr>
            <tr><td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency<br />Decision</td><td style={{ border: '1.5px solid black', padding: '4px', textAlign: 'justify' }}>Student must satisfactorily complete each assessment tasks to be Competent (C) in the unit.<br />Student with unsatisfactory completion of any of the assignment tasks will be deemed Not Yet Competent (NYC).</td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – REASONABLE ADJUSTMENT & COVER SHEET ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '25px' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1.5px solid black', padding: '4px', background: '#d9d9d9', fontWeight: 'bold', fontSize: '9.5pt' }}>Reasonable adjustment</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: '1.5px solid black', padding: '6px', textAlign: 'justify' }}>To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.<br /><br />ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Reasonable adjustment provided</td>
              <td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Reason for reasonable adjustment</td>
              <td style={{ border: '1.5px solid black', padding: '4px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Outcome</td>
            </tr>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '6px', height: '120px', verticalAlign: 'top' }}>
                <div className="flex flex-col gap-1 text-[8.5pt]">
                  <div className="flex items-start gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_edu: !compRecord.ra_edu })}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid black', marginTop: '2px', flexShrink: 0, position: 'relative' }}>
                      {compRecord.ra_edu && <span style={{ position: 'absolute', top: '-6px', left: '-1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div> Educational and bilingual support
                  </div>
                  <div className="flex items-start gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_oral: !compRecord.ra_oral })}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid black', marginTop: '2px', flexShrink: 0, position: 'relative' }}>
                      {compRecord.ra_oral && <span style={{ position: 'absolute', top: '-6px', left: '-1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div> Presenting questions orally
                  </div>
                  <div className="flex items-start gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_diagram: !compRecord.ra_diagram })}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid black', marginTop: '2px', flexShrink: 0, position: 'relative' }}>
                      {compRecord.ra_diagram && <span style={{ position: 'absolute', top: '-6px', left: '-1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div> <span>Presenting work instructions in<br />diagrammatic or pictorial form<br />instead of words and sentences</span>
                  </div>
                  <div className="flex items-start gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_extra: !compRecord.ra_extra })}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid black', marginTop: '2px', flexShrink: 0, position: 'relative' }}>
                      {compRecord.ra_extra && <span style={{ position: 'absolute', top: '-6px', left: '-1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div> <span>Extra time to complete a course or<br />assessment</span>
                  </div>
                  <div className="flex items-start gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_other: !compRecord.ra_other })}>
                    <div style={{ width: '12px', height: '12px', border: '1px solid black', marginTop: '2px', flexShrink: 0, position: 'relative' }}>
                      {compRecord.ra_other && <span style={{ position: 'absolute', top: '-6px', left: '-1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div> Others:
                  </div>
                </div>
              </td>
              <td style={{ border: '1.5px solid black', padding: '0' }}>
                <textarea
                  className="w-full h-full min-h-[120px] bg-transparent border-none outline-none resize-none text-[8.5pt] p-2"
                  value={compRecord.ra_reason || ''}
                  onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_reason: e.target.value })}
                  placeholder="Reason for adjustment..."
                  readOnly={isStudent}
                />
              </td>
              <td style={{ border: '1.5px solid black', padding: '0' }}>
                <textarea
                  className="w-full h-full min-h-[120px] bg-transparent border-none outline-none resize-none text-[8.5pt] p-2"
                  value={compRecord.ra_outcome || ''}
                  onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_outcome: e.target.value })}
                  placeholder="Outcome details..."
                  readOnly={isStudent}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#9bc2e6', padding: '6px', fontWeight: 'bold', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '15px' }}>
          COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT
        </div>
        <div style={{ fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold' }}>
          <p className="mb-4">A cover sheet must be included with each submission of work.</p>
          <p>Work submitted without a signed cover sheet will be returned unmarked.</p>
        </div>

        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1 OBSERVATION ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '12pt', textAlign: 'center', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 1- OBSERVATION</h1>
        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', textAlign: 'center', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>Cable Installation</h2>

        <div style={{ fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'justify', lineHeight: '1.5' }}>
          <p className="mb-4">In this assessment task you will install cable using support systems in preparation for termination. To do this you will:</p>
          <p className="mb-3">A. Explain the regulatory requirements include applicable standard</p>
          <p className="mb-3">B. Identify and check on cabling and general infrastructure needs</p>
          <p className="mb-3">C. Discuss hazard identification and risk management</p>
          <p className="mb-3">D. Manage remote power feed</p>
          <p className="mb-3">E. Identify requirements of support systems including catenary supports tensioning where necessary to meet AS/CA<br />S009: 2013</p>
          <p className="mb-3">F. Installation of cables for building faces for both internal and external locations</p>
          <p className="mb-3">G. Demonstrate practices to avoid cable damage and placement of cable and terminating equipment's</p>
          <p className="mb-3">H. Arrange cables to ensure ease of access</p>
          <p className="mb-3">I. Read and interpret drawings related to cable layouts, outlet location, cable coding system, and identifiers and<br />distributor locations comply with all WHS requirements and work practices.</p>
          <p className="mb-3">J. Labelling cables</p>
          <p className="mb-3">K. Identify earthing requirements where required and ensure TCR and CES wires meet legislative standards</p>
          <p className="mb-5">L. All work completed did meet industry standard AS/CA S009:2013</p>
        </div>

        <h3 style={{ fontWeight: 'bold', fontSize: '11.5pt', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif' }}>Required documents and equipment:</h3>
        <p style={{ fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '10px' }}>Before commencing this task ensures that your assessor has provided you with:</p>
        <ul style={{ fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', listStyleType: 'disc', paddingLeft: '40px', lineHeight: '1.6' }}>
          <li>Cable plan for assessment location</li>
          <li>Cable stock suitable for small scale aerial and underground cabling</li>
          <li>Cable reel and cable tension meter</li>
          <li>Cable hauling lubricants</li>
          <li>Conduit either in place or ready to be deployed</li>
          <li>Cable trays, racks and support methods</li>
          <li>A supervisor to report to</li>
          <li>Actual or simulated remote power</li>
          <li>Protective earthing</li>
          <li>Catenary wire for a domestic system</li>
          <li>Labelling requirements</li>
          <li>Damaged cable</li>
          <li>Typical work environment</li>
        </ul>
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 1 – ASSESSOR CHECKLIST</h1>
        <p style={{ fontStyle: 'italic', fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </p>
        <p style={{ fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </p>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          Assessor Instructions:
        </p>
        <p style={{ fontSize: '10pt', marginBottom: '20px', textAlign: 'justify', fontFamily: '"Times New Roman", Times, serif' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </p>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Outcomes:</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }} rowSpan={2}>
                <div style={{ fontWeight: 'bold' }}>Oral assessment questions</div>
                <div style={{ fontWeight: 'normal' }}>Use questions to confirm the candidates understanding of the task</div>
                <div style={{ fontWeight: 'bold' }}>Note any additional questions you use during the assessment</div>
              </th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory response</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} rowSpan={2}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid black', padding: '6px', fontWeight: 'bold' }}>Installation questions</td>
            </tr>
          </thead>
          <tbody>
            {[
              "What are the major risks in performing this work?",
              "What PPE should be used for this type of work?",
              "How might cable be damaged and how can this are avoided?",
              "What are the consequences of damaged cable for the customer?",
              "Show how the major components of this installation are represented on the plan",
              "How will the aerial support structures and cable be secured?"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task1_oral_${i}`]: 'yes' })}>
                  {compRecord[`task1_oral_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task1_oral_${i}`]: 'no' })}>
                  {compRecord[`task1_oral_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginTop: '20px', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Evidence of performance:</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }}>Did the candidate satisfactorily:</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px' }}></th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px' }}></th>
            </tr>
          </thead>
          <tbody>
            {[
              "Identify and check on the regulatory requirements for work on your assigned location",
              "Identify and check on cabling and general infrastructure needs and develop a strategy to manage any specific needs"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task1_perf_${i}`]: 'yes' })}>
                  {compRecord[`task1_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task1_perf_${i}`]: 'no' })}>
                  {compRecord[`task1_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '20px' }}>
          <tbody>
            {[
              "Take steps to manage and report safety hazards",
              "Take steps to manage remote power feed",
              "Install cable support systems including catenary supports",
              "Place and secure cables on support structures and building faces for both internal and external locations",
              "Demonstrate work practices which avoid cable damage and placement of cable and terminating equipment in compliance with manufacturer specification",
              "Arrange cables to ensure ease of access",
              "Read and interpret drawings related to cable layouts, outlet location, cable coding system, and identifiers and distributor locations",
              "Comply with all WHS requirements and work practices.",
              "Label all cables and allow sufficient space for access to cables",
              "Complete all installation tasks to standards prescribed by industry regulations",
              "Install earthing where required and ensure TCR and CES wires meet legislative standards",
              "Complete all work observing industry standard S009:2013",
              ""
            ].map((q, idx) => {
              const i = idx + 2;
              return (
                <tr key={i}>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '60%' }}>{q}</td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '10%', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task1_perf_${i}`]: 'yes' })}>
                    {compRecord[`task1_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '10%', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task1_perf_${i}`]: 'no' })}>
                    {compRecord[`task1_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '20%' }}></td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Comments/Feedback to Participant</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '55%', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '45%', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '80px', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
          <textarea
            className="no-print"
            style={{ width: '100%', minHeight: '60px', border: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
            value={compRecord.task1_feedback || ''}
            onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, task1_feedback: e.target.value }) }}
            readOnly={isStudent}
          />
          <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '60px', fontSize: '10pt' }}>{compRecord.task1_feedback}</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif' }}>
          Result:{' '}
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task1_result: 'S' }) }} style={{ padding: '4px' }}>
            Satisfactory (S)
            {compRecord.task1_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
          <span style={{ margin: '0 4px' }}>/</span>
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task1_result: 'NS' }) }} style={{ padding: '4px' }}>
            Not Satisfactory (NS)
            {compRecord.task1_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%', borderRight: '1.5px solid black', padding: '10px', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ width: '45%', padding: '10px', position: 'relative', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('task1_assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.task1_assessor_signature && <img src={compRecord.task1_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.task1_assessor_signature && <img src={compRecord.task1_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(compRecord.assessment_date)}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', margin: '20px 0', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 2- OBSERVATION</h1>
        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', textAlign: 'center', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif' }}>Termination techniques</h2>
        <div style={{ fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.5' }}>
          <p style={{ marginBottom: '15px' }}>In this assessment you will terminate cable according to the following instructions:</p>
          <div style={{ marginBottom: '15px' }}>AT 2.1. perform a simple cable termination at termination module according to manufacturer's specifications and without damage to conductors</div>
          <div style={{ marginBottom: '15px' }}>AT 2.2. terminate systems at both distributor and outlet locations and test earthing</div>
          <div style={{ marginBottom: '15px' }}>AT 2.3. Apply recommended earthing in accordance with standard S009:2013 including TCR/CES earth wire</div>
          <div style={{ marginBottom: '15px' }}>AT 2.4. Observe colour coding when terminating</div>
          <div style={{ marginBottom: '15px' }}>*AT 2.5. install and terminate one jumperable distributor (campus distributor or building distributor) with a capacity of 100 pair or greater</div>
          <div style={{ marginBottom: '15px' }}>*AT 2.6. Terminate one non-jumperable distributor and a patch panel</div>
          <div style={{ marginBottom: '15px' }}>*AT 2.7. Terminate at least one 50 pair, one 4 pair and one Ethernet cables including accurate completion of installation records, drawing alterations and compliance forms</div>
          <div style={{ marginBottom: '15px' }}>AT 2.8. read and interpret drawings relate to cable layouts, outlet location, cable coding system, and identifiers and distributor locations and test for integration with existing systems</div>
          <div style={{ marginBottom: '15px' }}>AT 2.9. Label cable pairs and earthing system, recording details in cable record and complete a TCA form</div>
          <div style={{ marginBottom: '15px' }}>AT 2.10. Interpret and apply relevant legislation, codes, regulations and standards</div>
          <div style={{ marginBottom: '15px' }}>AT 2.11. Comply with all WHS requirements and work practices</div>
          <div style={{ marginBottom: '15px' }}>AT 2.12. Visually inspect new work to check for correct colour coding and sequencing and correct separations</div>
          <div style={{ marginBottom: '15px' }}>AT 2.13. Conduct and interpret system testing in accordance with manufacturer specifications</div>
          <p style={{ marginBottom: '10px' }}>*Note: for candidates only seeking restricted cabler registration, training tasks AT2.4 to AT2.7 should be replaced by tasks below:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '15px', marginTop: '0' }}>
            <li>Network termination device</li>
            <li>Australian modular socket</li>
            <li>Mode 3 alarm socket</li>
            <li>RJ45, RJ12 or RJ11 modular socket.</li>
          </ul>
          <p style={{ marginBottom: '20px' }}>Note: jumperable distributors are not included in this requirement</p>

          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Required documents and equipment:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '0', marginTop: '0' }}>
            <li>Cable plan for assessment location</li>
            <li>Cable-50 pair, 4 pair, structured (cat 5 or similar)</li>
            <li>Krone tool</li>
            <li>Krone block</li>
            <li>Modular socket</li>
            <li>Outlet termination</li>
            <li>Cable record template</li>
            <li>Hand tools-screw driver, other basic tools</li>
            <li>Appropriate PPE</li>
          </ul>
        </div>
        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT Task 2 – ASSESSOR CHECKLIST</h1>
        <p style={{ fontStyle: 'italic', fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </p>
        <p style={{ fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </p>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          Assessor Instructions:
        </p>
        <p style={{ fontSize: '10pt', marginBottom: '20px', textAlign: 'justify', fontFamily: '"Times New Roman", Times, serif' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </p>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Outcomes:</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }} rowSpan={2}>
                <div style={{ fontWeight: 'bold' }}>Oral assessment questions</div>
                <div style={{ fontWeight: 'normal' }}>Use questions to confirm the candidates understanding of the task samples shown below</div>
                <div style={{ fontWeight: 'bold' }}>Note any additional questions you use during the assessment</div>
              </th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} rowSpan={2}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid black', padding: '6px', fontWeight: 'bold' }}>Questions</td>
            </tr>
          </thead>
          <tbody>
            {[
              "Name three hazards for this type of termination work?",
              "What separations should be maintained between cable terminations and LV cables?",
              "What requirements apply the installation of an MDF?",
              "Describe the regulations that apply to cable installation"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task2_oral_${i}`]: 'yes' })}>
                  {compRecord[`task2_oral_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task2_oral_${i}`]: 'no' })}>
                  {compRecord[`task2_oral_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginTop: '20px', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Evidence of performance:</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }}>Did the candidate satisfactorily:</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px' }}></th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px' }}></th>
            </tr>
          </thead>
          <tbody>
            {[
              "Perform a simple cable termination at termination module according to manufacturer's specifications and without damage to conductors",
              "Terminate systems at both distributor and outlet locations and test earthing",
              "Apply recommended earthing in accordance with standard S009 :2013 including TCR/CES earth wire",
              "Observe colour coding when terminating",
              "Install and terminate one jumperable distributor (campus distributor or building distributor) with a capacity of 100 pair or greater",
              "Terminate one non-jumperable distributor and a patch panel"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task2_perf_${i}`]: 'yes' })}>
                  {compRecord[`task2_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task2_perf_${i}`]: 'no' })}>
                  {compRecord[`task2_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '20px' }}>
          <tbody>
            {[
              "Terminate at least one 50 pair, one 4 pair and one Ethernet cables including accurate completion of installation records, drawing alterations and compliance forms",
              "Read and interpret drawings relate to cable layouts, outlet location, cable coding system, and identifiers and distributor locations and test for integration with existing systems",
              "Label cable pairs and earthing system, recording details in cable record and complete a TCA form",
              "Interpret and apply relevant legislation, codes, regulations and standards",
              "Comply with all WHS requirements and work practices",
              "Visually inspect new work to check for correct colour coding and sequencing and correct separations",
              "Conduct system testing in accordance with manufacturer specifications"
            ].map((q, idx) => {
              const i = idx + 6;
              return (
                <tr key={i}>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '60%' }}>{q}</td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '10%', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task2_perf_${i}`]: 'yes' })}>
                    {compRecord[`task2_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '10%', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task2_perf_${i}`]: 'no' })}>
                    {compRecord[`task2_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '20%' }}></td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Comments/Feedback to Participant</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '55%', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '45%', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '80px', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
          <textarea
            className="no-print"
            style={{ width: '100%', minHeight: '60px', border: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
            value={compRecord.task2_feedback || ''}
            onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, task2_feedback: e.target.value }) }}
            readOnly={isStudent}
          />
          <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '60px', fontSize: '10pt' }}>{compRecord.task2_feedback}</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif' }}>
          Result:{' '}
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task2_result: 'S' }) }} style={{ padding: '4px' }}>
            Satisfactory (S)
            {compRecord.task2_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
          <span style={{ margin: '0 4px' }}>/</span>
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task2_result: 'NS' }) }} style={{ padding: '4px' }}>
            Not Satisfactory (NS)
            {compRecord.task2_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%', borderRight: '1.5px solid black', padding: '10px', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ width: '45%', padding: '10px', position: 'relative', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('task2_assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.task2_assessor_signature && <img src={compRecord.task2_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.task2_assessor_signature && <img src={compRecord.task2_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(compRecord.assessment_date)}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', margin: '20px 0', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 3 – OBSERVATION</h1>
        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', textAlign: 'center', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif' }}>Administration and supervision</h2>
        <div style={{ fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.5' }}>
          <p style={{ marginBottom: '15px' }}>In this task you will install terminal blocks and terminate Cables in both side of the MDF according to regulations and industry practices and oversee the final steps in the cabling process. Follow these steps:</p>
          <div style={{ marginBottom: '15px' }}>AT 3.1. Read and interpret drawings related to cable type, customer distribution reacrd</div>
          <div style={{ marginBottom: '15px' }}>AT 3.2. Update plans with installation details and system plans</div>
          <div style={{ marginBottom: '15px' }}>AT 3.3. Complete a MDF record for the cabling system</div>
          <div style={{ marginBottom: '15px' }}>AT 3.4. Label cable pairs accurately and according to regulations</div>
          <div style={{ marginBottom: '15px' }}>AT 3.5. Inspect jumpers for separations and compliance with regulations</div>
          <div style={{ marginBottom: '15px' }}>AT 3.6 make adjustments when cabling</div>
          <div style={{ marginBottom: '15px' }}>AT 3.7. Interpret and apply relevant legislation, codes, regulations and standards</div>
          <div style={{ marginBottom: '15px' }}>AT 3.8 supervise cabling work of another cabler by checking their work for compliance with in accordance with standard S009:2013</div>

          <p style={{ fontWeight: 'bold', marginBottom: '10px', marginTop: '20px', fontSize: '12pt' }}>Required documents and equipment:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '0', marginTop: '0' }}>
            <li style={{ marginBottom: '10px' }}>Access to cable system</li>
            <li style={{ marginBottom: '10px' }}>Test equipment as used in course- e.g. multimeter, continuity tester, test telephone, cable identification test set</li>
            <li style={{ marginBottom: '10px' }}>Test record sheet</li>
            <li style={{ marginBottom: '10px' }}>Cable plans</li>
          </ul>
        </div>
        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</h1>
        <p style={{ fontStyle: 'italic', fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </p>
        <p style={{ fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </p>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          Assessor Instructions:
        </p>
        <p style={{ fontSize: '10pt', marginBottom: '20px', textAlign: 'justify', fontFamily: '"Times New Roman", Times, serif' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </p>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Outcomes:</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }} rowSpan={2}>
                <div style={{ fontWeight: 'bold' }}>Oral assessment questions</div>
                <div style={{ fontWeight: 'normal' }}>Use questions to confirm the candidates understanding of the task samples shown below</div>
                <div style={{ fontWeight: 'bold' }}>Note any additional questions you use during the assessment</div>
              </th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} rowSpan={2}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid black', padding: '6px', fontWeight: 'bold' }}>Questions</td>
            </tr>
          </thead>
          <tbody>
            {[
              "Name three potential faults on a cable system",
              "Your assessor will hand you a testing device. What is the fault that the tester you are holding detects?",
              "What steps can you take to rectify this fault?",
              "What steps can a cabler take to avoid this fault when installing cable?"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task3_oral_${i}`]: 'yes' })}>
                  {compRecord[`task3_oral_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task3_oral_${i}`]: 'no' })}>
                  {compRecord[`task3_oral_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginTop: '20px', marginBottom: '10px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Evidence of performance:</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }}>Did the candidate satisfactorily:</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px' }}></th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px' }}></th>
            </tr>
          </thead>
          <tbody>
            {[
              "Read and interpret drawings related to cable layouts, outlet location, cable coding system, and identifiers and distributor locations for the purpose of locating system earthing",
              "Update plans with installation details and system plans",
              "Complete a TCA for the cabling system",
              "Label cable pairs accurately and according to regulations",
              "Inspect cabling for separations and compliance with regulations"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task3_perf_${i}`]: 'yes' })}>
                  {compRecord[`task3_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task3_perf_${i}`]: 'no' })}>
                  {compRecord[`task3_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '20px' }}>
          <tbody>
            {[
              "Make adjustments when cabling",
              "Interpret and apply relevant legislation, codes, regulations and standards",
              "Supervise cabling work of another cabler by checking their work for compliance with in accordance with standard S009:2013"
            ].map((q, idx) => {
              const i = idx + 5;
              return (
                <tr key={i}>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '60%' }}>{q}</td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '10%', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task3_perf_${i}`]: 'yes' })}>
                    {compRecord[`task3_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '10%', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task3_perf_${i}`]: 'no' })}>
                    {compRecord[`task3_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                  </td>
                  <td style={{ border: '1.5px solid black', padding: '6px', width: '20%' }}></td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Comments/Feedback to Participant</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '55%', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '45%', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '80px', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
          <textarea
            className="no-print"
            style={{ width: '100%', minHeight: '60px', border: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
            value={compRecord.task3_feedback || ''}
            onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, task3_feedback: e.target.value }) }}
            readOnly={isStudent}
          />
          <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '60px', fontSize: '10pt' }}>{compRecord.task3_feedback}</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif' }}>
          Result:{' '}
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task3_result: 'S' }) }} style={{ padding: '4px' }}>
            Satisfactory (S)
            {compRecord.task3_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
          <span style={{ margin: '0 4px' }}>/</span>
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task3_result: 'NS' }) }} style={{ padding: '4px' }}>
            Not Satisfactory (NS)
            {compRecord.task3_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%', borderRight: '1.5px solid black', padding: '10px', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ width: '45%', padding: '10px', position: 'relative', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('task3_assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.task3_assessor_signature && <img src={compRecord.task3_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.task3_assessor_signature && <img src={compRecord.task3_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(compRecord.assessment_date)}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={14} />
      </div>

      {/* ═══════════════════ PAGE 15 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', margin: '20px 0', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 4 – REPORT</h1>
        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', textAlign: 'center', marginBottom: '20px', fontFamily: '"Times New Roman", Times, serif' }}>Knowledge Report</h2>
        <div style={{ fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.5' }}>
          <p style={{ marginBottom: '15px' }}>In this task you will prepare a short report that will summarise the basic knowledge required to work as a cabler. Follow these steps:</p>
          <div style={{ marginBottom: '15px' }}>AT 4.1. Review the list of questions on the following page (be sure to select the right set of questions- ICTCBL320</div>
          <div style={{ marginBottom: '15px' }}>AT 4.2. Research the answers to each question in your student workbook, in magazines, during class work or while talking to your instructor</div>
          <div style={{ marginBottom: '15px' }}>AT 4.3. Prepare your report giving brief answers to each question.</div>
          <div style={{ marginBottom: '15px' }}>AT 4.4. Submit your report to your instructor by the agreed date.</div>
          <div style={{ marginBottom: '15px' }}>AT 4.5 Attend a brief meeting with your instructor. Take a copy of your report. You will be asked oral questions- at least 10 questions- until your instructor judges that you have a suitable knowledge of jumper metallic conductor cable in the access net work</div>

          <p style={{ fontWeight: 'bold', marginBottom: '10px', marginTop: '20px', fontSize: '12pt' }}>Required documents and equipment:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '15px', marginTop: '0' }}>
            <li style={{ marginBottom: '10px' }}>A template for your report- see below</li>
            <li style={{ marginBottom: '10px' }}>A copy of your knowledge report, once developed</li>
            <li style={{ marginBottom: '10px' }}>The TRCP workbooks</li>
          </ul>

          <p style={{ marginBottom: '15px' }}>Sources of information to complete this task can include:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '15px', marginTop: '0' }}>
            <li style={{ marginBottom: '10px' }}>The student workbook</li>
            <li style={{ marginBottom: '10px' }}>Training room sessions</li>
            <li style={{ marginBottom: '10px' }}>Reference texts</li>
            <li style={{ marginBottom: '10px' }}>Consultation with experienced cablers or any other reasonable source of information except direct copying from other candidates</li>
          </ul>

          <p style={{ marginBottom: '15px' }}>.</p>
          <p style={{ marginBottom: '15px' }}>Timing</p>
          <p style={{ marginBottom: '15px' }}>The assessor and candidate will agree on a time to conduct the oral component which should only take 10 to 15 minutes.</p>

          <p style={{ marginBottom: '10px' }}>Knowledge evidence questions</p>
          <ol style={{ paddingLeft: '40px', margin: '0', listStyleType: 'decimal' }}>
            <li style={{ marginBottom: '5px' }}>Knowledge about cable type, termination System and standard to follow</li>
            <li style={{ marginBottom: '5px' }}>Describe the typical Jumbering activity at customer cabling system</li>
            <li style={{ marginBottom: '5px' }}>Give examples of the types of termination blocks used in cabling</li>
            <li style={{ marginBottom: '5px' }}>Identify legislation, codes of practice and Standard that impact on the work activity</li>
            <li style={{ marginBottom: '5px' }}>List the materials used for telecommunications cabling</li>
          </ol>
        </div>
        <PageFooter n={15} />
      </div>

      {/* ═══════════════════ PAGE 16 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div style={{ fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.5' }}>
          <ol start={6} style={{ paddingLeft: '40px', margin: '0 0 20px 0', listStyleType: 'decimal' }}>
            <li style={{ marginBottom: '5px' }}>Describe the important documentation and records required when cabling</li>
            <li style={{ marginBottom: '5px' }}>List some step you can take to make using equipment safer</li>
            <li style={{ marginBottom: '5px' }}>Describe the earthing systems and protection strategies</li>
            <li style={{ marginBottom: '5px' }}>List six specific work place health and safety (WHS) actions and relate them to specific activities and site conditions</li>
            <li style={{ marginBottom: '5px' }}>Explain the purpose of test methods and performance requirements</li>
            <li style={{ marginBottom: '5px' }}>Describe the typical issues and challenges that occur on site and what to do about it</li>
            <li style={{ marginBottom: '5px' }}>Summarise the mandatory workplace records required when installing communications cabling</li>
            <li style={{ marginBottom: '5px' }}>List some of the applications that cabling contribute</li>
            <li style={{ marginBottom: '5px' }}>Define where integral bearer wires are required</li>
            <li style={{ marginBottom: '5px' }}>Describe the responsibilities and process for supervising communications installation works</li>
          </ol>
        </div>

        <div style={{ border: '1.5px solid black', padding: '15px', marginTop: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>Report:</p>
          <textarea
            className="no-print"
            style={{ width: '100%', flex: 1, minHeight: '300px', border: 'none', resize: 'none', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
            value={answers['task4_report'] || ''}
            onChange={(e) => setAnswers({ ...answers, task4_report: e.target.value })}
          />
          <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', flex: 1, minHeight: '300px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>{answers['task4_report']}</div>
        </div>

        <PageFooter n={16} />
      </div>

      {/* ═══════════════════ PAGE 17 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontWeight: 'bold', fontSize: '13pt', textAlign: 'center', margin: '20px 0 30px 0', fontFamily: '"Times New Roman", Times, serif' }}>ASSESSMENT TASK 4 – ASSESSOR CHECKLIST</h1>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Outcomes – Evidence of performance</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '30px' }}>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '60%' }} rowSpan={2}>
                <div style={{ fontWeight: 'bold' }}>Performance indicators</div>
                <div style={{ fontWeight: 'bold' }}>Written report and oral questions</div>
                <div style={{ fontWeight: 'normal' }}>Use the additional space to note any critical oral questions asked.</div>
                <div style={{ fontWeight: 'bold' }}>Did the candidate:</div>
              </th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} colSpan={2}>Satisfactory</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '20%' }} rowSpan={2}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '6px', textAlign: 'left', width: '10%' }}>No</th>
            </tr>
            <tr>
              <td colSpan={4} style={{ border: '1.5px solid black', padding: '6px', height: '24px' }}></td>
            </tr>
          </thead>
          <tbody>
            {[
              "Research answers for each question?",
              "Produce and submit a simple, neat and legible report?",
              "Answer questions confidently and correctly?"
            ].map((q, i) => (
              <tr key={i}>
                <td style={{ border: '1.5px solid black', padding: '6px' }}>{q}</td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task4_perf_${i}`]: 'yes' })}>
                  {compRecord[`task4_perf_${i}`] === 'yes' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px', cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }} onClick={() => setCompRecord({ ...compRecord, [`task4_perf_${i}`]: 'no' })}>
                  {compRecord[`task4_perf_${i}`] === 'no' ? <span style={{ color: 'red', fontSize: '16pt', lineHeight: 1 }}>✓</span> : ''}
                </td>
                <td style={{ border: '1.5px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left' }}>Comments/Feedback to Participant</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '55%', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1.5px solid black', padding: '10px', width: '45%', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(answers.student_date || submitDate || '')}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '80px', marginBottom: '15px', fontFamily: '"Times New Roman", Times, serif' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
          <textarea
            className="no-print"
            style={{ width: '100%', minHeight: '60px', border: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
            value={compRecord.task4_feedback || ''}
            onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, task4_feedback: e.target.value }) }}
            readOnly={isStudent}
          />
          <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '60px', fontSize: '10pt' }}>{compRecord.task4_feedback}</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif' }}>
          Result:{' '}
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task4_result: 'S' }) }} style={{ padding: '4px' }}>
            Satisfactory (S)
            {compRecord.task4_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
          <span style={{ margin: '0 4px' }}>/</span>
          <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, task4_result: 'NS' }) }} style={{ padding: '4px' }}>
            Not Satisfactory (NS)
            {compRecord.task4_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '120%', height: '140%', pointerEvents: 'none' }}></span>}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%', borderRight: '1.5px solid black', padding: '10px', verticalAlign: 'top', fontSize: '10pt' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ width: '45%', padding: '10px', position: 'relative', fontSize: '10pt', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('task4_assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '20px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.task4_assessor_signature && <img src={compRecord.task4_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.task4_assessor_signature && <img src={compRecord.task4_assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', width: '100px', display: 'inline-block', height: '18px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '9pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block font-bold text-center" style={{ borderBottom: '1.5px solid black', width: '100px', height: '18px' }}>
                    {formatDisplayDate(compRecord.assessment_date)}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={17} />
      </div>

      {/* ═══════════════════ PAGE 18 – TASK 5 INTRO + Q1-4 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task5.title}</h1>
        {task5.sections?.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-2">
            {section.title && <h3 className="font-bold mb-1">{section.title}</h3>}
            <p className="whitespace-pre-wrap text-[9.5pt]">{section.content}</p>
          </div>
        ))}
        <table className="w-full border-collapse border-[1.5px] border-black text-[9.5pt] mt-2">
          <thead>
            <tr>
              <th className="bg-[#5b9bd5] text-black text-center font-bold text-lg py-1 border-[1.5px] border-black">Questions</th>
            </tr>
          </thead>
          <tbody>
            {qs5.slice(0, 4).map((q: any) => renderT5Row(q))}
          </tbody>
        </table>
        <PageFooter n={18} />
      </div>

      {/* ═══════════════════ PAGE 19 – TASK 5 Q5-7 (Fig 1) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[9.5pt]">
          <tbody>
            {qs5.slice(4, 7).map((q: any) => renderT5Row(q))}
            <tr>
              <td className="border-[1.5px] border-black p-2 sm:p-3">
                <div className="pl-6">
                  <span className="whitespace-pre-wrap font-normal">Fig 2</span>
                  <div className="mt-2 flex justify-center">
                    <img src="/assets/question-4/image2.png" alt="Fig 2" style={{ maxWidth: '300px', height: 'auto' }} />
                  </div>
                </div>
              </td>
            </tr>
            <tr><td className="border-[1.5px] border-black h-12"></td></tr>
          </tbody>
        </table>
        <PageFooter n={19} />
      </div>

      {/* ═══════════════════ PAGE 20 – TASK 5 Q8-14 (Fig 2, cable image) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[9.5pt]">
          <tbody>
            {qs5.slice(7, 14).map((q: any) => renderT5Row(q))}
          </tbody>
        </table>
        <PageFooter n={20} />
      </div>

      {/* ═══════════════════ PAGE 21 – TASK 5 Q15-21 (tool images) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[9.5pt]">
          <tbody>
            {qs5.slice(14, 21).map((q: any) => renderT5Row(q))}
          </tbody>
        </table>
        <PageFooter n={21} />
      </div>

      {/* ═══════════════════ PAGE 22 – TASK 5 Q22-24 + DECLARATIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[9.5pt] mb-4">
          <tbody>
            {qs5.slice(21).map((q: any) => renderT5Row(q))}
          </tbody>
        </table>
        {renderDeclarations('task5')}
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', marginTop: '16px', borderTop: '2px solid black', paddingTop: '8px' }}>
          END OF ASSESSMENT
        </div>
        <PageFooter n={22} />
      </div>

    </div>
  );
};
