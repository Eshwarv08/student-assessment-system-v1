import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions6';

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

export const Q6Booklet: React.FC<Q6BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
  const [internalCompRecord, setInternalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
  const compRecord = externalCompRecord ?? internalCompRecord;
  const setCompRecord = externalSetCompRecord ?? setInternalCompRecord;

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

  const q6Styles = `
      .q6-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q6-booklet-view * {
        box-sizing: border-box;
      }
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
      .q6-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q6-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q6-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q6-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q6-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q6-booklet-view table td, .q6-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q6-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q6-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q6-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q6-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q6-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q6-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q6-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q6-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a;
      }
      .q6-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q6-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q6-booklet-view .page-footer {
        margin-top: auto;
        padding-top: 4mm;
        border-top: 1px solid #000;
        display: flex;
        justify-content: space-between;
        font-size: 8pt;
      }
      .q6-booklet-view .inner-header {
        margin-bottom: 4mm;
        border-bottom: 2px solid #000;
        padding-bottom: 2mm;
      }
      .q6-booklet-view .inner-header .top-row {
        display: flex; justify-content: space-between; align-items: flex-start;
      }
      .q6-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q6-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q6-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q6-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q6-booklet-view .question-block {
        margin-bottom: 8mm;
      }
      .q6-booklet-view .question-text {
        font-weight: bold;
        margin-bottom: 3mm;
      }
      @media print {
        .q6-booklet-view { background: #fff !important; padding: 0 !important; }
        .q6-booklet-view .page {
          margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important;
        }
      }
  `;

  return (
    <div className="q6-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q6Styles }} />
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
            <div style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>
              {assessmentQuestions.metadata.code}
            </div>
            <div style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>
              {assessmentQuestions.metadata.course}
            </div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '110mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>ACTA College Pty. Ltd</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div className="title-block">
              <div><span className="underline-bold">Assessment book</span></div>
              <div><span className="underline-bold">{assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}</span></div>
            </div>
            <div className="logo-block">
              <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT COMPETENCY RECORD</h1>
        <div className="intro-box">
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table className="comp-table" style={{ marginBottom: '5px' }}>
          <tbody>
            <tr><td className="label-col">Student's Name</td><td className="field-value-cell font-bold">{studentName}</td></tr>
            <tr>
              <td className="label-col">Assessor's Name</td>
              <td className="field-value-cell"></td>
            </tr>
            <tr>
              <td className="label-col">Assessment Site</td>
              <td className="field-value-cell"></td>
            </tr>
            <tr>
              <td className="label-col">Assessment Date/s</td>
              <td className="field-value-cell font-bold"></td>
            </tr>
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
              <td className="font-bold">Assessment Task 1</td>
              <td className="text-center">S / NS</td>
              <td rowSpan={6} style={{ verticalAlign: 'middle' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label><input type="checkbox" disabled /> Competent (C)</label>
                   <label><input type="checkbox" disabled /> Not Competent (NC)</label>
                 </div>
              </td>
            </tr>
            <tr><td className="font-bold">Assessment Task 2</td><td className="text-center">S / NS</td></tr>
            <tr><td className="font-bold">Assessment Task 3</td><td className="text-center">S / NS</td></tr>
            <tr><td className="font-bold">Assessment Task 4</td><td className="text-center">S / NS</td></tr>
            <tr><td className="font-bold">Assessment Task 5</td><td className="text-center">S / NS</td></tr>
            
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
          <thead>
            <tr>
              <th colSpan={3} style={{ border: '1px solid #555', padding: '3px', background: '#f0f0f0' }}>Assessor's Feedback (as Required):</th>
            </tr>
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
                  <div
                    onClick={() => openSigModal('assessor_signature', 'comp')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 hover:bg-blue-50/50"
                    style={{ flex: 1, cursor: isStudent ? 'default' : 'pointer' }}
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  Date: <span className="font-bold border-b border-dashed border-gray-400 inline-block min-w-[80px] text-center ml-1">{formatDisplayDate(compRecord.assessor_sig_date)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', verticalAlign: 'top' }}>
                <strong>Student:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div 
                    onClick={() => openSigModal('student_signature', 'comp')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 hover:bg-blue-50/50"
                    style={{ flex: 1 }}
                  >
                    {answers.student_signature_url ? (
                      <img src={answers.student_signature_url} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-2">Date: <span className="font-bold">{formatDisplayDate(submitDate || '')}</span></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ADMIN INFO PAGES */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">{assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Administrative Use Only:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Entered into Student Management Database</td><td style={{ border: '1px solid #555', padding: '3px 6px' }}>Signature/Initial ________________ Date: ________________</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.unitCodeName}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.preRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.coRequisites}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.unitSummary}</td></tr>
          </tbody>
        </table>
      </div>
      
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">{assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Target Group</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.targetGroup}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Conditions and Context of the Assessments</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.conditionsAndContext}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Specific Resources Required</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.specificResources}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Re-assessment</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.reAssessment}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">{assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Assessment Instruction</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.assessmentInstruction}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 1</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.task1Description}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 2</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.task2Description}</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 3</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{assessmentQuestions.adminInfo.task3Description}</td></tr>
          </tbody>
        </table>
      </div>

      {/* DYNAMIC TASKS */}
      {Object.keys(assessmentQuestions)
        .filter(key => key.startsWith('task'))
        .sort((a, b) => parseInt(a.replace('task', '')) - parseInt(b.replace('task', '')))
        .map((taskKey, idx) => {
          const taskData = assessmentQuestions[taskKey as keyof typeof assessmentQuestions] as any;
          
          return (
            <div key={taskKey} className="page">
              <div className="inner-header">
                <div className="top-row">
                  <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">{assessmentQuestions.metadata.code} {assessmentQuestions.metadata.course}</span></div>
                  <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                </div>
              </div>

              <h1 className="section-title text-center text-blue-900 font-bold my-4">
                {taskData.title || taskData.observationTitle}
                {taskData.observationSubtitle && <div className="text-lg mt-1">{taskData.observationSubtitle}</div>}
              </h1>

              {taskData.sections?.map((section: any, sIdx: number) => {
                if (section.type === 'text') {
                  return (
                    <div key={sIdx} className="mb-4">
                      {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
                      <p className="whitespace-pre-wrap">{section.content}</p>
                    </div>
                  );
                } else if (section.type === 'table') {
                  return (
                    <div key={sIdx} className="mb-4">
                      {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr>
                            {section.headers?.map((h: string, hIdx: number) => (
                              <th key={hIdx} className="border border-gray-400 bg-gray-100 p-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows?.map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                              <td className="border border-gray-400 p-2 font-bold w-1/4">{row.label}</td>
                              <td className="border border-gray-400 p-2">
                                {row.editable ? (
                                  <input 
                                    type="text" 
                                    className="w-full border-b border-gray-400 outline-none p-1 bg-transparent"
                                    value={answers[row.id] || ''}
                                    onChange={(e) => isStudent && setAnswers({...answers, [row.id]: e.target.value})}
                                    readOnly={!isStudent}
                                  />
                                ) : (
                                  row.value
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return null;
              })}

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
                              <input type="radio" checked={answers[opt.name || `t${taskKey!.replace('task', '')}q${q.id}`] === opt.value} onChange={(e) => setAnswers({...answers, [opt.name || `t${taskKey!.replace('task', '')}q${q.id}`]: opt.value})} className="mt-0.5" />
                              <label>{opt.text}</label>
                            </div>
                          ))}

                          {q.type === 'text' && (
                            <textarea
                              className="w-full border border-gray-300 p-2 min-h-[100px] resize-y"
                              value={answers[`t${taskKey!.replace('task', '')}q${q.id}`] || ''}
                              onChange={(e) => setAnswers({...answers, [`t${taskKey!.replace('task', '')}q${q.id}`]: e.target.value})}
                              placeholder="(No response)"
                            />
                          )}

                          {(q.type === 'options' || q.type === 'checkbox') && q.options?.map((opt: any, oIdx: number) => {
                            const ansArray = answers[`t${taskKey!.replace('task', '')}q${q.id}`] || [];
                            const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                            return (
                              <div key={oIdx} className="flex gap-2 mb-2 items-center">
                                <input type="checkbox" checked={checked} onChange={(e) => {
                                  let newArr = [...(Array.isArray(answers[`t${taskKey!.replace('task', '')}q${q.id}`]) ? answers[`t${taskKey!.replace('task', '')}q${q.id}`] : [])];
                                  if (e.target.checked) newArr.push(opt.value);
                                  else newArr = newArr.filter(v => v !== opt.value);
                                  setAnswers({...answers, [`t${taskKey!.replace('task', '')}q${q.id}`]: newArr});
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
                                  <input type="radio" checked={answers[part.name] === opt.value} onChange={(e) => setAnswers({...answers, [part.name]: opt.value})} />
                                  <label>{opt.text}</label>
                                </div>
                              ))}
                            </div>
                          ))}

                          {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tIdx: number) => (
                            <div key={tIdx} className="mb-4 border border-gray-200 p-2">
                              {ti.image && <img src={ti.image} className="max-w-[200px] mb-2" alt="Diagram" />}
                              <input type="text" className="border-b border-black w-full outline-none p-1 bg-transparent" placeholder={ti.placeholder} value={answers[ti.name] || ''} onChange={(e) => setAnswers({...answers, [ti.name]: e.target.value})} />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
                        <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
                          Assessor to tick (☑)
                        </div>
                        <div 
                          className={`w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                          onClick={() => { if (!isStudent) setCompRecord({...compRecord, [`${taskKey}_q${q.id}_result`]: 'S'}) }}
                        >
                           <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                             {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                           </span>
                           Satisfactory (S)
                        </div>
                        <div 
                          className={`w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                          onClick={() => { if (!isStudent) setCompRecord({...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS'}) }}
                        >
                           <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                             {compRecord[`${taskKey}_q${q.id}_result`] === 'NS' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                           </span>
                           Not Satisfactory (NS)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(taskData.performance || taskData.oral || taskData.checklistItems || taskData.observationItems) && (
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
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_oral_${idx}`]: 'yes'})}>
                                {compRecord[`${taskKey}_oral_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_oral_${idx}`]: 'no'})}>
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
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_perf_${idx}`]: 'yes'})}>
                                {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_perf_${idx}`]: 'no'})}>
                                {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                      
                      {taskData.observationItems && (
                        <>
                          <tr>
                            <td colSpan={3} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
                              Observation Items:
                            </td>
                          </tr>
                          {taskData.observationItems.map((item: string, idx: number) => (
                            <tr key={`obs-${idx}`}>
                              <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_obs_${idx}`]: 'yes'})}>
                                {compRecord[`${taskKey}_obs_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_obs_${idx}`]: 'no'})}>
                                {compRecord[`${taskKey}_obs_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
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
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_chk_${idx}`]: 'yes'})}>
                                {compRecord[`${taskKey}_chk_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_chk_${idx}`]: 'no'})}>
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
            </div>
          )
        })}

    </div>
  );
};
