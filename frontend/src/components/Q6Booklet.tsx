import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions6';

const InnerHeader = () => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
    <div style={{ fontSize: '9pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif' }}>
      <div style={{ textDecoration: 'underline' }}>Assessment booklet</div>
      <div style={{ textDecoration: 'underline' }}>{assessmentQuestions.metadata.code} - {assessmentQuestions.metadata.course}</div>
    </div>
    <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div style={{ marginTop: 'auto', paddingTop: '4mm', display: 'flex', justifyContent: 'space-between', fontSize: '8pt', fontFamily: '"Times New Roman", Times, serif' }}>
    <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V4.4 | 2024</span>
    <span style={{ fontWeight: 'bold' }}>Page {n} of 20</span>
  </div>
);

interface Q6BookletProps {
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

export const Q6Booklet: React.FC<Q6BookletProps> = ({ answers, setAnswers, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
      const key = sigModal?.type === 'comp' ? sigModal.field : `${sigModal?.type}_${sigModal?.field}`;

      if (sigModal?.field === 'student_signature') {
        setAnswers({ ...answers, [key]: dataUrl, student_signature_url: dataUrl }); // Fallback for global
      } else if (sigModal?.field === 'assessor_signature') {
        setCompRecord({ ...compRecord, [key]: dataUrl, assessor_signature: dataUrl, task1_assessor_signature: dataUrl, task2_assessor_signature: dataUrl, task3_assessor_signature: dataUrl, admin_signature: dataUrl });
      } else {
        setCompRecord({ ...compRecord, [key]: dataUrl });
      }
      closeSigModal();
    }
  };

  useEffect(() => {
    if (sigModal?.open && sigModalCanvasRef.current) {
      const pad = new SignaturePad(sigModalCanvasRef.current, { backgroundColor: 'rgb(255,255,255)', penColor: 'rgb(0,0,0)' });
      sigPadRef.current = pad;
      const resize = () => {
        if (sigModalCanvasRef.current && sigModalContainerRef.current) {
          const r = Math.max(window.devicePixelRatio || 1, 1);
          sigModalCanvasRef.current.width = sigModalContainerRef.current.offsetWidth * r;
          sigModalCanvasRef.current.height = sigModalContainerRef.current.offsetHeight * r;
          sigModalCanvasRef.current.getContext('2d')?.scale(r, r);
          pad.clear();
        }
      };
      setTimeout(resize, 100);
      window.addEventListener('resize', resize);
      return () => { window.removeEventListener('resize', resize); pad.off(); };
    }
  }, [sigModal?.open]);

  const globalAssessorSig = compRecord.assessor_signature || compRecord.task1_assessor_signature || compRecord.task2_assessor_signature || compRecord.task3_assessor_signature;
  const globalAssessorDate = compRecord.assessor_sig_date || compRecord.task1_assessor_sig_date || compRecord.task2_assessor_sig_date || compRecord.task3_assessor_sig_date;

  const formatDisplayDate = (d: string) => d || '';

