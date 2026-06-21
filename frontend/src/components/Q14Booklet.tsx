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
  const q4_5 = t1qs.slice(3, 5);
  const q6 = t1qs[5];
  const q7_11 = t1qs.slice(6, 11);
  const q12 = t1qs[11];

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
                      <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>
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
                <input type="radio" checked={answers[opt.name || qKey] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })} className="mt-0.5" />
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
                     <input type="radio" checked={answers[qKey] === opt.value} onChange={() => setAnswers({ ...answers, [qKey]: opt.value })} className="mt-0.5" />
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
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>{assessmentQuestions.metadata.rtoName}</div>
            </div>
          </div>
        </div>
        <PageFooter n={1} />
      </div>

      {/* PAGE 2: Assessment Competency Record */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">ASSESSMENT COMPETENCY RECORD</h1>
        <div className="intro-box">
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>
        <table className="comp-table" style={{ marginBottom: '5px' }}>
          <tbody>
            <tr><td className="label-col">Student's Name</td><td className="field-value-cell font-bold">{studentName}</td></tr>
            <tr><td className="label-col">Assessor's Name</td><td className="field-value-cell"></td></tr>
            <tr><td className="label-col">Assessment Site</td><td className="field-value-cell"></td></tr>
            <tr><td className="label-col">Assessment Date/s</td><td className="field-value-cell font-bold"></td></tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Assessor Declaration</div>
                <div>In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.</div>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
          <tbody>
            <tr>
              <th style={{ border: '1px solid #555', padding: '4px', textAlign: 'left', background: '#f0f0f0' }}>Please attach the following documentation to this form</th>
              <th style={{ border: '1px solid #555', padding: '4px', width: '15%', background: '#f0f0f0' }}>Result</th>
              <th style={{ border: '1px solid #555', padding: '4px', width: '25%', background: '#f0f0f0' }}>FINAL ASSESSMENT RESULT:</th>
            </tr>
            <tr>
              <td className="font-bold">Assessment Task 1 - Questions and Answers</td>
              <td className="text-center">S / NS</td>
              <td rowSpan={4} style={{ verticalAlign: 'middle' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label><input type="checkbox" disabled /> Competent (C)</label>
                   <label><input type="checkbox" disabled /> Not Competent (NC)</label>
                 </div>
              </td>
            </tr>
            <tr><td className="font-bold">Assessment Task 2 - Observation</td><td className="text-center">S / NS</td></tr>
            <tr><td className="font-bold">Assessment Task 3 - Observation</td><td className="text-center">S / NS</td></tr>
            <tr><td className="font-bold">Assessment Task 4 - Report</td><td className="text-center">S / NS</td></tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
          <thead>
            <tr><th colSpan={3} style={{ border: '1px solid #555', padding: '3px', background: '#f0f0f0' }}>Assessor's Feedback (as Required):</th></tr>
          </thead>
          <tbody>
            <tr><td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', width: '30%', border: '1px solid #555' }}>Attempt &nbsp;&nbsp;&nbsp;&nbsp; Date</td><td style={{ border: '1px solid #555', width: '70%' }}></td></tr>
            <tr><td className="attempt-td" style={{ width: '10%' }}>1</td><td className="attempt-td" style={{ width: '20%' }}></td><td className="attempt-fb"></td></tr>
            <tr><td className="attempt-td">2</td><td className="attempt-td"></td><td className="attempt-fb"></td></tr>
            <tr><td className="attempt-td">3</td><td className="attempt-td"></td><td className="attempt-fb"></td></tr>
            <tr><td colSpan={2} style={{ border: '1px solid #555', fontWeight: 'bold', padding: '3px 6px', textAlign: 'center' }}>Final Feedback:</td><td style={{ border: '1px solid #555' }}></td></tr>
          </tbody>
        </table>
        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '3px' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 hover:bg-blue-50/50" style={{ flex: 1, cursor: isStudent ? 'default' : 'pointer' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} className="max-h-[25px] max-w-[100px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic">Sign Here</span>}
                  </div>
                </div>
                <div className="mt-2">Date: <span className="font-bold border-b border-dashed border-gray-400 inline-block min-w-[80px] text-center ml-1">{formatDisplayDate(compRecord.assessor_sig_date)}</span></div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', verticalAlign: 'top' }}>
                <strong>Student:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div onClick={() => openSigModal('student_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 hover:bg-blue-50/50" style={{ flex: 1 }}>
                    {answers.student_signature_url ? <img src={answers.student_signature_url} className="max-h-[25px] max-w-[100px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic">Sign Here</span>}
                  </div>
                </div>
                <div className="mt-2">Date: <span className="font-bold">{formatDisplayDate(submitDate || '')}</span></div>
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={2} />
      </div>

      {/* PAGE 3: Administrative Use Only */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">ADMINISTRATIVE USE ONLY</h1>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Unit Code/Name</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.unitCodeName}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Pre-requisites</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.preRequisites}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Co-requisites</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.coRequisites}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Unit Summary</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.unitSummary}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Target Group</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.targetGroup}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Conditions and Context of Assessments</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.conditionsAndContext}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Specific Resources Required</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.specificResources}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Re-assessment</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.reAssessment}</p>
        </div>
        <PageFooter n={3} />
      </div>

      {/* PAGE 4: Admin Instructions */}
      <div className="page">
        <InnerHeader />
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Plagiarism</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.plagiarism}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Complaints and Appeal</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.complaintsAndAppeals}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Assessors Intervention</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.assessorsIntervention}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Attaching Documents</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.attachingDocuments}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Assessment Instruction</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.assessmentInstruction}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Assessment Task 1</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.task1Description}</p>
        </div>
        <PageFooter n={4} />
      </div>

      {/* PAGE 5: Admin Instructions (continued) */}
      <div className="page">
        <InnerHeader />
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Assessment Task 2</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.task2Description}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Assessment Task 3</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.task3Description}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Assessment Task 4</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.task4Description}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Competency Decision</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.competencyDecision}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Reasonable Adjustment</h3>
          <p className="whitespace-pre-wrap text-sm">Reasonable adjustment refers to adjustments made to how assessments are conducted but not to the requirements of the assessment. ACTA College will consult and implement reasonable adjustments for students with disability and learning difficulties.</p>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-1">Cover Sheet for Submission</h3>
          <p className="whitespace-pre-wrap text-sm">{admin.coverSheetInstruction}</p>
        </div>
        <PageFooter n={5} />
      </div>

      {/* PAGE 6: Assessment Task 1 — Written Questions and Answers (Student Instructions / Questions 1-2) */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task1.title}</h1>
        {task1.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-6">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
          </div>
        ))}
        {q1_2.map((q: any) => renderQ(q, 'task1'))}
        <PageFooter n={6} />
      </div>

      {/* PAGE 7: Assessment Task 1 — Questions 3-5 */}
      <div className="page">
        <InnerHeader />
        {renderQ(q3, 'task1')}
        {q4_5.map((q: any) => renderQ(q, 'task1'))}
        <PageFooter n={7} />
      </div>

      {/* PAGE 8: Assessment Task 1 — Questions 6-11 */}
      <div className="page">
        <InnerHeader />
        {renderQ(q6, 'task1')}
        {q7_11.map((q: any) => renderQ(q, 'task1'))}
        <PageFooter n={8} />
      </div>

      {/* PAGE 9: Assessment Task 1 — Question 12 / Comments/Feedback / Declarations */}
      <div className="page">
        <InnerHeader />
        {renderQ(q12, 'task1')}
        {renderDeclarations('task1')}
        <PageFooter n={9} />
      </div>

      {/* PAGE 10: Assessment Task 2 — Observation: Prepare to Install Coaxial Cable */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task2.observationTitle}</h1>
        {task2.observationSubtitle && <h2 className="sub-title mb-4">{task2.observationSubtitle}</h2>}
        {task2.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
          </div>
        ))}
        <PageFooter n={10} />
      </div>

      {/* PAGE 11: Assessment Task 2 — Assessor Checklist / Oral Assessment Questions / Record of Performance start */}
      <div className="page">
        <InnerHeader />
        <h2 className="sub-title" style={{ marginBottom: '4px' }}>{task2.checklistTitle}</h2>
        <p className="whitespace-pre-wrap text-[9pt] mb-2">{task2.checklistIntro}</p>
        <p className="whitespace-pre-wrap text-[9pt] italic mb-4">{task2.assessorInstructions}</p>
        
        <div className="font-bold text-sm mb-2">{task2.checklistLabel}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderOralRows('task2', task2.checklistItems)}
          </tbody>
        </table>

        <div className="font-bold text-sm mb-2">{task2.performanceHeader}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-2">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task2', task2.performance, 0, 3)}
          </tbody>
        </table>
        <PageFooter n={11} />
      </div>

      {/* PAGE 12: Assessment Task 2 — Record of Performance (continued) / Declarations */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task2', task2.performance, 3, task2.performance.length)}
          </tbody>
        </table>
        {renderDeclarations('task2')}
        <PageFooter n={12} />
      </div>

      {/* PAGE 13: Assessment Task 3 — Observation: Install and Terminate Coaxial Cable */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task3.observationTitle}</h1>
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
        
        <div className="font-bold text-sm mb-2">{task3.checklistLabel}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt]">
          <ChecklistHead />
          <tbody>
            {renderOralRows('task3', task3.checklistItems)}
          </tbody>
        </table>
        <PageFooter n={13} />
      </div>

      {/* PAGE 14: Assessment Task 3 — Record of Performance / Declarations */}
      <div className="page">
        <InnerHeader />
        <div className="font-bold text-sm mb-2 mt-2">{task3.performanceHeader}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task3', task3.performance, 0, task3.performance.length)}
          </tbody>
        </table>
        {renderDeclarations('task3')}
        <PageFooter n={14} />
      </div>

      {/* PAGE 15: Assessment Task 4 — Report: Mechanical Splice / Assessor Checklist / Oral Assessment */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task4.observationTitle || task4.title}</h1>
        {task4.observationSubtitle && <h2 className="sub-title mb-4">{task4.observationSubtitle}</h2>}
        {task4.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-4">
            {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
            {section.type === 'text' && <p className="whitespace-pre-wrap">{section.content}</p>}
          </div>
        ))}
        
        <h2 className="sub-title mt-6" style={{ marginBottom: '4px' }}>{task4.checklistTitle}</h2>
        <p className="whitespace-pre-wrap text-[9pt] mb-2">{task4.checklistIntro}</p>
        <p className="whitespace-pre-wrap text-[9pt] italic mb-4">{task4.assessorInstructions}</p>
        
        <div className="font-bold text-sm mb-2">{task4.checklistLabel}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt]">
          <ChecklistHead />
          <tbody>
            {renderOralRows('task4', task4.checklistItems)}
          </tbody>
        </table>
        <PageFooter n={15} />
      </div>

      {/* PAGE 16: Assessment Task 4 — Record of Performance / Declarations / End of Assessment */}
      <div className="page">
        <InnerHeader />
        <div className="font-bold text-sm mb-2 mt-2">{task4.performanceHeader}</div>
        <table className="w-full border-collapse border-[1.5px] border-black text-[9pt] mb-6">
          <ChecklistHead />
          <tbody>
            {renderPerfRows('task4', task4.performance, 0, task4.performance.length)}
          </tbody>
        </table>
        {renderDeclarations('task4')}
        <div className="text-center font-bold text-xl mt-8 mb-4 tracking-widest uppercase">End of Assessment</div>
        <PageFooter n={16} />
      </div>

    </div>
  );
};
