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
  compRecord?: any;
  setCompRecord?: (val: any) => void;
}

export const Q1Booklet: React.FC<Q1BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord }) => {
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
      @media screen and (max-width: 800px) {
        .q1-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q1-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q1-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q1-booklet-view .flex, .q1-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q1-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q1-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q1-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q1-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q1-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q1-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
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
              <div className="cover-outer-border" style={{ border: '1.5px solid #6b9bd2', padding: '3px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div className="cover-inner-border" style={{ border: '3px solid #6b9bd2', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ width: 'auto', height: '180px', objectFit: 'contain', marginBottom: '2mm', marginTop: '8mm' }} />
                  <div style={{ color: '#8b0000', fontSize: '10.5pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', marginBottom: '8mm' }}>RTO NO: 40954</div>
                  
                  <div className="cover-title" style={{ fontSize: '42pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '6mm', letterSpacing: '1px' }}>Assessment Booklet</div>
                  
                  <div style={{ background: '#8ba8d4', height: '14px', width: '100%', marginBottom: '8mm' }}></div>
                  
                  <div className="cover-subtitle" style={{ fontSize: '20pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '4mm' }}>
                    ICTCBL246&ICTCBL247
                  </div>
                  
                  <div className="cover-subtitle" style={{ fontSize: '20pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm', padding: '0 5mm' }}>
                    Install, Maintain and Modify Customer<br />Premises Communications Cabling:<br />ACMA Restricted Rule & Open Rule
                  </div>
                  
                  <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="cover-student-name-container" style={{ fontSize: '13pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', padding: '0 15mm' }}>
                      <span style={{ marginRight: '10px' }}>Student Name:</span>
                      <span style={{ display: 'inline-block', borderBottom: '1.5px solid #000', flex: 1, fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left', minHeight: '22px', width: '100%' }}>{studentName}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '8pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '25mm', marginBottom: '10mm' }}>ACTA College Pty. Ltd</div>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
                  <tbody>
                    <tr>
                      <td colSpan={6} style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', background: '#bfbfbf', fontWeight: 'bold' }}>
                        Assessor Declaration
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt' }}>
                        In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold', background: '#bfbfbf', width: '40%' }}>
                        Evidence Is Confirmed as:
                      </td>
                      <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'center' }}>
                        <label className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_valid: !compRecord.evidence_valid })}>
                          <div className="w-4 h-4 border border-black flex items-center justify-center shrink-0 bg-white relative">
                            {compRecord.evidence_valid && <span className="text-red-600 font-bold text-lg leading-none absolute -top-[2px] -right-[2px]">✓</span>}
                          </div>
                          Valid
                        </label>
                      </td>
                      <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'center' }}>
                        <label className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_sufficient: !compRecord.evidence_sufficient })}>
                          <div className="w-4 h-4 border border-black flex items-center justify-center shrink-0 bg-white relative">
                            {compRecord.evidence_sufficient && <span className="text-red-600 font-bold text-lg leading-none absolute -top-[2px] -right-[2px]">✓</span>}
                          </div>
                          Sufficient
                        </label>
                      </td>
                      <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'center' }}>
                        <label className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_current: !compRecord.evidence_current })}>
                          <div className="w-4 h-4 border border-black flex items-center justify-center shrink-0 bg-white relative">
                            {compRecord.evidence_current && <span className="text-red-600 font-bold text-lg leading-none absolute -top-[2px] -right-[2px]">✓</span>}
                          </div>
                          Current
                        </label>
                      </td>
                      <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'center' }}>
                        <label className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence_authentic: !compRecord.evidence_authentic })}>
                          <div className="w-4 h-4 border border-black flex items-center justify-center shrink-0 bg-white relative">
                            {compRecord.evidence_authentic && <span className="text-red-600 font-bold text-lg leading-none absolute -top-[2px] -right-[2px]">✓</span>}
                          </div>
                          Authentic
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <th colSpan={3} style={{ border: '1px solid #555', padding: '4px', textAlign: 'left', background: '#f0f0f0' }}>Please attach the following documentation to this form</th>
                      <th style={{ border: '1px solid #555', padding: '4px', width: '15%', background: '#f0f0f0', textAlign: 'center' }}>Result</th>
                      <td rowSpan={7} colSpan={2} style={{ border: '1px solid #555', padding: '4px', width: '30%', background: '#bfbfbf', verticalAlign: 'middle' }}>
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="font-bold text-center mb-6">FINAL ASSESSMENT<br />RESULT:</div>
                          <div className="flex flex-col gap-3 w-full pl-4 font-bold">
                            <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'C' })}>
                              <div className="w-4 h-4 border border-black bg-white flex items-center justify-center shrink-0 relative">
                                {compRecord.final_result === 'C' && <span className="text-red-600 font-bold text-xl leading-none absolute -top-[4px] -right-[2px]">✓</span>}
                              </div>
                              Competent (C)
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, final_result: 'NC' })}>
                              <div className="w-4 h-4 border border-black bg-white flex items-center justify-center shrink-0 relative">
                                {compRecord.final_result === 'NC' && <span className="text-red-600 font-bold text-xl leading-none absolute -top-[4px] -right-[2px]">✓</span>}
                              </div>
                              Not NYC Competent (NC)
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '1px solid #555', padding: '4px 6px', width: '23%' }}>Assessment Task 1</td>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_doc: !compRecord.task1_doc })}>
                          <div className="w-3 h-3 border border-black bg-white flex items-center justify-center shrink-0 relative">
                            {compRecord.task1_doc && <span className="text-red-600 font-bold text-sm leading-none absolute -top-[2px] -right-[1px]">✓</span>}
                          </div>
                          Observation
                        </label>
                      </td>
                      <td className="text-center align-middle" style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`cursor-pointer ${compRecord.task1_result === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'S' })}>S</span>
                          <span>/</span>
                          <span className={`cursor-pointer ${compRecord.task1_result === 'NS' ? 'border-[1.5px] border-red-600 rounded-full w-7 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task1_result: 'NS' })}>NS</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '1px solid #555', padding: '4px 6px' }}>Assessment Task 2</td>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_doc: !compRecord.task2_doc })}>
                          <div className="w-3 h-3 border border-black bg-white flex items-center justify-center shrink-0 relative">
                            {compRecord.task2_doc && <span className="text-red-600 font-bold text-sm leading-none absolute -top-[2px] -right-[1px]">✓</span>}
                          </div>
                          Observation
                        </label>
                      </td>
                      <td className="text-center align-middle" style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`cursor-pointer ${compRecord.task2_result === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'S' })}>S</span>
                          <span>/</span>
                          <span className={`cursor-pointer ${compRecord.task2_result === 'NS' ? 'border-[1.5px] border-red-600 rounded-full w-7 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task2_result: 'NS' })}>NS</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '1px solid #555', padding: '4px 6px' }}>Assessment Task 3</td>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_doc: !compRecord.task3_doc })}>
                          <div className="w-3 h-3 border border-black bg-white flex items-center justify-center shrink-0 relative">
                            {compRecord.task3_doc && <span className="text-red-600 font-bold text-sm leading-none absolute -top-[2px] -right-[1px]">✓</span>}
                          </div>
                          Observation
                        </label>
                      </td>
                      <td className="text-center align-middle" style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`cursor-pointer ${compRecord.task3_result === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'S' })}>S</span>
                          <span>/</span>
                          <span className={`cursor-pointer ${compRecord.task3_result === 'NS' ? 'border-[1.5px] border-red-600 rounded-full w-7 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task3_result: 'NS' })}>NS</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '1px solid #555', padding: '4px 6px' }}>Assessment Task 4</td>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_doc: !compRecord.task4_doc })}>
                          <div className="w-3 h-3 border border-black bg-white flex items-center justify-center shrink-0 relative">
                            {compRecord.task4_doc && <span className="text-red-600 font-bold text-sm leading-none absolute -top-[2px] -right-[1px]">✓</span>}
                          </div>
                          Knowledge Questions
                        </label>
                      </td>
                      <td className="text-center align-middle" style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`cursor-pointer ${compRecord.task4_result === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result: 'S' })}>S</span>
                          <span>/</span>
                          <span className={`cursor-pointer ${compRecord.task4_result === 'NS' ? 'border-[1.5px] border-red-600 rounded-full w-7 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task4_result: 'NS' })}>NS</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '1px solid #555', padding: '4px 6px' }}>Assessment Task 5</td>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task5_doc: !compRecord.task5_doc })}>
                          <div className="w-3 h-3 border border-black bg-white flex items-center justify-center shrink-0 relative">
                            {compRecord.task5_doc && <span className="text-red-600 font-bold text-sm leading-none absolute -top-[2px] -right-[1px]">✓</span>}
                          </div>
                          Questions and Answers
                        </label>
                      </td>
                      <td className="text-center align-middle" style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`cursor-pointer ${compRecord.task5_result === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task5_result: 'S' })}>S</span>
                          <span>/</span>
                          <span className={`cursor-pointer ${compRecord.task5_result === 'NS' ? 'border-[1.5px] border-red-600 rounded-full w-7 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task5_result: 'NS' })}>NS</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold" style={{ border: '1px solid #555', padding: '4px 6px' }}>Assessment Task 6</td>
                      <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <label className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, task6_doc: !compRecord.task6_doc })}>
                          <div className="w-3 h-3 border border-black bg-white flex items-center justify-center shrink-0 relative">
                            {compRecord.task6_doc && <span className="text-red-600 font-bold text-sm leading-none absolute -top-[2px] -right-[1px]">✓</span>}
                          </div>
                          50 Multi Choice Questions
                        </label>
                      </td>
                      <td className="text-center align-middle" style={{ border: '1px solid #555', padding: '4px 6px' }}>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`cursor-pointer ${compRecord.task6_result === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task6_result: 'S' })}>S</span>
                          <span>/</span>
                          <span className={`cursor-pointer ${compRecord.task6_result === 'NS' ? 'border-[1.5px] border-red-600 rounded-full w-7 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, task6_result: 'NS' })}>NS</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #555', padding: '6px', background: '#bfbfbf', width: '10%', textAlign: 'center', fontSize: '9pt' }}>Attempt</th>
                      <th style={{ border: '1px solid #555', padding: '6px', background: '#bfbfbf', width: '20%', textAlign: 'center', fontSize: '9pt' }}>Date</th>
                      <th style={{ border: '1px solid #555', padding: '6px', background: '#bfbfbf', width: '70%', textAlign: 'center', fontSize: '9pt' }}>Assessor's Feedback (as Required):</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="attempt-td" style={{ textAlign: 'center', fontWeight: 'bold' }}>1</td><td className="attempt-td"></td><td className="attempt-fb"></td></tr>
                    <tr><td className="attempt-td" style={{ textAlign: 'center', fontWeight: 'bold' }}>2</td><td className="attempt-td"></td><td className="attempt-fb"></td></tr>
                    <tr><td className="attempt-td" style={{ textAlign: 'center', fontWeight: 'bold' }}>3</td><td className="attempt-td"></td><td className="attempt-fb"></td></tr>
                    <tr><td colSpan={2} style={{ border: '1px solid #555', fontWeight: 'bold', padding: '6px', textAlign: 'center', background: '#bfbfbf', fontSize: '9pt' }}>Final Feedback:</td><td style={{ border: '1px solid #555' }}></td></tr>
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
                                value={compRecord.assessment_date || ''} onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }} disabled={isStudent} />
                            </span>
                            <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(compRecord.assessment_date || '')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', verticalAlign: 'top' }}>
                        <strong>Student:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
                      </td>
                      <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', verticalAlign: 'top' }}>
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
                                value={answers.student_date || submitDate || ''} onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })} />
                            </span>
                            <span className="hidden print:inline-block" style={{ borderBottom: '1px solid #000', flex: 1, height: '20px', paddingLeft: '4px' }}>{formatDisplayDate(answers.student_date || submitDate || '')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {/* ════════ ADMIN INFO 1 ════════ */}
            {pageConf.type === 'admin_1' && (
              <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000' }}>
                  <thead>
                    <tr>
                      <th colSpan={2} style={{ background: '#bfbfbf', border: '1.5px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', fontSize: '11pt' }}>
                        Administrative Use Only:
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1.5px solid #000', padding: '6px', width: '30%' }}>Entered into Student Management Database</td>
                      <td style={{ border: '1.5px solid #000', padding: '6px' }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 border border-black bg-white flex items-center justify-center cursor-pointer"
                            onClick={() => !isStudent && setCompRecord({ ...compRecord, admin_entered: !compRecord.admin_entered })}
                          >
                            {compRecord.admin_entered && <span className="text-red-600 font-bold leading-none -mt-1 text-[14px]">✓</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Signature/Initial:</span>
                            <div
                              className="sig-visual cursor-pointer inline-flex items-center justify-center min-w-[100px] border-b border-black hover:bg-blue-50/50 relative"
                              onClick={() => openSigModal('assessor_signature', 'comp')}
                            >
                              {compRecord.assessor_signature ? (
                                <img src={compRecord.assessor_signature} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                              ) : (
                                <span className="text-[10px] text-slate-400 italic px-2">Sign Here</span>
                              )}
                            </div>
                            <span className="ml-2">Date:</span>
                            <span className="no-print border-b border-black inline-block min-w-[100px]">
                              <input
                                type="date"
                                style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', cursor: isStudent ? 'default' : 'pointer' }}
                                value={compRecord.assessment_date || ''}
                                onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, assessment_date: e.target.value }) }}
                                readOnly={isStudent}
                              />
                            </span>
                            <span className="hidden print:inline-block border-b border-black min-w-[100px] text-center">{formatDisplayDate(compRecord.assessment_date || '')}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Unit Code/Name</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.unitCodeName}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Pre-requisites</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.preRequisites}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Co-requisites</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.coRequisites}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Unit Summary</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.unitSummary}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Target Group</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.targetGroup}</td></tr>
                    <tr>
                      <td style={{ border: '1.5px solid #000', borderBottom: 'none', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Conditions and<br />Context of the<br />Assessments</td>
                      <td style={{ border: '1.5px solid #000', borderBottom: 'none', padding: '6px', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                        {admin.conditionsAndContext.substring(0, admin.conditionsAndContext.indexOf('Access is required to:\n• site/s on which communications cabling activities can be carried out\n• two jumperable'))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ════════ ADMIN INFO 2 ════════ */}
            {pageConf.type === 'admin_2' && (
              <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1.5px solid #000', borderTop: 'none', padding: '6px', width: '30%', verticalAlign: 'top' }}></td>
                      <td style={{ border: '1.5px solid #000', borderTop: 'none', padding: '6px', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                        {admin.conditionsAndContext.substring(admin.conditionsAndContext.indexOf('Access is required to:\n• site/s on which communications cabling activities can be carried out\n• two jumperable'))}
                      </td>
                    </tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Specific Resources<br />Required</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.specificResources}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Re-Assessment</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.reAssessment}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Plagiarism</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.plagiarism}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Complaints and<br />Appeal</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.complaintsAndAppeals}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessors<br />Intervention</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.assessorsIntervention}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ════════ ADMIN INFO 3 ════════ */}
            {pageConf.type === 'admin_3' && (
              <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000' }}>
                  <tbody>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', width: '30%', verticalAlign: 'top' }}>Attaching<br />Documents</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.attachingDocuments}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment<br />Instruction</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.assessmentInstruction}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 1:</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.task1Description}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 2:</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.task2Description}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 3:</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.task3Description}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 4:</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.task4Description}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Assessment Task 5<br />and Task 6:</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.task5Description}</td></tr>
                    <tr><td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', verticalAlign: 'top' }}>Competency<br />Decision</td><td style={{ border: '1.5px solid #000', padding: '6px', whiteSpace: 'pre-wrap' }}>{admin.competencyDecision}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ════════ ADMIN INFO 4 ════════ */}
            {pageConf.type === 'admin_4' && (
              <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '30px' }}>
                  <thead>
                    <tr>
                      <th colSpan={3} style={{ background: '#bfbfbf', border: '1.5px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>
                        Reasonable adjustment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} style={{ border: '1.5px solid #000', padding: '8px' }}>
                        <p style={{ margin: '0 0 8px 0' }}>To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.</p>
                        <p style={{ margin: 0 }}>ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Reasonable Adjustment Provided</td>
                      <td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '33%' }}>Reason for Reasonable Adjustment</td>
                      <td style={{ border: '1.5px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '34%' }}>Outcome</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1.5px solid #000', padding: '8px', lineHeight: '1.6' }}>
                        <div className="flex gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_edu: !compRecord.ra_edu })}>
                          <div className="w-4 h-4 border-[1.5px] border-black shrink-0 mt-1 flex items-center justify-center">
                            {compRecord.ra_edu && <span className="text-red-600 font-bold leading-none -mt-1 text-[14px]">✓</span>}
                          </div> 
                          Educational and bilingual support
                        </div>
                        <div className="flex gap-2 cursor-pointer mt-1" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_oral: !compRecord.ra_oral })}>
                          <div className="w-4 h-4 border-[1.5px] border-black shrink-0 mt-1 flex items-center justify-center">
                            {compRecord.ra_oral && <span className="text-red-600 font-bold leading-none -mt-1 text-[14px]">✓</span>}
                          </div> 
                          Presenting questions orally
                        </div>
                        <div className="flex gap-2 cursor-pointer mt-1" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_diagram: !compRecord.ra_diagram })}>
                          <div className="w-4 h-4 border-[1.5px] border-black shrink-0 mt-1 flex items-center justify-center">
                            {compRecord.ra_diagram && <span className="text-red-600 font-bold leading-none -mt-1 text-[14px]">✓</span>}
                          </div> 
                          Presenting work instructions in diagrammatic or pictorial form instead of words and sentences
                        </div>
                        <div className="flex gap-2 cursor-pointer mt-1" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_extra: !compRecord.ra_extra })}>
                          <div className="w-4 h-4 border-[1.5px] border-black shrink-0 mt-1 flex items-center justify-center">
                            {compRecord.ra_extra && <span className="text-red-600 font-bold leading-none -mt-1 text-[14px]">✓</span>}
                          </div> 
                          Extra time to complete a course or assessment
                        </div>
                        <div className="flex gap-2 cursor-pointer mt-1" onClick={() => !isStudent && setCompRecord({ ...compRecord, ra_other: !compRecord.ra_other })}>
                          <div className="w-4 h-4 border-[1.5px] border-black shrink-0 mt-1 flex items-center justify-center">
                            {compRecord.ra_other && <span className="text-red-600 font-bold leading-none -mt-1 text-[14px]">✓</span>}
                          </div> 
                          Others:
                        </div>
                      </td>
                      <td style={{ border: '1.5px solid #000', padding: '6px' }}></td>
                      <td style={{ border: '1.5px solid #000', padding: '6px' }}></td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ background: '#99c2ff', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', marginBottom: '15px' }}>
                  COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT
                </div>
                <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '10.5pt' }}>A cover sheet must be included with each submission of work.</p>
                <p style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>Work submitted without a signed cover sheet will be returned unmarked.</p>
              </div>
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
                        <div className="whitespace-pre-wrap text-[9.5pt]">
                          {section.content.includes('“To be completed in class”') ? (
                            <>
                              <span className="text-red-600 font-bold block text-center mb-4 text-[11pt]">“To be completed in class”</span>
                              {section.content.replace('“To be completed in class”\n\n', '').replace('“To be completed in class”\n', '').replace('“To be completed in class”', '')}
                            </>
                          ) : (
                            section.content
                          )}
                        </div>
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
            {((pageConf.type === 'checklist1' || pageConf.type === 'checklist2') && pageConf.type === 'checklist1' || (pageConf.task === 'task3' && pageConf.type === 'intro')) && taskData && taskData.checklistTitle && (
              <>
                <h1 className="section-title text-center font-bold mt-6 mb-4 uppercase">{taskData.checklistTitle}</h1>
                <div className="mb-4 text-[9.5pt] font-serif">
                  <p className="italic mb-2">{taskData.assessorInstructions?.split('\n\n')[0]}</p>
                  <p className="mb-2">{taskData.assessorInstructions?.split('\n\n')[1]}</p>
                  <p className="font-bold mb-2">{taskData.assessorInstructions?.split('\n\n')[2]}</p>
                  <p>{taskData.assessorInstructions?.split('\n\n')[3]}</p>
                </div>
              </>
            )}

            {/* ════════ Oral Checklist ════════ */}
            {pageConf.oral && taskData && (
              <div className={pageConf.type === 'checklist2' ? "mb-6" : "mt-4 mb-6"}>
                {pageConf.type !== 'checklist2' && (
                  <h3 className="font-bold text-[12pt] mb-2 font-serif">Outcomes:</h3>
                )}
                <table className="w-full border-collapse border-[1.5px] border-black text-[9pt]">
                  {pageConf.type !== 'checklist2' && (
                    <thead>
                      <tr>
                        <th rowSpan={2} className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-2 text-black w-[50%] align-top">
                          <div className="font-bold">Oral Assessment Questions</div>
                          <div className="font-normal mt-1 text-xs">Use questions to confirm the candidates understanding of the task samples<br/>shown below</div>
                          <div className="font-normal mt-1 text-xs">Note: Any additional questions you use during the assessment</div>
                        </th>
                        <th colSpan={2} className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-2 text-black font-bold align-top">
                          Satisfactory
                        </th>
                        <th rowSpan={2} className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-2 text-black font-bold w-[30%] align-top">
                          Comments
                        </th>
                      </tr>
                      <tr>
                        <th className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-1 text-black font-bold w-[10%]">Yes</th>
                        <th className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-1 text-black font-bold w-[10%]">No</th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {pageConf.type === 'checklist1' && (
                      <tr>
                        <td className="border-[1.5px] border-black bg-white font-bold px-3 py-2 text-black" colSpan={4}>
                          Questions
                        </td>
                      </tr>
                    )}
                    {pageConf.oral.map((idx: number) => {
                      const item = taskData.oral?.[idx];
                      if (!item) return null;
                      return (
                        <tr key={`oral-${idx}`}>
                          <td className={`border-[1.5px] border-black px-3 py-2 bg-white ${pageConf.type === 'checklist2' ? 'w-[50%]' : ''}`}>{item}</td>
                          <td className={`border-[1.5px] border-black px-3 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center ${pageConf.type === 'checklist2' ? 'w-[10%]' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}`]: 'yes' })}>
                            {compRecord[`${taskKey}_oral_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                          </td>
                          <td className={`border-[1.5px] border-black px-3 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center ${pageConf.type === 'checklist2' ? 'w-[10%]' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_oral_${idx}`]: 'no' })}>
                            {compRecord[`${taskKey}_oral_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                          </td>
                          <td className={`border-[1.5px] border-black px-3 py-2 bg-white ${pageConf.type === 'checklist2' ? 'w-[30%]' : ''}`}></td>
                        </tr>
                      );
                    })}
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
                          <span>{taskKey === 'task6' ? `Q${q.id} .` : `${q.id}.`}</span>
                          <span className="whitespace-pre-wrap">{q.text}</span>
                        </div>

                        <div className="pl-0 sm:pl-6 mt-2">
                          {q.type === 'radio' && q.options?.map((opt: any, oIdx: number) => {
                            const ansKey = opt.name || `t${taskKey!.replace('task', '')}q${q.id}`;
                            const isChecked = answers[ansKey] === opt.value;
                            return (
                              <div key={oIdx} className="flex gap-2 mb-2 items-center text-[10.5pt]">
                                <input required={isStudent}  
                                  type="radio" 
                                  name={ansKey}
                                  checked={isChecked} 
                                  onChange={(e) => setAnswers({ ...answers, [ansKey]: opt.value })} 
                                  className="mt-0.5 cursor-pointer"
                                />
                                <label 
                                  className="cursor-pointer hover:bg-gray-50" 
                                  onClick={() => setAnswers({ ...answers, [ansKey]: opt.value })}
                                >
                                  {opt.text}
                                </label>
                              </div>
                            );
                          })}

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
                                  else newArr = newArr.filter((v: any) => v !== opt.value);
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
                                  <input required={isStudent} type="radio" checked={answers[part.name] === opt.value} onChange={(e) => setAnswers({ ...answers, [part.name]: opt.value })} />
                                  <label>{opt.text}</label>
                                </div>
                              ))}
                            </div>
                          ))}

                          {q.type === 'text_inputs' && q.textInputs?.map((ti: any, tIdx: number) => (
                            <div key={tIdx} className="mb-4 border border-gray-200 p-2">
                              {ti.image && <img src={ti.image} className="max-w-[200px] mb-2" alt="Diagram" />}
                              <input required={isStudent} type="text" className="border-b border-black w-full outline-none p-1 bg-transparent" placeholder={ti.placeholder} value={answers[ti.name] || ''} onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })} />
                            </div>
                          ))}

                          {q.type === 'custom_q27' && q.parts?.map((part: any, pIdx: number) => (
                            <div key={pIdx} className="mb-6 font-serif pl-8 relative text-[10.5pt]">
                              {part.title && <div className="mb-1">{part.title}</div>}
                              {part.subtitle && <div className="mb-1">{part.subtitle}</div>}
                              {part.text && <div className="mb-1">{part.text}</div>}
                              <div className="mt-1 flex items-center gap-1.5">
                                <div 
                                  className="cursor-pointer inline-block relative px-1 hover:bg-gray-100"
                                  onClick={() => {
                                    setAnswers({ ...answers, [part.name]: answers[part.name] === 'True' ? '' : 'True' });
                                  }}
                                >
                                  True
                                  {answers[part.name] === 'True' && (
                                    <span className="absolute left-1/2 -top-2 -translate-x-1/2 text-red-600 font-bold text-[22px] leading-none z-10 pointer-events-none">✓</span>
                                  )}
                                </div>
                                <span>or</span>
                                <div 
                                  className="cursor-pointer inline-block relative px-1 hover:bg-gray-100"
                                  onClick={() => {
                                    setAnswers({ ...answers, [part.name]: answers[part.name] === 'False' ? '' : 'False' });
                                  }}
                                >
                                  False{part.label.includes('?') ? '?' : ''}
                                  {answers[part.name] === 'False' && (
                                    <span className="absolute left-1/2 -top-2 -translate-x-1/2 text-red-600 font-bold text-[22px] leading-none z-10 pointer-events-none">✓</span>
                                  )}
                                </div>
                              </div>
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
                          onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'S' }) }}
                        >
                          <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                            {compRecord[`${taskKey}_q${q.id}_result`] === 'S' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                          </span>
                          Satisfactory (S)
                        </div>
                        <div
                          className={`w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight ${isStudent ? '' : 'cursor-pointer hover:bg-[#f5d0b5]'}`}
                          onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_q${q.id}_result`]: 'NS' }) }}
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

            {/* ════════ Performance Checklist ════════ */}
            {pageConf.perf && taskData && (
              <div className="mt-4 mb-6">
                {pageConf.type === 'questions' ? (
                  <>
                    {taskData.checklistTitle && (
                      <h2 className="text-[13pt] font-bold text-center mt-8 mb-4 uppercase">{taskData.checklistTitle}</h2>
                    )}
                    <h3 className="font-bold text-[12pt] mb-2 font-serif">Outcomes &ndash; Evidence of performance</h3>
                  </>
                ) : (
                  <h3 className="font-bold text-[12pt] mb-2 font-serif">Evidence of Performance:</h3>
                )}
                <table className="w-full border-collapse border-[1.5px] border-black text-[9pt]">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-2 text-black w-[50%] align-top">
                        {pageConf.type === 'questions' ? (
                          <>
                            <div className="font-bold">Performance indicators</div>
                            <div className="font-bold">Oral questions</div>
                            <div className="font-normal text-xs mb-1 mt-1 text-[#333]">Use the additional space to note any critical oral questions asked.</div>
                            <div className="font-bold">Did the candidate:</div>
                          </>
                        ) : (
                          <span className="font-bold">Did the Candidate Satisfactorily:</span>
                        )}
                      </th>
                      <th colSpan={2} className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-2 text-black font-bold align-top">
                        Satisfactory
                      </th>
                      <th rowSpan={2} className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-2 text-black font-bold w-[20%] align-top">
                        Comments
                      </th>
                    </tr>
                    <tr>
                      <th className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-1 text-black font-bold w-[10%]">Yes</th>
                      <th className="border-[1.5px] border-black bg-[#a6a6a6] text-left px-3 py-1 text-black font-bold w-[10%]">No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageConf.type === 'checklist1' && taskData.performanceHeader && (
                      <tr>
                        <td colSpan={4} className="border-[1.5px] border-black bg-[#e0e0e0] font-bold px-3 py-2 text-black">
                          {taskData.performanceHeader}
                        </td>
                      </tr>
                    )}
                    {pageConf.type === 'questions' && (
                      <tr>
                        <td colSpan={4} className="border-[1.5px] border-black bg-white h-[28px]"></td>
                      </tr>
                    )}
                    {pageConf.perf.map((idx: number) => {
                      const item = taskData.performance?.[idx] || taskData.checklistItems?.[idx];
                      if (!item) return null;
                      return (
                        <tr key={`perf-${idx}`}>
                          <td className="border-[1.5px] border-black px-3 py-2 bg-white">{item}</td>
                          <td className="border-[1.5px] border-black px-3 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'yes' })}>
                            {compRecord[`${taskKey}_perf_${idx}`] === 'yes' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                          </td>
                          <td className="border-[1.5px] border-black px-3 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center" onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${taskKey}_perf_${idx}`]: 'no' })}>
                            {compRecord[`${taskKey}_perf_${idx}`] === 'no' ? <span className="text-red-600 font-bold text-lg leading-none">✓</span> : ''}
                          </td>
                          <td className="border-[1.5px] border-black px-3 py-2 bg-white"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {pageConf.type === 'questions' && (
                  <div className="font-bold text-[9pt] mt-2 font-serif">
                    Additional sheet may be used if required by Instructor.
                  </div>
                )}
              </div>
            )}

            {/* ════════ Feedback & Signature Block ════════ */}
            {pageConf.feedback && taskData && (
              <div className="mt-8" style={{ pageBreakInside: 'avoid' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '12px' }}>Comments/Feedback to Participant</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888', marginBottom: '20px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '60%', borderRight: '1.5px solid #888', padding: '8px', verticalAlign: 'top' }}>
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
                                <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                              ) : (
                                <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? 'Click to sign' : ''}</span>
                              )}
                            </div>
                            <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                              {answers.student_signature_url && (
                                <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Date:</span>
                            <span className="no-print" style={{ borderBottom: '1.5px solid black', flex: 1, display: 'inline-block', height: '24px', position: 'relative' }}>
                              <input required={isStudent} 
                                type="date"
                                style={{ width: '100%', height: '100%', outline: 'none', border: 'none', background: 'transparent', fontFamily: "'Times New Roman', serif", fontSize: '10pt', margin: 0, padding: '0 0 0 4px', fontWeight: 'bold', cursor: 'pointer' }}
                                value={answers.student_date || submitDate || ''}
                                onChange={(e) => setAnswers({ ...answers, student_date: e.target.value })}
                              />
                            </span>
                            <span className="hidden print:inline-block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', paddingLeft: '4px', fontWeight: 'bold' }}>
                              {formatDisplayDate(answers.student_date || submitDate || '')}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ border: '1.5px solid #888', padding: '8px', minHeight: '120px', marginBottom: '20px' }}>
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

                <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '13pt' }}>
                  Result:{' '}
                  <span
                    className={`inline-block mx-1 ${isStudent ? '' : 'cursor-pointer'}`}
                    onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'S' }) }}
                    style={{ padding: '4px' }}
                  >
                    Satisfactory <span className="relative inline-block px-1">(S)
                    {compRecord[`${taskKey}_result`] === 'S' && (
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '130%', height: '140%', pointerEvents: 'none' }}></span>
                    )}</span>
                  </span>
                  <span style={{ margin: '0 2px' }}>/</span>
                  <span
                    className={`inline-block mx-1 ${isStudent ? '' : 'cursor-pointer'}`}
                    onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, [`${taskKey}_result`]: 'NS' }) }}
                    style={{ padding: '4px' }}
                  >
                    Not Satisfactory <span className="relative inline-block px-1">(NS)
                    {compRecord[`${taskKey}_result`] === 'NS' && (
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid #cc0000', borderRadius: '50%', width: '115%', height: '140%', pointerEvents: 'none' }}></span>
                    )}</span>
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #888' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '60%', borderRight: '1.5px solid #888', padding: '8px', verticalAlign: 'top' }}>
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
                                <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                              ) : (
                                <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
                              )}
                            </div>
                            <div className="hidden print:block" style={{ borderBottom: '1.5px solid black', flex: 1, height: '20px', position: 'relative' }}>
                              {compRecord.assessor_signature && (
                                <img src={compRecord.assessor_signature} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
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
