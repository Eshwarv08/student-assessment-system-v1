import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions13';

const InnerHeader = () => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
    <div style={{ fontSize: '8pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', width: '35%', lineHeight: '1.2', paddingTop: '8px' }}>
      {assessmentQuestions.metadata.code}<br />
      {assessmentQuestions.metadata.course}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
      <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain', marginBottom: '2px' }} />
      <div style={{ color: '#8b0000', fontSize: '5pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
        RTO NO: 40954
      </div>
    </div>
    <div style={{ width: '35%' }}></div>
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div style={{ marginTop: 'auto', paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '8pt', fontFamily: '"Times New Roman", Times, serif', color: '#555' }}>
    <span>ACTA College RTO 40954 | 32 Terminus Street| Liverpool Sydney NSW 2170 | V3.0</span>
    <span>Page {n} of 14</span>
  </div>
);

const BlueHeader = ({ text }: { text: string }) => (
  <div style={{ background: '#89b4e6', padding: '4px 8px', fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '12px', marginTop: '16px', color: '#000' }}>
    {text}
  </div>
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
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_decl_date || (submitDate ? new Date(submitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])} 
                      onChange={(e) => setAnswers({ ...answers, student_decl_date: e.target.value })} 
                      max={new Date().toISOString().split('T')[0]} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', paddingLeft: '4px' }}>
                    {formatDisplayDate(answers.student_decl_date || submitDate || new Date().toISOString().split('T')[0])}
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
          Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>S{compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          Not Satisfactory (<span style={{ position: 'relative', display: 'inline-block' }}>NS{compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
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

  const ChecklistHead = ({ title, subtitle, extraSubRow }: { title: string, subtitle?: string, extraSubRow?: string }) => (
    <thead>
      <tr>
        <th rowSpan={subtitle ? 1 : 2} className="border-[1px] border-black bg-[#a6a6a6] text-left px-2 py-1 text-black font-bold font-serif leading-tight">
          {title}
        </th>
        <th colSpan={2} className="border-[1px] border-black bg-[#a6a6a6] text-left px-2 py-1 text-black font-bold font-serif leading-tight">Satisfactory</th>
        <th rowSpan={2} className="border-[1px] border-black bg-[#a6a6a6] text-left px-2 py-1 text-black font-bold font-serif leading-tight">Comments</th>
      </tr>
      <tr>
        {subtitle ? (
          <th className="border-[1px] border-black bg-[#a6a6a6] text-left px-2 py-1 text-black font-bold font-serif leading-tight">{subtitle}</th>
        ) : null}
        <th className="border-[1px] border-black bg-[#a6a6a6] text-left px-2 py-1 text-black font-bold font-serif leading-tight">Yes</th>
        <th className="border-[1px] border-black bg-[#a6a6a6] text-left px-2 py-1 text-black font-bold font-serif leading-tight">No</th>
      </tr>
      {extraSubRow && (
        <tr>
          <td colSpan={4} className="border-[1px] border-black bg-white text-left px-2 py-1 text-black font-bold font-serif leading-tight">{extraSubRow}</td>
        </tr>
      )}
    </thead>
  );

  const TableColGroup = () => (
    <colgroup>
      <col style={{ width: '55%' }} />
      <col style={{ width: '7.5%' }} />
      <col style={{ width: '7.5%' }} />
      <col style={{ width: '30%' }} />
    </colgroup>
  );

  const renderOralRows = (taskKey: string, oralItems: string[]) => (
    <>
      {oralItems.map((item: string, idx: number) => (
        <tr key={`oral-${idx}`}>
          <td className="border-[1px] border-black px-2 py-1 font-serif text-[9.5pt] leading-snug">{item}</td>
          <td className="border-[1px] border-black px-2 py-1 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}`]: 'yes' })}>
            {compRecord[`${taskKey}_oral_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
          <td className="border-[1px] border-black px-2 py-1 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}`]: 'no' })}>
            {compRecord[`${taskKey}_oral_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
          <td className="border-[1px] border-black p-0">
            <textarea className="w-full h-full min-h-[28px] resize-none outline-none p-1 bg-transparent font-serif text-[9.5pt]" 
              value={compRecord[`${taskKey}_oral_${idx}_comment`] || ''}
              onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}_comment`]: e.target.value }) }}
              readOnly={isStudent} />
          </td>
        </tr>
      ))}
    </>
  );

  const renderPerfRows = (taskKey: string, items: string[], startIdx: number, endIdx: number) => (
    <>
      {items.slice(startIdx, endIdx).map((item: string, i: number) => {
        const idx = startIdx + i;
        return (
          <tr key={`perf-${idx}`}>
            <td className="border-[1px] border-black px-2 py-1 font-serif text-[9.5pt] leading-snug">{item}</td>
            <td className="border-[1px] border-black px-2 py-1 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'yes' })}>
              {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
            </td>
            <td className="border-[1px] border-black px-2 py-1 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'no' })}>
              {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
            </td>
            <td className="border-[1px] border-black p-0">
              <textarea className="w-full h-full min-h-[28px] resize-none outline-none p-1 bg-transparent font-serif text-[9.5pt]" 
                value={compRecord[`${taskKey}_perf_${idx}_comment`] || ''}
                onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}_comment`]: e.target.value }) }}
                readOnly={isStudent} />
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
                <input required={isStudent} type="radio" checked={answers[opt.name || qKey] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })} className="mt-0.5" />
                <label>{opt.text}</label>
              </div>
            ))}
            {q.type === 'options' && q.options?.map((opt: any, oIdx: number) => (
              <div key={oIdx} className="flex gap-2 mb-2 items-center">
                <input required={isStudent} type="radio" checked={answers[qKey] === opt.value} onChange={() => setAnswers({ ...answers, [qKey]: opt.value })} className="mt-0.5" />
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
            {q.type === 'text_inputs' && (
              <>
                <div className="grid grid-cols-3 gap-0 border-t-[1px] border-l-[1px] border-black my-4">
                  {q.textInputs?.map((ti: any, tIdx: number) => (
                    <div key={tIdx} className="border-b-[1px] border-r-[1px] border-black p-2 flex flex-col items-center justify-center min-h-[160px] bg-white">
                      {ti.image && (
                        <div className="flex-1 flex items-center justify-center w-full p-2">
                          <img src={ti.image} className="max-w-full max-h-[110px] object-contain" alt={ti.placeholder || "Diagram"} />
                        </div>
                      )}
                      <div className="font-bold text-[11pt] text-black font-serif text-center mt-2">{ti.placeholder}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-4 mb-4">
                  {q.textInputs?.map((ti: any, tIdx: number) => (
                    <div key={`input-${tIdx}`} className="flex items-end gap-2 w-full">
                      <span className="font-bold font-serif text-[11pt]">{ti.placeholder}.</span>
                      <input required={isStudent}  
                        type="text" 
                        className="border-b-[1.5px] border-black flex-1 outline-none bg-transparent font-serif text-[10pt]" 
                        value={answers[ti.name] || ''} 
                        onChange={(e) => setAnswers({...answers, [ti.name]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
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
        <div className="cover-outer-border" style={{ border: '1px solid #89b4e6', padding: '2px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ border: '3px solid #89b4e6', padding: '1px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="cover-inner-border" style={{ border: '1px solid #89b4e6', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '220px', height: 'auto', objectFit: 'contain', marginBottom: '3mm', marginTop: '15mm' }} />
              <div style={{ color: '#8b0000', fontSize: '11pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', marginBottom: '35mm' }}>
                RTO NO: 40954
              </div>

              <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '8mm', lineHeight: '1.2' }}>
                Assessor’s Marking<br />Guide
              </div>

              <div style={{ background: '#89b4e6', height: '14px', width: '100%', margin: '8mm 0 15mm 0' }}></div>

              <div className="cover-subtitle" style={{ fontSize: '24pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '4mm' }}>
                {assessmentQuestions.metadata.code}
              </div>
              
              <div className="cover-subtitle" style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '35mm' }}>
                {assessmentQuestions.metadata.course}
              </div>

              <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="cover-student-name-container" style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                  Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '100%', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>ACTA College Pty. Ltd</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2: Assessor's Marking Guide Instructions */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <thead>
            <tr>
              <th colSpan={2} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontSize: '14pt', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif' }}>
                Assessor’s Marking Guide Instructions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>Prior to<br/>Conducting the<br/>Assessment</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[0].content}</td>
            </tr>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>Conducting the<br/>assessment</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[1].content}</td>
            </tr>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>Reasonable<br/>adjustment</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>
                To meet the needs of all learners’ adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.<br/><br/>
                Examples of reasonable adjustments:<br/>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '4px 0' }}>
                  <li>Educational support</li>
                  <li>presenting questions orally for students with literacy issues</li>
                  <li>presenting work instructions in diagrammatic or pictorial form instead of words and sentences</li>
                  <li>Extra time to complete a course or assessment</li>
                </ul>
                ACTA College will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.
              </td>
            </tr>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>Making the<br/>decision</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[2].content}</td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={2} />
      </div>

      {/* PAGE 3 */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>After the<br/>assessment</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[3].content}</td>
            </tr>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>Assessors<br/>Intervention</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[4].content}</td>
            </tr>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>Assessors Value<br/>Judgement</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[5].content}</td>
            </tr>
            <tr>
              <td style={{ width: '25%', background: '#d9d9d9', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'left' }}>Competency<br/>Decision</td>
              <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.markingGuide[6].content}</td>
            </tr>
          </tbody>
        </table>

        <BlueHeader text={admin.tasksOverview.title} />
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-4">{admin.tasksOverview.intro}</p>
        <p className="text-[9.5pt] font-serif mb-2">Elements of Competency:</p>
        <ol className="list-decimal pl-8 text-[9.5pt] font-serif mb-4">
          <li>{admin.tasksOverview.elements[0]}</li>
          <li>{admin.tasksOverview.elements[1]}</li>
        </ol>
        <PageFooter n={3} />
      </div>

      {/* PAGE 4 */}
      <div className="page">
        <InnerHeader />
        <ol className="list-decimal pl-8 text-[9.5pt] font-serif mb-4" start={3}>
          <li>{admin.tasksOverview.elements[2]}</li>
          <li>{admin.tasksOverview.elements[3]}</li>
        </ol>
        
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-2 mt-4">{admin.tasksOverview.evidenceIntro}</p>
        <ul className="list-disc pl-8 text-[9.5pt] font-serif mb-4" style={{ listStyleType: 'disc' }}>
          {admin.tasksOverview.evidenceItems.map((el: string, idx: number) => <li key={idx}>{el}</li>)}
        </ul>
        
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif font-bold mb-4">{admin.tasksOverview.summary}</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            {admin.tasksOverview.tasks.map((task: any, idx: number) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px', fontWeight: 'bold', width: '20%' }}>{task.id}</td>
                <td style={{ border: '1px solid #000', padding: '6px', width: '20%' }}>{task.type}</td>
                <td style={{ border: '1px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{task.text}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <BlueHeader text={admin.recordingAssessment.title} />
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-4">{admin.recordingAssessment.content}</p>

        <BlueHeader text={admin.competencyAssessment.title} />
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-2">{admin.competencyAssessment.content}</p>
        <ul className="list-disc pl-8 text-[9.5pt] font-serif" style={{ listStyleType: 'circle' }}>
          {admin.competencyAssessment.criteria.map((c: string, idx: number) => (
            <li key={idx}><span className="font-bold">{c}</span></li>
          ))}
        </ul>
        <PageFooter n={4} />
      </div>

      {/* PAGE 5 */}
      <div className="page">
        <InnerHeader />
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-4">The Assessor will be required to enter a result for each participant on the Assessment of Competency Record using the following codes;</p>
        <table style={{ borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', marginLeft: '16px' }}>
          <tbody>
            {admin.competencyAssessment.codes.map((c: any, idx: number) => (
              <tr key={idx}>
                <td style={{ padding: '2px 8px', fontWeight: 'bold', width: '80px' }}>{c.code}</td>
                <td style={{ padding: '2px 8px', fontWeight: 'bold' }}>-</td>
                <td style={{ padding: '2px 8px', fontWeight: 'bold' }}>{c.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-6">{admin.competencyAssessment.footer}</p>

        <BlueHeader text={admin.assessorFeedback.title} />
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif mb-6">{admin.assessorFeedback.content}</p>

        <BlueHeader text={admin.coverSheet.title} />
        <p className="whitespace-pre-wrap text-[9.5pt] font-serif font-bold mb-6">{admin.coverSheet.content}</p>


        <PageFooter n={5} />
      </div>

      {/* PAGE 6 */}
      <div className="page">
        <InnerHeader />
        <h1 className="text-center font-bold font-serif mb-2 uppercase" style={{ fontSize: '13pt', marginTop: '12px' }}>{task1.title}</h1>
        {task1.observationSubtitle && <h2 className="text-center font-bold font-serif mb-4" style={{ fontSize: '12pt' }}>{task1.observationSubtitle}</h2>}
        {task1.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold font-serif text-[10pt] mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap font-serif text-[9.5pt]">{section.content}</p>}
            {section.type === 'image' && (
              <div className="flex justify-center my-4">
                <img src={section.src} alt={section.title} className="max-w-full" style={{ maxHeight: '250px' }} />
              </div>
            )}
          </div>
        ))}
        <PageFooter n={6} />
      </div>

      {/* PAGE 7: Assessment Task 1 — Instructions for Assessor / Assessor Checklist / Oral Assessment Questions */}
      <div className="page">
        <InnerHeader />
        
        <div className="font-bold font-serif text-[10.5pt] mb-2 mt-4">Instructions for assessor:</div>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-2">Distribute a floor plan with the entry point and wall socket locations marked – possibly a unique plan for each participant. Ask candidates to complete the task listed below.</p>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-6">Role play the customer for the purpose of confirming the cable plan.</p>

        <h1 className="text-center font-bold font-serif mb-4 text-[14pt]">ASSESSMENT TASK 1 – ASSESSOR CHECKLIST</h1>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] italic mb-4">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-4">The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
        <h3 className="font-bold font-serif text-[10.5pt] mb-2">Assessor Instructions:</h3>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-4">The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>
        
        <h3 className="font-bold font-serif text-[12pt] mb-2 mt-4">Oral assessment:</h3>
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] table-fixed">
          <TableColGroup />
          <ChecklistHead title="Oral assessment questions" subtitle="Note any additional questions you use during the assessment" />
          <tbody>
            {renderOralRows('task1', task1.checklistItems)}
          </tbody>
        </table>
        <PageFooter n={7} />
      </div>

      {/* PAGE 8: Assessment Task 1 — Record of Performance / Assessment Task 2 — Observation */}
      <div className="page">
        <InnerHeader />
        
        <h3 className="font-bold font-serif text-[12pt] mb-2 mt-4">Record of performance:</h3>
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] mb-8 table-fixed">
          <TableColGroup />
          <ChecklistHead title="Did the candidate:" />
          <tbody>
            {renderPerfRows('task1', task1.performance, 0, task1.performance.length)}
          </tbody>
        </table>

        <div className="text-center font-bold font-serif uppercase mb-2" style={{ fontSize: '12pt', marginTop: '16px', lineHeight: '1.2' }}>
          ASSESSMENT TASK 2- OBSERVATION (PC-1.1,1.4-<br/>1.6,3.1,3.3,3.4,4.1,4.2,4.3)
        </div>
        <h2 className="text-center font-bold font-serif mb-6" style={{ fontSize: '11.5pt' }}>Terminate structured cable using a 110 block</h2>
        
        <p className="font-serif text-[9.5pt] mb-1">Install a 110 block using structured cable termination techniques. Perform the following tasks and demonstrate their completion to the assessor visually with oral explanation.</p>
        <p className="font-serif text-[9.5pt] mb-1">AT 2.1 strip and prepare structured cable suitable for the customer requirements.</p>
        <p className="font-serif text-[9.5pt] mb-1">AT 2.2 maintain twist ratio when preparing and terminating cable</p>
        <p className="font-serif text-[9.5pt] mb-1">AT 2.3 use cable and termination hardware suitable for purpose</p>
        <p className="font-serif text-[9.5pt] mb-6">AT 2.4 explain the role of earthing the system in a structured cable system. Earthing to be performed only by licensed electrician.</p>

        <h3 className="font-bold font-serif text-[9.5pt] mb-2">Required documents and equipment:</h3>
        <ul className="list-disc pl-8 font-serif text-[9.5pt] mb-4">
          <li className="mb-1">A workpolace typical of customer premises cabling worksite – a house, small office, factory- where cabling routes can be identified</li>
          <li className="mb-1">A wall surface</li>
          <li className="mb-1">A 110 block and suitable fixing hardware</li>
        </ul>
        <PageFooter n={8} />
      </div>

      {/* PAGE 9: Assessment Task 2 — Instructions for Assessor / Assessor Checklist / Oral Assessment / Record of Performance (start) */}
      <div className="page">
        <InnerHeader />
        
        <ul className="list-disc pl-8 font-serif text-[9.5pt] mb-6 mt-4">
          <li className="mb-1">Cable stock – cat 5 is suitable for most tasks in this course</li>
          <li className="mb-1">Cable fixing resources – cable ties, catenary wire, cable clips</li>
          <li className="mb-1">Common hand tools</li>
        </ul>

        <h3 className="font-bold font-serif text-[9.5pt] mb-2">Instructions for assessor:</h3>
        <ul className="list-disc pl-8 font-serif text-[9.5pt] mb-6">
          <li className="mb-1">Prepare work station with cable stock, installation tools and access to a real or simulated cavity wall and roof space</li>
          <li className="mb-1">Instruct the candidate to install a 110 block</li>
          <li className="mb-1">Mark an entry point and a location for a 110 block on cabinet, wall or wall cavity</li>
          <li className="mb-1">Ask participants to recommend a cable type to suit this job</li>
          <li className="mb-1">Ask students to supervise each other to ensure regulations or observed</li>
        </ul>

        <h1 className="text-center font-bold font-serif mb-4 text-[14pt]">ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</h1>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] italic mb-4">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-4">The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
        <h3 className="font-bold font-serif text-[10.5pt] mb-2">Assessor Instructions:</h3>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-4">The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>

        <h3 className="font-bold font-serif text-[12pt] mb-2 mt-4">Oral assessment</h3>
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] mb-6 table-fixed">
          <TableColGroup />
          <ChecklistHead title="Oral assessment questions" subtitle="Note any additional questions you use during the assessment" extraSubRow="Termination questions" />
          <tbody>
            {renderOralRows('task2', task2.checklistItems)}
          </tbody>
        </table>

        <h3 className="font-bold font-serif text-[12pt] mb-2 mt-4">Record of performance:</h3>
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] table-fixed">
          <TableColGroup />
          <ChecklistHead title="Did the candidate install termination hardware with:" />
          <tbody>
            {renderPerfRows('task2', task2.performance, 0, 2)}
          </tbody>
        </table>
        <PageFooter n={9} />
      </div>

      {/* PAGE 10: Assessment Task 2 — Record of Performance (continued) / Assessment Task 3 — Observation */}
      <div className="page">
        <InnerHeader />
        
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] mb-8 mt-4 table-fixed">
          <TableColGroup />
          <tbody>
            {renderPerfRows('task2', task2.performance, 2, task2.performance.length)}
          </tbody>
        </table>

        <h1 className="text-center font-bold font-serif mb-1 uppercase" style={{ fontSize: '13pt', marginTop: '16px' }}>{task3.title}</h1>
        {task3.observationSubtitle && <h2 className="text-center font-bold font-serif mb-4" style={{ fontSize: '12pt' }}>{task3.observationSubtitle}</h2>}
        {task3.sections.map((section: any, sIdx: number) => {
          if (section.title === 'Required documents and equipment:') {
            return (
              <div key={sIdx} className="mb-4">
                <h3 className="font-bold font-serif text-[10.5pt] mb-2">{section.title}</h3>
                <ul className="list-disc pl-8 font-serif text-[9.5pt] mb-4">
                  {section.content.split('\n').map((bullet: string, bIdx: number) => 
                    bullet.trim() ? <li key={bIdx}>{bullet.replace('•', '').trim()}</li> : null
                  )}
                </ul>
              </div>
            );
          }
          if (section.title === 'Student Instructions:') {
            return (
               <div key={sIdx} className="mb-4">
                  <p className="whitespace-pre-wrap font-serif text-[9.5pt]">{section.content}</p>
               </div>
            );
          }
          return (
            <div key={sIdx} className="mb-4">
              {section.title && <h3 className="font-bold font-serif text-[10.5pt] mb-2">{section.title}</h3>}
              {section.type === 'text' && <p className="whitespace-pre-wrap font-serif text-[9.5pt]">{section.content}</p>}
            </div>
          );
        })}

        <h3 className="font-bold font-serif text-[10.5pt] mb-2">Instructions for assessor :</h3>
        <ul className="list-disc pl-8 font-serif text-[9.5pt] mb-6">
          <li>Prepare work station with broadband patch cable and tester</li>
          <li>Ensure that there is at least one measurable fault on the cable system</li>
          <li>Direct participant to perform a full range of certification tests</li>
          <li>Review results and discuss the reading indicating a fault</li>
          <li>Direct participant to rectify fault and produce a certification report.</li>
        </ul>

        <h1 className="text-center font-bold font-serif mb-4 text-[14pt]">ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</h1>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] italic mb-4">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-4">The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
        <h3 className="font-bold font-serif text-[10.5pt] mb-2">Assessor Instructions:</h3>
        <p className="whitespace-pre-wrap font-serif text-[9.5pt] mb-4">The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>
        <PageFooter n={10} />
      </div>

      {/* PAGE 11: Assessment Task 3 — Oral Assessment / Record of Performance / Assessment Task 4 */}
      <div className="page">
        <InnerHeader />
        
        <h3 className="font-bold font-serif text-[12pt] mb-2 mt-4">Oral assessment:</h3>
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] mb-6 table-fixed">
          <TableColGroup />
          <ChecklistHead title="Oral assessment questions" subtitle="Note any additional questions you use during the assessment" extraSubRow="Testing and recording questions" />
          <tbody>
            {renderOralRows('task3', task3.checklistItems)}
          </tbody>
        </table>

        <h3 className="font-bold font-serif text-[12pt] mb-2 mt-4">Record of performance:</h3>
        <table className="w-full border-collapse border-[1px] border-black text-[9.5pt] mb-8 table-fixed">
          <TableColGroup />
          <ChecklistHead title="Did the candidate:" />
          <tbody>
            {renderPerfRows('task3', task3.performance, 0, task3.performance.length)}
          </tbody>
        </table>

        <h1 className="text-center font-bold font-serif mb-4 uppercase" style={{ fontSize: '13pt', marginTop: '16px' }}>{task4.title}</h1>
        {task4.sections.map((section: any, sIdx: number) => {
          if (section.title === 'Make sure you:') {
            return (
              <div key={sIdx} className="mb-4">
                <h3 className="font-bold font-serif text-[10pt] mb-2">{section.title}</h3>
                <ul className="list-disc pl-8 font-serif text-[9.5pt] mb-4">
                  {section.content.split('\n').map((bullet: string, bIdx: number) => 
                    bullet.trim() ? <li key={bIdx}>{bullet.replace('•', '').trim()}</li> : null
                  )}
                </ul>
              </div>
            );
          }
          return (
            <div key={sIdx} className="mb-4">
              {section.title && <h3 className="font-bold font-serif text-[10.5pt] mb-1">{section.title}</h3>}
              {section.type === 'text' && <p className="whitespace-pre-wrap font-serif text-[9.5pt]">{section.content}</p>}
            </div>
          );
        })}
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
