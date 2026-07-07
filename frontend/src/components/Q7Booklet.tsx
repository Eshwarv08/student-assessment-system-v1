import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions7';

const InnerHeader = () => (
  <div className="inner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '16px' }}>
    <div style={{ textDecoration: 'underline', fontStyle: 'italic', fontWeight: 'bold', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif' }}>
      {assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}
    </div>
    <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
  </div>
);

const PageFooter = ({ n }: { n: number }) => (
  <div className="page-footer"><span></span><span>Page {n} of 16</span></div>
);

interface Q7BookletProps {
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

export const Q7Booklet: React.FC<Q7BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
    const parts = d.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return d;
  };

  const renderDeclarations = (taskKey: string) => (
    <div className="mt-6">
      <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '12px' }}>Comments/Feedback to Participant</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('student_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '30px', cursor: 'pointer', position: 'relative' }}>
                    {answers.student_signature_url ? <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', position: 'relative' }}>
                    {answers.student_signature_url && <img src={answers.student_signature_url} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <div className="no-print" style={{ flex: 1, borderBottom: '1.5px solid black', height: '30px' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: 'pointer' }}
                      value={answers.student_date || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => { setAnswers({ ...answers, student_date: e.target.value }) }} />
                  </div>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', paddingLeft: '4px', fontWeight: 'bold' }}>{formatDisplayDate(answers.student_date || submitDate || '')}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ border: '1.5px solid black', padding: '8px', minHeight: '100px', marginBottom: '16px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '10pt' }}>Assessor's Feedback:</p>
        <textarea className="no-print" style={{ width: '100%', minHeight: '70px', border: 'none', resize: 'vertical', fontFamily: "'Times New Roman', serif", fontSize: '10.5pt', padding: 0, outline: 'none', backgroundColor: 'transparent' }}
          placeholder="Assessor feedback..." value={compRecord[`${taskKey}_feedback`] || ''}
          onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_feedback`]: e.target.value }) }} readOnly={isStudent} />
        <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '70px', fontSize: '10.5pt' }}>{compRecord[`${taskKey}_feedback`]}</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold', fontSize: '12.5pt' }}>
        Result:{' '}
        <span className={`inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }} style={{ padding: '4px' }}>
          Satisfactory <span className="relative inline-block">(S){compRecord[`${taskKey}_result`] === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid red', borderRadius: '50%', width: '160%', height: '140%', pointerEvents: 'none' }}></span>}</span>
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span className={`inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`} onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }} style={{ padding: '4px' }}>
          Not Satisfactory <span className="relative inline-block">(NS){compRecord[`${taskKey}_result`] === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid red', borderRadius: '50%', width: '130%', height: '140%', pointerEvents: 'none' }}></span>}</span>
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', borderRight: '1.5px solid black', padding: '8px', verticalAlign: 'top' }}>
              <p style={{ margin: 0, lineHeight: '1.4', fontSize: '10pt' }}><span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
            </td>
            <td style={{ width: '40%', padding: '8px 12px', fontSize: '10pt' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Signature:</span>
                  <div className="no-print" onClick={() => openSigModal('assessor_signature', 'comp')} style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '30px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}>
                    {compRecord.assessor_signature ? <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                  <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', position: 'relative' }}>
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} alt="Sig" style={{ maxHeight: '30px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date:</span>
                  <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '30px', position: 'relative' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '30px', paddingLeft: '4px' }}>{compRecord.assessment_date ? formatDisplayDate(compRecord.assessment_date) : ''}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderQ = (q: any, taskKey: string, isFirst: boolean = false) => (
    <div key={q.id} className={`border-[1.5px] border-black ${isFirst ? '' : 'border-t-0'} bg-white flex flex-col`}>
      <div className="flex gap-2 font-bold p-3 border-b-[1.5px] border-black text-[10pt]">
        <span>{q.id}.</span><span className="whitespace-pre-wrap">{q.text}</span>
      </div>
      <div className={q.type === 'multipart_radio' ? '' : 'p-3 pl-4'}>
          {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
            <div key={oIdx} className="flex gap-2 mb-1 items-center">
              <input required={isStudent} type="radio" checked={answers[opt.name || `t${taskKey.replace('task', '')}q${q.id}`] === opt.value} onChange={() => setAnswers({ ...answers, [opt.name || `t${taskKey.replace('task', '')}q${q.id}`]: opt.value })} className="mt-0.5" />
              <label>{opt.text}</label>
            </div>
          ))}
          {(q.type === 'checkbox' || q.type === 'options') && q.options?.map((opt: any, oIdx: number) => {
            const ansArray = answers[`t${taskKey.replace('task', '')}q${q.id}`] || [];
            const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
            return (
              <div key={oIdx} className="flex gap-2 mb-1 items-center">
                <input type="checkbox" checked={checked} onChange={(e) => {
                  let newArr = [...(Array.isArray(answers[`t${taskKey.replace('task', '')}q${q.id}`]) ? answers[`t${taskKey.replace('task', '')}q${q.id}`] : [])];
                  if (e.target.checked) newArr.push(opt.value); else newArr = newArr.filter((v: any) => v !== opt.value);
                  setAnswers({ ...answers, [`t${taskKey.replace('task', '')}q${q.id}`]: newArr });
                }} className="mt-0.5" />
                <label>{opt.text}</label>
              </div>
            );
          })}
          {q.type === 'text' && (
            <textarea required={isStudent} className="w-full border border-gray-300 p-2 min-h-[80px] resize-y"
              value={answers[`t${taskKey.replace('task', '')}q${q.id}`] || ''}
              onChange={(e) => setAnswers({ ...answers, [`t${taskKey.replace('task', '')}q${q.id}`]: e.target.value })}
              placeholder="(No response)" />
          )}
          {q.type === 'multipart_radio' && (q.id === 3 || q.id === 5) && (
            <table className="w-full border-collapse text-[9.5pt]">
              <thead>
                <tr>
                  <th className="border-b-[1.5px] border-r-[1.5px] border-black p-2 text-left font-bold last:border-r-0">{q.id === 3 ? 'Coaxial cabling' : 'Transmission Type'}</th>
                  <th className="border-b-[1.5px] border-r-[1.5px] border-black p-2 text-left font-bold last:border-r-0">{q.id === 3 ? 'Definition, choose the best definition' : ''}</th>
                </tr>
              </thead>
              <tbody>
                {q.parts?.map((part: any, pIdx: number) => {
                  let leftCol = part.text;
                  let rightColText = '';
                  
                  if (q.id === 3) {
                    leftCol = part.text;
                  } else if (q.id === 5) {
                    if (pIdx === 0) {
                      leftCol = "Aerial PSTN telephone LINE";
                      rightColText = "sends information in the form of an analogue and digital signal.";
                    } else {
                      leftCol = "Aeral HFC broad band cable";
                      rightColText = "Broadband sends data is as digital signals through the media as a signal channel that uses the entire band of the media.";
                    }
                  }

                  return (
                    <tr key={pIdx}>
                      <td className="border-b-[1.5px] border-r-[1.5px] border-black p-2 align-top font-bold w-[35%]">{leftCol}</td>
                      <td className="border-b-[1.5px] border-black p-2 align-top">
                        {rightColText && (
                          <div className="flex gap-2 mb-2 items-start">
                            <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1.5px solid #000', marginTop: '2px' }}></span>
                            <span>{rightColText}</span>
                          </div>
                        )}
                        {part.options?.map((opt: any, oIdx: number) => (
                          <div key={oIdx} className="flex gap-2 mb-1 items-center">
                            {q.id === 5 ? (
                              <input required={isStudent} type="checkbox" className="mt-0.5 w-[14px] h-[14px] border-[1.5px] border-black" checked={answers[part.name] === opt.value} onChange={() => setAnswers({ ...answers, [part.name]: answers[part.name] === opt.value ? '' : opt.value })} />
                            ) : (
                              <input required={isStudent} type="radio" className="mt-0.5" checked={answers[part.name] === opt.value} onChange={() => setAnswers({ ...answers, [part.name]: opt.value })} />
                            )}
                            <label className={q.id === 5 ? 'font-bold' : ''}>{opt.text}</label>
                          </div>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {q.type === 'multipart_radio' && q.id !== 3 && q.id !== 5 && (
            <div className="p-3 pl-4 text-[10pt]">
              {q.parts?.map((part: any, pIdx: number) => {
                // For Q7, part 0 is just text in the image. We don't render True/False options.
                if (q.id === 7 && pIdx === 0) {
                  return <div key={pIdx} className="mb-4">{part.text}</div>;
                }
                // For Q7, part 1 contains the checkboxes.
                if (q.id === 7 && pIdx === 1) {
                  return (
                    <div key={pIdx}>
                      <div className="mb-2">What can the soffit be used when installing coaxial cable? Choose 1 option:</div>
                      {part.options?.map((opt: any, oIdx: number) => (
                        <div key={oIdx} className="flex gap-2 mb-1 items-center">
                          <input required={isStudent} type="checkbox" className="mt-0.5 w-[14px] h-[14px] border-[1.5px] border-black" checked={answers[part.name] === opt.value} onChange={() => setAnswers({ ...answers, [part.name]: answers[part.name] === opt.value ? '' : opt.value })} />
                          <label>{opt.text}</label>
                        </div>
                      ))}
                    </div>
                  );
                }
                // Fallback
                return (
                  <div key={pIdx} className="mb-3">
                    <div className="font-bold mb-1 whitespace-pre-wrap">{part.text}</div>
                    {part.options?.map((opt: any, oIdx: number) => (
                      <div key={oIdx} className="flex gap-2 mb-1">
                        <input required={isStudent} type="radio" checked={answers[part.name] === opt.value} onChange={() => setAnswers({ ...answers, [part.name]: opt.value })} />
                        <label>{opt.text}</label>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] mt-auto">
        <div className="w-[40%] p-1 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex items-center">Assessor to tick (☑)</div>
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

  const renderPerfRows = (taskKey: string, items: string[], start: number, end: number) =>
    items.slice(start, end).map((item, i) => {
      const idx = start + i;
      return (
        <tr key={`perf-${idx}`}>
          <td className="border-[1.5px] border-black px-3 py-2 text-[9pt]">{item}</td>
          <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'yes' })}>
            {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
          <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'no' })}>
            {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
          </td>
        </tr>
      );
    });

  const q7Styles = `
      .q7-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q7-booklet-view * { box-sizing: border-box; }
      .q7-booklet-view .page {
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
      .q7-booklet-view h1.section-title {
        font-size: 13.5pt; font-weight: bold; text-align: center; margin: 5mm 0 4mm;
        text-transform: uppercase; letter-spacing: .3px;
        background: transparent !important; color: #000 !important; padding: 0 !important;
      }
      .q7-booklet-view p { margin-top: 0; margin-bottom: 8px; line-height: 1.45; }
      .q7-booklet-view h2.sub-title { font-size: 11pt; font-weight: bold; text-align: center; margin: 2mm 0; }
      .q7-booklet-view .intro-box { background: #f5f5f5; border: 1px solid #999; padding: 4px 8px; margin-bottom: 5px; font-size: 9pt; }
      .q7-booklet-view table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5pt; }
      .q7-booklet-view table td, .q7-booklet-view table th { border: 1px solid #555; padding: 3px 6px; vertical-align: top; }
      .q7-booklet-view table th { background: #e8e8e8; font-weight: bold; }
      .q7-booklet-view .field-label-cell { font-weight: bold; background: #f0f0f0; width: 38%; border: 1px solid #555; padding: 5px 6px; }
      .q7-booklet-view .field-value-cell { border: 1px solid #555; padding: 5px 6px; min-height: 22px; }
      .q7-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q7-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q7-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q7-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q7-booklet-view .page-footer {
        margin-top: auto; padding-top: 4mm; border-top: 1px solid #000;
        display: flex; justify-content: space-between; font-size: 8pt;
      }
      .q7-booklet-view .inner-header { margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
      .q7-booklet-view .inner-header .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
      .q7-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q7-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      @media print {
        .q7-booklet-view { background: #fff !important; padding: 0 !important; }
        .q7-booklet-view .page { margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important; }
      }
  `;

  const admin = assessmentQuestions.adminInfo as any;
  const task1 = assessmentQuestions.task1 as any;
  const task2 = assessmentQuestions.task2 as any;
  const task3 = assessmentQuestions.task3 as any;
  const task4 = assessmentQuestions.task4 as any;
  const qs = task1.questions as any[];

  return (
    <div className="q7-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q7Styles }} />

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
      <div className="page" style={{ padding: '10mm' }}>
        <div style={{ border: '1px solid #8daac9', padding: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '3px double #8daac9', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: '160px', height: 'auto', objectFit: 'contain', marginTop: '10mm' }} />
            <div style={{ color: '#8b0000', fontSize: '11pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', marginTop: '2mm', marginBottom: '10mm' }}>RTO NO: 40954</div>
            
            <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '3mm', letterSpacing: '0.5px' }}>Assessment Booklet</div>
            
            <div style={{ background: '#8daac9', height: '10px', width: '90%', marginBottom: '8mm' }}></div>
            
            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'center', marginBottom: '2mm' }}>
              {assessmentQuestions.metadata.code}
            </div>
            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', textAlign: 'center', lineHeight: 1.3 }}>
              {assessmentQuestions.metadata.course}
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
        
        <h1 className="section-title" style={{ textAlign: 'center', textTransform: 'uppercase', fontFamily: '"Times New Roman", Times, serif', fontSize: '13pt', margin: '0 0 4px 0', fontWeight: 'bold' }}>ASSESSMENT COMPETENCY RECORD</h1>
        <div style={{ background: '#d9d9d9', border: '1px solid #000', padding: '6px 8px', marginBottom: '8px', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'justify' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '4px 6px', fontWeight: 'bold', width: '30%' }}>Student's Name</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>{studentName}</td></tr>
            <tr><td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '4px 6px', fontWeight: 'bold' }}>Assessor's Name</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <input type="text" className="w-full bg-transparent border-none outline-none no-print" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} readOnly={isStudent} />
              <span className="hidden print:inline">{compRecord.assessor_name}</span>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '4px 6px', fontWeight: 'bold' }}>Assessment Site</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <input type="text" className="w-full bg-transparent border-none outline-none no-print" value={compRecord.assessment_site || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_site: e.target.value })} readOnly={isStudent} />
              <span className="hidden print:inline">{compRecord.assessment_site}</span>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', background: '#d9d9d9', padding: '4px 6px', fontWeight: 'bold' }}>Assessment Date/s</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <input type="text" className="w-full bg-transparent border-none outline-none no-print" placeholder="mm/dd/yyyy" value={compRecord.assessment_dates_multi || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_dates_multi: e.target.value })} readOnly={isStudent} />
              <span className="hidden print:inline">{compRecord.assessment_dates_multi}</span>
            </td></tr>
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
                <td rowSpan={5} style={{ border: '1px solid #000', borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '4px 6px', textAlign: 'center', verticalAlign: 'middle', width: '28%', background: '#d9d9d9' }}>
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
                    S {compRecord.task1_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task1_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
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
                    S {compRecord.task2_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task2_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', borderLeft: 'none', padding: '4px 6px', fontWeight: 'bold' }}>Assessment Task 3</td>
                <td style={{ border: '1px solid #000', padding: '4px 6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, doc_task3: !compRecord.doc_task3 })}>
                  <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', position: 'relative' }}>
                    {compRecord.doc_task3 && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span> Observation
                </td>
                <td style={{ border: '1px solid #000', borderBottom: 'none', padding: '4px 6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}>
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'S' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    S {compRecord.task3_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task3_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', borderLeft: 'none', borderBottom: 'none', padding: '4px 6px', fontWeight: 'bold' }}>Assessment Task 4</td>
                <td style={{ border: '1px solid #000', borderBottom: 'none', padding: '4px 6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, doc_task4: !compRecord.doc_task4 })}>
                  <span style={{ border: '1px solid #000', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', position: 'relative' }}>
                    {compRecord.doc_task4 && <span style={{ color: 'red', position: 'absolute', top: '-6px', left: '-1px', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                  </span> Report
                </td>
                <td style={{ border: '1px solid #000', borderBottom: 'none', padding: '4px 6px', textAlign: 'center', cursor: isStudent ? 'default' : 'pointer' }}>
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result: 'S' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    S {compRecord.task4_result === 'S' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
                  </span>
                  {' '}/{' '}
                  <span onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result: 'NS' })} style={{ position: 'relative', display: 'inline-block', padding: '2px' }}>
                    NS {compRecord.task4_result === 'NS' && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '140%', height: '140%', pointerEvents: 'none' }}></span>}
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
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', height: '35px', fontWeight: 'bold' }}>1</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="date" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print" value={compRecord.attempts?.[0]?.date || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[0]) att[0] = { date: '', feedback: '' }; att[0].date = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} readOnly={isStudent} />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[0]?.date)}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="text" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5" value={compRecord.attempts?.[0]?.feedback || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[0]) att[0] = { date: '', feedback: '' }; att[0].feedback = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} placeholder="Provide attempt 1 feedback" readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', height: '35px', fontWeight: 'bold' }}>2</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="date" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print" value={compRecord.attempts?.[1]?.date || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[1]) att[1] = { date: '', feedback: '' }; att[1].date = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} readOnly={isStudent} />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[1]?.date)}</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <input type="text" className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5" value={compRecord.attempts?.[1]?.feedback || ''} onChange={(e) => { if (!isStudent) { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[1]) att[1] = { date: '', feedback: '' }; att[1].feedback = e.target.value; setCompRecord({ ...compRecord, attempts: att }); } }} placeholder="Provide attempt 2 feedback" readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', height: '35px', fontWeight: 'bold' }}>3</td>
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
                  <span className="no-print" style={{ borderBottom: '1px solid #000', flex: 1, minHeight: '20px', marginLeft: '4px' }}>
                    <input type="text" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0 }}
                      value={compRecord.assessor_name || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessor_name: e.target.value }) }} readOnly={isStudent} />
                  </span>
                  <span className="hidden print:block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', marginLeft: '4px' }}>
                    {compRecord.assessor_name || ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <span>Date: </span>
                  <span className="no-print" style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: isStudent ? 'default' : 'pointer' }}
                      value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value, admin_date: e.target.value }) }} readOnly={isStudent} />
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
                  <div className="no-print" style={{ borderBottom: '1px solid #000', width: '120px', minHeight: '30px', marginLeft: '4px', textAlign: 'center', display: 'inline-block' }}>
                    <input type="date" style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: 0, cursor: 'pointer' }}
                      value={answers.student_date || submitDate?.split('T')[0] || ''} onChange={(e) => { setAnswers({ ...answers, student_date: e.target.value }) }} />
                  </div>
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
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Administrative Use Only:</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 6px', width: '25%', fontWeight: 'bold' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #000', padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', position: 'relative', cursor: 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })}>
                    {compRecord.admin_entered && <span style={{ position: 'absolute', top: '-5px', left: '1px', color: 'red', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <span>Signature/Initial <div className="inline-block relative cursor-pointer" style={{ borderBottom: '1px solid #000', width: '60px', marginLeft: '4px', minHeight: '24px' }} onClick={() => openSigModal('assessor_signature', 'comp')}>{compRecord.assessor_signature ? <img src={compRecord.assessor_signature} style={{ maxHeight: '24px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} /> : (compRecord.admin_signature && <img src={compRecord.admin_signature} style={{ maxHeight: '24px', position: 'absolute', bottom: '0' }} />)}</div></span>
                  <span style={{ marginLeft: 'auto' }}>Date: <input type="date" style={{ borderBottom: '1px solid #000', width: '100px', outline: 'none', background: 'transparent', cursor: isStudent ? 'default' : 'pointer' }} value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, admin_date: e.target.value, assessment_date: e.target.value }) }} readOnly={isStudent} /></span>
                </div>
              </td>
            </tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>{admin.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>{admin.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>{admin.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Unit Summary</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <p className="mb-2">This unit describes the skills and knowledge required to install aerial cable in domestic, commercial or industrial communications applications that include digital and analog, telephony, data, video, digital broadcasting, computer networks, local area networks (LANs), wide area networks (WANs), master antenna television (MATV), cable television (CATV), closed-circuit television (CCTV), long-term evolution (LTE) and multimedia.</p>
              <p>It applies to technical staff installing aerial cable for customer and carrier networks. Installations are completed outdoors on customer premises using basic rigging procedures, methods and equipment for working safely at heights.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Target Group</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              Licensing, legislative, regulatory and certification requirements apply to telecommunications systems. Work functions in the occupational areas where this unit may be used are subject to regulatory requirements. All customer cabling work in the telecommunications, fire, security and data industries must be performed by a registered cabler. All cablers are required to register with an Australian Communications and Media Authority (ACMA) accredited registrar. Refer to the ICT Information and Communications Technology Training Package Companion Volume Implementation Guide or the relevant regulator for specific guidance on requirements.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Conditions and<br/>Context of the<br/>Assessments</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <p className="mb-2">Skills must be assessed in a workplace or simulated environment where conditions are typical of those in a telecommunications work environment or workplace.</p>
              <p className="mb-1">Access is required to:</p>
              <ul className="list-disc pl-8 mb-2">
                <li>site/s where aerial cable installation can be conducted</li>
                <li>aerial installation equipment currently used in industry</li>
                <li>aerial cables including:
                  <ul style={{ listStyleType: 'circle', paddingLeft: '20px' }}>
                    <li>integral bearer</li>
                    <li>self-supporting</li>
                    <li>stranded support (catenary)</li>
                  </ul>
                </li>
                <li>relevant regulatory and equipment documentation that impacts on aerial cable installation activities.</li>
              </ul>
              <p>Assessors of this unit must satisfy the requirements for assessors in applicable vocational education and training legislation, frameworks and/or standards. Refer also to the <span className="italic">Requirements for assessors</span> in the ICT Information and Communications Technology Training Package Companion Volume Implementation Guide.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Specific Resources Required</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <ul className="list-disc pl-8 font-bold">
                <li>Learner Guide</li>
                <li>Assessment Booklet</li>
                <li>Practical Workshop</li>
                <li>Manufacturers Manuals and specifications</li>
                <li>Workplace policy and procedures</li>
              </ul>
            </td></tr>
          </tbody>
        </table>
        <PageFooter n={3} />
      </div>

      {/* ═══════════════════ PAGE 4 – ADMIN CONTINUED ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', width: '25%', verticalAlign: 'top' }}>Re-assessment</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <p className="mb-2">Students who are unsuccessful at achieving competency at the first attempt will be offered coaching, information and additional time (other needs if required) before a second and possibly a third attempt is made. If the student is not able to satisfactorily complete the assessment after the third attempt the student will be deemed Not Competent and resulted as such. The student may re-enrol in the qualification at a later to date to gain successful completion of the unit/s.</p>
              <p>For further details refer to ACTA College Assessment Policy and Procedure.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Plagiarism</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              ACTA College considers plagiarism and cheating as serious student misconduct and this may result either in a student’s exclusion from a unit or course or may have to complete a re-assessment depending on individual case.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Complaints and<br/>Appeal</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              Where a student wishes to appeal an assessment decision they are required to notify their assessor in the first instance. Where appropriate the assessor may decide to re-assess the student to ensure a fair and equitable decision is gained. The assessor shall complete a written report regarding the re-assessment outlining the reasons why assessment was or was not granted.
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessors<br/>Intervention</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <p className="mb-2">Assessors are to check that the student is ready for assessment, and defer the assessment if they are not. It is important that assessors do not teach at the assessment but allow students to competence for themselves.</p>
              <p className="mb-2">Feedback is to be given at the completion of the assessment using the feedback to student. If a student does not meet a standard, the assessor is to sit down with them and assist them in their understanding. Should you disagree with the assessment outcome, you can appeal the decision as stated in the Student Handbook.</p>
              <p>Your student record must indicate that you have all required skills and knowledge in completing the task. For each assessment, the assessor is to act as a supervisor and not interfere with the assessment. In the event that the assessment activities will impact on your safety or that of others, the assessment must be stopped immediately.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Attaching<br/>Documents</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <p className="mb-2">Attached documents are accepted but must be labelled with the following information:</p>
              <p>Unit Name and Title, Students name, Student ID, Date of Submissions, Student signature.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment<br/>Instruction</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <p className="mb-2">Assessment is mapped to the unit and must be completed by the end of each unit. This is a summative assessment, which requires each student to have adequate practice prior to undertaking this assessment</p>
              <p className="mb-1">The assessment consists of 4 tasks:</p>
              <p className="mb-0">Assessment Task 1 is Written questions and answers</p>
              <p className="mb-0">Assessment Task 2 is Observation</p>
              <p className="mb-0">Assessment Task 3 is Observation</p>
              <p className="mb-2">Assessment Task 4 is Report</p>
              <p className="mb-1">For answers to written questions, reports and projects, you must:</p>
              <ul className="list-disc pl-5 mb-2">
                <li>Print clearly in black or blue pen or type it as a word document</li>
                <li>Answer each of the key points and /or follow instructions</li>
                <li>Assessments written in pencil or are illegible will not be accepted.</li>
              </ul>
              <p>Ask your assessor if you do not understand any part of the assessment. Whist your assessor cannot tell you the answer, he/she may be able to re-word a question or instruction to assist in a better understanding for you.</p>
            </td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 1:</td><td style={{ border: '1px solid #000', padding: '4px 6px' }}>
              This is a questions and answers assessment over time. The assessor must provide students with sufficient information to complete this assessment over the duration of the full day training session. At the beginning of each review session the students should be given a few minutes to familiarize yourself with the questions. Students should be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor. The assessor must follow the session plan aligning on which day to conduct the practical observation.
            </td></tr>
          </tbody>
        </table>
        <PageFooter n={4} />
      </div>

      {/* ═══════════════════ PAGE 5 – ADMIN CONTINUED ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt', marginBottom: '16px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', width: '25%', verticalAlign: 'top' }}>Assessment Task 2:</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.task2Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 3:</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.task3Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 4:</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.task4Description}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency Decision</td><td style={{ border: '1px solid #000', padding: '4px 6px', whiteSpace: 'pre-wrap' }}>{admin.competencyDecision}</td></tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", Times, serif', fontSize: '9.5pt' }}>
          <thead>
            <tr style={{ background: '#b0b0b0' }}>
              <th colSpan={3} style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left' }}>Reasonable Adjustment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '8px', lineHeight: '1.4' }}>
                To meet the needs of all learners’ adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.<br /><br />
                ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.
              </td>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '4px 6px', width: '35%', textAlign: 'center' }}>Reasonable Adjustment Provided</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', width: '35%', textAlign: 'center' }}>Reason for Reasonable Adjustment</th>
              <th style={{ border: '1px solid #000', padding: '4px 6px', width: '30%', textAlign: 'center' }}>Outcome</th>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
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
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="w-full h-full min-h-[140px] bg-transparent border-none outline-none resize-none text-slate-800 p-2" value={compRecord.ra_reason || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_reason: e.target.value })} readOnly={isStudent} />
              </td>
              <td style={{ border: '1px solid #000', padding: '0', verticalAlign: 'top' }}>
                <textarea className="w-full h-full min-h-[140px] bg-transparent border-none outline-none resize-none text-slate-800 p-2" value={compRecord.ra_outcome || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, ra_outcome: e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#8daac9', padding: '6px 8px', marginTop: '20px', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold' }}>COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</h2>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold' }}>A cover sheet must be included with each submission of work.</p>
        <p style={{ margin: '0 0 12px 0', fontSize: '9.5pt', fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold' }}>Work submitted without a signed cover sheet will be returned unmarked.</p>
        
        <div style={{ marginTop: 'auto' }}>
          <PageFooter n={5} />
        </div>
      </div>

{/* ═══════════════════ PAGE 6 – TASK 1: student instructions + Q1-2 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <h1 className="section-title">{task1.title}</h1>
        {task1.sections?.map((s: any, i: number) => (
          <div key={i} className="mb-3">
            {s.title && <h3 className="font-bold mb-1 text-[11pt]">{s.title}</h3>}
            {s.content.includes('•') ? (
              <ul className="list-disc pl-8 text-[9pt] leading-[1.4]">
                {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => (
                  <li key={j} className="mb-1">{line.replace('•', '').trim()}</li>
                ))}
              </ul>
            ) : (
              <p className="whitespace-pre-wrap text-[9pt] leading-[1.4]">{s.content}</p>
            )}
          </div>
        ))}
        <div className="mt-3">
          <div className="bg-[#5b9bd5] text-white font-bold p-2 border-[1.5px] border-black text-[11pt]">Questions</div>
          {qs.slice(0, 2).map((q: any, i: number) => renderQ(q, 'task1', false))}
        </div>
        <PageFooter n={6} />
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1: Q3-6 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div className="mt-2">{qs.slice(2, 6).map((q: any, i: number) => renderQ(q, 'task1', i === 0))}</div>
        <PageFooter n={7} />
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1: Q7-11 ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div className="mt-2">{qs.slice(6, 11).map((q: any, i: number) => renderQ(q, 'task1', i === 0))}</div>
        <PageFooter n={8} />
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 1: Q12 + declarations ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <div className="mt-2 mb-4">{qs.slice(11).map((q: any, i: number) => renderQ(q, 'task1', i === 0))}</div>
        {renderDeclarations('task1')}
        <PageFooter n={9} />
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 2: observation sections ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <h1 className="section-title" style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: '10px', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif' }}>
          {task2.observationTitle || 'ASSESSMENT TASK 2 \u2013 OBSERVATION'}
        </h1>
        {task2.observationSubtitle && (
          <h2 className="sub-title" style={{ whiteSpace: 'pre-wrap', marginBottom: '16px', fontSize: '12pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif' }}>
            {task2.observationSubtitle}
          </h2>
        )}
        
        <div style={{ fontSize: '10.5pt', marginBottom: '24px', lineHeight: '1.5' }}>
          {task2.sections?.slice(0, 2).map((s: any, i: number) => {
            const isBulletList = s.title === 'Required Documents and Equipment' || s.content.includes('•');
            const showTitle = s.title !== 'Task Description';
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                {showTitle && s.title && <h3 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '12px' }}>{s.title}</h3>}
                {isBulletList ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '32px', textAlign: 'justify' }}>
                    {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => (
                      <li key={j} style={{ marginBottom: '4px' }}>{line.replace('•', '').trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ textAlign: 'justify' }}>
                    {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => (
                      <div key={j} style={{ marginBottom: '14px' }}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <PageFooter n={10} />
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2: assessor checklist + oral questions + performance[0-2] ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <h1 className="section-title" style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: '10px', marginBottom: '16px', fontFamily: '"Times New Roman", Times, serif' }}>
          {task2.checklistTitle || 'ASSESSMENT TASK 2 \u2013 ASSESSOR CHECKLIST'}
        </h1>
        
        <div style={{ fontSize: '10.5pt', marginBottom: '24px', lineHeight: '1.4' }}>
          <p style={{ fontStyle: 'italic', marginBottom: '16px', color: '#000', textAlign: 'justify' }}>
            This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
          </p>
          <p style={{ marginBottom: '24px', color: '#000', textAlign: 'justify' }}>
            The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
          </p>
          <h3 style={{ fontWeight: 'bold', fontSize: '11pt', marginBottom: '12px' }}>Assessor Instructions:</h3>
          <p style={{ color: '#000', textAlign: 'justify' }}>
            The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
          </p>
        </div>
        
        <h3 style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px' }}>Oral Assessment:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '24px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'top' }}>
                Oral Assessment Questions
                <div style={{ marginTop: '20px' }}>Note any additional questions</div>
              </th>
              <th colSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'top' }}>
                Satisfactory
              </th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderChkRows('task2', task2.checklistItems, 0, task2.checklistItems.length)}
          </tbody>
        </table>

        <h3 style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px' }}>Record of Performance:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: 'white', padding: '8px 12px' }}></th>
              <th colSpan={2} style={{ border: '1.5px solid black', background: 'white', textAlign: 'left', padding: '8px 12px', fontWeight: 'normal', fontSize: '10pt' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: 'white', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '13pt' }}>Did the Candidate:</th>
              <th style={{ border: '1.5px solid black', background: 'white', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '12pt' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: 'white', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '12pt' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderPerfRows('task2', task2.performance, 0, 3)}
          </tbody>
        </table>
        <PageFooter n={11} />
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2: performance[3-end] + declarations ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[10pt] mb-4 mt-2 table-fixed">
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <tbody>{renderPerfRows('task2', task2.performance, 3, task2.performance.length)}</tbody>
        </table>
        {renderDeclarations('task2')}
        <PageFooter n={12} />
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 3: observation sections + checklist intro + oral + performance[0-1] ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <h1 className="section-title" style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: '10px', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif' }}>
          {task3.observationTitle || 'ASSESSMENT TASK 3 \u2013 OBSERVATION'}
        </h1>
        {task3.observationSubtitle && (
          <h2 className="sub-title" style={{ whiteSpace: 'pre-wrap', marginBottom: '16px', fontSize: '12pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif' }}>
            {task3.observationSubtitle}
          </h2>
        )}
        
        <div style={{ fontSize: '10.5pt', marginBottom: '24px', lineHeight: '1.5' }}>
          {task3.sections?.slice(0, 2).map((s: any, i: number) => {
            const isBulletList = s.title === 'Required Documents and Equipment' || s.content.includes('•');
            const showTitle = s.title !== 'Task Description';
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                {showTitle && s.title && <h3 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '12px' }}>{s.title}</h3>}
                {isBulletList ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '32px', textAlign: 'justify' }}>
                    {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => (
                      <li key={j} style={{ marginBottom: '4px' }}>{line.replace('•', '').trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ textAlign: 'justify' }}>
                    {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => (
                      <div key={j} style={{ marginBottom: '14px' }}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <h1 className="section-title" style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '16px', marginTop: '32px', fontFamily: '"Times New Roman", Times, serif' }}>
          {task3.checklistTitle || 'ASSESSMENT TASK 3 \u2013 ASSESSOR CHECKLIST'}
        </h1>
        
        <h3 style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px' }}>Oral Assessment:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '24px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'top' }}>
                Oral assessment questions
                <div style={{ marginTop: '20px' }}>Note any additional questions</div>
              </th>
              <th colSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'top' }}>
                Satisfactory
              </th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderChkRows('task3', task3.checklistItems, 0, task3.checklistItems.length)}
          </tbody>
        </table>

        <h3 style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px' }}>Record of Performance:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', padding: '8px 12px' }}></th>
              <th colSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>Satisfactory</th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '11pt' }}>Did the candidate:</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '11pt' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '11pt' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderPerfRows('task3', task3.performance, 0, 2)}
          </tbody>
        </table>
        <PageFooter n={13} />
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 3: performance[2-end] + declarations ═══════════════════ */}
      <div className="page">
        <InnerHeader />
        <table className="w-full border-collapse border-[1.5px] border-black text-[10pt] mb-4 mt-2 table-fixed">
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <tbody>{renderPerfRows('task3', task3.performance, 2, task3.performance.length)}</tbody>
        </table>
        {renderDeclarations('task3')}
        <PageFooter n={14} />
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 4: observation sections + oral questions ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <h1 className="section-title" style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: '10px', marginBottom: '8px', fontFamily: '"Times New Roman", Times, serif' }}>
          {task4.observationTitle || 'ASSESSMENT TASK 4- REPORT'}
        </h1>
        {task4.observationSubtitle && (
          <h2 className="sub-title" style={{ whiteSpace: 'pre-wrap', marginBottom: '16px', fontSize: '12pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif' }}>
            {task4.observationSubtitle}
          </h2>
        )}
        
        <div style={{ fontSize: '10.5pt', marginBottom: '24px', lineHeight: '1.5' }}>
          {task4.sections?.slice(0, 2).map((s: any, i: number) => {
            const isBulletList = s.title === 'Required Documents and Equipment' || s.content.includes('•');
            const showTitle = s.title !== 'Task Description';
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                {showTitle && s.title && <h3 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '12px' }}>{s.title}</h3>}
                {isBulletList ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '32px', textAlign: 'justify' }}>
                    {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => (
                      <li key={j} style={{ marginBottom: '4px' }}>{line.replace('•', '').trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ textAlign: 'justify' }}>
                    {s.content.split('\n').filter((line: string) => line.trim()).map((line: string, j: number) => {
                      if (j === 0 && s.title === 'Task Description') {
                        return <div key={j} style={{ marginBottom: '14px', fontWeight: 'bold' }}>{line}</div>;
                      }
                      return <div key={j} style={{ marginBottom: '14px' }}>{line}</div>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <h1 className="section-title" style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '16px', marginTop: '32px', fontFamily: '"Times New Roman", Times, serif' }}>
          {task4.checklistTitle || 'ASSESSMENT TASK 4 \u2013 ASSESSOR CHECKLIST'}
        </h1>
        
        <h3 style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px' }}>Oral Assessment:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', marginBottom: '24px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'top' }}>
                Oral assessment questions
                <div style={{ marginTop: '20px' }}>Note any additional questions</div>
              </th>
              <th colSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'top' }}>
                Satisfactory
              </th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderChkRows('task4', task4.checklistItems, 0, task4.checklistItems.length)}
          </tbody>
        </table>
        <PageFooter n={15} />
      </div>

      {/* ═══════════════════ PAGE 16 – TASK 4: performance[0-end] + declarations ═══════════════════ */}
      <div className="page" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <InnerHeader />
        
        <h3 style={{ fontWeight: 'bold', fontSize: '13pt', marginBottom: '8px', marginTop: '16px' }}>Record of Performance:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid black', tableLayout: 'fixed', marginBottom: '32px' }}>
          <colgroup>
            <col style={{ width: '76%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th rowSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>
                Did The Candidate:
              </th>
              <th colSpan={2} style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>
                Satisfactory
              </th>
            </tr>
            <tr>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>Yes</th>
              <th style={{ border: '1.5px solid black', background: '#a6a6a6', textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', fontSize: '10pt' }}>No</th>
            </tr>
          </thead>
          <tbody>
            {renderPerfRows('task4', task4.performance, 0, task4.performance.length)}
          </tbody>
        </table>
        
        {renderDeclarations('task4')}
        <PageFooter n={16} />
      </div>

    </div>
  );
};
