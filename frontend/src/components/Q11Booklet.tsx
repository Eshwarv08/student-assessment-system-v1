import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions11';

interface Q11BookletProps {
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
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
    <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
      <div style={{ textDecoration: 'underline' }}>Assessment booklet</div>
      <div style={{ textDecoration: 'underline' }}>{assessmentQuestions.metadata.code} - {assessmentQuestions.metadata.course}</div>
    </div>
    <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <>
    <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.3 | 2024</span><span>Page {n} of 12</span></div>
    <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.3 | 2024</span><span>Page {n} of 12</span></div>
  </>
);

export const Q11Booklet: React.FC<Q11BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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

  const renderStudentDecl = (taskId: string) => (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', marginTop: '16px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '8px' }}>Comments/Feedback to Participant</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ border: '1.5px solid #000', padding: '12px 16px', width: '50%', verticalAlign: 'top' }}>
              <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
            </td>
            <td style={{ border: '1.5px solid #000', padding: '12px 16px', width: '50%', verticalAlign: 'top' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '20px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : ''}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, display: 'inline-block', height: '20px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord[`${taskId}_student_date`] !== undefined ? compRecord[`${taskId}_student_date`] : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })}  />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord[`${taskId}_student_date`] !== undefined ? compRecord[`${taskId}_student_date`] : (submitDate || '')))}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderAssessorDecl = (taskId: string) => {
    const isS = compRecord[`${taskId}_result`] === 'S';
    const isNS = compRecord[`${taskId}_result`] === 'NS';
    return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Assessor's Feedback:</div>
              <textarea className="no-print" style={{ width: '100%', height: '100px', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord[`${taskId}_feedback`] || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, [`${taskId}_feedback`]: e.target.value})} disabled={isStudent}></textarea>
              <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>{compRecord[`${taskId}_feedback`]}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', marginBottom: '16px' }}>
        Result: Satisfactory 
        <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskId}_result`]: 'S'})} style={{ position: 'relative', display: 'inline-block', margin: '0 6px' }}>
          (S)
          {isS && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '36px', height: '36px', pointerEvents: 'none' }}></span>}
        </span>
        /Not Satisfactory 
        <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskId}_result`]: 'NS'})} style={{ position: 'relative', display: 'inline-block', margin: '0 6px' }}>
          (NS)
          {isNS && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2.5px solid red', borderRadius: '50%', width: '56px', height: '36px', pointerEvents: 'none' }}></span>}
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ border: '1.5px solid #000', padding: '12px 16px', width: '50%', verticalAlign: 'top' }}>
              <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
            </td>
            <td style={{ border: '1.5px solid #000', padding: '12px 16px', width: '50%', verticalAlign: 'top' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '20px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : ''}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, display: 'inline-block', height: '20px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: 0 }} value={compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, assessment_date: e.target.value, assessor_sig_date_page2: e.target.value, admin_sig_date: e.target.value, task1_date_observed: e.target.value})} disabled={isStudent} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || '')}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )};

  const renderDeclarations = (taskKey: string) => (
    <>{renderStudentDecl(taskKey)}{renderAssessorDecl(taskKey)}</>
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
    
    const lines = q.text.split('\n');
    const headerText = lines[0];
    const subText = lines.slice(1).join('\n');

    return (
      <tr key={q.id}>
        <td style={{ border: '1.5px solid #000', padding: 0 }}>
          <div style={{ borderBottom: '1.5px solid #000', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 'bold', fontSize: '10.5pt' }}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{q.id}.  {headerText}</span>
          </div>
          <div style={{ padding: '8px 12px', minHeight: '80px', fontSize: '10.5pt', display: 'flex', flexDirection: 'column' }}>
            {subText && <div style={{ fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{subText}</div>}
            
            {q.type === 'text' && (
              <>
                <textarea required={isStudent} className="no-print" style={{ width: '100%', minHeight: '80px', border: 'none', resize: 'vertical', background: 'transparent', outline: 'none', fontFamily: '"Times New Roman", Times, serif' }} value={answers[qKey] || ''} onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })} />
                <div className="hidden print:block whitespace-pre-wrap">{answers[qKey]}</div>
              </>
            )}
            
            {(q.type === 'options' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
              const isCheckbox = opt.type === 'checkbox' || q.id === 8;
              const ansArray = answers[qKey] || [];
              const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
              return (
                <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', minWidth: '14px', border: '1px solid #000', position: 'relative', marginTop: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {checked && <span style={{ position: 'absolute', color: 'red', fontSize: '18px', top: '-6px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '10.5pt', lineHeight: '1.4' }}>{opt.text}</span>
                    <input type={isCheckbox ? 'checkbox' : 'radio'} name={isCheckbox ? undefined : qKey} className="hidden" checked={checked} onChange={(e) => {
                      if (isCheckbox) {
                        let newArr = [...(Array.isArray(answers[qKey]) ? answers[qKey] : [])];
                        if (e.target.checked) newArr.push(opt.value); else newArr = newArr.filter((v: any) => v !== opt.value);
                        setAnswers({ ...answers, [qKey]: newArr });
                      } else {
                        setAnswers({ ...answers, [qKey]: opt.value });
                      }
                    }} />
                  </label>
                </div>
              );
            })}
          </div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] mt-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="w-[40%] p-1 text-blue-800 border-r-[1.5px] border-black flex items-center pl-2">Assessor to tick (☑)</div>
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
        </td>
      </tr>
    );
  };

  const q11Styles = `
      .q11-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q11-booklet-view * { box-sizing: border-box; }
      .q11-booklet-view .page {
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
      .q11-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q11-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q11-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q11-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q11-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q11-booklet-view table td, .q11-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q11-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q11-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q11-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q11-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q11-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q11-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q11-booklet-view .page-footer {
        margin-top: auto; padding-top: 4mm; border-top: 1px solid #000;
        display: flex; justify-content: space-between; font-size: 8pt;
      }
      .q11-booklet-view .inner-header { margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
      .q11-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q11-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      @media print {
        .q11-booklet-view { background: #fff !important; padding: 0 !important; }
        .q11-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }

      @media screen and (max-width: 800px) {
        .q11-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q11-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q11-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q11-booklet-view .flex, .q11-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q11-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q11-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q11-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q11-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q11-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q11-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  `;

  return (
    <div className="q11-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q11Styles }} />

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
        <div style={{ border: '3.5px solid #00a2e8', padding: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="cover-inner-border" style={{ border: '1.2px solid #00a2e8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '220px', height: 'auto', objectFit: 'contain', marginBottom: '2mm', marginTop: '10mm' }} />
            <div style={{ fontSize: '13pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#8b0000', marginBottom: '8mm' }}>RTO NO: 40954</div>
            
            <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '3mm', letterSpacing: '1px' }}>Assessment Booklet</div>
            
            <div style={{ background: '#00a2e8', height: '14px', width: '100%', margin: '4mm 0', marginBottom: '8mm' }}></div>
            
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
        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: '4mm', borderTop: '1px solid #000', paddingTop: '4mm' }}><span></span><span>Page 1 of 12</span></div>
        <div className="no-print page-footer"><span></span><span>Page 1 of 12</span></div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
          <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
            <div style={{ textDecoration: 'underline' }}>Assessment booklet</div>
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
              <td style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Date</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="date" className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px 8px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, assessment_date: e.target.value, assessor_sig_date_page2: e.target.value, admin_sig_date: e.target.value, task1_date_observed: e.target.value})} disabled={isStudent} />
                <div className="hidden print:block" style={{ padding: '6px 8px', minHeight: '30px' }}>{formatDisplayDate(compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || '')}</div>
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
              <td rowSpan={3} style={{ background: '#d9d9d9', border: '1px solid #000', padding: '4px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
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
                  Observation
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
                  Questions and Answers
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
                  <input type="date" className="no-print" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', padding: '6px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord[`attempt_${attempt}_date`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_date`]: e.target.value })} disabled={isStudent} />
                  <div className="hidden print:block text-center p-1.5">{formatDisplayDate(compRecord[`attempt_${attempt}_date`] || '')}</div>
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
                        value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_override !== undefined ? compRecord.student_sig_date_override : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_override !== undefined ? compRecord.student_sig_date_override : (submitDate || '')))}</span>
                  </div>
                </div>
              </td>
            </tr>
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
                      <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                        value={compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, assessment_date: e.target.value, assessor_sig_date_page2: e.target.value, admin_sig_date: e.target.value, task1_date_observed: e.target.value})} disabled={isStudent} />
                    </span>
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || '')}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="hidden print:flex" style={{ justifyContent: 'space-between', fontSize: '8pt', marginTop: 'auto', paddingTop: '4mm' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.3 | 2024</span><span>Page 2 of 12</span></div>
        <div className="no-print page-footer" style={{ borderTop: 'none', marginTop: 'auto' }}><span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.3 | 2024</span><span>Page 2 of 12</span></div>
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN (Unit Code → Plagiarism) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ background: '#b3b3b3', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Administrative use only:</td>
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
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: 0 }}
                      value={compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || ''} onChange={(e) => setCompRecord({...compRecord, assessment_date: e.target.value, assessor_sig_date_page2: e.target.value, admin_sig_date: e.target.value, task1_date_observed: e.target.value})} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', width: '100px', height: '20px', margin: '0 8px' }}>{formatDisplayDate(compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || '')}</span>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.unitSummary}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Conditions and context of the assessments</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.conditionsAndContext}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Specific Resources Required</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Learner Guide</li>
                  <li>Assessment Booklet</li>
                  <li>Practical Workshop</li>
                  <li>Manufacturers Manuals and specifications</li>
                  <li>Workplace policy and procedures</li>
                </ul>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.reAssessment}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.plagiarism}</td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN (Complaints → Competency Decision) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Complaints and appeal</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.complaintsAndAppeals}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessors Intervention</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessorsIntervention}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Attaching documents</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.attachingDocuments}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Instruction</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessmentInstruction}</td></tr>
            {admin.taskOverviews?.map((task: any, idx: number) => (
              <tr key={idx}><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{task.id}:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{task.text}</td></tr>
            ))}
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN (Reasonable Adjustment + Cover Sheet) ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt', marginBottom: '20px' }}>
          <tbody>
            <tr><td colSpan={3} style={{ background: '#b3b3b3', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Reasonable adjustment</td></tr>
            <tr><td colSpan={3} style={{ border: '1px solid #000', padding: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.reasonableAdjustment}</td></tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '33%', fontWeight: 'bold' }}>Reasonable adjustment provided</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '33%', fontWeight: 'bold' }}>Reason for reasonable adjustment</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '34%', fontWeight: 'bold' }}>Outcome</th>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }} onClick={(e) => { if(!isStudent) { e.preventDefault(); setCompRecord({...compRecord, ra_1: !compRecord.ra_1}); } }}>
                    <div style={{ width: '14px', height: '14px', minWidth: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative' }}>{compRecord.ra_1 && <span style={{ position: 'absolute', top: '-4px', left: '1px', color: 'red', fontWeight: 'bold', fontSize: '18px' }}>✓</span>}</div>
                    <span>Educational and bilingual support</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }} onClick={(e) => { if(!isStudent) { e.preventDefault(); setCompRecord({...compRecord, ra_2: !compRecord.ra_2}); } }}>
                    <div style={{ width: '14px', height: '14px', minWidth: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative' }}>{compRecord.ra_2 && <span style={{ position: 'absolute', top: '-4px', left: '1px', color: 'red', fontWeight: 'bold', fontSize: '18px' }}>✓</span>}</div>
                    <span>Presenting questions orally</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }} onClick={(e) => { if(!isStudent) { e.preventDefault(); setCompRecord({...compRecord, ra_3: !compRecord.ra_3}); } }}>
                    <div style={{ width: '14px', height: '14px', minWidth: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative' }}>{compRecord.ra_3 && <span style={{ position: 'absolute', top: '-4px', left: '1px', color: 'red', fontWeight: 'bold', fontSize: '18px' }}>✓</span>}</div>
                    <span>Presenting work instructions in diagrammatic or pictorial form instead of words and sentences</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }} onClick={(e) => { if(!isStudent) { e.preventDefault(); setCompRecord({...compRecord, ra_4: !compRecord.ra_4}); } }}>
                    <div style={{ width: '14px', height: '14px', minWidth: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative' }}>{compRecord.ra_4 && <span style={{ position: 'absolute', top: '-4px', left: '1px', color: 'red', fontWeight: 'bold', fontSize: '18px' }}>✓</span>}</div>
                    <span>Extra time to complete a course or assessment</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }} onClick={(e) => { if(!isStudent) { e.preventDefault(); setCompRecord({...compRecord, ra_5: !compRecord.ra_5}); } }}>
                    <div style={{ width: '14px', height: '14px', minWidth: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative' }}>{compRecord.ra_5 && <span style={{ position: 'absolute', top: '-4px', left: '1px', color: 'red', fontWeight: 'bold', fontSize: '18px' }}>✓</span>}</div>
                    <span>Others:</span>
                  </label>
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '8px' }}><textarea className="w-full h-full min-h-[150px] outline-none bg-transparent resize-none font-['Times_New_Roman'] no-print" value={compRecord.ra_reason || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, ra_reason: e.target.value})} disabled={isStudent}></textarea><div className="hidden print:block whitespace-pre-wrap">{compRecord.ra_reason}</div></td>
              <td style={{ border: '1px solid #000', padding: '8px' }}><textarea className="w-full h-full min-h-[150px] outline-none bg-transparent resize-none font-['Times_New_Roman'] no-print" value={compRecord.ra_outcome || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, ra_outcome: e.target.value})} disabled={isStudent}></textarea><div className="hidden print:block whitespace-pre-wrap">{compRecord.ra_outcome}</div></td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#8ea9db', padding: '6px 10px', fontWeight: 'bold', fontSize: '14pt', display: 'inline-block', marginBottom: '16px' }}>COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</div>
        <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '16px' }}>A cover sheet must be included with each submission of work.</div>
        <div style={{ fontWeight: 'bold', fontSize: '11pt' }}>Work submitted without a signed cover sheet will be returned unmarked.</div>
        
        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1: Observation sections ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px' }}>{task1.observationTitle}</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px' }}>PRACTICAL DEMONSTRATION</div>
          <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>{task1.observationSubtitle}</div>
        </div>

        {task1.sections?.map((s: any, i: number) => (
          <div key={i} className="mb-4">
            {s.title && <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px' }}>{s.title}</div>}
            <div style={{ fontSize: '10.5pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{s.content}</div>
          </div>
        ))}
        
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1 CHECKLIST: observationItems + checklistItems[0-6] ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <div style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '12px' }}>{task1.checklistTitle}</div>
        <div style={{ fontStyle: 'italic', fontSize: '10.5pt', marginBottom: '16px', lineHeight: '1.4' }}>This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</div>
        <div style={{ fontSize: '10.5pt', marginBottom: '16px', lineHeight: '1.4' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</div>
        <div style={{ fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '8px' }}>Assessor Instructions:</div>
        <div style={{ fontSize: '10.5pt', marginBottom: '20px', lineHeight: '1.4' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</div>
        
        <div style={{ fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '12px' }}>The following was observed during the observations:</div>
        
        <div style={{ paddingLeft: '40px', marginBottom: '20px' }}>
          {task1.observationItems.map((item: string, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '250px', fontSize: '10.5pt' }}>{item}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task1_obs_${idx}`]: !compRecord[`task1_obs_${idx}`] })}>
                <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative' }}>
                  {compRecord[`task1_obs_${idx}`] && <span style={{ position: 'absolute', top: '-6px', left: '0px', color: 'red', fontSize: '20px', fontWeight: 'bold' }}>✓</span>}
                </div>
                <span style={{ fontSize: '10.5pt' }}>Observation 1</span>
              </div>
            </div>
          ))}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#b3b3b3', border: '1px solid #888', padding: '8px', width: '60%', textAlign: 'center', fontWeight: 'bold' }}>Checklist</th>
              <th style={{ background: '#b3b3b3', border: '1px solid #888', padding: '8px', width: '15%', textAlign: 'center', fontWeight: 'bold' }}>Case 1</th>
              <th style={{ background: '#b3b3b3', border: '1px solid #888', padding: '8px', width: '25%', textAlign: 'center', fontWeight: 'bold' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ background: '#d9d9d9', border: '1px solid #888', padding: '8px', fontWeight: 'bold' }}>Date Observed:</td>
              <td style={{ border: '1px solid #888', padding: '0', background: '#fff' }}>
                <input type="date" className="no-print" style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '4px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, assessment_date: e.target.value, assessor_sig_date_page2: e.target.value, admin_sig_date: e.target.value, task1_date_observed: e.target.value})} disabled={isStudent} />
                <div className="hidden print:block p-1 text-center font-bold">{formatDisplayDate(compRecord.assessment_date || compRecord.assessor_sig_date_page2 || compRecord.admin_sig_date || compRecord.task1_date_observed || '')}</div>
              </td>
              <td style={{ border: '1px solid #888', padding: '0', background: '#fff' }}></td>
            </tr>
            {task1.checklistItems.slice(0, 7).map((item: string, idx: number) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #888', padding: '8px', background: '#fff' }}>{item}</td>
                <td style={{ border: '1px solid #888', padding: '8px', textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, [`task1_chk_${idx}`]: 'yes' }); } }}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative' }}>
                        {compRecord[`task1_chk_${idx}`] === 'yes' && <span style={{ position: 'absolute', top: '-6px', left: '0px', color: 'red', fontSize: '20px', fontWeight: 'bold' }}>✓</span>}
                      </div> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, [`task1_chk_${idx}`]: 'no' }); } }}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative' }}>
                        {compRecord[`task1_chk_${idx}`] === 'yes' ? null : compRecord[`task1_chk_${idx}`] === 'no' ? <span style={{ position: 'absolute', top: '-6px', left: '0px', color: 'red', fontSize: '20px', fontWeight: 'bold' }}>✓</span> : null}
                      </div> No
                    </label>
                  </div>
                </td>
                <td style={{ border: '1px solid #888', padding: '0', background: '#fff' }}>
                  <textarea className="no-print" style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '4px', resize: 'vertical', minHeight: '40px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord[`task1_chk_comment_${idx}`] || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, [`task1_chk_comment_${idx}`]: e.target.value})} disabled={isStudent}></textarea>
                  <div className="hidden print:block p-1" style={{ whiteSpace: 'pre-wrap', minHeight: '40px' }}>{compRecord[`task1_chk_comment_${idx}`]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1 CHECKLIST: checklistItems[7-end] ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontSize: '10pt', marginTop: '16px' }}>
          <tbody>
            {task1.checklistItems.slice(7).map((item: string, i: number) => {
              const idx = i + 7;
              return (
              <tr key={idx}>
                <td style={{ border: '1px solid #888', padding: '8px', background: '#fff', width: '60%' }}>{item}</td>
                <td style={{ border: '1px solid #888', padding: '8px', textAlign: 'center', background: '#fff', width: '15%' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, [`task1_chk_${idx}`]: 'yes' }); } }}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative' }}>
                        {compRecord[`task1_chk_${idx}`] === 'yes' && <span style={{ position: 'absolute', top: '-6px', left: '0px', color: 'red', fontSize: '20px', fontWeight: 'bold' }}>✓</span>}
                      </div> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (!isStudent) { e.preventDefault(); setCompRecord({ ...compRecord, [`task1_chk_${idx}`]: 'no' }); } }}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #000', position: 'relative' }}>
                        {compRecord[`task1_chk_${idx}`] === 'yes' ? null : compRecord[`task1_chk_${idx}`] === 'no' ? <span style={{ position: 'absolute', top: '-6px', left: '0px', color: 'red', fontSize: '20px', fontWeight: 'bold' }}>✓</span> : null}
                      </div> No
                    </label>
                  </div>
                </td>
                <td style={{ border: '1px solid #888', padding: '0', background: '#fff', width: '25%' }}>
                  <textarea className="no-print" style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '4px', resize: 'vertical', minHeight: '40px', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord[`task1_chk_comment_${idx}`] || ''} onChange={(e) => !isStudent && setCompRecord({...compRecord, [`task1_chk_comment_${idx}`]: e.target.value})} disabled={isStudent}></textarea>
                  <div className="hidden print:block p-1" style={{ whiteSpace: 'pre-wrap', minHeight: '40px' }}>{compRecord[`task1_chk_comment_${idx}`]}</div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 1: declarations ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        {renderDeclarations('task1')}
        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 2: sections + Q1-4 ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>ASSESSMENT TASK 2: WRITTEN QUESTIONS AND ANSWERS</div>
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px' }}>Student Instructions:</div>
        <div style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '16px', textAlign: 'justify' }}>
          This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45-60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 2 in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.
        </div>
        <div style={{ fontSize: '10.5pt', marginBottom: '8px' }}>Make sure you:</div>
        <ul style={{ fontSize: '10.5pt', lineHeight: '1.4', paddingLeft: '40px', marginBottom: '20px' }}>
          <li>Answer all questions</li>
          <li>Print clearly</li>
          <li>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
          <li>Ask your assessor if you do not understand a question. Whist your assessor cannot tell you the answer, he/she may be able to re-word the question for you</li>
          <li>Do not talk to your classmates. If you are caught discussion the answers you will be asked to leave and your assessment will not be marked.</li>
          <li>Do not cheat. Anyone caught cheating will automatically be marked Not Competent for this unit. There are NO EXCEPTIONS to this rule.</li>
        </ul>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '10.5pt' }}>
          <thead>
            <tr>
              <th style={{ background: '#5b9bd5', color: '#000', border: '1.5px solid #000', padding: '8px', fontSize: '14pt', fontWeight: 'bold', textAlign: 'center' }}>Questions</th>
            </tr>
          </thead>
          <tbody>
            {task2.questions?.slice(0, 4).map((q: any) => renderQ(q, 'task2'))}
          </tbody>
        </table>
        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2: Q5-10 ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '10.5pt' }}>
          <tbody>
            {task2.questions?.slice(4, 10).map((q: any) => renderQ(q, 'task2'))}
          </tbody>
        </table>
        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2: Q11 + declarations + end checklist ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '10.5pt', marginBottom: '20px' }}>
          <tbody>
            {task2.questions?.slice(10).map((q: any) => renderQ(q, 'task2'))}
          </tbody>
        </table>
        
        {renderDeclarations('task2')}
        
        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
          END OF ASSESSMENT
        </div>
        <div style={{ fontSize: '10.5pt', paddingLeft: '40px' }}>
          <div style={{ marginBottom: '8px' }}>Before you hand in your assessment, make sure that you:</div>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.4' }}>
            <li>Re-check your answers and make sure you are happy with your responses.</li>
            <li>Have written your Name on the first page and signed the student declaration below</li>
            <li>If you are submitting this assessment as a separate attachment, please attached an Assessment Submission Sheet available from the Student Administration or the ACTA intranet.</li>
          </ol>
        </div>
        <PageFooter n={12} />
      </div>

    </div>
  );
};
