import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { assessmentQuestions } from '../data/questions';

interface Q1BookletProps {
  answers: any;
  setAnswers: (val: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  studentName?: string;
  submitDate?: string;
  isStudent?: boolean;
}

export const Q1Booklet: React.FC<Q1BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent }) => {
  // Dummy variables to prevent errors and hide assessor functionality
  const compRecord: any = { tasks: {}, attempts: [], evidence: {} };
  const setCompRecord = (val: any) => { };

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

  const q1Styles = `
      .q1-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q1-booklet-view * {
        box-sizing: border-box;
      }
      .q1-booklet-view .page {
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
      .q1-booklet-view h1.section-title {
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
      .q1-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q1-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q1-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q1-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q1-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q1-booklet-view table td, .q1-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q1-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q1-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q1-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q1-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q1-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q1-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q1-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q1-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 24px; height: 24px; justify-content: center; font-weight: bold; font-size: 10pt; color: #1e3a8a;
      }
      .q1-booklet-view .attempt-td { padding: 2px 4px; border: 1px solid #555; text-align: center; }
      .q1-booklet-view .attempt-fb { padding: 2px 4px; border: 1px solid #555; }
      .q1-booklet-view .page-footer {
        margin-top: auto;
        padding-top: 4mm;
        border-top: 1px solid #000;
        display: flex;
        justify-content: space-between;
        font-size: 8pt;
      }
      .q1-booklet-view .inner-header {
        margin-bottom: 4mm;
        border-bottom: 2px solid #000;
        padding-bottom: 2mm;
      }
      .q1-booklet-view .inner-header .top-row {
        display: flex; justify-content: space-between; align-items: flex-start;
      }
      .q1-booklet-view .inner-header .title-block { font-weight: bold; font-size: 11.5pt; color: #b00; }
      .q1-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q1-booklet-view .checklist-table th { background: #e0e0e0; font-size: 9.5pt; }
      .q1-booklet-view .checklist-table td { padding: 4px 6px; font-size: 9pt; }
      .q1-booklet-view .question-block {
        margin-bottom: 8mm;
      }
      .q1-booklet-view .question-text {
        font-weight: bold;
        margin-bottom: 3mm;
      }
      @media print {
        .q1-booklet-view { background: #fff !important; padding: 0 !important; }
        .q1-booklet-view .page {
          margin: 0 !important; padding: 12mm 14mm !important; box-shadow: none !important; border: none !important;
        }
      }
  `;

  return (
    <div className="q1-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q1Styles }} />
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

      {/* ═══════════════════ ALL PAGES PAGINATION ═══════════════════ */}
      {[
        { type: 'cover' }, // Page 1
        { type: 'comp_record' }, // Page 2
        { type: 'admin_1' }, // Page 3
        { type: 'admin_2' }, // Page 4
        { type: 'admin_3' }, // Page 5
        { type: 'admin_4' }, // Page 6

        { task: 'task1', type: 'intro' }, // Page 7
        { task: 'task1', type: 'checklist1', oral: [0, 1, 2, 3, 4, 5], perf: [0, 1, 2, 3] }, // Page 8
        { task: 'task1', type: 'checklist2', perf: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], feedback: true }, // Page 9

        { task: 'task2', type: 'intro' }, // Page 10
        { task: 'task2', type: 'checklist1', oral: [0, 1, 2, 3], perf: [0, 1, 2, 3, 4, 5] }, // Page 11
        { task: 'task2', type: 'checklist2', perf: [6, 7, 8, 9, 10, 11, 12], feedback: true }, // Page 12

        { task: 'task3', type: 'intro', oral: [0, 1] }, // Page 13
        { task: 'task3', type: 'checklist2', oral: [2, 3], perf: [0, 1, 2, 3, 4, 5, 6, 7], feedback: true }, // Page 14

        { task: 'task4', type: 'questions', qIds: [1, 2], showIntro: true }, // Page 15
        { task: 'task4', type: 'questions', qIds: [3, 4, 5, 6, 7] }, // Page 16
        { task: 'task4', type: 'questions', qIds: [8, 9, 10, 11] }, // Page 17
        { task: 'task4', type: 'questions', qIds: [12, 13, 14, 15, 16] }, // Page 18
        { task: 'task4', type: 'questions', qIds: [17], perf: [0, 1], feedback: true }, // Page 19

        { task: 'task5', type: 'questions', qIds: [1, 2, 3, 4], showIntro: true }, // Page 20
        { task: 'task5', type: 'questions', qIds: [5, 6, 7, 8, 9, 10, 11] }, // Page 21
        { task: 'task5', type: 'questions', qIds: [12, 13, 14, 15, 16, 17, 18] }, // Page 22
        { task: 'task5', type: 'questions', qIds: [19, 20, 21, 22, 23, 24] }, // Page 23
        { task: 'task5', type: 'questions', qIds: [25, 26, 27] }, // Page 24
        { task: 'task5', type: 'questions', qIds: [28], feedback: true }, // Page 25

        { task: 'task6', type: 'questions', qIds: [], showIntro: true }, // Page 26
        { task: 'task6', type: 'questions', qIds: [1, 2, 3, 4, 5, 6] }, // Page 27
        { task: 'task6', type: 'questions', qIds: [7, 8, 9, 10, 11, 12] }, // Page 28
        { task: 'task6', type: 'questions', qIds: [13, 14, 15, 16, 17, 18] }, // Page 29
        { task: 'task6', type: 'questions', qIds: [19, 20, 21, 22, 23, 24] }, // Page 30
        { task: 'task6', type: 'questions', qIds: [25, 26, 27, 28, 29, 30] }, // Page 31
        { task: 'task6', type: 'questions', qIds: [31, 32, 33, 34, 35, 36] }, // Page 32
        { task: 'task6', type: 'questions', qIds: [37, 38, 39, 40] }, // Page 33
        { task: 'task6', type: 'questions', qIds: [41, 42, 43, 44, 45, 46] }, // Page 34
        { task: 'task6', type: 'questions', qIds: [47, 48, 49, 50], feedback: true }, // Page 35

      ].map((pageConf, index) => {
        const pageNum = index + 1;
        const taskKey = pageConf.task;
        const taskData = taskKey ? (assessmentQuestions[taskKey as keyof typeof assessmentQuestions] as any) : null;
        const admin = assessmentQuestions.adminInfo;

        return (
          <div key={`page-${pageNum}`} className="page" style={pageConf.type === 'cover' ? { padding: '8mm 10mm' } : {}}>
            {/* Header (except Cover) */}
            {pageConf.type !== 'cover' && (
              <div className="inner-header">
                <div className="top-row">
                  <div className="title-block">
                    <div><span className="underline-bold">Assessment book</span></div>
                    <div><span className="underline-bold">ICTCBL246 & ICTCBL247 Install, maintain and modify customer premises communications cabling</span></div>
                  </div>
                  <div className="logo-block">
                    <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>
            )}

            {/* ════════ COVER ════════ */}
            {pageConf.type === 'cover' && (
              <div style={{ border: '3.5px solid #1a5fa8', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }} />
                  <div style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
                  <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
                  <div style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>
                    ICTCBL246 & ICTCBL247
                  </div>
                  <div style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>
                    Install, maintain and modify customer premises communications cabling
                  </div>
                  <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                      Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '110mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>ACTA College Pty. Ltd</div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ COMP RECORD ════════ */}
            {pageConf.type === 'comp_record' && (
              <>
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
                    <tr><td className="font-bold">Assessment Task 6</td><td className="text-center">S / NS</td></tr>
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
              </>
            )}

            {/* ════════ ADMIN INFO 1 ════════ */}
            {pageConf.type === 'admin_1' && (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Administrative Use Only:</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Entered into Student Management Database</td><td style={{ border: '1px solid #555', padding: '3px 6px' }}>Signature/Initial ________________ Date: ________________</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.unitCodeName}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Unit Summary</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.unitSummary}</td></tr>
                  </tbody>
                </table>
              </>
            )}

            {/* ════════ ADMIN INFO 2 ════════ */}
            {pageConf.type === 'admin_2' && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Target Group</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Conditions and Context of the Assessments</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.conditionsAndContext}</td></tr>
                  </tbody>
                </table>
              </>
            )}

            {/* ════════ ADMIN INFO 3 ════════ */}
            {pageConf.type === 'admin_3' && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Specific Resources Required</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.specificResources}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Re-assessment</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.reAssessment}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Plagiarism</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.plagiarism}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Complaints and Appeal</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.complaintsAndAppeals}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessors Intervention</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.assessorsIntervention}</td></tr>
                  </tbody>
                </table>
              </>
            )}

            {/* ════════ ADMIN INFO 4 ════════ */}
            {pageConf.type === 'admin_4' && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold', width: '30%' }}>Attaching Documents</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.attachingDocuments}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Instruction</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.assessmentInstruction}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 1</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.task1Description}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 2</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.task2Description}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 3</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.task3Description}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 4</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.task4Description}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 5</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.task5Description}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Assessment Task 6</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.task6Description}</td></tr>
                    <tr><td style={{ border: '1px solid #555', padding: '3px 6px', fontWeight: 'bold' }}>Competency Decision</td><td style={{ border: '1px solid #555', padding: '3px 6px', whiteSpace: 'pre-wrap' }}>{admin.competencyDecision}</td></tr>
                  </tbody>
                </table>

                <div style={{ marginTop: '15px' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>Reasonable adjustment</div>
                  <p style={{ fontSize: '9pt', marginBottom: '8px' }}>To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.</p>
                  <p style={{ fontSize: '9pt', marginBottom: '8px' }}>ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '9pt' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #555', padding: '4px', textAlign: 'left', background: '#e0e0e0' }}>Reasonable Adjustment Provided</th>
                        <th style={{ border: '1px solid #555', padding: '4px', textAlign: 'left', background: '#e0e0e0' }}>Reason for Reasonable Adjustment</th>
                        <th style={{ border: '1px solid #555', padding: '4px', textAlign: 'left', background: '#e0e0e0' }}>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #555', padding: '4px' }}>[ ] Educational and bilingual support<br/>[ ] Presenting questions orally<br/>[ ] Presenting work instructions in diagrammatic or pictorial form instead of words and sentences<br/>[ ] Extra time to complete a course or assessment<br/>[ ] Others:</td>
                        <td style={{ border: '1px solid #555', padding: '4px' }}></td>
                        <td style={{ border: '1px solid #555', padding: '4px' }}></td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '8px' }}>COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</div>
                  <p style={{ fontSize: '9pt' }}>A cover sheet must be included with each submission of work.</p>
                  <p style={{ fontSize: '9pt' }}>Work submitted without a signed cover sheet will be returned unmarked.</p>
                </div>
              </>
            )}

            {/* ════════ Title & Intro ════════ */}
            {(pageConf.showIntro || pageConf.type === 'intro') && taskData && (
              <>
                <h1 className="section-title text-center text-blue-900 font-bold my-4">
                  {taskData.title || taskData.observationTitle}
                  {taskData.observationSubtitle && <div className="text-lg mt-1">{taskData.observationSubtitle}</div>}
                </h1>
                {taskData.sections?.map((section: any, sIdx: number) => {
                  if (section.type === 'text') {
                    return (
                      <div key={`sec-${sIdx}`} className="mb-4">
                        {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
                        <p className="whitespace-pre-wrap">{section.content}</p>
                      </div>
                    );
                  } else if (section.type === 'table') {
                    return (
                      <div key={`sec-${sIdx}`} className="mb-4">
                        {section.title && <h3 className="font-bold mb-2">{section.title}</h3>}
                        <table className="w-full border-collapse border border-gray-400">
                          <thead>
                            <tr>
                              {section.headers?.map((h: string, hIdx: number) => (
                                <th key={`th-${hIdx}`} className="border border-gray-400 bg-gray-100 p-2 text-left">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.rows?.map((row: any, rIdx: number) => (
                              <tr key={`tr-${rIdx}`}>
                                <td className="border border-gray-400 p-2 font-bold w-1/4">{row.label}</td>
                                <td className="border border-gray-400 p-2">{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return null;
                })}
              </>
            )}

            {/* ════════ Checklist Title ════════ */}
            {(pageConf.type === 'checklist1' || pageConf.type === 'checklist2') && pageConf.type === 'checklist1' && taskData && (
              <>
                <h2 className="text-lg font-bold text-center bg-gray-200 p-2 mb-4">{taskData.checklistTitle}</h2>
                <p className="whitespace-pre-wrap mb-4 text-sm italic">{taskData.assessorInstructions}</p>
              </>
            )}

            {/* ════════ Oral & Performance Checklists ════════ */}
            {(pageConf.oral || pageConf.perf) && taskData && (
              <div className="mt-4">
                <table className="w-full border-collapse border-[1.5px] border-black mb-6 text-[9pt]">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="border-[1.5px] border-black bg-[#999] text-left px-3 py-2 text-black font-bold">
                        {pageConf.oral && !pageConf.perf ? "Questions" : "Did the Candidate:"}
                      </th>
                      <th colSpan={2} className="border-[1.5px] border-black bg-[#999] text-left px-3 py-2 text-black font-bold">Satisfactory</th>
                    </tr>
                    <tr>
                      <th className="border-[1.5px] border-black bg-[#aaa] text-left px-3 py-1.5 text-black font-bold w-[12%]">Yes</th>
                      <th className="border-[1.5px] border-black bg-[#aaa] text-left px-3 py-1.5 text-black font-bold w-[12%]">No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Oral section */}
                    {pageConf.oral && (
                      <>
                        {pageConf.type === 'checklist1' && (
                          <tr>
                            <td className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black" colSpan={3}>
                              {taskData.oralHeader || "Oral Assessment Questions"}
                            </td>
                          </tr>
                        )}
                        {pageConf.oral.map((idx: number) => {
                          const item = taskData.oral?.[idx];
                          if (!item) return null;
                          return (
                            <tr key={`oral-${idx}`}>
                              <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_oral_${idx}`]: 'yes'})}>
                                {compRecord[`${taskKey}_oral_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_oral_${idx}`]: 'no'})}>
                                {compRecord[`${taskKey}_oral_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}

                    {/* Performance section */}
                    {pageConf.perf && (
                      <>
                        {pageConf.type === 'checklist1' && (
                          <tr>
                            <td colSpan={3} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
                              {taskData.performanceHeader || "Evidence of Performance: Did The Candidate Satisfactorily:"}
                            </td>
                          </tr>
                        )}
                        {pageConf.perf.map((idx: number) => {
                          const item = taskData.performance?.[idx] || taskData.checklistItems?.[idx];
                          if (!item) return null;
                          return (
                            <tr key={`perf-${idx}`}>
                              <td className="border-[1.5px] border-black px-3 py-2">{item}</td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_perf_${idx}`]: 'yes'})}>
                                {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                              <td className="border-[1.5px] border-black px-3 py-2 cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({...compRecord, [`${taskKey}_perf_${idx}`]: 'no'})}>
                                {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ════════ Questions section ════════ */}
            {pageConf.type === 'questions' && pageConf.qIds && taskData && (
              <div className="mt-4">
                {pageConf.qIds.map((qId: number) => {
                  const q = taskData.questions?.find((x: any) => x.id === qId);
                  if (!q) return null;
                  return (
                    <div key={`q-${q.id}`} className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
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

                          {q.type === 'options' && q.options?.map((opt: any, oIdx: number) => {
                            const ansArray = answers[`t${taskKey!.replace('task', '')}q${q.id}`] || [];
                            const checked = Array.isArray(ansArray) ? ansArray.includes(opt.value) : ansArray === opt.value;
                            return (
                              <div key={oIdx} className="flex gap-2 mb-2 items-center">
                                <input type="checkbox" checked={checked} onChange={(e) => {
                                  let newArr = [...(Array.isArray(answers[`t${taskKey!.replace('task', '')}q${q.id}`]) ? answers[`t${taskKey!.replace('task', '')}q${q.id}`] : [])];
                                  if (e.target.checked) newArr.push(opt.value);
                                  else newArr = newArr.filter((v: any) => v !== opt.value);
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
                  );
                })}
              </div>
            )}

            {/* ════════ Feedback & Signature Block ════════ */}
            {pageConf.feedback && taskData && (
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
            )}

            {/* ════════ Page Footer ════════ */}
            {pageConf.type !== 'cover' && (
              <div className="page-footer mt-auto pt-[4mm] border-t border-black flex justify-between text-[8pt]">
                <div>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V5.6 | 2024</div>
                <div>Page {pageNum} of 35</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
