import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw, FileText, Wrench, Clock, Info } from 'lucide-react';
import { assessmentQuestions } from '../data/questions15';

interface Q15BookletProps {
  answers: any;
  setAnswers: (val: any) => void;
  onSubmit: (e?: React.FormEvent) => void | Promise<void>;
  submitting: boolean;
  studentName?: string;
  submitDate?: string;
  isStudent?: boolean;
  compRecord?: any;
  setCompRecord?: (val: any) => void;
  grades?: any;
  setGrades?: (val: any) => void;
}

export const Q15Booklet: React.FC<Q15BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord, grades = {}, setGrades = () => { } }) => {
  // Local variables for student view where compRecord isn't passed
  const [localCompRecord, setLocalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });

  const compRecord = externalCompRecord || localCompRecord;
  const setCompRecord = externalSetCompRecord || setLocalCompRecord;

  const renderSectionIcon = (title: string) => {
    if (!title) return null;
    const t = title.toLowerCase();
    if (t.includes('assessment task description')) return <FileText className="inline-block mr-2 text-blue-800" size={18} />;
    if (t.includes('resources required')) return <Wrench className="inline-block mr-2 text-blue-800" size={18} />;
    if (t.includes('timing')) return <Clock className="inline-block mr-2 text-blue-800" size={18} />;
    if (t.includes('assessment instructions')) return <Info className="inline-block mr-2 text-blue-800" size={18} />;
    return null;
  };

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
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
  };

  const clearSig = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
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
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        pad.off();
      };
    }
  }, [sigModal?.open]);

  const formatDisplayDate = (d: string) => d || '';

  const q15Styles = `
      .q15-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q15-booklet-view * {
        box-sizing: border-box;
      }
      .q15-booklet-view .page {
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
      .q15-booklet-view h1.section-title {
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
      .q15-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q15-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q15-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q15-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q15-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q15-booklet-view table td, .q15-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q15-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q15-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q15-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q15-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q15-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q15-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q15-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q15-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a;
      }
      .q15-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q15-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q15-booklet-view .page-footer {
        margin-top: auto;
        padding-top: 4mm;
        border-top: 1px solid #000;
        display: flex;
        justify-content: space-between;
        font-size: 8pt;
      }
      .q15-booklet-view .inner-header {
        margin-bottom: 4mm;
        border-bottom: 2px solid #000;
        padding-bottom: 2mm;
      }
      .q15-booklet-view .inner-header .top-row {
        display: flex; justify-content: space-between; align-items: flex-start;
      }
      .q15-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q15-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q15-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q15-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q15-booklet-view .question-block {
        margin-bottom: 8mm;
      }
      .q15-booklet-view .question-text {
        font-weight: bold;
        margin-bottom: 3mm;
      }
      @media print {
        .q15-booklet-view { background: #fff !important; padding: 0 !important; }
        .q15-booklet-view .page {
          margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important;
        }
      }
  `;

  return (
    <div className="q15-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q15Styles }} />
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
                <canvas
                  ref={sigModalCanvasRef}
                  className="w-full h-full cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={clearSig}
                  className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors text-sm"
                >
                  <RotateCcw size={18} /> CLEAR
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm"
                >
                  <CheckCircle2 size={18} /> SAVE SIGNATURE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ PAGE 1 – COVER ═══════════════════ */}
      <div className="page" style={{ padding: '8mm 10mm' }}>
        <div style={{ border: '3.5px solid #1a5fa8', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }} />
            <div style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
            <div style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px', textAlign: 'center' }}>
              {assessmentQuestions.metadata.code}
            </div>
            <div style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm', textAlign: 'center' }}>
              {assessmentQuestions.metadata.subtitle}
            </div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '110mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>{assessmentQuestions.metadata.rtoName}</div>
            </div>
          </div>
        </div>
      </div>




      {/* DYNAMIC TASKS */}
      {Object.keys(assessmentQuestions)
        .filter(key => key.startsWith('task'))
        .sort((a, b) => {
          const parseKey = (k: string) => {
            if (k === 'taskPA5') return 5.5;
            return parseInt(k.replace('task', '')) || 0;
          };
          return parseKey(a) - parseKey(b);
        })
        .map((taskKey, idx) => {
          const taskData = assessmentQuestions[taskKey as keyof typeof assessmentQuestions] as any;

          const allSections = [...(taskData.assessorSections || []).map((s: any) => ({ ...s, isAssessorOnly: true })), ...(taskData.sections || [])];

          const pages: any[][] = [[]];
          allSections.forEach((section: any, sIdx: number) => {
            const isFirstStudentSection = !section.isAssessorOnly && sIdx > 0 && allSections[sIdx - 1].isAssessorOnly;
            if (section.pageBreak || isFirstStudentSection) {
              if (pages[pages.length - 1].length > 0) {
                pages.push([]);
              }
            }
            pages[pages.length - 1].push(section);
          });

          if (pages[pages.length - 1].length === 0 && pages.length > 1) {
            pages.pop();
          }

          if (pages.length === 0) pages.push([]);

          return pages.map((pageSections, pageIdx) => (
            <div key={`${taskKey}-page-${pageIdx}`} className="page">
              <div className="inner-header">
                <div className="top-row">
                  <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">{assessmentQuestions.adminInfo.unitCodeName}</span></div>
                  <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                </div>
              </div>

              {pageIdx === 0 && (
                <h1 className="section-title text-center text-blue-900 font-bold my-4">
                  {taskData.title || taskData.observationTitle}
                  {taskData.observationSubtitle && <div className="text-lg mt-1">{taskData.observationSubtitle}</div>}
                </h1>
              )}

              {pageSections.map((section: any, sIdx: number) => {
                if (section.type === 'text') {
                  return (
                    <div key={sIdx} className="mb-4">
                      {section.title && <h3 className="font-bold mb-2 flex items-center">{renderSectionIcon(section.title)}{section.title}</h3>}
                      <p className="whitespace-pre-wrap">{section.content}</p>
                    </div>
                  );
                } else if (section.type === 'image') {
                  return (
                    <div key={sIdx} className="mb-6 flex flex-col items-center">
                      {section.title && <h3 className="font-bold mb-2 w-full text-left flex items-center">{renderSectionIcon(section.title)}{section.title}</h3>}
                      <img src={section.src} alt={section.caption || "Assessment Diagram"} className="max-w-full max-h-[400px] object-contain border border-gray-300" />
                      {section.caption && <div className="text-center italic text-sm mt-2 text-gray-600">{section.caption}</div>}
                    </div>
                  );
                } else if (section.type === 'table') {
                  return (
                    <div key={sIdx} className="mb-4 break-inside-avoid">
                      {section.title && section.title.includes("Checklist") ? (
                        <h1 className="text-[14pt] font-bold bg-[#c0cddf] py-2 px-3 rounded-sm border border-black text-left mb-4 mt-2">
                          {section.title}
                        </h1>
                      ) : section.title ? (
                        <h3 className="font-bold mb-2 flex items-center">{renderSectionIcon(section.title)}{section.title}</h3>
                      ) : null}
                      <table className="w-full border-collapse border border-black text-[9pt]">
                        <thead>
                          <tr>
                            {section.headers?.map((h: string, hIdx: number) => (
                              <th key={hIdx} className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.title?.includes("Checklist") && (
                            <tr>
                              <td colSpan={section.headers?.length || 1} className="border border-black p-2 font-medium">
                                Student's name: <span className="font-bold ml-2">{studentName}</span>
                              </td>
                            </tr>
                          )}
                          {section.rows?.map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                              {row.isSubHeader ? (
                                <td colSpan={section.headers?.length || 1} className="border border-black p-2 font-bold bg-gray-100">{row.label}</td>
                              ) : (
                                <>
                                  {row.label !== undefined && <td className="border border-black p-2 font-medium w-3/5">{row.label}</td>}
                                  {row.cells ? (
                                    row.cells.map((cell: any, cIdx: number) => (
                                      <td key={cIdx} colSpan={row.colSpan || 1} className="border border-black p-2 text-center align-middle">
                                        {cell.type === 'text' || cell.type === 'date' ? (
                                          <input
                                            type={cell.type}
                                            className="w-full border-b border-black border-dashed min-h-[20px] bg-transparent text-center focus:outline-none"
                                            value={compRecord[cell.name] || ''}
                                            onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [cell.name]: e.target.value })}
                                            readOnly={isStudent}
                                          />
                                        ) : cell.type === 'signature' ? (
                                          <div
                                            onClick={() => !isStudent && openSigModal(cell.name, 'comp')}
                                            className="w-full border-b border-black border-dashed min-h-[20px] cursor-pointer flex items-center justify-center"
                                          >
                                            {compRecord[cell.name] ? (
                                              <img src={compRecord[cell.name]} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                                            ) : (
                                              <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>
                                            )}
                                          </div>
                                        ) : cell.options ? (
                                          <div className="flex flex-col gap-1 items-center justify-center">
                                            {cell.options.map((opt: any, oIdx: number) => (
                                              <div
                                                key={oIdx}
                                                className="flex gap-2 items-center cursor-pointer"
                                                onClick={() => !isStudent && setCompRecord({ ...compRecord, [cell.name]: compRecord[cell.name] === opt.value ? '' : opt.value })}
                                              >
                                                <div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">
                                                  {compRecord[cell.name] === opt.value && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}
                                                </div>
                                                {opt.text && <span className="text-[8.5pt]">{opt.text}</span>}
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </td>
                                    ))
                                  ) : (
                                    <td className="border border-black p-2 text-center"></td>
                                  )}
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return null;
              })}

              {pageIdx === pages.length - 1 && (
                <>
                  {taskData.questions && (
                    <div className="mt-8">
                      {taskData.questions.map((q: any) => (
                        <div key={q.id} className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
                          <div className="p-3 sm:p-4">
                            <div className="flex gap-2 font-bold mb-3 text-[10pt]">
                              <span>{q.id}.</span>
                              <span className="whitespace-pre-wrap">{q.text}</span>
                            </div>

                            <div className="pl-0 sm:pl-6 mt-2">
                              {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => (
                                <div key={oIdx} className="flex gap-2 mb-2 items-center">
                                  <input type="radio" checked={answers[opt.name || `t${taskKey!.replace('task', '')}q${q.id}`] === opt.value} onChange={(e) => setAnswers({ ...answers, [opt.name || `t${taskKey!.replace('task', '')}q${q.id}`]: opt.value })} className="mt-0.5" />
                                  <label>{opt.text}</label>
                                </div>
                              ))}

                              {q.type === 'text' && (
                                <textarea
                                  className="w-full border border-gray-300 p-2 min-h-[100px] resize-y"
                                  value={answers[`t${taskKey!.replace('task', '')}q${q.id}`] || ''}
                                  onChange={(e) => setAnswers({ ...answers, [`t${taskKey!.replace('task', '')}q${q.id}`]: e.target.value })}
                                  placeholder="(No response)"
                                />
                              )}

                              {q.type === 'options' && q.options?.map((opt: any, oIdx: number) => {
                                const ansArray = answers[`t${taskKey!.replace('task', '')}q${q.id}`] || [];
                                const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                                return (
                                  <div key={oIdx} className="flex gap-2 mb-2 items-center">
                                    <input type="checkbox" checked={checked} onChange={(e) => {
                                      let newArr = [...(Array.isArray(answers[`t${taskKey!.replace('task', '')}q${q.id}`]) ? answers[`t${taskKey!.replace('task', '')}q${q.id}`] : [])];
                                      if (e.target.checked) newArr.push(opt.value);
                                      else newArr = newArr.filter(v => v !== opt.value);
                                      setAnswers({ ...answers, [`t${taskKey!.replace('task', '')}q${q.id}`]: newArr });
                                    }} className="mt-0.5" />
                                    <label>{opt.text}</label>
                                  </div>
                                )
                              })}

                              {q.type === 'multipart_radio' && q.parts?.map((part: any, pIdx: number) => (
                                <div key={pIdx} className="mb-4 bg-gray-50 p-3 border border-gray-200">
                                  <div className="font-bold mb-2 whitespace-pre-wrap">{part.text}</div>
                                  {part.options?.map((opt: any, oIdx: number) => (
                                    <div key={oIdx} className="flex gap-2 mb-1">
                                      <input type="radio" checked={answers[part.name] === opt.value} onChange={(e) => setAnswers({ ...answers, [part.name]: opt.value })} />
                                      <label>{opt.text}</label>
                                    </div>
                                  ))}
                                </div>
                              ))}

                              {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tIdx: number) => (
                                <div key={tIdx} className="mb-4 border border-gray-200 p-2">
                                  {ti.image && <img src={ti.image} className="max-w-[200px] mb-2" alt="Diagram" />}
                                  <input type="text" className="border-b border-black w-full outline-none p-1 bg-transparent" placeholder={ti.placeholder} value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
                            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
                              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
                            </div>
                            <div
                              onClick={() => !isStudent && setGrades({ ...grades, [`t${taskKey!.replace('task', '')}q${q.id}`]: 'correct' })}
                              className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer"
                            >
                              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                                {grades[`t${taskKey!.replace('task', '')}q${q.id}`] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                              </span>
                              Satisfactory (S)
                            </div>
                            <div
                              onClick={() => !isStudent && setGrades({ ...grades, [`t${taskKey!.replace('task', '')}q${q.id}`]: 'incorrect' })}
                              className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer"
                            >
                              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                                {grades[`t${taskKey!.replace('task', '')}q${q.id}`] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                              </span>
                              Not Satisfactory (NS)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(taskData.performance || taskData.oral || taskData.checklistItems) && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-center bg-gray-200 p-2 mb-4">{taskData.checklistTitle}</h2>
                      <p className="whitespace-pre-wrap mb-4 text-sm italic">{taskData.assessorInstructions}</p>

                      <h3 className="font-bold mb-2 text-[10pt]">Record of Performance:</h3>
                      <table className="w-full border-collapse border-[1.5px] border-black mb-6 text-[9pt]">
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
                        <tbody>
                          {taskData.oral && (
                            <>
                              <tr>
                                <td className="border-[1.5px] border-black bg-[#e0e0e0] italic px-3 py-1.5 text-[8.5pt]" colSpan={3}>
                                  *See assessment task details for specific oral questions
                                </td>
                              </tr>
                              {taskData.oral.map((item: string, idx: number) => (
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
                          )}

                          {taskData.performance && (
                            <>
                              <tr>
                                <td colSpan={3} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
                                  {taskData.performanceHeader || "Evidence of Performance: Did The Candidate Satisfactorily:"}
                                </td>
                              </tr>
                              {taskData.performance.map((item: string, idx: number) => (
                                <tr key={`perf-${idx}`}>
                                  <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
                                  <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'yes' })}>
                                    {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                                  </td>
                                  <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'no' })}>
                                    {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}

                          {taskData.checklistItems && (
                            <>
                              <tr>
                                <td colSpan={3} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
                                  Evidence of Performance: Did The Candidate Satisfactorily:
                                </td>
                              </tr>
                              {taskData.checklistItems.map((item: string, idx: number) => (
                                <tr key={`chk-${idx}`}>
                                  <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
                                  <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'yes' })}>
                                    {compRecord[`${taskKey}_chk_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                                  </td>
                                  <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_chk_${idx}`]: 'no' })}>
                                    {compRecord[`${taskKey}_chk_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

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
                                <div
                                  className="no-print"
                                  onClick={() => openSigModal('student_signature', 'comp')}
                                  style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '24px', cursor: 'pointer', position: 'relative' }}
                                >
                                  {answers.student_signature_url ? (
                                    <img src={answers.student_signature_url} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />
                                  ) : (
                                    <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                                  )}
                                </div>
                                <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                                  {answers.student_signature_url && (
                                    <img src={answers.student_signature_url} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />
                                  )}
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
                      <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '90px', fontSize: '10.5pt' }}>
                        {compRecord[`${taskKey}_feedback`]}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '12.5pt' }}>
                      Result:{' '}
                      <span
                        className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`}
                        onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }}
                        style={{ padding: '4px' }}
                      >
                        Satisfactory (S)
                        {compRecord[`${taskKey}_result`] === 'S' && (
                          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>
                        )}
                      </span>
                      <span style={{ margin: '0 8px' }}>/</span>
                      <span
                        className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`}
                        onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }}
                        style={{ padding: '4px' }}
                      >
                        Not Satisfactory (NS)
                        {compRecord[`${taskKey}_result`] === 'NS' && (
                          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>
                        )}
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
                                <div
                                  className="no-print"
                                  onClick={() => openSigModal('assessor_signature', 'comp')}
                                  style={{ borderBottom: '1.5px solid black', flex: 1, minHeight: '24px', cursor: isStudent ? 'default' : 'pointer', position: 'relative' }}
                                >
                                  {compRecord.assessor_signature ? (
                                    <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />
                                  ) : (
                                    <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                                  )}
                                </div>
                                <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                                  {compRecord.assessor_signature && (
                                    <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '35px', position: 'absolute', bottom: '-4px', mixBlendMode: 'multiply' }} />
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Date:</span>
                                <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                                  <input
                                    type="date"
                                    style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', cursor: isStudent ? 'default' : 'pointer' }}
                                    value={compRecord.assessment_date || ''}
                                    onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }}
                                    readOnly={isStudent}
                                  />
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
                </>
              )}
            </div>
          ))
        })}

    </div>
  );
};
