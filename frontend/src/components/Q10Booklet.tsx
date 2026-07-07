import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions10';

interface Q10BookletProps {
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
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', lineHeight: '1.2' }}>
    <div>
      Assessment Booklet<br />
      {assessmentQuestions.metadata.code}<br />
      {assessmentQuestions.metadata.course}
    </div>
    <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '45px', objectFit: 'contain' }} />
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', color: '#555', marginTop: 'auto', paddingTop: '10px', fontFamily: '"Times New Roman", Times, serif' }}>
    <div>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V4.3 | 2023</div>
    <div>Page {n} of 25</div>
  </div>
);

export const Q10Booklet: React.FC<Q10BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return d;
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
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

  const renderTask3Q = (q: any, taskKey: string) => {
    const qKey = `t${taskKey.replace('task', '')}q${q.id}`;
    return (
      <table key={q.id} style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginTop: '-1px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
        <tbody>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '8px' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{q.id}.  {q.text}</div>
              {q.image && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                  <img src={q.image} alt={q.imageCaption || `Question ${q.id}`} style={{ width: q.smallImage ? '200px' : '100%', maxWidth: '300px', height: 'auto' }} />
                  {q.imageCaption && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>{q.imageCaption}</span>}
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '8px', minHeight: '60px' }}>
              {q.type === 'text' && (
                <textarea required={isStudent} className="no-print" style={{ width: '100%', border: 'none', padding: '4px', minHeight: '60px', resize: 'vertical', background: 'transparent', outline: 'none' }} value={answers[qKey] || ''} onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })} />
              )}
              {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
                <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div className="no-print" style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })}>
                    {answers[opt.name || qKey] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                    {answers[opt.name || qKey] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <label>{opt.text}</label>
                </div>
              ))}
              {(q.type === 'options' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
                const ansArray = answers[qKey] || [];
                const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                return (
                  <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div className="no-print" style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                      let newArr = [...(Array.isArray(answers[qKey]) ? answers[qKey] : [])];
                      if (!checked) newArr.push(opt.value); else newArr = newArr.filter((v: any) => v !== opt.value);
                      setAnswers({ ...answers, [qKey]: newArr });
                    }}>
                      {checked && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {checked && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label>{opt.text}</label>
                  </div>
                );
              })}
              {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tiIdx: number) => (
                <div key={tiIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ minWidth: '20px' }}>{ti.placeholder}.</span>
                  <input required={isStudent} className="no-print" style={{ flex: 1, borderBottom: '1px solid #000', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', background: 'transparent' }} value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
                  <div className="hidden print:block" style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '20px' }}>{answers[ti.name]}</div>
                </div>
              ))}

              {q.type === 'multipart_radio' && q.parts?.map((part: any, pIdx: number) => (
                <div key={pIdx} style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px', whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>{part.text}</div>
                  {part.options?.map((opt: any, oIdx: number) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                      <div className="no-print" style={{ width: '14px', height: '14px', border: '1.5px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, [part.name]: opt.value })}>
                        {answers[part.name] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div>
                      <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1.5px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                        {answers[part.name] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div>
                      <label>{opt.text}</label>
                    </div>
                  ))}
                </div>
              ))}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#e0e0e0' }}>
            <td style={{ border: '1px solid #000', width: '40%', padding: '6px', color: '#0055cc', fontWeight: 'bold' }}>
              Assessor to tick (<span style={{ fontFamily: 'monospace' }}>☑</span>)
            </td>
            <td className="no-print" style={{ border: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' }) }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>Satisfactory (S)
            </td>
            <td className="hidden print:table-cell" style={{ border: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>Satisfactory (S)
            </td>
            <td className="no-print" style={{ border: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' }) }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>Not Satisfactory (NS)
            </td>
            <td className="hidden print:table-cell" style={{ border: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>Not Satisfactory (NS)
            </td>
          </tr>
        </tbody>
      </table>);
  };

  const renderTask4Q = (q: any, taskKey: string, hideText: boolean = false) => {
    const qKey = `t${taskKey.replace('task', '')}q${q.id}`;
    let questionTitle = `${q.id}. ${q.text}`;
    let subText = null;

    if (q.id === 2) {
      questionTitle = `2. Work health and safety (WHS) Regulations are:`;
      subText = `WHS Regulations are a more detailed set of requirements created to support the duties established in the WHS/OHS Act. Regulations also need to be enacted or passed by Parliament in each jurisdiction to be legally binding.`;
    } else if (q.id === 3) {
      questionTitle = `3. Codes of practices for work health and safety (WHS) is`;
      subText = `Codes of practices for work health and safety (WHS) give practical guidance on how to legally comply with regulations and Acts`;
    } else if (q.id === 4) {
      questionTitle = `4. Licences\nUsing the information in safe work NSW visit the website and search for ‘codes of practice – asbestos’ using this document complete the three following questions:`;
    } else if (q.id === 13) {
      questionTitle = `13. When working with materials containing asbestos you must use:`;
      subText = `Particulate respirator (maintained as AS1715)\nOveralls and head protection (contaminated clothing should not be worn off site)\nBoots, booties, gloves and eye protection`;
    } else if (q.id === 14) {
      questionTitle = `14. Why should you not drill, cut, saw or sand dry substrates containing asbestos?`;
      subText = `Because dry particles of asbestos dust will become airborne`;
    } else if (q.id === 15) {
      questionTitle = `15. How should you dispose of asbestos contaminated waste?`;
      subText = `You should contact the environmental officer in the particular local authority`;
    }

    return (
      <div key={q.id} style={{ marginBottom: '24px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', border: '1px solid #000' }}>
        <div style={{ padding: '12px' }}>
          {!hideText && <p style={{ fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{questionTitle}</p>}
          {!hideText && subText && (
            <p style={{ marginBottom: '16px', whiteSpace: 'pre-wrap', fontWeight: q.id >= 13 ? 'bold' : 'normal', paddingLeft: q.id >= 13 ? '32px' : '0' }}>{subText}</p>
          )}

          {q.type === 'text' && (
            <div style={{ border: '1px solid #000', padding: '4px', minHeight: '80px', marginTop: '8px' }}>
              <textarea required={isStudent} className="no-print" style={{ width: '100%', border: 'none', minHeight: '70px', outline: 'none', background: 'transparent' }} value={answers[qKey] || ''} onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })} />
              <div className="hidden print:block" style={{ minHeight: '70px', whiteSpace: 'pre-wrap' }}>{answers[qKey]}</div>
            </div>
          )}

          {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tiIdx: number) => (
            <div key={tiIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ minWidth: '20px' }}>{ti.placeholder}.</span>
              <input required={isStudent} className="no-print" style={{ flex: 1, borderBottom: '1px solid #000', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', background: 'transparent' }} value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
              <div className="hidden print:block" style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '20px' }}>{answers[ti.name]}</div>
            </div>
          ))}

          {(q.type === 'options' || q.type === 'radio' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
            const ansArray = answers[qKey] || [];
            const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
            const isTrueFalse = opt.text === 'True' || opt.text === 'False';
            return (
              <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                <div className="no-print" style={{ width: '14px', height: '14px', border: isTrueFalse ? '2px solid #000' : '1.5px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                  if (q.type === 'options' || q.type === 'checkbox') {
                    let newArr = [...(Array.isArray(answers[qKey]) ? answers[qKey] : [])];
                    if (!checked) newArr.push(opt.value); else newArr = newArr.filter((v: any) => v !== opt.value);
                    setAnswers({ ...answers, [qKey]: newArr });
                  } else {
                    setAnswers({ ...answers, [qKey]: opt.value });
                  }
                }}>
                  {checked && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                </div>
                <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: isTrueFalse ? '2px solid #000' : '1.5px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                  {checked && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                </div>
                <label style={{ fontWeight: isTrueFalse ? 'bold' : 'normal' }}>{opt.text}</label>
              </div>
            );
          })}

          {q.type === 'multipart_radio' && q.parts?.map((part: any, pIdx: number) => (
            <div key={pIdx} style={{ marginBottom: '24px', paddingLeft: '16px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>{part.text}</p>
              {part.options?.map((opt: any, oIdx: number) => (
                <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                  <div className="no-print" style={{ width: '14px', height: '14px', border: '1.5px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, [part.name]: opt.value })}>
                    {answers[part.name] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1.5px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                    {answers[part.name] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div>
                  <label>{opt.text}</label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #000' }}>
          <tbody>
            <tr style={{ backgroundColor: '#e0e0e0' }}>
              <td style={{ borderRight: '1px solid #000', width: '40%', padding: '6px', color: '#0055cc', fontWeight: 'bold' }}>
                Assessor to tick (<span style={{ fontFamily: 'monospace' }}>☑</span>)
              </td>
              <td className="no-print" style={{ borderRight: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' }) }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>Satisfactory (S)
              </td>
              <td className="hidden print:table-cell" style={{ borderRight: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>Satisfactory (S)
              </td>
              <td className="no-print" style={{ width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' }) }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>Not Satisfactory (NS)
              </td>
              <td className="hidden print:table-cell" style={{ width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>Not Satisfactory (NS)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const admin = assessmentQuestions.adminInfo as any;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const task4 = assessmentQuestions.task4 as any;

  const renderStudentDecl = (taskKey: string) => (
    <div className="mt-4" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {taskKey !== 'task3' && <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '10px' }}>Comments/Feedback to Participant</h3>}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '24px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ height: '25px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ height: '25px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <input required={isStudent} type="date" className="no-print" value={toDateInputValue(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_page2 !== undefined ? compRecord.student_sig_date_page2 : (submitDate || '')))} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} style={{ flex: 1, border: 'none', borderBottom: '1px solid #000', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', fontWeight: 'bold' }} />
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px', fontWeight: 'bold' }}>{formatDisplayDate(answers.student_date !== undefined ? answers.student_date : (compRecord.student_sig_date_page2 !== undefined ? compRecord.student_sig_date_page2 : (submitDate || '')))}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderAssessorDecl = (taskKey: string) => (
    <div className="mt-4" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <div style={{ border: '1px solid #000', padding: '8px', minHeight: '100px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..." value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }} readOnly={isStudent} />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px', fontSize: '10pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '12pt' }}>
        Result:{' '}
        <span className={`inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '4px' }}>
          Satisfactory (<span className="relative inline-block">S{compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span className={`inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          Not Satisfactory (<span className="relative inline-block">NS{compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}</span>)
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '24px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '25px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '25px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} disabled={isStudent} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{compRecord.assessment_date ? formatDisplayDate(compRecord.assessment_date) : ''}</span>
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

  const ChkHead = () => (
    <thead style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <tr>
        <th rowSpan={2} style={{ border: '1px solid #000', backgroundColor: '#999', textAlign: 'left', padding: '6px', fontWeight: 'bold' }}>Did The Candidate:</th>
        <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#999', textAlign: 'center', padding: '6px', fontWeight: 'bold' }}>Satisfactory</th>
        <th rowSpan={2} style={{ border: '1px solid #000', backgroundColor: '#999', textAlign: 'left', padding: '6px', fontWeight: 'bold', width: '25%' }}>Comments</th>
      </tr>
      <tr>
        <th style={{ border: '1px solid #000', backgroundColor: '#aaa', textAlign: 'left', padding: '6px', fontWeight: 'bold', width: '12%' }}>Yes</th>
        <th style={{ border: '1px solid #000', backgroundColor: '#aaa', textAlign: 'left', padding: '6px', fontWeight: 'bold', width: '12%' }}>No</th>
      </tr>
    </thead>
  );

  const renderChkRows = (taskKey: string, items: string[], start: number, end: number) =>
    items.slice(start, end).map((item, i) => {
      const idx = start + i;
      return (
        <tr key={`chk-${idx}`} style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          <td style={{ border: '1px solid #000', padding: '6px', fontSize: '9.5pt' }}>{item}</td>
          <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'yes' })}>
            {compRecord[`${taskKey}_chk_${idx}`] === 'yes' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt', lineHeight: 1 }}>✓</span> : ''}
          </td>
          <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'no' })}>
            {compRecord[`${taskKey}_chk_${idx}`] === 'no' ? <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '14pt', lineHeight: 1 }}>✓</span> : ''}
          </td>
          <td style={{ border: '1px solid #000', padding: '6px' }}>
            <textarea className="no-print" style={{ width: '100%', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif' }} value={compRecord[`${taskKey}_chk_comm_${idx}`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_comm_${idx}`]: e.target.value })} disabled={isStudent} />
            <span className="hidden print:inline-block">{compRecord[`${taskKey}_chk_comm_${idx}`]}</span>
          </td>
        </tr>
      );
    });

  const renderQ = (q: any, taskKey: string) => {
    const qKey = `t${taskKey.replace('task', '')}q${q.id}`;
    return (
      <table key={q.id} style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginTop: '-1px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
        <tbody>
          <tr>
            <td style={{ width: '5%', borderRight: '1px solid #000', verticalAlign: 'top', padding: '8px', textAlign: 'center' }}>
              {q.id}
            </td>
            <td style={{ width: '95%', verticalAlign: 'top', padding: '8px' }}>
              <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>{q.text}</div>
              {q.image && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                  <img src={q.image} alt={q.imageCaption || `Question ${q.id}`} style={{ width: q.smallImage ? '200px' : '100%', maxWidth: '500px', height: 'auto' }} />
                  {q.imageCaption && <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>{q.imageCaption}</span>}
                </div>
              )}
              <div style={{ paddingLeft: '0', marginTop: '8px' }}>
                {q.type === 'text' && (
                  <textarea required={isStudent} className="no-print" style={{ width: '100%', border: 'none', borderBottom: '1px dashed #000', padding: '4px', minHeight: '60px', resize: 'vertical', background: 'transparent', outline: 'none' }} value={answers[qKey] || ''} onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })} />
                )}
                {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
                  <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div className="no-print" style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, [opt.name || qKey]: opt.value })}>
                      {answers[opt.name || qKey] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {answers[opt.name || qKey] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label>{opt.text}</label>
                  </div>
                ))}
                {(q.type === 'options' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
                  const ansArray = answers[qKey] || [];
                  const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                  return (
                    <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <div className="no-print" style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                        let newArr = [...(Array.isArray(answers[qKey]) ? answers[qKey] : [])];
                        if (!checked) newArr.push(opt.value); else newArr = newArr.filter((v: any) => v !== opt.value);
                        setAnswers({ ...answers, [qKey]: newArr });
                      }}>
                        {checked && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div>
                      <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                        {checked && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                      </div>
                      <label>{opt.text}</label>
                    </div>
                  );
                })}
                {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tiIdx: number) => (
                  <div key={tiIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ minWidth: '20px' }}>{ti.placeholder}.</span>
                    <input required={isStudent} className="no-print" style={{ flex: 1, borderBottom: '1px solid #000', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', background: 'transparent' }} value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
                    <div className="hidden print:block" style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '20px' }}>{answers[ti.name]}</div>
                  </div>
                ))}

                {q.type === 'multipart_radio' && q.parts?.map((part: any, pIdx: number) => (
                  <div key={pIdx} style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{part.text}</div>
                    {part.options?.map((opt: any, oIdx: number) => (
                      <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                        <div className="no-print" style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, [part.name]: opt.value })}>
                          {answers[part.name] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                        </div>
                        <div className="hidden print:flex" style={{ width: '14px', height: '14px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                          {answers[part.name] === opt.value && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                        </div>
                        <label>{opt.text}</label>
                      </div>
                    ))}
                  </div>
                ))}
                {q.type === 'jsa_table' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginTop: '8px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={2}>
                          <span style={{ fontWeight: 'bold' }}>Job title</span><br />
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_job_title || ''} onChange={(e) => setAnswers({ ...answers, t1q5_job_title: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_job_title}</span><br />
                          <span style={{ fontWeight: 'bold' }}>JSA NO</span><br />
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_jsa_no || ''} onChange={(e) => setAnswers({ ...answers, t1q5_jsa_no: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_jsa_no}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
                          Date:<br />
                          <input required={isStudent} type="date" className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={toDateInputValue(answers.t1q5_date || '')} onChange={(e) => setAnswers({ ...answers, t1q5_date: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_date}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>
                          New<br />
                          Revised
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', width: '33%' }}>
                          <span style={{ fontWeight: 'bold' }}>Title of person:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_title_person || ''} onChange={(e) => setAnswers({ ...answers, t1q5_title_person: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_title_person}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px', width: '33%' }} colSpan={2}>
                          <span style={{ fontWeight: 'bold' }}>Supervisor:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_supervisor || ''} onChange={(e) => setAnswers({ ...answers, t1q5_supervisor: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_supervisor}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px', width: '34%' }}>
                          <span style={{ fontWeight: 'bold' }}>Analysis by:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_analysis_by || ''} onChange={(e) => setAnswers({ ...answers, t1q5_analysis_by: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_analysis_by}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                          <span style={{ fontWeight: 'bold' }}>Plant/ location:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_location || ''} onChange={(e) => setAnswers({ ...answers, t1q5_location: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_location}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={2}>
                          <span style={{ fontWeight: 'bold' }}>Department:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_department || ''} onChange={(e) => setAnswers({ ...answers, t1q5_department: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_department}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                          <span style={{ fontWeight: 'bold' }}>Reviewed by:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_reviewed_by || ''} onChange={(e) => setAnswers({ ...answers, t1q5_reviewed_by: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_reviewed_by}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={3}>
                          <span style={{ fontWeight: 'bold' }}>Required personal protective equipment</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_ppe || ''} onChange={(e) => setAnswers({ ...answers, t1q5_ppe: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_ppe}</span>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                          <span style={{ fontWeight: 'bold' }}>Approved by:</span>
                          <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers.t1q5_approved_by || ''} onChange={(e) => setAnswers({ ...answers, t1q5_approved_by: e.target.value })} />
                          <span className="hidden print:inline-block">{answers.t1q5_approved_by}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Job sequence - steps</td>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }} colSpan={2}>Potential hazards</td>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Recommended action</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontStyle: 'italic' }}>Break the job down into steps</td>
                        <td style={{ border: '1px solid #000', padding: '6px', fontStyle: 'italic' }} colSpan={2}>Identify hazards for each step</td>
                        <td style={{ border: '1px solid #000', padding: '6px', fontStyle: 'italic' }}>List actions to eliminate or reduce hazard</td>
                      </tr>
                      {[0, 1, 2, 3].map(i => (
                        <tr key={i}>
                          <td style={{ border: '1px solid #000', padding: '6px', height: '30px' }}>
                            <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers[`t1q5_step_${i}`] || ''} onChange={(e) => setAnswers({ ...answers, [`t1q5_step_${i}`]: e.target.value })} />
                            <span className="hidden print:inline-block">{answers[`t1q5_step_${i}`]}</span>
                          </td>
                          <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={2}>
                            <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers[`t1q5_hazard_${i}`] || ''} onChange={(e) => setAnswers({ ...answers, [`t1q5_hazard_${i}`]: e.target.value })} />
                            <span className="hidden print:inline-block">{answers[`t1q5_hazard_${i}`]}</span>
                          </td>
                          <td style={{ border: '1px solid #000', padding: '6px' }}>
                            <input required={isStudent} className="no-print" style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: '"Times New Roman", Times, serif' }} value={answers[`t1q5_action_${i}`] || ''} onChange={(e) => setAnswers({ ...answers, [`t1q5_action_${i}`]: e.target.value })} />
                            <span className="hidden print:inline-block">{answers[`t1q5_action_${i}`]}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ borderTop: '1px solid #000', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ backgroundColor: '#e0e0e0' }}>
                    <td style={{ borderRight: '1px solid #000', width: '40%', padding: '6px', color: '#0055cc', fontWeight: 'bold' }}>
                      Assessor to tick (<span style={{ fontFamily: 'monospace' }}>☑</span>)
                    </td>
                    <td className="no-print" style={{ borderRight: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' }) }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                        {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                      </span>Satisfactory (S)
                    </td>
                    <td className="hidden print:table-cell" style={{ borderRight: '1px solid #000', width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                        {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                      </span>Satisfactory (S)
                    </td>
                    <td className="no-print" style={{ width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' }) }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                        {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                      </span>Not Satisfactory (NS)
                    </td>
                    <td className="hidden print:table-cell" style={{ width: '30%', padding: '6px', color: '#0055cc', fontWeight: 'bold', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #0055cc', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                        {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                      </span>Not Satisfactory (NS)
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };
  const q10Styles = `
      .q10-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q10-booklet-view * { box-sizing: border-box; }
      .q10-booklet-view .page {
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
      .q10-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q10-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q10-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q10-booklet-view h3.task-label { font-size: 10.5pt; font-weight: bold; text-align: center; margin: 1mm 0 3mm; }
      .q10-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q10-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q10-booklet-view table td, .q10-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q10-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q10-booklet-view .field-label-cell { font-weight: bold; background: #f0f0f0; width: 38%; border: 1px solid #555; padding: 5px 6px; }
      .q10-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q10-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q10-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q10-booklet-view .evidence-row { display: flex; align-items: center; gap: 18px; padding: 3px 0; font-size: 9pt; }
      .q10-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q10-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q10-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q10-booklet-view .page-footer {
        margin-top: auto; padding-top: 4mm; border-top: 1px solid #000;
        display: flex; justify-content: space-between; font-size: 8pt;
      }
      .q10-booklet-view .inner-header { margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
      .q10-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q10-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q10-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q10-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q10-booklet-view .question-block { margin-bottom: 8mm; }
      .q10-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q10-booklet-view { background: #fff !important; padding: 0 !important; }
        .q10-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }

      @media screen and (max-width: 800px) {
        .q10-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q10-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q10-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q10-booklet-view .flex, .q10-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q10-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q10-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q10-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q10-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q10-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q10-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  `;

  return (
    <div className="q10-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q10Styles }} />

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
      <div className="page" style={{ padding: '0' }}>
        <div style={{ flex: 1, border: '1.5px solid #2e74b5', margin: '15mm', padding: '4px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1.5px solid #2e74b5', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '230px', height: 'auto', objectFit: 'contain', marginTop: '25mm' }} />
            <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#903030', fontFamily: 'Arial, sans-serif', marginTop: '4mm' }}>RTO NO: 40954</div>
            <div className="cover-title" style={{ fontSize: '46pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>Assessment Booklet</div>
            <div style={{ background: '#8faadc', height: '14px', width: '92%', marginTop: '6mm', marginBottom: '12mm' }}></div>
            <div className="cover-subtitle" style={{ fontSize: '20pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'center', lineHeight: '1.3', maxWidth: '450px' }}>
              {assessmentQuestions.metadata.code}<br />
              {assessmentQuestions.metadata.subtitle}
            </div>

            <div style={{ width: '100%', marginTop: 'auto', marginBottom: '35mm', display: 'flex', justifyContent: 'flex-start', paddingLeft: '12%' }}>
              <div className="cover-student-name-container" style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.5px solid #000', width: '100%', fontWeight: 'bold', color: '#000', fontFamily: '"Times New Roman", Times, serif', fontSize: '14pt', textAlign: 'left', paddingBottom: '2px', paddingLeft: '8px' }}>{studentName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page" style={{ padding: '12mm 14mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif', color: '#555' }}>
          <div>
            Assessment Booklet<br />
            {assessmentQuestions.metadata.code}<br />
            {assessmentQuestions.metadata.course}
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '13pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '12px', fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase' }}>ASSESSMENT COMPETENCY RECORD</h1>

        <div style={{ border: '1px solid #000', padding: '6px 8px', background: '#c0c0c0', fontSize: '9pt', marginBottom: '16px', lineHeight: '1.4' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '35%', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Student's Name</td>
              <td style={{ width: '65%', border: '1px solid #000', padding: '6px 8px', color: '#000', fontFamily: '"Times New Roman", Times, serif' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Assessor's Name</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="text" className="no-print" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{compRecord.assessor_name}</div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Assessment Site</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="text" className="no-print" value={compRecord.assessment_site || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_site: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{compRecord.assessment_site}</div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#c0c0c0' }}>Assessment Date/s</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <input type="date" className="no-print" value={toDateInputValue(compRecord.assessment_date || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit' }} />
                <div className="hidden print:block" style={{ padding: '6px 8px' }}>{formatDisplayDate(compRecord.assessment_date || '')}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={6} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '4px 8px', fontWeight: 'bold' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={6} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '40%' }}>Evidence is Confirmed as:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%' }}>
                <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_valid: !compRecord.evidence_valid })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{compRecord.evidence_valid && <span style={{ color: '#cc0000', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-6px', left: '2px' }}>✓</span>}</div> Valid
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%' }}>
                <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_sufficient: !compRecord.evidence_sufficient })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{compRecord.evidence_sufficient && <span style={{ color: '#cc0000', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-6px', left: '2px' }}>✓</span>}</div> Sufficient
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%' }}>
                <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_current: !compRecord.evidence_current })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{compRecord.evidence_current && <span style={{ color: '#cc0000', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-6px', left: '2px' }}>✓</span>}</div> Current
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%' }}>
                <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_authentic: !compRecord.evidence_authentic })} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{compRecord.evidence_authentic && <span style={{ color: '#cc0000', fontSize: '18px', fontWeight: 'bold', position: 'absolute', top: '-6px', left: '2px' }}>✓</span>}</div> Authentic
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ background: '#f0f0f0', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textAlign: 'left' }}>Please attach the following documentation to this form</td>
              <td style={{ background: '#f0f0f0', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textAlign: 'center' }}>Result</td>
              <td colSpan={1} rowSpan={5} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '12px', verticalAlign: 'middle', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '10.5pt' }}>FINAL ASSESSMENT<br />RESULT:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', paddingLeft: '10%' }}>
                  <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'C' })} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{compRecord.final_result === 'C' && <span style={{ color: '#cc0000', fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '-6px', left: '2px' }}>✓</span>}</div> Competent (C)
                  </div>
                  <div className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'NC' })} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>{compRecord.final_result === 'NC' && <span style={{ color: '#cc0000', fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '-6px', left: '2px' }}>✓</span>}</div> Not Competent (NC)
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 1</td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t1: !compRecord.tasks?.t1 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t1 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Case Study
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task1_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task1_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 2</td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t2: !compRecord.tasks?.t2 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t2 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Knowledge Evidence
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task2_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task2_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 3</td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t3: !compRecord.tasks?.t3 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t3 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Written Q & A
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task3_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task3_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={1} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '25%' }}>Assessment Task 4</td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div className="checkbox-row" style={{ cursor: isStudent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t4: !compRecord.tasks?.t4 } })}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {compRecord.tasks?.t4 && <span style={{ color: '#cc0000', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                  </div> Additional worksheet of activities and questions
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result_page2: 'S' })} style={{ position: 'relative', display: 'inline-block', width: '20px', height: '20px', lineHeight: '20px' }}>
                    S{compRecord.task4_result_page2 === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '24px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                  /
                  <span className={isStudent ? '' : 'cursor-pointer'} onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result_page2: 'NS' })} style={{ position: 'relative', display: 'inline-block', width: '24px', height: '20px', lineHeight: '20px' }}>
                    NS{compRecord.task4_result_page2 === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '32px', height: '24px', pointerEvents: 'none' }}></span>}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', fontWeight: 'bold', width: '15%', textAlign: 'center' }}>Attempt</td>
              <td style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', fontWeight: 'bold', width: '25%', textAlign: 'center' }}>Date</td>
              <td style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', fontWeight: 'bold', width: '60%', textAlign: 'center' }}>Assessor's Feedback (as Required):</td>
            </tr>
            {[1, 2, 3].map(attempt => (
              <tr key={attempt}>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>{attempt}</td>
                <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'middle' }}>
                  <input type="date" className="no-print" value={toDateInputValue(compRecord[`attempt_${attempt}_date`] || '')} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_date`]: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'center' }} />
                  <div className="hidden print:block text-center">{formatDisplayDate(compRecord[`attempt_${attempt}_date`] || '')}</div>
                </td>
                <td style={{ border: '1px solid #000', padding: '0' }}>
                  <textarea className="no-print" placeholder="" value={compRecord[`attempt_${attempt}_feedback`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`attempt_${attempt}_feedback`]: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', minHeight: '30px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                  <div className="hidden print:block" style={{ padding: '6px', minHeight: '30px', whiteSpace: 'pre-wrap' }}>{compRecord[`attempt_${attempt}_feedback`]}</div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #000', padding: '0' }}>
                <textarea className="no-print" placeholder="" value={compRecord.final_feedback || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, final_feedback: e.target.value })} disabled={isStudent} style={{ width: '100%', padding: '6px', minHeight: '40px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }} />
                <div className="hidden print:block" style={{ padding: '6px', minHeight: '40px', whiteSpace: 'pre-wrap' }}>{compRecord.final_feedback}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '8px' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '50%' }}>
                <strong>Assessor Declaration:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', width: '50%' }}>
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
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', width: '50%', verticalAlign: 'top' }}>
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
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', color: '#555', marginTop: 'auto', paddingTop: '10px', fontFamily: '"Times New Roman", Times, serif' }}>
          <div>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V4.3 | 2023</div>
          <div>Page 2 of 25</div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN (Unit Code → Plagiarism) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
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
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.unitSummary}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Conditions and context of the assessments</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.conditionsAndContext}</td></tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Specific Resources Required</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.specificResources}</td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.reAssessment}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.plagiarism}</td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN (Complaints → Competency Decision) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '30%', verticalAlign: 'top' }}>Complaints and appeal</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.complaintsAndAppeals}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessors Intervention</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessorsIntervention}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Attaching documents</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.attachingDocuments}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Instruction</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.assessmentInstruction}</td></tr>
            {admin.taskOverviews?.map((task: any, idx: number) => (
              <tr key={idx}><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>{task.id}</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{task.text}</td></tr>
            ))}
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN (Reasonable Adjustment + Cover Sheet) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td colSpan={3} style={{ background: '#c0c0c0', border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Reasonable adjustment</td></tr>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', lineHeight: '1.4' }}>
                {admin.reasonableAdjustment}
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
        <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '16px' }}>{admin.coverSheetInstruction}</div>
        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1: sections + Q1 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>{task1.observationTitle}</h1>
        {task1.observationSubtitle && <h2 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', fontFamily: '"Times New Roman", Times, serif' }}>{task1.observationSubtitle}</h2>}

        <div style={{ fontSize: '10pt', lineHeight: '1.5' }}>
          {task1.sections?.map((s: any, i: number) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              {s.title && <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>{s.title}</div>}
              <div style={{ whiteSpace: 'pre-wrap' }}>{s.content}</div>
            </div>
          ))}
        </div>

        <div>{task1.questions?.slice(0, 1).map((q: any) => renderQ(q, 'task1'))}</div>
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1: Q2-4 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task1.questions?.slice(1, 4).map((q: any) => renderQ(q, 'task1'))}</div>
        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1: Q5 (JSA table) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task1.questions?.slice(4, 5).map((q: any) => renderQ(q, 'task1'))}</div>
        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 1: Q6-7 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task1.questions?.slice(5, 7).map((q: any) => renderQ(q, 'task1'))}</div>
        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 1: Q8-11 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task1.questions?.slice(7).map((q: any) => renderQ(q, 'task1'))}</div>
        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 1 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px' }}>ASSESSMENT TASK 1 – ASSESSOR CHECKLIST</h1>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.4' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '12px', lineHeight: '1.4' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontWeight: 'bold', marginBottom: '12px' }}>
          Assessor Instructions:
        </p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '16px', lineHeight: '1.4' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </p>

        <h3 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', fontWeight: 'bold', marginBottom: '8px' }}>Record of Performance:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <ChkHead />
          <tbody>
            {renderChkRows('task1', task1.checklistItems, 0, task1.checklistItems.length)}
          </tbody>
        </table>
        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 1: declarations ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        {renderDeclarations('task1')}
        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 2 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px' }}>ASSESSMENT TASK 2 KNOWLEDGE EVIDENCE</h1>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px' }}>Manage Safety and the Environment</h2>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontWeight: 'bold', marginBottom: '12px' }}>Student Instructions:</p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '16px', lineHeight: '1.4' }}>
          This assessment will be conducted like a team meeting, if applicable, in which each person brings two hazards. This assessment will be adjusted to individual assessment if no meeting can occur.
        </p>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '8px' }}>1. Identify an example of each of the following:</p>
        <div style={{ border: '1px solid #000', padding: '12px', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>A specific safety hazard on a typical cabling worksite</p>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>Page: 50-53 from the reading material</p>
          <textarea required={isStudent} className="no-print" style={{ width: '100%', minHeight: '60px', border: '1px dashed #ccc', outline: 'none', background: 'transparent' }} value={answers.t2q1_safety_hazard || ''} onChange={(e) => setAnswers({ ...answers, t2q1_safety_hazard: e.target.value })} />
          <div className="hidden print:block" style={{ minHeight: '60px', whiteSpace: 'pre-wrap' }}>{answers.t2q1_safety_hazard}</div>

          <div style={{ height: '24px' }}></div>

          <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>A specific environment hazard on a cabling worksite</p>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>Page: 54 from the reading material</p>
          <textarea required={isStudent} className="no-print" style={{ width: '100%', minHeight: '60px', border: '1px dashed #ccc', outline: 'none', background: 'transparent' }} value={answers.t2q1_env_hazard || ''} onChange={(e) => setAnswers({ ...answers, t2q1_env_hazard: e.target.value })} />
          <div className="hidden print:block" style={{ minHeight: '60px', whiteSpace: 'pre-wrap' }}>{answers.t2q1_env_hazard}</div>
        </div>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '8px' }}>2. Complete the table based on each hazard, mentioned in question: 1, covering:</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', backgroundColor: '#e0e0e0', padding: '6px', textAlign: 'left', width: '25%' }}>Hazard</th>
              <th style={{ border: '1px solid #000', backgroundColor: '#fff', padding: '6px', textAlign: 'left' }}>Safety hazard example from question: 1</th>
              <th style={{ border: '1px solid #000', backgroundColor: '#fff', padding: '6px', textAlign: 'left' }}>Environment hazard example from question: 1</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', backgroundColor: '#e0e0e0', padding: '6px', fontWeight: 'bold' }}>Risk rating</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {['Minor', 'Major', 'Death'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className="no-print" style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, t2q2_safety_risk: opt.toLowerCase() })}>
                      {answers.t2q2_safety_risk === opt.toLowerCase() && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '12px', height: '12px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {answers.t2q2_safety_risk === opt.toLowerCase() && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label style={{ fontSize: '10pt' }}>{opt}</label>
                  </div>
                ))}
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {['Minor', 'Major', 'Death'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className="no-print" style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => setAnswers({ ...answers, t2q2_env_risk: opt.toLowerCase() })}>
                      {answers.t2q2_env_risk === opt.toLowerCase() && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '12px', height: '12px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {answers.t2q2_env_risk === opt.toLowerCase() && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label style={{ fontSize: '10pt' }}>{opt}</label>
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', backgroundColor: '#e0e0e0', padding: '6px', fontWeight: 'bold' }}>Control measures for hazard</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {['Elimination', 'Substitution', 'Isolation', 'Engineering', 'PPE'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className="no-print" style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                      let arr = Array.isArray(answers.t2q2_safety_controls) ? [...answers.t2q2_safety_controls] : [];
                      if (arr.includes(opt.toLowerCase())) arr = arr.filter(a => a !== opt.toLowerCase()); else arr.push(opt.toLowerCase());
                      setAnswers({ ...answers, t2q2_safety_controls: arr });
                    }}>
                      {(answers.t2q2_safety_controls || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '12px', height: '12px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {(answers.t2q2_safety_controls || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label style={{ fontSize: '10pt' }}>{opt}</label>
                  </div>
                ))}
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {['Elimination', 'Substitution', 'Isolation', 'Engineering', 'PPE'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className="no-print" style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                      let arr = Array.isArray(answers.t2q2_env_controls) ? [...answers.t2q2_env_controls] : [];
                      if (arr.includes(opt.toLowerCase())) arr = arr.filter(a => a !== opt.toLowerCase()); else arr.push(opt.toLowerCase());
                      setAnswers({ ...answers, t2q2_env_controls: arr });
                    }}>
                      {(answers.t2q2_env_controls || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '12px', height: '12px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {(answers.t2q2_env_controls || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label style={{ fontSize: '10pt' }}>{opt}</label>
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', backgroundColor: '#e0e0e0', padding: '6px', fontWeight: 'bold' }}>Relevant legislation</td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {['Work health and safety Law', 'OHS Law'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className="no-print" style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                      let arr = Array.isArray(answers.t2q2_safety_leg) ? [...answers.t2q2_safety_leg] : [];
                      if (arr.includes(opt.toLowerCase())) arr = arr.filter(a => a !== opt.toLowerCase()); else arr.push(opt.toLowerCase());
                      setAnswers({ ...answers, t2q2_safety_leg: arr });
                    }}>
                      {(answers.t2q2_safety_leg || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '12px', height: '12px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {(answers.t2q2_safety_leg || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label style={{ fontSize: '10pt' }}>{opt}</label>
                  </div>
                ))}
              </td>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {['Work health and safety Law', 'OHS Law'].map((opt) => (
                  <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div className="no-print" style={{ width: '12px', height: '12px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: '#fff' }} onClick={() => {
                      let arr = Array.isArray(answers.t2q2_env_leg) ? [...answers.t2q2_env_leg] : [];
                      if (arr.includes(opt.toLowerCase())) arr = arr.filter(a => a !== opt.toLowerCase()); else arr.push(opt.toLowerCase());
                      setAnswers({ ...answers, t2q2_env_leg: arr });
                    }}>
                      {(answers.t2q2_env_leg || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="hidden print:flex" style={{ width: '12px', height: '12px', border: '1px solid #000', justifyContent: 'center', alignItems: 'center' }}>
                      {(answers.t2q2_env_leg || []).includes(opt.toLowerCase()) && <span style={{ color: '#cc0000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <label style={{ fontSize: '10pt' }}>{opt}</label>
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 2 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px' }}>ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</h1>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.4' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '12px', lineHeight: '1.4' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontWeight: 'bold', marginBottom: '12px' }}>
          Assessor Instructions:
        </p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '16px', lineHeight: '1.4' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </p>

        <h3 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', fontWeight: 'bold', marginBottom: '8px' }}>Knowledge Evidence</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <tr>
              <th style={{ border: '1px solid #000', backgroundColor: '#999', textAlign: 'left', padding: '6px', fontWeight: 'bold' }}>Knowledge Evidence Questions</th>
              <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#999', textAlign: 'center', padding: '6px', fontWeight: 'bold' }}>Satisfactory</th>
              <th rowSpan={2} style={{ border: '1px solid #000', backgroundColor: '#999', textAlign: 'left', padding: '6px', fontWeight: 'bold', width: '25%' }}>Comments</th>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', backgroundColor: '#aaa', textAlign: 'left', padding: '6px', fontWeight: 'bold' }}>Note any additional questions you use during the assessment</th>
              <th style={{ border: '1px solid #000', backgroundColor: '#aaa', textAlign: 'left', padding: '6px', fontWeight: 'bold', width: '12%' }}>Yes</th>
              <th style={{ border: '1px solid #000', backgroundColor: '#aaa', textAlign: 'left', padding: '6px', fontWeight: 'bold', width: '12%' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderChkRows('task2', task2.checklistItems, 0, 10)}
          </tbody>
        </table>
        <PageFooter n={14} />
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 2 ASSESSOR CHECKLIST CONT ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h3 style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', fontWeight: 'bold', marginBottom: '8px' }}>Record of Performance:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '16px' }}>
          <ChkHead />
          <tbody>
            {renderChkRows('task2', task2.checklistItems, 10, task2.checklistItems.length)}
          </tbody>
        </table>
        {renderDeclarations('task2')}
        <PageFooter n={15} />
      </div>

      {/* ═══════════════════ PAGE 16 – TASK 3 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '16px' }}>ASSESSMENT TASK 3: WRITTEN QUESTIONS AND ANSWERS</h1>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontWeight: 'bold', marginBottom: '12px' }}>Student Instructions:</p>
        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '16px', lineHeight: '1.4' }}>
          This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45-60 minutes. As you learn, practice and review knowledge and skills, you will keep the reading materials in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.
        </p>

        <p style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', fontWeight: 'bold', marginBottom: '8px' }}>Make sure you:</p>
        <ul style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '16px', paddingLeft: '24px', lineHeight: '1.4' }}>
          <li style={{ marginBottom: '8px' }}>Answer all questions</li>
          <li style={{ marginBottom: '8px' }}>Print clearly</li>
          <li style={{ marginBottom: '8px' }}>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
          <li style={{ marginBottom: '8px' }}>Ask your assessor if you do not understand a question. Whist your assessor cannot tell you the answer, he/she may be able to re-word the question for you</li>
          <li style={{ marginBottom: '8px' }}>Do not talk to your classmates. If you are caught discussion the answers you will be asked to leave and your assessment will not be marked.</li>
          <li style={{ marginBottom: '8px' }}>Do not cheat. Anyone caught cheating will automatically be marked Not Competent for this unit. There are NO EXCEPTIONS to this rule.</li>
        </ul>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', backgroundColor: '#e0e0e0', padding: '6px', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', fontWeight: 'bold' }}>Questions</th>
            </tr>
          </thead>
        </table>
        <div>{task3.questions?.slice(0, 2).map((q: any) => renderTask3Q(q, 'task3'))}</div>
        <PageFooter n={16} />
      </div>

      {/* ═══════════════════ PAGE 17 – TASK 3 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task3.questions?.slice(2, 7).map((q: any) => renderTask3Q(q, 'task3'))}</div>
        <PageFooter n={17} />
      </div>
      {/* ═══════════════════ PAGE 18 – TASK 3 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task3.questions?.slice(7, 10).map((q: any) => renderTask3Q(q, 'task3'))}</div>
        <h3 style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold', fontSize: '12pt', marginTop: '32px' }}>Comments/Feedback to Participant</h3>
        <PageFooter n={18} />
      </div>

      {/* ═══════════════════ PAGE 19 – TASK 3 DECLARATIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div style={{ marginTop: '24px' }}>
          {renderDeclarations('task3')}
        </div>
        <PageFooter n={19} />
      </div>

      {/* ═══════════════════ PAGE 20 – TASK 4 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '24px' }}>TASK 4 - ADDITIONAL WORKSHEET</h1>
        <div>{task4.questions?.slice(0, 4).map((q: any) => renderTask4Q(q, 'task4'))}</div>
        <PageFooter n={20} />
      </div>

      {/* ═══════════════════ PAGE 21 – TASK 4 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task4.questions?.slice(4, 10).map((q: any) => renderTask4Q(q, 'task4'))}</div>
        <PageFooter n={21} />
      </div>

      {/* ═══════════════════ PAGE 22 – TASK 4 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task4.questions?.slice(10, 16).map((q: any) => renderTask4Q(q, 'task4'))}</div>
        <PageFooter n={22} />
      </div>
      {/* ═══════════════════ PAGE 23 – TASK 4: Q17-22 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task4.questions?.slice(16, 22).map((q: any) => renderTask4Q(q, 'task4'))}</div>
        <PageFooter n={23} />
      </div>

      {/* ═══════════════════ PAGE 24 – TASK 4: Q23-28 (Text only for 28) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div>{task4.questions?.slice(22, 27).map((q: any) => renderTask4Q(q, 'task4'))}</div>
        <div>
          <p style={{ fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginBottom: '8px' }}>
            28. Choose 3 the most important steps to take when working near traffic?
          </p>
        </div>
        <PageFooter n={24} />
      </div>

      {/* ═══════════════════ PAGE 25 – TASK 4: Q28 (options) + declarations + end of assessment ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div style={{ marginTop: '-12px' }}>
          {renderTask4Q(task4.questions[27], 'task4', true)}
        </div>
        {renderDeclarations('task4')}

        <div style={{ textAlign: 'center', marginTop: '32px', fontFamily: '"Times New Roman", Times, serif' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '16px' }}>END OF ASSESSMENT</h2>
          <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '12px' }}>Before you hand in your assessment, make sure that you:</p>
        </div>
        <ol style={{ paddingLeft: '48px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.4' }}>
          <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>Re-check your answers and make sure you are happy with your responses.</li>
          <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>Have written your Name, Student ID, on the first page and signed the student declaration.</li>
          <li style={{ paddingLeft: '8px', marginBottom: '4px' }}>If you are submitting this assessment as a separate attachment, please attached an Assessment Submission Sheet available from the Student Administration or the ACTA intranet.</li>
        </ol>
        <PageFooter n={25} />
      </div>

    </div>
  );
};