  // ── Declarations block reused per task ──
  const renderDeclarations = (taskKey: string) => (
    <div style={{ marginTop: '6mm', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4mm', fontSize: '12pt' }}>Comments/Feedback to Participant</div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', marginBottom: '4mm' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #888', padding: '12px', width: '50%', verticalAlign: 'top', lineHeight: 1.4 }}>
              <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
            </td>
            <td style={{ border: '1px solid #888', padding: '12px', width: '50%', verticalAlign: 'top' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', taskKey)} style={{ borderBottom: '1px solid #888', flex: 1, minHeight: '30px', cursor: 'pointer', position: 'relative' }}>
                    {answers[`${taskKey}_student_signature`] ? <img src={answers[`${taskKey}_student_signature`]} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#aaa' }}>{isStudent ? 'Click to sign' : ''}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Date:</span>
                  <span className="no-print flex-1" style={{ borderBottom: '1px solid #888', minHeight: '30px', position: 'relative' }}>
                    <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers[`${taskKey}_student_date`] || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, [`${taskKey}_student_date`]: e.target.value })} />
                  </span>
                  <span className="hidden print:inline-block flex-1" style={{ borderBottom: '1px solid #888', minHeight: '30px' }}>
                    {answers[`${taskKey}_student_date`] ? formatDisplayDate(answers[`${taskKey}_student_date`]) : '____/____/_______'}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', marginBottom: '4mm' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #888', padding: '8px', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Assessor's Feedback:</div>
              <textarea style={{ width: '100%', minHeight: '100px', background: 'transparent', outline: 'none', border: 'none', resize: 'none' }}
                value={compRecord[`${taskKey}_feedback`] || ''} onChange={(e) => setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value })} readOnly={isStudent} />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', margin: '6mm 0' }}>
        Result:
        <span style={{ display: 'inline-block', margin: '0 6px', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' })}>
          Satisfactory{' '}
          <span style={{ position: 'relative' }}>
            (S)
            {compRecord[`${taskKey}_result`] === 'S' && (
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '40px', height: '40px', pointerEvents: 'none' }}></span>
            )}
          </span>
        </span>
        /
        <span style={{ display: 'inline-block', margin: '0 6px', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' })}>
          Not Satisfactory{' '}
          <span style={{ position: 'relative' }}>
            (NS)
            {compRecord[`${taskKey}_result`] === 'NS' && (
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '50px', height: '50px', pointerEvents: 'none' }}></span>
            )}
          </span>
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #888', padding: '12px', width: '50%', verticalAlign: 'top', lineHeight: 1.4 }}>
              <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
            </td>
            <td style={{ border: '1px solid #888', padding: '12px', width: '50%', verticalAlign: 'top' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', taskKey)} style={{ borderBottom: '1px solid #888', flex: 1, minHeight: '30px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {globalAssessorSig ? <img src={globalAssessorSig} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#aaa' }}>{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Date:</span>
                  <span className="no-print flex-1" style={{ borderBottom: '1px solid #888', minHeight: '30px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={globalAssessorDate || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_assessor_sig_date`]: e.target.value, assessor_sig_date: e.target.value, task1_assessor_sig_date: e.target.value, task2_assessor_sig_date: e.target.value, task3_assessor_sig_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block flex-1" style={{ borderBottom: '1px solid #888', minHeight: '30px' }}>
                    {globalAssessorDate ? formatDisplayDate(globalAssessorDate) : '____/____/_______'}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderQBlock = (q: any, taskKey: string) => {
    if (q.type === 'text') {
      return (
        <React.Fragment key={q.id}>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #888', borderBottom: '1px solid #888', background: '#f5f5f5', padding: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
              <div style={{ display: 'flex', gap: '8px', fontWeight: 'bold', color: '#000' }}>
                <span>{q.id}.</span>
                <span style={{ whiteSpace: 'pre-wrap' }}>{q.text}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: '1px solid #888', padding: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', background: '#fff' }}>
              <textarea style={{ width: '100%', minHeight: '80px', border: 'none', outline: 'none', background: 'transparent', resize: 'vertical' }}
                placeholder="No answer provided"
                className="placeholder:italic placeholder:text-[#a0aabf]"
                value={answers[`t${taskKey.replace('task', '')}q${q.id}`] || ''} onChange={(e) => setAnswers({ ...answers, [`t${taskKey.replace('task', '')}q${q.id}`]: e.target.value })} />
            </td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '40%', background: '#e6ebd0', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }}>Assessor to tick (☑)</td>
            <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' })}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                  {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                </div> Satisfactory (S)
              </div>
            </td>
            <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' })}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                  {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                </div> Not Satisfactory (NS)
              </div>
            </td>
          </tr>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={q.id}>
        <tr>
          <td colSpan={3} style={{ border: '1px solid #888', borderBottom: '1px solid #888', padding: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>{q.id}.</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{q.text}</span>
            </div>
            {q.image && (
              <div style={{ marginTop: '8px', marginLeft: '24px' }}>
                <img src={q.image} alt={`Q${q.id} diagram`} style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
            <div style={{ paddingLeft: '24px', marginTop: '6px' }}>
              {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => {
                const val = answers[opt.name || `t${taskKey.replace('task', '')}q${q.id}`];
                const checked = val === opt.value;
                return (
                  <div key={oIdx} style={{ display: 'flex', gap: '6px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => setAnswers({ ...answers, [opt.name || `t${taskKey.replace('task', '')}q${q.id}`]: opt.value })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', marginTop: '2px', flexShrink: 0 }}>
                      {checked && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <label style={{ cursor: 'pointer' }}>{opt.text}</label>
                  </div>
                );
              })}
              {(q.type === 'options' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
                const ansArray = answers[`t${taskKey.replace('task', '')}q${q.id}`] || [];
                const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                return (
                  <div key={oIdx} style={{ display: 'flex', gap: '6px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => {
                    let arr = [...(Array.isArray(answers[`t${taskKey.replace('task', '')}q${q.id}`]) ? answers[`t${taskKey.replace('task', '')}q${q.id}`] : [])];
                    if (!checked) arr.push(opt.value); else arr = arr.filter((v: any) => v !== opt.value);
                    setAnswers({ ...answers, [`t${taskKey.replace('task', '')}q${q.id}`]: arr });
                  }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', marginTop: '2px', flexShrink: 0 }}>
                      {checked && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <label style={{ cursor: 'pointer' }}>{opt.text}</label>
                  </div>
                );
              })}
              {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tiIdx: number) => (
                <div key={tiIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {ti.label && <span style={{ minWidth: '40px' }}>{ti.label}</span>}
                  <input required={isStudent}  type="text" style={{ border: '1.5px solid #000', outline: 'none', width: '200px', padding: '2px 4px' }}
                    value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
                </div>
              ))}
              {q.type === 'multipart_radio' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
                  {q.parts?.map((part: any, pIdx: number) => (
                    <div key={pIdx} style={{ flex: 1, minWidth: '200px' }}>
                      {part.image && <img src={part.image} alt={part.text} style={{ maxWidth: '100%', marginBottom: '8px' }} />}
                      <div style={{ paddingLeft: '8px' }}>
                        {part.options?.map((opt: any, oIdx: number) => {
                          const checked = answers[part.name] === opt.value;
                          return (
                            <div key={oIdx} style={{ display: 'flex', gap: '6px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => setAnswers({ ...answers, [part.name]: opt.value })}>
                              <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', marginTop: '2px', flexShrink: 0 }}>
                                {checked && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                              </div>
                              <label style={{ cursor: 'pointer' }}>{opt.text}</label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '40%', background: '#e6ebd0', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }}>Assessor to tick (☑)</td>
          <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' })}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
              </div> Satisfactory (S)
            </div>
          </td>
          <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' })}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
              </div> Not Satisfactory (NS)
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  // ── Checklist table helpers ──
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

  const q6Styles = `
      .q6-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q6-booklet-view * { box-sizing: border-box; }
      .q6-booklet-view .page {
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
      .q6-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q6-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q6-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q6-booklet-view h3.task-label { font-size: 10.5pt; font-weight: bold; text-align: center; margin: 1mm 0 3mm; }
      .q6-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q6-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q6-booklet-view table td, .q6-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q6-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q6-booklet-view .field-label-cell { font-weight: bold; background: #f0f0f0; width: 38%; border: 1px solid #555; padding: 5px 6px; }
      .q6-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q6-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q6-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q6-booklet-view .evidence-row { display: flex; align-items: center; gap: 18px; padding: 3px 0; font-size: 9pt; }
      .q6-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q6-booklet-view .result-badge { display: inline-flex; align-items: center; gap: 3px; background: #cde; border: 1px solid #67a; border-radius: 50%; width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a; }
      .q6-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q6-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q6-booklet-view .page-footer { margin-top: auto; padding-top: 4mm; border-top: 1px solid #000; display: flex; justify-content: space-between; font-size: 8pt; }
      .q6-booklet-view .inner-header { margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
      .q6-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q6-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q6-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q6-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q6-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q6-booklet-view .question-block { margin-bottom: 8mm; }
      .q6-booklet-view .question-text { font-weight: bold; margin-bottom: 3mm; }
      @media print {
        .q6-booklet-view { background: #fff !important; padding: 0 !important; }
        .q6-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }
  `;

  const admin = assessmentQuestions.adminInfo;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const t1qs = task1.questions as any[];
  const t3qs = task3.questions as any[];
  const q30 = t1qs.find((q: any) => q.id === 30);

  return (
    <div className="q6-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q6Styles }} />

      {/* Signature Modal */}
      {sigModal?.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#1e3a8a] text-white p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">{sigModal?.field === 'student_signature' ? 'Student Signature' : 'Assessor Signature'}</h3>
              <button onClick={closeSigModal} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
            </div>
            <div className="p-4 sm:p-8">
              <div ref={sigModalContainerRef} className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden mb-6 flex justify-center h-[250px]">
                <canvas ref={sigModalCanvasRef} className="w-full h-full cursor-crosshair" style={{ touchAction: 'none' }} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={clearSig} className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-sm"><RotateCcw size={18} /> CLEAR</button>
                <button onClick={saveSignature} className="flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold rounded-xl text-sm"><CheckCircle2 size={18} /> SAVE SIGNATURE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ PAGE 1 – COVER ═══════════════════ */}
      <div className="page" style={{ padding: '8mm 10mm' }}>
        <div style={{ border: '4px solid #5b9bd5', padding: '3px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="cover-inner-border" style={{ border: '1.5px solid #5b9bd5', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '220px', height: 'auto', objectFit: 'contain', marginBottom: '2mm', marginTop: '15mm' }} />
            <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#8b0000', fontFamily: 'Arial, sans-serif', marginBottom: '8mm' }}>RTO NO: 40954</div>
            <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '4mm' }}>Assessment Booklet</div>
            <div style={{ background: '#9bc2e6', height: '14px', width: '100%', marginBottom: '12mm' }}></div>

            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '6mm', letterSpacing: '0.5px' }}>{assessmentQuestions.metadata.code}</div>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, textAlign: 'center', maxWidth: '80%' }}>
              Use electrical skills when working<br />
              with telecommunications<br />
              networks (Release 1)
            </div>

            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '15mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="cover-student-name-container" style={{ fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.5px solid #000', width: '100mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '9pt', fontFamily: '"Times New Roman", Times, serif', color: '#333', marginTop: '20mm' }}>ACTA College Pty. Ltd</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontSize: '12pt', fontWeight: 'bold', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', margin: '2mm 0 4mm', textTransform: 'uppercase' }}>ASSESSMENT COMPETENCY RECORD</h1>
        <div style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', fontSize: '9pt', marginBottom: '6mm', lineHeight: 1.4, fontFamily: '"Times New Roman", Times, serif' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '6mm', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold' }}>Student's Name</td>
              <td style={{ width: '70%', border: '1px solid #000', padding: '6px 8px' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold' }}>Assessor's Name</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <input type="text" style={{ width: '100%', background: 'transparent', outline: 'none', border: 'none' }} value={compRecord.assessor_name || ''} onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Site</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <input type="text" style={{ width: '100%', background: 'transparent', outline: 'none', border: 'none' }} value={compRecord.assessment_site || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_site: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Date/s</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <span className="no-print">
                  <input type="date" style={{ width: '100%', background: 'transparent', outline: 'none', border: 'none', fontFamily: "'Times New Roman', serif" }} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                </span>
                <span className="hidden print:inline-block">
                  {compRecord.assessment_date ? formatDisplayDate(compRecord.assessment_date) : ''}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '6mm', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td colSpan={5} style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold', width: '35%' }}>Evidence is Confirmed as:</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', cursor: 'pointer', width: '15%' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_valid: !compRecord.evidence_valid })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                    {compRecord.evidence_valid && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Valid
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', cursor: 'pointer', width: '15%' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_sufficient: !compRecord.evidence_sufficient })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                    {compRecord.evidence_sufficient && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Sufficient
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', cursor: 'pointer', width: '15%' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_current: !compRecord.evidence_current })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                    {compRecord.evidence_current && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Current
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', cursor: 'pointer', width: '20%' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_authentic: !compRecord.evidence_authentic })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                    {compRecord.evidence_authentic && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Authentic
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Please attach the following documentation to this form</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', textAlign: 'center' }}>Result</td>
              <td rowSpan={4} style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>
                FINAL ASSESSMENT<br />RESULT:<br /><br />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', marginLeft: '10px' }}>
                  <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_assessment_result: 'C' })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                      {compRecord.final_assessment_result === 'C' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    Competent (C)
                  </div>
                  <div className="cursor-pointer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, final_assessment_result: 'NC' })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                      {compRecord.final_assessment_result === 'NC' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    Not Competent (NC)
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 1</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}><div className="cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_doc_attached: !compRecord.task1_doc_attached })} style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative', flexShrink: 0 }}>{compRecord.task1_doc_attached && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}</div> <span style={{ whiteSpace: 'nowrap' }}>Multi-choice and Questions and Answers</span></div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <span className="cursor-pointer" style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'S' })}>S{compRecord.task1_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '24px', height: '24px', border: '2px solid red', borderRadius: '50%' }}></span>}</span> /
                <span className="cursor-pointer" style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'NS' })}>NS{compRecord.task1_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '30px', height: '24px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 2</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}><div className="cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_doc_attached: !compRecord.task2_doc_attached })} style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative', flexShrink: 0 }}>{compRecord.task2_doc_attached && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}</div> <span style={{ whiteSpace: 'nowrap' }}>Observation</span></div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <span className="cursor-pointer" style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'S' })}>S{compRecord.task2_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '24px', height: '24px', border: '2px solid red', borderRadius: '50%' }}></span>}</span> /
                <span className="cursor-pointer" style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'NS' })}>NS{compRecord.task2_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '30px', height: '24px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 3</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}><div className="cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_doc_attached: !compRecord.task3_doc_attached })} style={{ width: '14px', height: '14px', border: '1px solid #000', marginTop: '2px', position: 'relative', flexShrink: 0 }}>{compRecord.task3_doc_attached && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}</div> <span style={{ whiteSpace: 'nowrap' }}>Questions and Answers</span></div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                <span className="cursor-pointer" style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'S' })}>S{compRecord.task3_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '24px', height: '24px', border: '2px solid red', borderRadius: '50%' }}></span>}</span> /
                <span className="cursor-pointer" style={{ position: 'relative', display: 'inline-block', margin: '0 8px' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'NS' })}>NS{compRecord.task3_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '30px', height: '24px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '6mm', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px', width: '10%' }}>Attempt</th>
              <th style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px', width: '25%' }}>Date</th>
              <th style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px', width: '65%' }}>Assessor's Feedback (as Required):</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((num) => (
              <tr key={num}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{num}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  <input type="date" style={{ width: '100%', background: 'transparent', outline: 'none', border: 'none' }} value={compRecord[`attempt_${num}_date`] || ''} onChange={(e) => setCompRecord({ ...compRecord, [`attempt_${num}_date`]: e.target.value })} readOnly={isStudent} />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  <input type="text" style={{ width: '100%', background: 'transparent', outline: 'none', border: 'none' }} value={compRecord[`attempt_${num}_feedback`] || ''} onChange={(e) => setCompRecord({ ...compRecord, [`attempt_${num}_feedback`]: e.target.value })} readOnly={isStudent} />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', background: '#d9d9d9', padding: '12px 6px', fontWeight: 'bold', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                <input type="text" style={{ width: '100%', background: 'transparent', outline: 'none', border: 'none' }} value={compRecord.final_feedback || ''} onChange={(e) => setCompRecord({ ...compRecord, final_feedback: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '4px', fontFamily: '"Times New Roman", Times, serif' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', width: '60%', verticalAlign: 'top', lineHeight: 1.4 }}>
                <strong>Assessor Declaration:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', width: '40%', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '30px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                      {globalAssessorSig ? <img src={globalAssessorSig} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date:</span>
                    <span className="no-print flex-1" style={{ borderBottom: '1.5px solid black', minHeight: '30px', position: 'relative' }}>
                      <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', fontWeight: 'bold', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                        value={globalAssessorDate || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessor_sig_date: e.target.value, task1_assessor_sig_date: e.target.value, task2_assessor_sig_date: e.target.value, task3_assessor_sig_date: e.target.value }) }} readOnly={isStudent} />
                    </span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top', lineHeight: 1.4 }}>
                <strong>Student Declaration:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Signature:</span>
                    <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '30px', cursor: 'pointer', position: 'relative' }}>
                      {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date:</span>
                    <span className="no-print flex-1" style={{ borderBottom: '1.5px solid black', minHeight: '30px', position: 'relative' }}>
                      <input required={isStudent}  type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', fontWeight: 'bold', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                        value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <PageFooter n={2} />
      </div>

      {/* ═══════════════════ PAGE 3 – ADMIN (unit info through plagiarism + complaintsAndAppeals) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold', fontSize: '11pt' }}>Administrative Use Only:</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', width: '35%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })}>
                    {compRecord.admin_entered && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <span>Signature/Initial <div className="inline-block relative cursor-pointer" style={{ borderBottom: '1px solid #000', width: '60px', marginLeft: '4px', minHeight: '24px' }} onClick={() => openSigModal('admin_signature', 'comp')}>{globalAssessorSig ? <img src={globalAssessorSig} style={{ maxHeight: '24px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : (compRecord.admin_signature && <img src={compRecord.admin_signature} style={{ maxHeight: '24px', position: 'absolute', bottom: '0' }} />)}</div></span>
                  <span style={{ marginLeft: 'auto' }}>Date: <input type="date" style={{ borderBottom: '1px solid #000', width: '100px', outline: 'none', background: 'transparent' }} value={globalAssessorDate || ''} onChange={(e) => setCompRecord({ ...compRecord, admin_date: e.target.value, assessor_sig_date: e.target.value, task1_assessor_sig_date: e.target.value, task2_assessor_sig_date: e.target.value, task3_assessor_sig_date: e.target.value })} readOnly={isStudent} /></span>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.unitSummary}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Conditions and Context of the Assessments</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.conditionsAndContext}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Specific Resources Required</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{admin.specificResources}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Re-Assessment</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.reAssessment}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.plagiarism}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Complaints and Appeal</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.complaintsAndAppeals}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessors Intervention</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.assessorsIntervention}</td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN (assessors intervention + attaching docs + instruction + tasks + competency decision) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '35%' }}>Attaching documents</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.attachingDocuments}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Instruction</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.assessmentInstruction}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 1:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.task1Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 2:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.task2Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Assessment Task 3:</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.task3Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN (reasonable adjustment + cover sheet) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '20mm' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', background: '#d9d9d9', padding: '6px 8px', fontWeight: 'bold', fontSize: '11pt' }}>Reasonable Adjustment</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{admin.reasonableAdjustment}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '35%', textAlign: 'center' }}>Reasonable Adjustment Provided</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '35%', textAlign: 'center' }}>Reasonable Adjustment</td>
              <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', width: '30%', textAlign: 'center' }}>Outcome</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_edu: !compRecord.ra_edu })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', flexShrink: 0 }}>
                      {compRecord.ra_edu && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    Educational and bilingual support
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_oral: !compRecord.ra_oral })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', flexShrink: 0 }}>
                      {compRecord.ra_oral && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    Presenting questions orally
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_diagram: !compRecord.ra_diagram })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', flexShrink: 0, marginTop: '2px' }}>
                      {compRecord.ra_diagram && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span style={{ lineHeight: 1.2 }}>Presenting work instructions in diagrammatic or<br />pictorial form instead of words and sentences</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_extra: !compRecord.ra_extra })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', flexShrink: 0, marginTop: '2px' }}>
                      {compRecord.ra_extra && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span style={{ lineHeight: 1.2 }}>Extra time to complete a course or assessment</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isStudent ? 'default' : 'pointer' }} onClick={(e) => { if (e.target instanceof HTMLInputElement) return; !isStudent && setCompRecord({ ...compRecord, ra_other: !compRecord.ra_other }) }}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', flexShrink: 0 }}>
                      {compRecord.ra_other && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    Others:
                    <input type="text" className="no-print" style={{ borderBottom: '1px solid #000', background: 'transparent', outline: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginLeft: '6px', width: '100px', flex: 1, cursor: isStudent ? 'default' : 'text' }} value={compRecord.ra_others_text || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_others_text: e.target.value })} readOnly={isStudent} />
                    <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', marginLeft: '6px', flex: 1 }}>{compRecord.ra_others_text}</span>
                  </div>
                </div>
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <textarea style={{ width: '100%', height: '100%', minHeight: '120px', background: 'transparent', outline: 'none', border: 'none', resize: 'none' }} value={compRecord.reasonable_adjustment_reason || ''} onChange={(e) => setCompRecord({ ...compRecord, reasonable_adjustment_reason: e.target.value })} readOnly={isStudent} />
              </td>
              <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                <textarea style={{ width: '100%', height: '100%', minHeight: '120px', background: 'transparent', outline: 'none', border: 'none', resize: 'none' }} value={compRecord.reasonable_adjustment_outcome || ''} onChange={(e) => setCompRecord({ ...compRecord, reasonable_adjustment_outcome: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#00ffff', padding: '4px', display: 'inline-block', fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', marginBottom: '4mm' }}>
          COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT
        </div>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', margin: '0 0 6mm 0' }}>A cover sheet must be included with each submission of work.</p>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', margin: 0 }}>Work submitted without a signed cover sheet will be returned unmarked.</p>

        <PageFooter n={5} />
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1: instructions + Q1-2 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontSize: '13pt', fontWeight: 'bold', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', margin: '6mm 0 8mm', textTransform: 'uppercase' }}>
          {task1.title}
        </h1>
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', lineHeight: 1.45, marginBottom: '6mm' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2mm' }}>Student Instructions:</div>
          <div style={{ textAlign: 'justify', marginBottom: '6mm' }}>{task1.sections[0].content}</div>
          <div style={{ fontWeight: 'bold', marginBottom: '2mm' }}>Make sure you:</div>
          <div style={{ marginLeft: '4mm' }}>
            {task1.sections[1].content.split('\n').map((line: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '1.5mm' }}>
                <span>•</span><span>{line.replace('• ', '')}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '4mm' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
            <thead>
              <tr><th colSpan={3} style={{ background: '#33ccff', color: '#000', padding: '6px', fontSize: '13pt', fontWeight: 'bold', border: '1.5px solid #000' }}>Questions</th></tr>
            </thead>
            <tbody>
              {t1qs.slice(0, 2).map((q: any) => renderQBlock(q, 'task1'))}
            </tbody>
          </table>
        </div>
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1 Q3-7 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', marginTop: '4mm' }}>
          <tbody>
            {t1qs.slice(2, 7).map((q: any) => renderQBlock(q, 'task1'))}
          </tbody>
        </table>
        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1 Q8-11 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', marginTop: '4mm' }}>
          <tbody>
            {t1qs.slice(7, 11).map((q: any) => renderQBlock(q, 'task1'))}
          </tbody>
        </table>
        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 1 Q12-16 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', marginTop: '4mm' }}>
          <tbody>
            {t1qs.slice(11, 16).map((q: any) => renderQBlock(q, 'task1'))}
          </tbody>
        </table>
        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 1 Q17-20 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', marginTop: '4mm' }}>
          <tbody>
            {t1qs.slice(16, 20).map((q: any) => renderQBlock(q, 'task1'))}
          </tbody>
        </table>
        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 1 Q21-26 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', marginTop: '4mm' }}>
          <tbody>
            {t1qs.slice(20, 26).map((q: any) => renderQBlock(q, 'task1'))}
          </tbody>
        </table>
        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 1 Q27-30 (images A-D) ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div className="mt-2">
          {t1qs.slice(26, 29).map((q: any) => renderQBlock(q, 'task1'))}
          {/* Q30 — render text + images A-D only */}
          {q30 && (
            <div className="mb-4 border-[1.5px] border-black bg-white flex flex-col">
              <div className="p-3">
                <div className="flex gap-2 font-bold mb-2 text-[10pt]">
                  <span>{q30.id}.</span>
                  <span className="whitespace-pre-wrap">{q30.text}</span>
                </div>
                <div className="pl-0 mt-4 flex flex-wrap gap-6 justify-between px-4">
                  {q30.textInputs?.slice(0, 4).map((ti: any, tIdx: number) => (
                    <div key={tIdx} className="w-[45%] flex flex-col items-center mb-6">
                      {ti.image && (
                        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <img src={ti.image} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={ti.placeholder} />
                        </div>
                      )}
                      <div className="flex items-center w-full gap-2">
                        <span className="font-bold">{ti.placeholder}</span>
                        <input required={isStudent}  type="text" style={{ border: '1.5px solid #000' }} className="w-full outline-none p-1 bg-transparent"
                          value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 1 Q30 image E + declarations ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        {q30 && q30.textInputs?.length > 4 && (
          <div className="mb-4 border-[1.5px] border-black bg-white flex flex-col">
            <div className="p-3">
              <div className="flex flex-col items-center mb-4 mt-2">
                {q30.textInputs[4].image && (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <img src={q30.textInputs[4].image} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={q30.textInputs[4].placeholder} />
                  </div>
                )}
                <div className="flex items-center w-[45%] gap-2">
                  <span className="font-bold">{q30.textInputs[4].placeholder}</span>
                  <input required={isStudent}  type="text" style={{ border: '1.5px solid #000' }} className="w-full outline-none p-1 bg-transparent"
                    value={answers[q30.textInputs[4].name] || ''} onChange={(e) => setAnswers({ ...answers, [q30.textInputs[4].name]: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] mt-auto">
              <div className="w-[40%] p-1 text-blue-800 border-r-[1.5px] border-black flex items-center">Assessor to tick (☑)</div>
              <div className={`w-[30%] p-1 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`task1_q${q30.id}_result`]: 'S' }) }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {compRecord[`task1_q${q30.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>Satisfactory (S)
              </div>
              <div className={`w-[30%] p-1 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`task1_q${q30.id}_result`]: 'NS' }) }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {compRecord[`task1_q${q30.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>Not Satisfactory (NS)
              </div>
            </div>
          </div>
        )}
        {renderDeclarations('task1')}
        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 2 OBSERVATION SECTIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', margin: '6mm 0 2mm', textTransform: 'uppercase' }}>
          {task2.observationTitle}
        </h1>
        {task2.observationSubtitle && (
          <h2 style={{ fontSize: '12.5pt', fontWeight: 'bold', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', margin: '0 0 6mm', whiteSpace: 'pre-wrap' }}>
            {task2.observationSubtitle}
          </h2>
        )}
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', lineHeight: 1.5 }}>
          {task2.sections?.filter((s: any) => s.type === 'text').map((section: any, sIdx: number) => (
            <div key={sIdx} style={{ marginBottom: '4mm' }}>
              {section.title && <div style={{ fontWeight: 'bold', marginBottom: '2mm' }}>{section.title}</div>}
              <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{section.content}</div>
            </div>
          ))}
        </div>
        <PageFooter n={14} />
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 2 MEASUREMENT TABLE + CHECKLIST INTRO + OBS ITEMS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        {task2.sections?.filter((s: any) => s.type === 'table').map((section: any, sIdx: number) => (
          <div key={sIdx} style={{ marginBottom: '8mm' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
              <thead>
                <tr>{section.headers?.map((h: string, hIdx: number) => <th key={hIdx} style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {section.rows?.map((row: any, rIdx: number) => (
                  <tr key={rIdx}>
                    <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', width: '25%' }}>{row.label}</td>
                    <td style={{ border: '1px solid #000', padding: '8px', width: '37.5%' }}>
                      {row.editable ? (
                        <input required={isStudent}  type="text" style={{ width: '100%', outline: 'none', background: 'transparent' }}
                          value={answers[row.id] || ''} onChange={(e) => setAnswers({ ...answers, [row.id]: e.target.value })} />
                      ) : row.value}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', width: '37.5%' }}>
                      {row.editable ? (
                        <input required={isStudent}  type="text" style={{ width: '100%', outline: 'none', background: 'transparent' }}
                          value={answers[`${row.id}_measured`] || ''} onChange={(e) => setAnswers({ ...answers, [`${row.id}_measured`]: e.target.value })} />
                      ) : row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <h1 style={{ fontSize: '14pt', fontWeight: 'bold', textAlign: 'center', fontFamily: '"Times New Roman", Times, serif', margin: '12mm 0 6mm', textTransform: 'uppercase' }}>
          ASSESSMENT TASK 2 – ASSESSOR CHECKLIST
        </h1>
        <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt', lineHeight: 1.5 }}>
          <p style={{ fontStyle: 'italic', marginBottom: '4mm' }}>
            This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
          </p>
          <p style={{ marginBottom: '4mm' }}>
            The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
          </p>
          <div style={{ fontWeight: 'bold', marginBottom: '2mm', fontSize: '11pt' }}>Assessor Instructions:</div>
          <p style={{ marginBottom: '6mm' }}>
            The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
          </p>
          <div style={{ fontWeight: 'bold', marginBottom: '6mm', fontSize: '11pt' }}>The following was observed during the observations:</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {task2.observationItems?.map((item: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>{item}</div>
                <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_obs_${idx}`]: !compRecord[`task2_obs_${idx}`] })}>
                  <div style={{ width: '16px', height: '16px', border: '1.5px solid #000', background: '#fff', position: 'relative' }}>
                    {compRecord[`task2_obs_${idx}`] && <span style={{ position: 'absolute', top: '-6px', left: '1px', color: 'red', fontSize: '16px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <span>Observation 1</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PageFooter n={15} />
      </div>

      {/* ═══════════════════ PAGE 16 – TASK 2 CHECKLIST ITEMS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', marginTop: '4mm', marginBottom: '4mm' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #888', background: '#a6a6a6', padding: '6px', width: '55%', fontWeight: 'bold', color: '#000' }}>Checklist</th>
              <th style={{ border: '1px solid #888', background: '#a6a6a6', padding: '6px', width: '20%', fontWeight: 'bold', color: '#000' }}>Circuit 1</th>
              <th style={{ border: '1px solid #888', background: '#a6a6a6', padding: '6px', width: '25%', fontWeight: 'bold', color: '#000' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #888', background: '#d9d9d9', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Date Observed:</td>
              <td colSpan={2} style={{ border: '1px solid #888', padding: '6px' }}>
                <input type="text" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }} value={compRecord.task2_date_observed || ''} onChange={(e) => setCompRecord({ ...compRecord, task2_date_observed: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
            {task2.checklistItems?.map((item: string, idx: number) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #888', padding: '6px 8px', lineHeight: 1.4 }}>{item}</td>
                <td style={{ border: '1px solid #888', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${idx}`]: 'yes' })}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                        {compRecord[`task2_chk_${idx}`] === 'yes' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                      </div> Yes
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`task2_chk_${idx}`]: 'no' })}>
                      <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative' }}>
                        {compRecord[`task2_chk_${idx}`] === 'no' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                      </div> No
                    </div>
                  </div>
                </td>
                <td style={{ border: '1px solid #888', padding: '6px' }}>
                  <input type="text" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }} value={compRecord[`task2_chk_comment_${idx}`] || ''} onChange={(e) => setCompRecord({ ...compRecord, [`task2_chk_comment_${idx}`]: e.target.value })} readOnly={isStudent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PageFooter n={16} />
      </div>

      {/* ═══════════════════ PAGE 17 – TASK 2 DECLARATIONS ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        {renderDeclarations('task2')}
        <PageFooter n={17} />
      </div>

      {/* ═══════════════════ PAGE 18 – TASK 3 INTRO + Q1-6 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task3.title}</h1>
        {task3.sections?.map((section: any, sIdx: number) => (
          <div key={sIdx} className="mb-3">
            {section.title && <h3 className="font-bold mb-1">{section.title}</h3>}
            {section.content && <p className="whitespace-pre-wrap text-[9pt]">{section.content}</p>}
          </div>
        ))}
        <div className="mt-2">
          {t3qs.slice(0, 6).map((q: any) => renderQBlock(q, 'task3'))}
        </div>
        <PageFooter n={18} />
      </div>

      {/* ═══════════════════ PAGE 19 – TASK 3 Q7-13 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div className="mt-2">
          {t3qs.slice(6, 13).map((q: any) => renderQBlock(q, 'task3'))}
        </div>
        <PageFooter n={19} />
      </div>

      {/* ═══════════════════ PAGE 20 – TASK 3 Q14-15 + DECLARATIONS + END OF ASSESSMENT ═══════════════════ */}
      <div className="page">
        <InnerHeader />

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #888', marginBottom: '6mm', marginTop: '2mm' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #888', padding: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>14.</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Describe characteristics of signal transmission</div>
                    <div style={{ fontWeight: 'bold' }}>True or False?</div>
                    <div>Sending and receiving information via a cable</div>
                  </div>
                </div>
                <div style={{ paddingLeft: '24px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => setAnswers({ ...answers, t3q14: 'true' })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', marginTop: '2px', flexShrink: 0 }}>
                      {answers.t3q14 === 'true' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <label style={{ cursor: 'pointer' }}>True</label>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }} onClick={() => setAnswers({ ...answers, t3q14: 'false' })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', marginTop: '2px', flexShrink: 0 }}>
                      {answers.t3q14 === 'false' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <label style={{ cursor: 'pointer' }}>False</label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '40%', background: '#e6ebd0', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }}>Assessor to tick (☑)</td>
              <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_q14_result: 'S' })}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                    {compRecord.task3_q14_result === 'S' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Satisfactory (S)
                </div>
              </td>
              <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_q14_result: 'NS' })}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                    {compRecord.task3_q14_result === 'NS' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Not Satisfactory (NS)
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #888', padding: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '10.5pt' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>15.</span>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>List and describe common telecommunications cables and the characteristics of use and application.</span>
                    <span> Please refer to slide 30 and 31 of PowerPoint 2</span>
                  </div>
                </div>
                <textarea required={isStudent} style={{ width: '100%', minHeight: '120px', border: 'none', outline: 'none', background: 'transparent', resize: 'vertical' }}
                  value={answers.t3q15 || ''} onChange={(e) => setAnswers({ ...answers, t3q15: e.target.value })} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '40%', background: '#e6ebd0', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }}>Assessor to tick (☑)</td>
              <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_q15_result: 'S' })}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                    {compRecord.task3_q15_result === 'S' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Satisfactory (S)
                </div>
              </td>
              <td style={{ border: '1px solid #888', padding: '6px 8px', fontWeight: 'bold', color: '#0000cd', width: '30%', background: '#e6ebd0', cursor: 'pointer', textAlign: 'center', fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_q15_result: 'NS' })}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #0000cd', background: '#fff', position: 'relative' }}>
                    {compRecord.task3_q15_result === 'NS' && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div> Not Satisfactory (NS)
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {renderDeclarations('task3')}

        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', margin: '14mm 0 6mm', fontFamily: '"Times New Roman", Times, serif' }}>
          END OF ASSESSMENT
        </div>
        <div style={{ fontSize: '10.5pt', fontFamily: '"Times New Roman", Times, serif', padding: '0 8mm' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '6px' }}>Before you hand in your assessment, make sure that you:</p>
          <ol style={{ paddingLeft: '24px', margin: 0, lineHeight: 1.5 }}>
            <li style={{ paddingLeft: '4px' }}>Re-check your answers and make sure you are happy with your responses.</li>
            <li style={{ paddingLeft: '4px' }}>Have written your Name, Student ID, on the first page and signed the student declaration</li>
            <li style={{ paddingLeft: '4px' }}>If you are submitting this assessment as a separate attachment, please attached an Assessment Submission Sheet available from the Student Administration or the ACTA intranet.</li>
          </ol>
        </div>

        <PageFooter n={20} />
      </div>

    </div>
  );
};
