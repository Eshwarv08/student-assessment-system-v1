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
  const [localCompRecord, setLocalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
  const compRecord = externalCompRecord || localCompRecord;
  const _setCompRecord = externalSetCompRecord || setLocalCompRecord;
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
      if (sigModal?.field === 'student_signature' || sigModal?.field === 'learner_dec_sig' || sigModal?.field === 'outcome_student_ack_sig') {
        setAnswers({ ...answers, [sigModal.field]: dataUrl, student_signature_url: dataUrl });
      } else {
        const updates: any = { [sigModal!.field]: dataUrl };
        if (sigModal!.field.includes('assessor_sig')) {
          updates.assessor_signature = dataUrl;
        }
        setCompRecord({ ...compRecord, ...updates });
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



  const renderAttemptsSignature = (prefix = 'pa2') => (
    <tr>
      <td colSpan={2} className="p-0 border-t border-black">
        <table className="w-full text-[9pt] border-collapse table-fixed">
          <thead className="bg-gray-200">
            <tr>
              <th className="border-r border-b border-black p-2 font-bold w-[20%] text-center">Initial Attempt<br />Circle S or NYS</th>
              <th className="border-r border-b border-black p-2 font-bold w-[20%] text-center">Initial Attempt<br />Date</th>
              <th className="border-r border-b border-black p-2 font-bold w-[20%] text-center">1st Reattempt<br />S or NYS<br />Date</th>
              <th className="border-r border-b border-black p-2 font-bold w-[20%] text-center">2nd Reattempt<br />S or NYS<br />& Date</th>
              <th className="border-b border-black p-2 font-bold w-[20%] text-center">Assessors<br />Initials</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td className="border-r border-black p-2 text-center align-middle font-bold">
                <div className="flex flex-row items-center justify-center gap-1">
                  <span className={`cursor-pointer ${compRecord[`${prefix}_attempt_initial`] === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-6 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${prefix}_attempt_initial`]: 'S' })}>S</span>
                  <span>/</span>
                  <span className={`cursor-pointer ${compRecord[`${prefix}_attempt_initial`] === 'NYS' ? 'border-[1.5px] border-red-600 rounded-full px-1 h-6 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${prefix}_attempt_initial`]: 'NYS' })}>NYS</span>
                </div>
              </td>
              <td className="border-r border-black p-2 text-center align-middle font-bold text-lg relative">
                <input type="date" className="absolute inset-0 w-full h-full bg-transparent text-center focus:outline-none text-[11px] font-normal px-2" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
              </td>
              <td className="border-r border-black p-2 text-center align-middle font-bold relative">
                <div className="flex flex-col items-center justify-center h-full gap-1">
                  <div className="flex flex-row items-center justify-center gap-1 text-[10px]">
                    <span className={`cursor-pointer ${compRecord[`${prefix}_attempt_1st`] === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-5 h-5 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${prefix}_attempt_1st`]: 'S' })}>S</span>
                    <span>/</span>
                    <span className={`cursor-pointer ${compRecord[`${prefix}_attempt_1st`] === 'NYS' ? 'border-[1.5px] border-red-600 rounded-full px-1 h-5 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${prefix}_attempt_1st`]: 'NYS' })}>NYS</span>
                  </div>
                  <input type="date" className="w-full bg-transparent text-center focus:outline-none text-[10px] font-normal" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </div>
              </td>
              <td className="border-r border-black p-2 text-center align-middle font-bold relative">
                <div className="flex flex-col items-center justify-center h-full gap-1">
                  <div className="flex flex-row items-center justify-center gap-1 text-[10px]">
                    <span className={`cursor-pointer ${compRecord[`${prefix}_attempt_2nd`] === 'S' ? 'border-[1.5px] border-red-600 rounded-full w-5 h-5 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${prefix}_attempt_2nd`]: 'S' })}>S</span>
                    <span>/</span>
                    <span className={`cursor-pointer ${compRecord[`${prefix}_attempt_2nd`] === 'NYS' ? 'border-[1.5px] border-red-600 rounded-full px-1 h-5 flex items-center justify-center' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, [`${prefix}_attempt_2nd`]: 'NYS' })}>NYS</span>
                  </div>
                  <input type="date" className="w-full bg-transparent text-center focus:outline-none text-[10px] font-normal" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </div>
              </td>
              <td className="p-2 text-center align-middle">
                <div onClick={() => !isStudent && openSigModal(`${prefix}_assessor_sig`, 'comp')} className="w-full h-full min-h-[30px] flex items-center justify-center cursor-pointer">
                  {(compRecord.assessor_signature || compRecord[`${prefix}_assessor_sig`]) ? <img src={compRecord.assessor_signature || compRecord[`${prefix}_assessor_sig`]} className="max-h-[35px] max-w-[80px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  );

  const renderSectionIcon = (title: string) => {
    if (!title) return null;
    const t = title.toLowerCase();
    if (t.includes('assessment task description')) return <FileText className="inline-block mr-2 text-blue-800" size={18} />;
    if (t.includes('resources required')) return <Wrench className="inline-block mr-2 text-blue-800" size={18} />;
    if (t.includes('timing')) return <Clock className="inline-block mr-2 text-blue-800" size={18} />;
    if (t.includes('assessment instructions')) return <Info className="inline-block mr-2 text-blue-800" size={18} />;
    return null;
  };


  const CustomTaskHeader = () => (
    <div className="flex justify-between items-end mb-2 pb-2">
      <div className="font-bold underline text-[10pt] pb-1">
        ICTCBL334 ICTCBL329 ICTCBL249 ICTCBL253 - Pit, Pipe, Manholes and Cable Hauling
      </div>
      <img src="/assets/acta-logo.png" alt="ACTA Logo" className="h-[60px] object-contain" />
    </div>
  );

  const InnerHeader = () => (
    <div className="inner-header">
      <div className="top-row">
        <div>
          <span className="underline-bold">Assessment book</span><br />
          <span className="underline-bold">{assessmentQuestions.adminInfo.unitCodeName}</span>
        </div>
        <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
      </div>
    </div>
  );

  const PageFooter = ({ n }: { n: number }) => (
    <div className="page-footer mt-auto pt-[4mm] border-t border-black flex justify-between text-[8pt]">
      <span></span>
      <span>Page {n} of 45</span>
    </div>
  );


  return (
    <div className="q15-booklet-view">
      <style dangerouslySetInnerHTML={{
        __html: `
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
` }} />
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
        <div className="cover-outer-border" style={{ border: '3.5px solid #1a5fa8', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="cover-inner-border" style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }} />
            <div className="cover-title" style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
            <div className="cover-subtitle" style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px', textAlign: 'center' }}>
              {assessmentQuestions.metadata.code}
            </div>
            <div className="cover-subtitle" style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm', textAlign: 'center' }}>
              {assessmentQuestions.metadata.subtitle}
            </div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="cover-student-name-container" style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '100%', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>{assessmentQuestions.metadata.rtoName}</div>
            </div>
          </div>
        </div>
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 w-full border-t border-black border-b mb-4 mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0">Knowledge Assessment Task 1 - Checklist</h1>
        </div>
        <table className="w-full border-collapse border border-black text-[9.5pt]">
          <tbody>
            <tr>
              <td colSpan={4} className="border border-black p-2 font-medium">
                Student's name: <span className="inline-block bg-[#fff2cc] min-w-[120px] min-h-[18px] px-2 align-bottom font-bold">{studentName}</span>
              </td>
            </tr>
            <tr>
              <td rowSpan={2} className="border border-black p-2 font-medium w-[60%] align-top">
                Did the student:
              </td>
              <td colSpan={2} className="border border-black p-1 text-center font-medium align-middle text-[8.5pt]">
                Completed<br />successfully
              </td>
              <td rowSpan={2} className="border border-black p-2 text-center align-top font-medium w-[20%]">
                Comments
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-center font-medium text-[8.5pt] w-[10%]">Yes</td>
              <td className="border border-black p-1 text-center font-medium text-[8.5pt] w-[10%]">No</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Complete all questions correctly?</td>
              <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'ka1_q1': compRecord['ka1_q1'] === 'Yes' ? '' : 'Yes' })}>
                <div className="flex items-center justify-center min-h-[20px] relative">
                  {compRecord['ka1_q1'] === 'Yes' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                </div>
              </td>
              <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'ka1_q1': compRecord['ka1_q1'] === 'No' ? '' : 'No' })}>
                <div className="flex items-center justify-center min-h-[20px] relative">
                  {compRecord['ka1_q1'] === 'No' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                </div>
              </td>
              <td className="border border-black p-2 text-center align-middle">
                <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord['ka1_q1_comments'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'ka1_q1_comments': e.target.value })} readOnly={isStudent} />
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="border border-black p-2 font-medium bg-[#d9d9d9]">
                Show an effective understanding of the following Knowledge requirements of the unit.
              </td>
            </tr>
            {[{ id: 'ka1_q2', text: 'ICTCBL334 KE1. & ICTCBL329 KE4 & ICTCBL249 KE4 & ICTCBL253 KE1. features and operating requirements of hauling/excavation and installation to select appropriate equipment' },
            { id: 'ka1_q3', text: 'ICTCBL334 KE2 & ICTCBL253 KE2. existing underground services' },
            { id: 'ka1_q4', text: 'ICTCBL334 KE3. & ICTCBL329 KE5 & ICTCBL249 KE5 & ICTCBL253 KE3. Industry & manufacturer requirements for safe operation of equipment' },
            { id: 'ka1_q5', text: 'ICTCBL334 KE4. & ICTCBL329 KE2 &ICTCBL249 KE2 & ICTCBL253 KE4. legislation, regulations, codes, standards, and other formal agreements that impact on the work activity/hauling' },
            { id: 'ka1_q6', text: 'ICTCBL334 KE5 & ICTCBL253 KE5. construction design plans' },
            { id: 'ka1_q7', text: 'ICTCBL334 KE6. & ICTCBL329 KE6. & ICTCBL249 KE6 & ICTCBL253 KE6specific work health and safety and environmental requirements relating to the activity and site conditions' },
            { id: 'ka1_q8', text: 'ICTCBL334 KE7 & ICTCBL253 KE7. components required for enclosures, pits and conduit' },
            { id: 'ka1_q9', text: 'ICTCBL334 KE8 & ICTCBL253 KE8. methods of installing enclosures and conduit as they apply to manufacturer specifications and regulatory requirements' },
            { id: 'ka1_q10', text: 'ICTCBL334 KE9. & ICTCBL329 KE6 & ICTCBL249 KE6 & ICTCBL253 KE9 typical issues and challenges that occur on site.' },
            { id: 'ka1_q11', text: 'ICTCBL329 KE1. &ICTCBL249 KE1 Australian Communications and Media Authority (ACMA) regulatory requirements for Telecommunications Cabling Provider Rules' },
            { id: 'ka1_q12', text: 'ICTCBL329 KE3 & ICTCBL249 KE3 rodding, roping and mandrel techniques' },
            { id: 'ka1_q13', text: 'ICTCBL329 KE7. & ICTCBL249 KE7 precautions associated with over- hauling through occupied conduits.' }
            ].map((q, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
                <td className="border border-black p-2 text-center align-middle">
                  <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-2 font-medium">Task Outcome:</td>
              <td colSpan={2} className="border border-black p-2 text-center align-middle">
                <div className="flex gap-2 items-center justify-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'ka1_outcome': compRecord['ka1_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                  <span>Satisfactory</span>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center">
                    {compRecord['ka1_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                  </div>
                </div>
              </td>
              <td className="border border-black p-2 text-center align-middle">
                <div className="flex gap-2 items-center justify-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'ka1_outcome': compRecord['ka1_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                  <span>Not Satisfactory</span>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center">
                    {compRecord['ka1_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Assessor signature</td>
              <td colSpan={3} className="border border-black p-2 text-center align-middle">
                <div onClick={() => !isStudent && openSigModal('ka1_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                  {(compRecord.assessor_signature || compRecord['ka1_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['ka1_assessor_sig']} className="max-h-[30px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Assessor name</td>
              <td colSpan={3} className="border border-black p-2 text-center align-middle">
                <input type="text" className="w-full bg-transparent text-center focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Date</td>
              <td colSpan={3} className="border border-black p-2 text-center align-middle">
                <input type="date" className="w-full bg-transparent text-center focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={2} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 w-full border-t border-black border-b mb-4 mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 1</h1>
        </div>
        <div className="mb-2 break-inside-avoid">
          <h3 className="font-medium text-[10.5pt] mb-2 text-black">Performance Criteria Mapping</h3>
        </div>
        <table className="w-full border-collapse border border-black text-[9.5pt]">
          <tbody>
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Criteria assessed in this task - ICTCBL334</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pc_334_1_1', text: '1.1 Obtain construction design plan from appropriate personnel and determine and obtain type of underground enclosure specified' },
              { id: 'pa1_pc_334_1_2', text: '1.2 Arrange access to site according to required enterprise procedure' },
              { id: 'pa1_pc_334_1_3', text: '1.3 Inform appropriate personnel of existing and potential worksite hazards' },
              { id: 'pa1_pc_334_1_4', text: '1.4 Verify location of proposed installation according to appropriate plans obtained from authorised personnel' },
              { id: 'pa1_pc_334_1_5', text: '1.5 Obtain information about location of other services from relevant authorities' },
              { id: 'pa1_pc_334_1_6', text: '1.6 Organise plant, tools and equipment for given work and safe work practice' },
              { id: 'pa1_pc_334_1_7', text: '1.7 Place recognised barriers during construction according to safety and enterprise requirements' },
              { id: 'pa1_pc_334_3_5', text: '3.5 Notify appropriate personnel of job completion and obtain sign-off' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Criteria assessed in this task - ICTCBL249</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pc_249_1_1', text: '1.1 Arrange access to site according to required procedure' },
              { id: 'pa1_pc_249_1_2', text: '1.2 Inform appropriate personnel of identified hazards on worksite' },
              { id: 'pa1_pc_249_1_3', text: '1.3 Confirm hauling location of proposed cable according to appropriate plan specifications obtained from authorized personnel' },
              { id: 'pa1_pc_249_1_4', text: '1.4 Obtain information about proposed locations of other services from relevant authorities' },
              { id: 'pa1_pc_249_1_5', text: '1.5 Set up tools and equipment required for safe work practice according to enterprise guidelines' },
              { id: 'pa1_pc_249_1_6', text: '1.6 Check for dangerous gases and place guards around open manholes according to work health and safety (WHS) and environmental requirements' },
              { id: 'pa1_pc_249_5_3', text: '5.3 Reinstate site to customer satisfaction and dispose of waste in an environmentally safe manner' },
              { id: 'pa1_pc_249_5_4', text: '5.4 Notify appropriate personnel about job completion and obtain sign-off' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Criteria assessed in this task - ICTCBL329</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pc_329_1_1', text: '1.1 Access site according to required enterprise procedures' },
              { id: 'pa1_pc_329_1_2', text: '1.2 Verify cable installation requirements from plans and recognise constraints' },
              { id: 'pa1_pc_329_1_3', text: '1.3 Identify from plans, correct duct to be hauled' },
              { id: 'pa1_pc_329_1_4', text: '1.4 Inform appropriate personnel of existing and potential worksite hazards' },
              { id: 'pa1_pc_329_1_6', text: '1.6 Select suitable tools, equipment, and protective equipment to meet required industry standards' },
              { id: 'pa1_pc_329_1_7', text: '1.7 Check for dangerous gases and place guards around open manholes following work health and safety (WHS) nd environmental requirements' },
              { id: 'pa1_pc_329_1_8', text: '1.8 Confirm correct duct/conduit to be utilised for hauling at site and access to intermediate manholes/pits along a hauling route' },
              { id: 'pa1_pc_329_reinstate', text: 'Reinstate site to customer satisfaction and dispose of waste in environmentally safe manner as required' },
              { id: 'pa1_pc_329_notify', text: 'Notify appropriate personnel and obtain sign-off' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <PageFooter n={3} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 w-full border-t border-black border-b mb-4 mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 1</h1>
        </div>
        <div className="mb-2 break-inside-avoid">
          <h3 className="font-medium text-[10.5pt] mb-2 text-black">Performance Criteria Mapping Continued</h3>
        </div>
        <table className="w-full border-collapse border border-black text-[9.5pt] mb-4">
          <tbody>
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Criteria assessed in this task - ICTCBL253</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pc_253_1_1', text: '1.1 Obtain construction design plan from appropriate personnel to scope work and arrange for site access' },
              { id: 'pa1_pc_253_1_2', text: '1.2 Notify appropriate personnel of identified safety hazards and other services that will need to be considered' },
              { id: 'pa1_pc_253_1_3', text: '1.3 Obtain plant, tools, and safety equipment to perform tasks safely and efficiently' },
              { id: 'pa1_pc_253_1_4', text: '1.4 Determine type of underground pit/manhole required for project as specified in construction design plan' },
              { id: 'pa1_pc_253_2_1', text: '2.1 Use tools according to enterprise guidelines and work health and safety (WHS) regulations' },
              { id: 'pa1_pc_253_4_1', text: '4.1 Complete reports and record alterations to plans using appropriate symbols, according to enterprise policy' },
              { id: 'pa1_pc_253_4_2', text: '4.2 Complete all labelling requirements according to industry standard' },
              { id: 'pa1_pc_253_4_5', text: '4.5 Notify appropriate personnel of job completion and obtain sign-off' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
              {renderAttemptsSignature('pa1_att1')}
          </tbody>
        </table>
        <div className="mb-2 break-inside-avoid mt-6">
          <h3 className="font-medium text-[10.5pt] mb-2 text-black">Performance Evidence Mapping</h3>
        </div>
        <table className="w-full border-collapse border border-black text-[9.5pt] mb-4">
          <tbody>
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Evidence assessed in this task-ICTCBL334</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pe_334_pe1', text: 'PE1. interpret and apply design plans and prepare for construction' },
              { id: 'pa1_pe_334_pe2', text: 'PE2. use specialised hand or power tools and equipment normally used for excavation, pipe, pit and conduit installation and site restoration, safely' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Evidence assessed in this task-ICTCBL249</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pe_249_pe1', text: 'PE1. plan the works and prepare the site' },
              { id: 'pa1_pe_249_pe2', text: 'PE2. read and interpret drawings and designs to interpret installation requirements' },
              { id: 'pa1_pe_249_pe8', text: 'PE8. prepare all reports and records to industry and enterprise standards.' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Evidence assessed in this task-ICTCBL329</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pe_329_pe4', text: 'PE4. use specialised hand or power tools and equipment for hauling cabling safely' },
              { id: 'pa1_pe_329_pe5', text: 'PE5. read and interpret plan drawings' },
              { id: 'pa1_pe_329_pe6', text: 'PE6. restore site and complete documentation' },
              { id: 'pa1_pe_329_pe7', text: 'PE7. comply with all related safety requirements and work practices.' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold">Performance Evidence assessed in this task-ICTCBL253</td>
              <td className="border border-black bg-[#d9d9d9] p-2 text-center font-bold w-[15%]">Tick Completed</td>
            </tr>
            {[
              { id: 'pa1_pe_253_pe1', text: 'PE1. interpret and apply design plans and prepare for construction' },
              { id: 'pa1_pe_253_pe7', text: 'PE7. apply related work health and safety (WHS) requirements and work practices associated with excavation, enclosure installation and site restoration.' }
            ].map(q => (
              <tr key={q.id}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
              </tr>
            ))}
              {renderAttemptsSignature('pa1_att2')}
          </tbody>
        </table>

        <PageFooter n={4} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 w-full border-t border-black border-b mb-4 mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 1 - Checklist</h1>
        </div>
        <table className="w-full border-collapse border border-black text-[9.5pt]">
          <tbody>
            <tr>
              <td colSpan={4} className="border border-black p-2 font-medium">
                Student's name: <span className="inline-block min-w-[120px] min-h-[18px] px-2 align-bottom font-bold">{studentName}</span>
              </td>
            </tr>
            <tr>
              <td rowSpan={2} className="border border-black p-2 font-medium w-[60%] align-top">
                Did the student:
              </td>
              <td colSpan={2} className="border border-black p-1 text-center font-medium align-middle text-[8.5pt]">
                Completed<br />successfully
              </td>
              <td rowSpan={2} className="border border-black p-2 text-center align-top font-medium w-[20%]">
                Comments
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-center font-medium text-[8.5pt] w-[10%]">Yes</td>
              <td className="border border-black p-1 text-center font-medium text-[8.5pt] w-[10%]">No</td>
            </tr>
            {[
              { id: 'pa1_cl_1', text: 'Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice' },
              { id: 'pa1_cl_2', text: 'Refer to all tool/equipment instructions/manufacturers guidelines prior to use.' },
              { id: 'pa1_cl_3', text: 'Complete a JSA for the task' },
              { id: 'pa1_cl_4', text: 'Assemble manhole guards around a manhole' },
              { id: 'pa1_cl_5', text: 'Gas check manhole access hole' },
              { id: 'pa1_cl_6', text: 'Remove manhole lids with pit key and store lids correctly' },
              { id: 'pa1_cl_7', text: 'Assemble manhole guards around the pits' },
              { id: 'pa1_cl_8', text: 'Remove pit lids with pit key and store correctly' },
              { id: 'pa1_cl_9', text: 'Gas checks the manhole as per spot sampling procedure and record readings' },
              { id: 'pa1_cl_10', text: 'Replace manhole lids and store guards in the correct location' },
              { id: 'pa1_cl_11', text: 'Submit the completed work to your supervisor (assessor) for Inspection' }
            ].map((q, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2 font-medium">{q.text}</td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
                <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                  <div className="flex items-center justify-center min-h-[20px] relative">
                    {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-2xl absolute -top-1">✓</span>}
                  </div>
                </td>
                <td className="border border-black p-2 text-center align-middle">
                  <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-2 font-medium">Task Outcome:</td>
              <td colSpan={2} className="border border-black p-2 text-center align-middle">
                <div className="flex gap-2 items-center justify-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa1_outcome': compRecord['pa1_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                  <span>Satisfactory</span>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center">
                    {compRecord['pa1_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                  </div>
                </div>
              </td>
              <td className="border border-black p-2 text-center align-middle">
                <div className="flex gap-2 items-center justify-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa1_outcome': compRecord['pa1_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                  <span>Not Satisfactory</span>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center">
                    {compRecord['pa1_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Assessor signature</td>
              <td colSpan={3} className="border border-black p-2 text-center align-middle">
                <div onClick={() => !isStudent && openSigModal('pa1_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                  {(compRecord.assessor_signature || compRecord['pa1_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa1_assessor_sig']} className="max-h-[30px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Assessor name</td>
              <td colSpan={3} className="border border-black p-2 text-center align-middle">
                <input type="text" className="w-full bg-transparent text-center focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Date</td>
              <td colSpan={3} className="border border-black p-2 text-center align-middle">
                <input type="date" className="w-full bg-transparent text-center focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
              </td>
            </tr>
          </tbody>
        </table>

        <PageFooter n={5} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 mb-6 w-full flex-shrink-0 border-t border-b border-black mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0 uppercase">Practical Assessment Task 1</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[14pt] text-black text-left m-0 p-0 mb-2">Assessment Instructions</div>
          <div className="font-bold mb-4">Complete the following activities:</div>
          <ol className="list-decimal pl-8 whitespace-pre-wrap mb-4 text-[11pt]">
            <li>Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice</li>
            <li>Refer to all tool/equipment instructions/manufacturers guidelines prior to use.</li>
            <li>Complete a JSA for the task</li>
            <li>Assemble manhole guards around a manhole</li>
            <li>Gas check manhole access hole</li>
            <li>Remove manhole lids with pit key and store lids correctly</li>
            <li>Assemble manhole guards around the pits</li>
            <li>Remove pit lids with pit key and store correctly</li>
            <li>Gas check the manhole as per spot sampling procedure and record readings</li>
            <li>Replace manhole lids and store guards in the correct location</li>
            <li>Submit your completed work to your supervisor (assessor) for inspection</li>
          </ol>
        </div>
        <div className="mb-6 flex flex-col items-start break-inside-avoid mt-8">
          <div className="text-[14pt] text-black text-left w-full m-0 p-0 mb-4">Plan of proposed work</div>
          <div className="flex justify-center w-full">
            <img src="/assets/question-15/task1.png" alt="Plan of proposed work" className="max-w-[700px] max-h-[250px] object-contain" />
          </div>
        </div>
        <div className="mb-6 break-inside-avoid mt-8">
          <div className="text-[14pt] text-black text-left w-full m-0 p-0 mb-4">Recorded Gas Levels</div>
          <div className="flex justify-center w-full">
            <table className="border-collapse border border-black text-[12pt] w-[50%]">
              <thead>
                <tr>
                  <th className="border border-black bg-gray-300 p-2 text-left font-bold w-[40%]">Gas</th>
                  <th className="border border-black bg-gray-300 p-2 text-left font-bold w-[60%]">Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-left">O2</td>
                  <td className="border border-black p-2 text-right relative">
                    <input type="text" className="w-full h-full absolute inset-0 bg-transparent text-right pr-6 focus:outline-none" value={compRecord['pa1_gas_o2'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa1_gas_o2': e.target.value })} readOnly={isStudent} />
                    <span className="relative z-10 pointer-events-none">%</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">H2S</td>
                  <td className="border border-black p-2 text-right relative">
                    <input type="text" className="w-full h-full absolute inset-0 bg-transparent text-right pr-12 focus:outline-none" value={compRecord['pa1_gas_h2s'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa1_gas_h2s': e.target.value })} readOnly={isStudent} />
                    <span className="relative z-10 pointer-events-none">PPM</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">CO</td>
                  <td className="border border-black p-2 text-right relative">
                    <input type="text" className="w-full h-full absolute inset-0 bg-transparent text-right pr-12 focus:outline-none" value={compRecord['pa1_gas_co'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa1_gas_co': e.target.value })} readOnly={isStudent} />
                    <span className="relative z-10 pointer-events-none">PPM</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-left">LEL</td>
                  <td className="border border-black p-2 text-right relative">
                    <input type="text" className="w-full h-full absolute inset-0 bg-transparent text-right pr-6 focus:outline-none" value={compRecord['pa1_gas_lel'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa1_gas_lel': e.target.value })} readOnly={isStudent} />
                    <span className="relative z-10 pointer-events-none">%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <PageFooter n={6} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 mb-6 w-full flex-shrink-0 border-t border-b border-black mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0 uppercase">Practical Assessment Task 1</h1>
        </div>
        <div className="mb-6 break-inside-avoid">
          <div className="text-[14pt] text-black text-left m-0 p-0 mb-2">Assessment Task Description</div>
          <div className="text-[10pt] leading-relaxed mb-4">
            For this assessment, you are working as a telco technician. You have been assigned a task by your supervisor to prepare the site for access and hauling of a new 50 pair cable to replace an existing cable between two pits adjacent to a manhole, and installing a new pit, a prefabricated manhole, in preparation for jointing. The supervisor has advised that this area is known for gas and that the adjacent manhole and the pits should be opened to allow the ducts to vent. You are also required to check for gas as per your workplace guidelines.
          </div>
          <div className="text-[10pt] leading-relaxed">
            Prior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and addressed hazards, unwanted events and potential risks for the job.
          </div>
        </div>
        <div className="mb-6 break-inside-avoid">
          <div className="text-[14pt] text-black text-left m-0 p-0 mb-4">Resources Required</div>
          <ul className="list-disc pl-8 whitespace-pre-wrap text-[10pt] leading-relaxed">
            <li>Learners Guide</li>
            <li>Student Assessment Pack</li>
            <li>Blue or Black Pen</li>
            <li>WHS/OHS Acts/Regulations as applicable to the state of delivery</li>
            <li>Codes of practice
              <ul className="list-circle pl-8 mt-1 mb-1">
                <li>How to manage work health and safety risks</li>
                <li>Managing the work environment and facilities</li>
                <li>Managing risks of plant in the workplace</li>
                <li>Managing noise preventing hearing loss work</li>
                <li>Managing electrical risks in the workplace</li>
                <li>Managing the risk of falls at workplaces</li>
              </ul>
            </li>
            <li>Workplace procedure 01687W01 Working at Telstra Manholes and Pits</li>
            <li>JSA-Included in this assessment pack</li>
            <li>Installed two lid man-hole</li>
            <li>Installed #6 Pit x2</li>
            <li>Manhole guards*</li>
            <li>Pit keys x2*</li>
            <li>Gas detector*</li>
            <li>Gas action chart</li>
            <li>Retro reflective vest*</li>
            <li>Gloves*</li>
            <li>Hard Hat*</li>
            <li>Safety glasses*</li>
            <li>Manufacturers specifications and operating instructions for all tools & equipment specified with a *.</li>
          </ul>
        </div>
        <div className="mb-6 break-inside-avoid">
          <div className="text-[14pt] text-black text-left m-0 p-0 mb-4">Timing</div>
          <div className="text-[10pt]">Your assessor will advise you of the due date of these submissions.</div>
        </div>
        <PageFooter n={7} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#c2d9f2] py-2 px-3 w-full border-t border-black border-b mb-4 mt-2">
          <h1 className="text-[13pt] font-bold text-black text-left m-0 p-0">KNOWLEDGE ASSESSMENT TASK 1 – WRITTEN QUESTIONS AND ANSWERS</h1>
        </div>
        <div className="mb-4"><h3 className="font-bold mb-2 flex items-center">{renderSectionIcon("Student Instructions")}Student Instructions</h3><p className="whitespace-pre-wrap">Choose the correct answer for each of the following questions. Refer to your learner guide where specified. For questions referring to a plan, use the provided image.</p></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>1.</span><span className="whitespace-pre-wrap">The NBN (National Broadband Network) at the moment consists entirely of:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q1" checked={answers['t2q1'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q1': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q1': 'a' })}>
                  a) Copper cable
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q1" checked={answers['t2q1'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q1': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q1': 'b' })}>
                  b) Cat 7 cabling
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q1" checked={answers['t2q1'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q1': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q1': 'c' })}>
                  c) Optical Fibre
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q1" checked={answers['t2q1'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q1': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q1': 'd' })}>
                  d) Coaxial cable
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q1': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q1'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q1': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q1'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>2.</span><span className="whitespace-pre-wrap">Identify whether the following statement is true or false: Category 3 copper cable is mainly used for voice applications.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q2" checked={answers['t2q2'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q2': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q2': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q2" checked={answers['t2q2'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q2': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q2': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q2': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q2'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q2': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q2'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>3.</span><span className="whitespace-pre-wrap">The Australian Standard that specifies installation requirements for customer cabling is:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q3" checked={answers['t2q3'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q3': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q3': 'a' })}>
                  a) AUSTRALIAN STANDARD AS/NZ 3000:2007
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q3" checked={answers['t2q3'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q3': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q3': 'b' })}>
                  b) | 017153a07 | TELSTRA’S LEAD-IN TRENCHING REQUIREMENTS.
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q3" checked={answers['t2q3'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q3': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q3': 'c' })}>
                  c) AUSTRALIAN STANDARD AS/CA S008:2010
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q3" checked={answers['t2q3'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q3': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q3': 'd' })}>
                  d) AUSTRALIAN STANDARD AS/CA S009:2013
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q3': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q3'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q3': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q3'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>4.</span><span className="whitespace-pre-wrap">The Cable Provider Rules in Australia are:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q4" checked={answers['t2q4'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q4': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q4': 'a' })}>
                  a) An industry-run registration scheme designed to promote self-regulation
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q4" checked={answers['t2q4'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q4': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q4': 'b' })}>
                  b) A government run registration scheme designed to promote government regulation
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q4" checked={answers['t2q4'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q4': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q4': 'c' })}>
                  c) A scheme in industry that is no longer used because of self-regulation
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q4" checked={answers['t2q4'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q4': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q4': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q4': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q4'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q4': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q4'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>5.</span><span className="whitespace-pre-wrap">To manage health and safety on a worksite there should be:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q5" checked={answers['t2q5'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q5': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q5': 'a' })}>
                  a) Hazard management plan
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q5" checked={answers['t2q5'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q5': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q5': 'b' })}>
                  b) Free hard hats
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q5" checked={answers['t2q5'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q5': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q5': 'c' })}>
                  c) Weather management plan
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q5" checked={answers['t2q5'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q5': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q5': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q5': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q5'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q5': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q5'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>6.</span><span className="whitespace-pre-wrap">Before work begins, approvals should be obtained from:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q6" checked={answers['t2q6'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q6': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q6': 'a' })}>
                  a) Likelihood that nothing will go wrong so don’t bother
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q6" checked={answers['t2q6'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q6': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q6': 'b' })}>
                  b) No approvals are required
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q6" checked={answers['t2q6'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q6': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q6': 'c' })}>
                  c) Authorities and asset owners
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q6" checked={answers['t2q6'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q6': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q6': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q6': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q6'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q6': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q6'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={8} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>7.</span><span className="whitespace-pre-wrap">Typical tools and equipment may include:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q7" checked={answers['t2q7'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q7': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q7': 'a' })}>
                  a) Shovels
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q7" checked={answers['t2q7'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q7': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q7': 'b' })}>
                  b) Trenching equipment
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q7" checked={answers['t2q7'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q7': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q7': 'c' })}>
                  c) Jointing equipment
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q7" checked={answers['t2q7'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q7': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q7': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q7': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q7'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q7': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q7'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>8.</span><span className="whitespace-pre-wrap">To facilitate easier hauling of cables into conduits, which of the following can be used?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q8" checked={answers['t2q8'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q8': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q8': 'a' })}>
                  a) Lubrication of the cable and ducts
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q8" checked={answers['t2q8'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q8': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q8': 'b' })}>
                  b) The use of cable guides
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q8" checked={answers['t2q8'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q8': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q8': 'c' })}>
                  c) The use of conduit guides
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q8" checked={answers['t2q8'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q8': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q8': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q8': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q8'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q8': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q8'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>9.</span><span className="whitespace-pre-wrap">Name one device for cleaning conduits.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <textarea required={isStudent} className="w-full border border-gray-300 p-2 min-h-[100px] resize-y" value={answers['t2q9'] || ''} onChange={(e) => setAnswers({ ...answers, 't2q9': e.target.value })} placeholder="(No response)" />
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q9': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q9'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q9': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q9'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>10.</span><span className="whitespace-pre-wrap">How does a winch used for small copper cables differ to one used for optical fibre cables?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q10" checked={answers['t2q10'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q10': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q10': 'a' })}>
                  a) They are the same
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q10" checked={answers['t2q10'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q10': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q10': 'b' })}>
                  b) Smaller hauling wheel
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q10" checked={answers['t2q10'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q10': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q10': 'c' })}>
                  c) Larger hauling wheel
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q10" checked={answers['t2q10'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q10': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q10': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q10': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q10'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q10': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q10'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>11.</span><span className="whitespace-pre-wrap">Identify whether the following statement is true or false: There is a need to ensure that the cable hauling tension is correct for the cable and that the bend radius is maintained and care is taken to protect the cable sheath during cable installation procedures.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q11" checked={answers['t2q11'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q11': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q11': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q11" checked={answers['t2q11'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q11': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q11': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q11': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q11'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q11': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q11'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={9} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>12.</span><span className="whitespace-pre-wrap">A multimeter can be used to check copper cables for:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q12" checked={answers['t2q12'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q12': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q12': 'a' })}>
                  a) Continuity
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q12" checked={answers['t2q12'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q12': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q12': 'b' })}>
                  b) Short circuits
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q12" checked={answers['t2q12'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q12': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q12': 'c' })}>
                  c) Loop resistance
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q12" checked={answers['t2q12'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q12': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q12': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q12': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q12'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q12': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q12'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>13.</span><span className="whitespace-pre-wrap">An induction/tone generator can be used to:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q13" checked={answers['t2q13'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q13': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q13': 'a' })}>
                  a) Measuring cable pair loop resistance
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q13" checked={answers['t2q13'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q13': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q13': 'b' })}>
                  b) Identifying pairs within cables
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q13" checked={answers['t2q13'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q13': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q13': 'c' })}>
                  c) Identify open circuits
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q13" checked={answers['t2q13'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q13': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q13': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q13': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q13'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q13': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q13'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>14.</span><span className="whitespace-pre-wrap">Wire map testers can test for:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q14" checked={answers['t2q14'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q14': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q14': 'a' })}>
                  a) Open circuit
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q14" checked={answers['t2q14'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q14': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q14': 'b' })}>
                  b) Short circuit
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q14" checked={answers['t2q14'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q14': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q14': 'c' })}>
                  c) Reversed or split pairs
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q14" checked={answers['t2q14'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q14': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q14': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q14': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q14'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q14': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q14'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>15.</span><span className="whitespace-pre-wrap">Identify whether the following statement is true or false: The need for surge protection on copper cables is determined by the cabling provider.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q15" checked={answers['t2q15'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q15': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q15': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q15" checked={answers['t2q15'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q15': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q15': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q15': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q15'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q15': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q15'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>16.</span><span className="whitespace-pre-wrap">Devices used to connect the feeder to cables are:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q16" checked={answers['t2q16'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q16': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q16': 'a' })}>
                  a) Cables are never hauled this way
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q16" checked={answers['t2q16'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q16': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q16': 'b' })}>
                  b) Hauling Eye & cable grip
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q16" checked={answers['t2q16'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q16': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q16': 'c' })}>
                  c) Screw on cable cap or glue on cap
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q16" checked={answers['t2q16'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q16': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q16': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q16': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q16'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q16': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q16'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>17.</span><span className="whitespace-pre-wrap">Sufficient cable length should be left in pits for:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q17" checked={answers['t2q17'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q17': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q17': 'a' })}>
                  a) Cables are left as short as possible
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q17" checked={answers['t2q17'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q17': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q17': 'b' })}>
                  b) Hauling
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q17" checked={answers['t2q17'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q17': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q17': 'c' })}>
                  c) Jointing
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q17" checked={answers['t2q17'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q17': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q17': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q17': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q17'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q17': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q17'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={10} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>18.</span><span className="whitespace-pre-wrap">On completion of the work, it is essential to send a ________ promptly to all parties and get sign off from the ________.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q18" checked={answers['t2q18'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q18': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q18': 'a' })}>
                  a) Gift, ACMA
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q18" checked={answers['t2q18'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q18': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q18': 'b' })}>
                  b) Report, customer
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q18" checked={answers['t2q18'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q18': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q18': 'c' })}>
                  c) On completion nothing more is done
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q18" checked={answers['t2q18'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q18': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q18': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q18': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q18'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q18': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q18'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>19.</span><span className="whitespace-pre-wrap">Reinstatement of the site is the responsibility of:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q19" checked={answers['t2q19'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q19': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q19': 'a' })}>
                  a) ACMA
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q19" checked={answers['t2q19'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q19': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q19': 'b' })}>
                  b) Customer
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q19" checked={answers['t2q19'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q19': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q19': 'c' })}>
                  c) Contractor
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q19" checked={answers['t2q19'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q19': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q19': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q19': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q19'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q19': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q19'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>20.</span><span className="whitespace-pre-wrap">Care must be taken when testing optical fibre cables to avoid:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q20" checked={answers['t2q20'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q20': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q20': 'a' })}>
                  a) Foot damage due to the high weight of the fibres
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q20" checked={answers['t2q20'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q20': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q20': 'b' })}>
                  b) Eye damage due to the laser light in the fibres
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q20" checked={answers['t2q20'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q20': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q20': 'c' })}>
                  c) Optical fibre is not dangerous
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q20" checked={answers['t2q20'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q20': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q20': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q20': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q20'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q20': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q20'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>21.</span><span className="whitespace-pre-wrap">Is it necessary to support cables in pits and enclosures?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q21" checked={answers['t2q21'] === 'yes'} onChange={() => setAnswers({ ...answers, 't2q21': 'yes' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q21': 'yes' })}>
                  a) Yes
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q21" checked={answers['t2q21'] === 'no'} onChange={() => setAnswers({ ...answers, 't2q21': 'no' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q21': 'no' })}>
                  b) No
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q21': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q21'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q21': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q21'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 flex flex-col items-center"><img src="/assets/question-15/task1.png" alt="Plan for Questions 22-25" className="max-w-[400px] max-h-[300px] object-contain border border-gray-300" /><div className="text-center italic text-sm mt-2 text-gray-600">Plan for Questions 22-25</div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>22.</span><span className="whitespace-pre-wrap">What is the diameter of duct is installed between boundary of 156 and 158 and boundary of 158 and 160 Hamilton Rd?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q22" checked={answers['t2q22'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q22': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q22': 'a' })}>
                  a) 100mm
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q22" checked={answers['t2q22'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q22': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q22': 'b' })}>
                  b) 50mm
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q22" checked={answers['t2q22'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q22': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q22': 'c' })}>
                  c) 60mm
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q22': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q22'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q22': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q22'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>23.</span><span className="whitespace-pre-wrap">What type (size) of pit is installed at the boundary of 156 and 158 Hamilton Rd?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q23" checked={answers['t2q23'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q23': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q23': 'a' })}>
                  a) P4
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q23" checked={answers['t2q23'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q23': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q23': 'b' })}>
                  b) P5
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q23" checked={answers['t2q23'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q23': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q23': 'c' })}>
                  c) P6
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q23': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q23'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q23': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q23'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>24.</span><span className="whitespace-pre-wrap">What kind of infrastructure is installed at the boundary of 150 and 152 Hamilton Rd?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q24" checked={answers['t2q24'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q24': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q24': 'a' })}>
                  a) Manhole
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q24" checked={answers['t2q24'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q24': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q24': 'b' })}>
                  b) Rope
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q24" checked={answers['t2q24'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q24': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q24': 'c' })}>
                  c) Conduit
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q24': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q24'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q24': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q24'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={11} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>25.</span><span className="whitespace-pre-wrap">What is the length of conduit is required to be installed in between boundary of 156 and 158 and boundary of 158 and 160 Hamilton Rd?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q25" checked={answers['t2q25'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q25': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q25': 'a' })}>
                  a) 26M
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q25" checked={answers['t2q25'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q25': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q25': 'b' })}>
                  b) 30M
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q25" checked={answers['t2q25'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q25': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q25': 'c' })}>
                  c) 22M
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q25': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q25'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q25': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q25'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>26.</span><span className="whitespace-pre-wrap">What is the permissible limit of LEL (Lower Explosive Limit) gases in a confined space?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q26" checked={answers['t2q26'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q26': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q26': 'a' })}>
                  a) 10% of the volume
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q26" checked={answers['t2q26'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q26': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q26': 'b' })}>
                  b) 5% of the volume
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q26" checked={answers['t2q26'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q26': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q26': 'c' })}>
                  c) 8% of the volume
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q26': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q26'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q26': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q26'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>27.</span><span className="whitespace-pre-wrap">What is the safest limit of oxygen in atmosphere?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q27" checked={answers['t2q27'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q27': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q27': 'a' })}>
                  a) 19.5% to 23%
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q27" checked={answers['t2q27'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q27': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q27': 'b' })}>
                  b) 23% to 27%
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q27" checked={answers['t2q27'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q27': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q27': 'c' })}>
                  c) 15% to 19.5%
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q27': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q27'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q27': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q27'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>28.</span><span className="whitespace-pre-wrap">What is the use of a Mandrel? Mandrels are used to prove the integrity of installed conduit runs. They will also remove small amounts of debris that may be in the conduit. Manufactured from high-strength aluminium alloy tube. Centre rod is plated all-thread steel. Eye on each end.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q28" checked={answers['t2q28'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q28': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q28': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q28" checked={answers['t2q28'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q28': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q28': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q28': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q28'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q28': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q28'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>29.</span><span className="whitespace-pre-wrap">How many percentage points should a mandrels be from a conduit size? The effective diameter of the mandrel must be 90 percent of the nominal pipe diameter and verified using a proving ring. The mandrel is sized to allow for up to 5% deformation of the installed pipe.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q29" checked={answers['t2q29'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q29': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q29': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q29" checked={answers['t2q29'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q29': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q29': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q29': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q29'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q29': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q29'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>30.</span><span className="whitespace-pre-wrap">How could avoid conduits get overhauled? Use the Mandrill to check the available capacity of the Conduit during rod and roping activity.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q30" checked={answers['t2q30'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q30': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q30': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q30" checked={answers['t2q30'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q30': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q30': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q30': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q30'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q30': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q30'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={12} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>31.</span><span className="whitespace-pre-wrap">What is the purpose of rod and roping? Rod and Roping is when new and existing conduit is proved and feed with rope to assist in the cable hauling on an existing copper and fibre cable for repairs, upgrades and new infrastructure works.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q31" checked={answers['t2q31'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q31': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q31': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q31" checked={answers['t2q31'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q31': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q31': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q31': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q31'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q31': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q31'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>32.</span><span className="whitespace-pre-wrap">The Customer Access Network connects end users of the:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q32" checked={answers['t2q32'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q32': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q32': 'a' })}>
                  a) Network boundary
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q32" checked={answers['t2q32'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q32': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q32': 'b' })}>
                  b) Telecommunications network
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q32" checked={answers['t2q32'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q32': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q32': 'c' })}>
                  c) Property entry point
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q32" checked={answers['t2q32'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q32': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q32': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q32': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q32'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q32': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q32'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>33.</span><span className="whitespace-pre-wrap">A Customer Private Network provides:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q33" checked={answers['t2q33'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q33': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q33': 'a' })}>
                  a) An external telecommunications network that forms part of the global telecommunications network
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q33" checked={answers['t2q33'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q33': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q33': 'b' })}>
                  b) A standalone internal telecommunications network that does not providing access to the global telecommunications network
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q33" checked={answers['t2q33'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q33': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q33': 'c' })}>
                  c) An internal telecommunications network as well as providing access to the global telecommunications network
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q33" checked={answers['t2q33'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q33': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q33': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q33': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q33'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q33': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q33'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>34.</span><span className="whitespace-pre-wrap">The National Broadband Network (NBN) currently consists entirely of:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q34" checked={answers['t2q34'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q34': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q34': 'a' })}>
                  a) Copper cable
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q34" checked={answers['t2q34'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q34': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q34': 'b' })}>
                  b) Cat 7 cabling
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q34" checked={answers['t2q34'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q34': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q34': 'c' })}>
                  c) Optical Fibre
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q34" checked={answers['t2q34'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q34': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q34': 'd' })}>
                  d) Coaxial cable
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q34': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q34'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q34': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q34'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>35.</span><span className="whitespace-pre-wrap">Is it a requirement to hold a General Construction White Card to work on construction sites?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q35" checked={answers['t2q35'] === 'yes'} onChange={() => setAnswers({ ...answers, 't2q35': 'yes' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q35': 'yes' })}>
                  a) Yes
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q35" checked={answers['t2q35'] === 'no'} onChange={() => setAnswers({ ...answers, 't2q35': 'no' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q35': 'no' })}>
                  b) No
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q35': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q35'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q35': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q35'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>36.</span><span className="whitespace-pre-wrap">The Code of Practise are created to:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q36" checked={answers['t2q36'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q36': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q36': 'a' })}>
                  a) Ensure worst practice outcomes & promote negative behaviour changes in the industry
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q36" checked={answers['t2q36'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q36': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q36': 'b' })}>
                  b) Provide guidelines for fair dealing between organisations and their customers
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q36" checked={answers['t2q36'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q36': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q36': 'c' })}>
                  c) Provide guidelines for fair dealing between organisations
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q36" checked={answers['t2q36'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q36': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q36': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q36': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q36'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q36': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q36'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>37.</span><span className="whitespace-pre-wrap">The Australian Standard that specifies underground Installation requirements for customer cabling is:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q37" checked={answers['t2q37'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q37': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q37': 'a' })}>
                  a) AUSTRALIAN STANDARD AS/NZ 3000:2007
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q37" checked={answers['t2q37'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q37': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q37': 'b' })}>
                  b) | 017153a07 | TELSTRA’S LEAD-IN TRENCHING REQUIREMENTS.
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q37" checked={answers['t2q37'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q37': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q37': 'c' })}>
                  c) AUSTRALIAN STANDARD AS/CA S008:2010
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q37" checked={answers['t2q37'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q37': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q37': 'd' })}>
                  d) AUSTRALIAN STANDARD AS/CA S009:2013
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q37': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q37'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q37': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q37'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>38.</span><span className="whitespace-pre-wrap">The Telecommunications Act 1997 is:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q38" checked={answers['t2q38'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q38': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q38': 'a' })}>
                  a) An industry body
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q38" checked={answers['t2q38'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q38': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q38': 'b' })}>
                  b) Legislated law
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q38" checked={answers['t2q38'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q38': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q38': 'c' })}>
                  c) A voluntary standard
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q38" checked={answers['t2q38'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q38': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q38': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q38': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q38'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q38': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q38'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={13} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>39.</span><span className="whitespace-pre-wrap">The Cable Provider Rules in Australia are best characterised as?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q39" checked={answers['t2q39'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q39': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q39': 'a' })}>
                  a) An industry-run registration scheme designed to promote self-regulation
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q39" checked={answers['t2q39'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q39': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q39': 'b' })}>
                  b) A government run registration scheme designed to promote government regulation
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q39" checked={answers['t2q39'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q39': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q39': 'c' })}>
                  c) A scheme in industry that is no longer used because of self-regulation
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q39" checked={answers['t2q39'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q39': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q39': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q39': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q39'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q39': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q39'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>40.</span><span className="whitespace-pre-wrap">A typical street distribution plan might provide information on…</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q40" checked={answers['t2q40'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q40': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q40': 'a' })}>
                  a) The location of conduit runs
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q40" checked={answers['t2q40'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q40': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q40': 'b' })}>
                  b) The location of electricity pedestals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q40" checked={answers['t2q40'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q40': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q40': 'c' })}>
                  c) The location of pits
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q40" checked={answers['t2q40'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q40': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q40': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q40': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q40'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q40': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q40'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>41.</span><span className="whitespace-pre-wrap">Access to a site is usually arranged by the …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q41" checked={answers['t2q41'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q41': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q41': 'a' })}>
                  a) ACMA
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q41" checked={answers['t2q41'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q41': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q41': 'b' })}>
                  b) Site supervisor or Site Manager
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q41" checked={answers['t2q41'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q41': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q41': 'c' })}>
                  c) No need for access permission for cablers
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q41" checked={answers['t2q41'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q41': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q41': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q41': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q41'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q41': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q41'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>42.</span><span className="whitespace-pre-wrap">Witches hats are a form of …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q42" checked={answers['t2q42'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q42': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q42': 'a' })}>
                  a) They are never used anymore
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q42" checked={answers['t2q42'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q42': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q42': 'b' })}>
                  b) Flashing strobe light
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q42" checked={answers['t2q42'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q42': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q42': 'c' })}>
                  c) Children’s toy
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q42" checked={answers['t2q42'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q42': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q42': 'd' })}>
                  d) Protective barrier
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q42': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q42'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q42': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q42'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>43.</span><span className="whitespace-pre-wrap">One form of barrier that could be used to protect people in manholes is …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q43" checked={answers['t2q43'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q43': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q43': 'a' })}>
                  a) Hard hats
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q43" checked={answers['t2q43'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q43': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q43': 'b' })}>
                  b) Guard rails
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q43" checked={answers['t2q43'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q43': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q43': 'c' })}>
                  c) Safety glasses
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q43" checked={answers['t2q43'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q43': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q43': 'd' })}>
                  d) Orange
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q43': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q43'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q43': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q43'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>44.</span><span className="whitespace-pre-wrap">To manage health and safety and inform personnel on a worksite hazards there should be a …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q44" checked={answers['t2q44'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q44': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q44': 'a' })}>
                  a) Hazard management plan
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q44" checked={answers['t2q44'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q44': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q44': 'b' })}>
                  b) Free hard hats
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q44" checked={answers['t2q44'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q44': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q44': 'c' })}>
                  c) Weather management plan
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q44" checked={answers['t2q44'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q44': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q44': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q44': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q44'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q44': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q44'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>45.</span><span className="whitespace-pre-wrap">List one potential hazard that might be encountered when installing underground cable…</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <textarea required={isStudent} className="w-full border border-gray-300 p-2 min-h-[100px] resize-y" value={answers['t2q45'] || ''} onChange={(e) => setAnswers({ ...answers, 't2q45': e.target.value })} placeholder="(No response)" />
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q45': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q45'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q45': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q45'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={14} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>46.</span><span className="whitespace-pre-wrap">Before work begins approvals should be obtained from…</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q46" checked={answers['t2q46'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q46': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q46': 'a' })}>
                  a) Likelihood that nothing will go wrong so don’t bother
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q46" checked={answers['t2q46'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q46': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q46': 'b' })}>
                  b) No approvals are required
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q46" checked={answers['t2q46'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q46': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q46': 'c' })}>
                  c) Authorities and asset owners
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q46" checked={answers['t2q46'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q46': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q46': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q46': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q46'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q46': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q46'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>47.</span><span className="whitespace-pre-wrap">Typical tools, plant and equipment may include…</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q47" checked={answers['t2q47'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q47': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q47': 'a' })}>
                  a) Shovels
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q47" checked={answers['t2q47'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q47': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q47': 'b' })}>
                  b) Trenching equipment
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q47" checked={answers['t2q47'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q47': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q47': 'c' })}>
                  c) Jointing equipment
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q47" checked={answers['t2q47'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q47': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q47': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q47': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q47'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q47': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q47'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>48.</span><span className="whitespace-pre-wrap">Excavation for existing underground enclosures should be conduction with consideration for:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q48" checked={answers['t2q48'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q48': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q48': 'a' })}>
                  a) Trench width kept to a minimum
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q48" checked={answers['t2q48'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q48': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q48': 'b' })}>
                  b) Adequate clearances for ease of access
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q48" checked={answers['t2q48'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q48': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q48': 'c' })}>
                  c) Shoring of trenches as required
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q48" checked={answers['t2q48'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q48': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q48': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q48': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q48'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q48': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q48'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>49.</span><span className="whitespace-pre-wrap">Personal Protective Equipment (PPE) must be worn on site?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q49" checked={answers['t2q49'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q49': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q49': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q49" checked={answers['t2q49'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q49': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q49': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q49': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q49'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q49': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q49'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>50.</span><span className="whitespace-pre-wrap">List two things that may cause constraints on your installation?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <textarea required={isStudent} className="w-full border border-gray-300 p-2 min-h-[100px] resize-y" value={answers['t2q50'] || ''} onChange={(e) => setAnswers({ ...answers, 't2q50': e.target.value })} placeholder="(No response)" />
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q50': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q50'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q50': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q50'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>51.</span><span className="whitespace-pre-wrap">The installation requirements for underground telecommunications installations are outlined in Plans and Technical Standards.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q51" checked={answers['t2q51'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q51': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q51': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q51" checked={answers['t2q51'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q51': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q51': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q51': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q51'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q51': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q51'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>52.</span><span className="whitespace-pre-wrap">The maximum recommended number of 20 pair cables in a 50 mm conduit is?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q52" checked={answers['t2q52'] === '5'} onChange={() => setAnswers({ ...answers, 't2q52': '5' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q52': '5' })}>
                  5
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q52" checked={answers['t2q52'] === '4'} onChange={() => setAnswers({ ...answers, 't2q52': '4' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q52': '4' })}>
                  4
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q52" checked={answers['t2q52'] === '3'} onChange={() => setAnswers({ ...answers, 't2q52': '3' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q52': '3' })}>
                  3
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q52" checked={answers['t2q52'] === '2'} onChange={() => setAnswers({ ...answers, 't2q52': '2' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q52': '2' })}>
                  2
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q52': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q52'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q52': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q52'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={15} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>53.</span><span className="whitespace-pre-wrap">The only colour conduit for communications cable is?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q53" checked={answers['t2q53'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q53': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q53': 'a' })}>
                  a) Green
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q53" checked={answers['t2q53'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q53': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q53': 'b' })}>
                  b) Orange
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q53" checked={answers['t2q53'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q53': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q53': 'c' })}>
                  c) White
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q53" checked={answers['t2q53'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q53': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q53': 'd' })}>
                  d) Yellow
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q53': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q53'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q53': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q53'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>54.</span><span className="whitespace-pre-wrap">When installing conduit, conduit bends or couplings care should be taken to ensure:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q54" checked={answers['t2q54'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q54': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q54': 'a' })}>
                  a) Free of external marks on the outside of the conduit and that the conduit ends must be of a green or blue in colour
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q54" checked={answers['t2q54'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q54': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q54': 'b' })}>
                  b) Free of snag points by cutting the end of the conduit at a right angle to the axis of the conduit and removing all burrs and sharp edges using a file or scraper
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q54" checked={answers['t2q54'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q54': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q54': 'c' })}>
                  c) Conduit is self-installing and doesn’t require any additional work
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q54" checked={answers['t2q54'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q54': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q54': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q54': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q54'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q54': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q54'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>55.</span><span className="whitespace-pre-wrap">Telecommunications underground conduit installed in a location other than a public footpath or roadway?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q55" checked={answers['t2q55'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q55': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q55': 'a' })}>
                  a) No special conditions required
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q55" checked={answers['t2q55'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q55': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q55': 'b' })}>
                  b) Enclosed in a red conduit for easy identification
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q55" checked={answers['t2q55'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q55': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q55': 'c' })}>
                  c) Enclosed in a compliant conduit
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q55" checked={answers['t2q55'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q55': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q55': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q55': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q55'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q55': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q55'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>56.</span><span className="whitespace-pre-wrap">To ensure you have selected the correct excavation equipment and plants:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q56" checked={answers['t2q56'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q56': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q56': 'a' })}>
                  a) You will need to check the task requirements, specifications and goals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q56" checked={answers['t2q56'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q56': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q56': 'b' })}>
                  b) You will need to check the weather, time and goals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q56" checked={answers['t2q56'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q56': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q56': 'c' })}>
                  c) You will need to check the user guides for the work, who is on site and goals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q56" checked={answers['t2q56'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q56': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q56': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q56': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q56'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q56': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q56'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>57.</span><span className="whitespace-pre-wrap">A multimeter can be used to check copper cables for?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q57" checked={answers['t2q57'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q57': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q57': 'a' })}>
                  a) Continuity
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q57" checked={answers['t2q57'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q57': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q57': 'b' })}>
                  b) Short circuits
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q57" checked={answers['t2q57'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q57': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q57': 'c' })}>
                  c) Loop resistance
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q57" checked={answers['t2q57'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q57': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q57': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q57': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q57'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q57': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q57'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>58.</span><span className="whitespace-pre-wrap">An induction /tone generator can be used to?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q58" checked={answers['t2q58'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q58': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q58': 'a' })}>
                  a) Measuring cable pair loop resistance
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q58" checked={answers['t2q58'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q58': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q58': 'b' })}>
                  b) Identifying pairs within cables
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q58" checked={answers['t2q58'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q58': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q58': 'c' })}>
                  c) Identify open circuits
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q58" checked={answers['t2q58'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q58': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q58': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q58': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q58'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q58': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q58'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>59.</span><span className="whitespace-pre-wrap">Wire map testers can test for?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q59" checked={answers['t2q59'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q59': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q59': 'a' })}>
                  a) Open circuit
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q59" checked={answers['t2q59'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q59': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q59': 'b' })}>
                  b) Short circuit
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q59" checked={answers['t2q59'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q59': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q59': 'c' })}>
                  c) Reversed or split pairs
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q59" checked={answers['t2q59'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q59': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q59': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q59': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q59'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q59': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q59'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>60.</span><span className="whitespace-pre-wrap">On completion of installation conduits should be tested for blockages to ensure they are free from impediments to cable hauling:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q60" checked={answers['t2q60'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q60': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q60': 'a' })}>
                  a) Sures edges
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q60" checked={answers['t2q60'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q60': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q60': 'b' })}>
                  b) Blockages
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q60" checked={answers['t2q60'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q60': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q60': 'c' })}>
                  c) Kinks
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q60" checked={answers['t2q60'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q60': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q60': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q60': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q60'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q60': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q60'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={16} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>61.</span><span className="whitespace-pre-wrap">A (TDR) Time Domain Reflectometer can be used to check copper cables for continuity, Short circuits, open circuit, cable length, and fault location.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q61" checked={answers['t2q61'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q61': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q61': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q61" checked={answers['t2q61'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q61': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q61': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q61': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q61'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q61': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q61'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>62.</span><span className="whitespace-pre-wrap">Name two methods for testing Optical Fibre cable?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <textarea required={isStudent} className="w-full border border-gray-300 p-2 min-h-[100px] resize-y" value={answers['t2q62'] || ''} onChange={(e) => setAnswers({ ...answers, 't2q62': e.target.value })} placeholder="(No response)" />
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q62': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q62'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q62': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q62'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>63.</span><span className="whitespace-pre-wrap">An (OTDR) Optical Time Domain Reflectometer sends a pulse of light down the cable to locate insertion loss on optical fibre cables?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q63" checked={answers['t2q63'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q63': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q63': 'a' })}>
                  a) Voltage
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q63" checked={answers['t2q63'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q63': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q63': 'b' })}>
                  b) Light
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q63" checked={answers['t2q63'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q63': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q63': 'c' })}>
                  c) High frequency
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q63" checked={answers['t2q63'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q63': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q63': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q63': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q63'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q63': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q63'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>64.</span><span className="whitespace-pre-wrap">Which test setup will give the operator the most information in when testing Optical Fibre cable?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q64" checked={answers['t2q64'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q64': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q64': 'a' })}>
                  a) Light Source/Power Meter method
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q64" checked={answers['t2q64'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q64': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q64': 'b' })}>
                  b) OTDR
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q64" checked={answers['t2q64'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q64': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q64': 'c' })}>
                  c) Both the same
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q64" checked={answers['t2q64'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q64': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q64': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q64': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q64'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q64': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q64'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>65.</span><span className="whitespace-pre-wrap">The types of test equipment and the type of test will be determined by:</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q65" checked={answers['t2q65'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q65': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q65': 'a' })}>
                  a) Test results
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q65" checked={answers['t2q65'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q65': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q65': 'b' })}>
                  b) The design parameters
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q65" checked={answers['t2q65'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q65': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q65': 'c' })}>
                  c) What day the tests are done on
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q65" checked={answers['t2q65'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q65': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q65': 'd' })}>
                  d) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q65': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q65'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q65': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q65'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>66.</span><span className="whitespace-pre-wrap">Conduit ends are sealed to…</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q66" checked={answers['t2q66'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q66': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q66': 'a' })}>
                  a) Prevent the ingress of dirt and water
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q66" checked={answers['t2q66'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q66': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q66': 'b' })}>
                  b) To make it easier to haul through ducts
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q66" checked={answers['t2q66'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q66': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q66': 'c' })}>
                  c) The sealing makes jointing easier
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q66" checked={answers['t2q66'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q66': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q66': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q66': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q66'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q66': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q66'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>67.</span><span className="whitespace-pre-wrap">Conduit should enter a pit or access hole through the long sides.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q67" checked={answers['t2q67'] === 'true'} onChange={() => setAnswers({ ...answers, 't2q67': 'true' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q67': 'true' })}>
                  a) True
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q67" checked={answers['t2q67'] === 'false'} onChange={() => setAnswers({ ...answers, 't2q67': 'false' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q67': 'false' })}>
                  b) False
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q67': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q67'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q67': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q67'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <PageFooter n={17} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>68.</span><span className="whitespace-pre-wrap">Wherever practicable, access-holes should be spaced at approximately…</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q68" checked={answers['t2q68'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q68': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q68': 'a' })}>
                  a) 230 m intervals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q68" checked={answers['t2q68'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q68': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q68': 'b' })}>
                  b) 320 m intervals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q68" checked={answers['t2q68'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q68': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q68': 'c' })}>
                  c) 330 m intervals
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q68" checked={answers['t2q68'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q68': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q68': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q68': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q68'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q68': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q68'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>69.</span><span className="whitespace-pre-wrap">On completion of the work it is essential to send a report promptly to all parties and get sign off from the customer.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q69" checked={answers['t2q69'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q69': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q69': 'a' })}>
                  a) Gift, ACMA
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q69" checked={answers['t2q69'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q69': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q69': 'b' })}>
                  b) Report, customer
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q69" checked={answers['t2q69'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q69': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q69': 'c' })}>
                  c) On completion, appropriate personnel of job
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q69" checked={answers['t2q69'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q69': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q69': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q69': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q69'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q69': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q69'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>70.</span><span className="whitespace-pre-wrap">Reinstatement of the site is the responsibility of …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q70" checked={answers['t2q70'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q70': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q70': 'a' })}>
                  a) ACMA
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q70" checked={answers['t2q70'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q70': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q70': 'b' })}>
                  b) Customer
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q70" checked={answers['t2q70'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q70': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q70': 'c' })}>
                  c) Contractor
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q70" checked={answers['t2q70'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q70': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q70': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q70': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q70'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q70': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q70'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>71.</span><span className="whitespace-pre-wrap">Care must be taken when testing optical fibre cables to avoid …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q71" checked={answers['t2q71'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q71': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q71': 'a' })}>
                  a) Foot damage due to the high weight of the fibres
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q71" checked={answers['t2q71'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q71': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q71': 'b' })}>
                  b) Eye damage due to the laser light in the fibres
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q71" checked={answers['t2q71'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q71': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q71': 'c' })}>
                  c) Optical fibre is not dangerous
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q71" checked={answers['t2q71'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q71': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q71': 'd' })}>
                  d) All of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q71': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q71'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q71': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q71'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>72.</span><span className="whitespace-pre-wrap">Is it necessary to support cables in pits and enclosures?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q72" checked={answers['t2q72'] === 'yes'} onChange={() => setAnswers({ ...answers, 't2q72': 'yes' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q72': 'yes' })}>
                  a) Yes
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q72" checked={answers['t2q72'] === 'no'} onChange={() => setAnswers({ ...answers, 't2q72': 'no' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q72': 'no' })}>
                  b) No
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q72': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q72'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q72': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q72'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>73.</span><span className="whitespace-pre-wrap">To enable future underground enclosure identification at a future date all enclosures must be …</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q73" checked={answers['t2q73'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q73': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q73': 'a' })}>
                  a) Marked legibly
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q73" checked={answers['t2q73'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q73': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q73': 'b' })}>
                  b) Coloured red or green
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q73" checked={answers['t2q73'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q73': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q73': 'c' })}>
                  c) Cables don’t need to be marked
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q73" checked={answers['t2q73'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q73': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q73': 'd' })}>
                  d) None of the above
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q73': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q73'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q73': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q73'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>
        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>74.</span><span className="whitespace-pre-wrap">Backfill of the site should be undertaken to ensure?</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q74" checked={answers['t2q74'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q74': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q74': 'a' })}>
                  a) the finished surface level does not settle beyond that acceptable to the contractor
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q74" checked={answers['t2q74'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q74': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q74': 'b' })}>
                  b) the finished surface level does not settle beyond that acceptable to the local authority or the carrier
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q74" checked={answers['t2q74'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q74': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q74': 'c' })}>
                  c) the finished surface level does not settle beyond that acceptable to the ACMA
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q74" checked={answers['t2q74'] === 'd'} onChange={() => setAnswers({ ...answers, 't2q74': 'd' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q74': 'd' })}>
                  d) the finished surface level is the responsibility of the local authority or the carrier
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q74': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q74'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q74': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q74'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>

        <div className="mb-6 border-[1.5px] border-black bg-white flex flex-col" style={{ pageBreakInside: 'avoid' }}>
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 font-bold mb-3 text-[10pt]"><span>75.</span><span className="whitespace-pre-wrap">The most common metals used in cables are ________________ and ________________.
Recycling plants will granulate and then separate the metal from the________________. Using this process, the plastic is removed and the copper, aluminium or other metals present are separated________________for recycling. These metals are then smelted for reuse in new metal products. Similarly the plastic is melted and extruded for ________________.</span></div>
            <div className="pl-0 sm:pl-6 mt-2">
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q75" checked={answers['t2q75'] === 'a'} onChange={() => setAnswers({ ...answers, 't2q75': 'a' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q75': 'a' })}>
                  a) Plastic, Rubber, Cables, Magnetically, Destruction
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q75" checked={answers['t2q75'] === 'b'} onChange={() => setAnswers({ ...answers, 't2q75': 'b' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q75': 'b' })}>
                  b) copper, aluminium, insulation, magnetically, reuse
                </label>
              </div>
              <div className="flex gap-2 mb-2 items-center text-[10.5pt]">
                <input required={isStudent} type="radio" name="t2q75" checked={answers['t2q75'] === 'c'} onChange={() => setAnswers({ ...answers, 't2q75': 'c' })} className="mt-0.5 cursor-pointer" />
                <label className="cursor-pointer hover:bg-gray-50" onClick={() => setAnswers({ ...answers, 't2q75': 'c' })}>
                  c) Lead, Bronze, Insulation, magnetically, destruction
                </label>
              </div>
            </div></div>
          <div className="flex border-t-[1.5px] border-black font-bold text-[9pt] sm:text-[9.5pt] mt-auto">
            <div className="w-[40%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black flex items-center">
              Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>✓</span></span>)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q75': 'correct' })} className="w-[30%] p-1 sm:p-2 text-blue-800 border-r-[1.5px] border-black bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q75'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Satisfactory (S)
            </div>
            <div onClick={() => !isStudent && setGrades({ ...grades, 't2q75': 'incorrect' })} className="w-[30%] p-1 sm:p-2 text-blue-800 bg-[#fce4d6] flex justify-center items-center text-center leading-tight cursor-pointer">
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1e3a8a', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                {grades['t2q75'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
              </span>
              Not Satisfactory (NS)
            </div>
          </div></div>

        <div className="hidden mt-8" style={{ pageBreakInside: 'avoid' }}>
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
                          <img src={answers.student_signature_url} alt="Sig" style={{ height: '20px', position: 'absolute', bottom: '0', mixBlendMode: 'multiply' }} />
                        ) : (
                          <span style={{ fontSize: '9px', color: '#888' }}>{isStudent ? '' : 'Click to sign'}</span>
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
              value={compRecord['task2_feedback'] || ''}
              onChange={(e) => { if (!isStudent) setCompRecord({ ...compRecord, 'task2_feedback': e.target.value }) }}
              readOnly={isStudent}
            />
            <div className="hidden print:block" style={{ whiteSpace: 'pre-wrap', minHeight: '90px', fontSize: '10.5pt' }}>
              {compRecord['task2_feedback']}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '12.5pt' }}>
            Result:{' '}
            <span
              className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`}
              onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, 'task2_result': 'S' }) }}
              style={{ padding: '4px' }}
            >
              Satisfactory (S)
              {compRecord['task2_result'] === 'S' && (
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '2px solid red', borderRadius: '50%', width: '110%', height: '140%', pointerEvents: 'none' }}></span>
              )}
            </span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span
              className={`relative inline-block mx-2 ${isStudent ? '' : 'cursor-pointer'}`}
              onClick={() => { if (!isStudent) setCompRecord({ ...compRecord, 'task2_result': 'NS' }) }}
              style={{ padding: '4px' }}
            >
              Not Satisfactory (NS)
              {compRecord['task2_result'] === 'NS' && (
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
        <PageFooter n={18} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <h1 className="section-title text-center text-blue-900 font-bold my-4">PRACTICAL ASSESSMENT TASK 2<div className="text-lg mt-1">Rod, Rope, Clean and Prove Conduit</div></h1>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-2">Performance Criteria Mapping</div>
          <table className="w-full border-collapse border border-black text-[9.5pt]">
            <tbody>
              <tr>
                <td className="border border-black bg-gray-200 p-2 font-bold text-center">Performance Criteria assessed in this task – ICTCBL249</td>
                <td className="border border-black bg-gray-200 p-2 font-bold text-center w-[15%]">Tick Completed</td>
              </tr>
              {[{ id: 'pa2_pc_1_1', text: '1.1 Arrange access to site according to required procedure' },
                { id: 'pa2_pc_1_2', text: '1.2 Inform appropriate personnel of identified hazards on worksite' },
                { id: 'pa2_pc_1_3', text: '1.3 Confirm hauling location of proposed cable according to appropriate plan specifications obtained from authorised personnel' },
                { id: 'pa2_pc_1_4', text: '1.4 Obtain information about proposed locations of other services from relevant authorities' },
                { id: 'pa2_pc_1_5', text: '1.5 Set up tools and equipment required for safe work practice according to enterprise guidelines' },
                { id: 'pa2_pc_1_6', text: '1.6 Check for dangerous gases and place guards around open manholes according to work health and safety (WHS) and environmental requirements' },
                { id: 'pa2_pc_2_2', text: '2.2 Connect conduit to pits or manholes as designed according to industry standards and asset owner requirements' },
                { id: 'pa2_pc_3_1', text: '3.1 Handle existing cables in a way that avoids cable damage' },
                { id: 'pa2_pc_3_2', text: '3.2 Use roping techniques to prove that underground conduit is clear for hauling' },
                { id: 'pa2_pc_5_3', text: '5.3 Reinstate site to customer satisfaction and dispose of waste in an environmentally salle manner' },
                { id: 'pa2_pc_5_4', text: '5.4 Notify appropriate personnel about job completion and obtain sign-off' }
              ].map((q, idx) => (
                <tr key={`249-${idx}`}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-black bg-gray-200 p-2 font-bold text-center">Performance Criteria assessed in this task – ICTCBL329</td>
                <td className="border border-black bg-gray-200 p-2 font-bold text-center w-[15%]">Tick Completed</td>
              </tr>
              {[{ id: 'pa2_pc_1_1', text: '1.1 Access site according to required enterprise procedures' },
                { id: 'pa2_pc_1_2', text: '1.2 Verify cable installation requirements from plans and recognise constraints' },
                { id: 'pa2_pc_1_3', text: '1.3 Identify from plans, correct duct to be hauled' },
                { id: 'pa2_pc_1_4', text: '1.4 Inform appropriate personnel of existing and potential worksite hazards' },
                { id: 'pa2_pc_1_5', text: '1.5 Obtain information about location of other services from relevant authorities' },
                { id: 'pa2_pc_1_6', text: '1.6 Select suitable tools, equipment, and protective equipment to meet required industry standards.' },
                { id: 'pa2_pc_1_7', text: '1.7 Check for dangerous gases and place guards around open manholes following work health and safety (WHS) and environmental requirements' },
                { id: 'pa2_pc_1_8', text: '1.8 Confirm correct duct/conduit to be utilised for hauling at site and access to intermediate manholes/pits along the hauling route' },
                { id: 'pa2_pc_1_9', text: '1.9 Rod and rope the conduit/duct to be hauled' },
                { id: 'pa2_pc_1_10', text: '1.10 Set-up cable installation equipment according to manufacturer requirements and enterprise guidelines' },
                { id: 'pa2_pc_1_11', text: '1.11 Clean debris and obstructions from conduit using appropriate mandrels' },
                { id: 'pa2_pc_1_12', text: '1.12 Seal cable ends to exclude entrance of foreign matter' },
                { id: 'pa2_pc_2_1', text: '2.1 Run hauling feeder through conduit to enable cable hauling' },
                { id: 'pa2_pc_2_2', text: '2.2 Use rodding techniques to prove that conduit is clear for hauling' },
                { id: 'pa2_pc_3_7', text: '3.7 Notify appropriate personnel and obtain sign-off' }
              ].map((q, idx) => (
                <tr key={`329-${idx}`}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Completed' ? '' : 'Completed' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Completed' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {renderAttemptsSignature('pa2')}
            </tbody>
          </table>
        </div>

        <PageFooter n={19} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 2</h1>
        </div>
        <div className="mb-4 break-inside-avoid"><h3 className="font-normal mb-2 flex items-center text-[11pt]">Performance Evidence Mapping</h3>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Evidence</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Tick Completed</th></tr></thead>
            <tbody><tr><td colSpan={2} className="border border-black p-2 font-bold bg-gray-100">Performance Evidence assessed in this task-ICTCBL249</td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE1. plan the works and prepare the site</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe1': compRecord['pa2_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE2. read and interpret drawings and designs to interpret installation requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe2': compRecord['pa2_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE6. use specialised hand or power tools and equipment for hauling cable safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe6': compRecord['pa2_pe_pe6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td colSpan={2} className="border border-black p-2 font-bold bg-gray-100">Performance Evidence assessed in this task-ICTCBL329</td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE1. use the correct type of rope for cable hauling</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe1': compRecord['pa2_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE2. use various rodding, roping and mandrel techniques as prior requirements to hauling cable</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe2': compRecord['pa2_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE4. restore site and complete documentation</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe4': compRecord['pa2_pe_pe4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE5. use specialised hand or power tools and equipment for hauling cabling safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe5': compRecord['pa2_pe_pe5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE7. comply with all related safety requirements and work practices.</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_pe_pe7': compRecord['pa2_pe_pe7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa2_pe_pe7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa2')}
            </tbody></table></div>

        <div className="text-[9pt] mt-4 mb-4">
          2nd reattempt cannot be undertaken on the same date as the initial and 1st reattempt. (see ******** Students) The last date of this observation is to match the date for this assessment on the ass******* page.
        </div>

        <PageFooter n={20} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 2</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Assessment Instructions</div>
          <div className="font-bold mb-4">Complete the following activities:</div>
          <ol className="list-decimal pl-8 whitespace-pre-wrap mb-4 text-[10pt]">
            <li>Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice</li>
            <li>Refer to all tool/equipment instructions/manufacturers guidelines prior to use.</li>
            <li>Refer to the completed JSA for the task</li>
            <li>Ensure gas detector is on and carried on your person</li>
            <li>Assemble cable drum stand and fit drum to cable following all manual handling requirements.</li>
            <li>Clean any silt from bottom of pit</li>
            <li>Rod conduit</li>
            <li>Attach hauling line and draw through conduit</li>
            <li>Attach cleaning brush to hauling line and clean debris from conduit</li>
            <li>Prove conduit with appropriate size slug</li>
            <li>Leave hauling line in conduit</li>
            <li>Flame brush cable end</li>
            <li>Fit endcap and shrink to seal cable</li>
            <li>Submit your completed work to your supervisor (assessor) for inspection</li>
          </ol>
        </div>
        <div className="mb-6 flex flex-col items-center break-inside-avoid mt-8">
          <div className="text-[14pt] text-black text-left w-full m-0 p-0 mb-4">Plan of proposed work</div>
          <img src="/assets/question-15/task2.png" alt="Plan of proposed work" className="max-w-[700px] max-h-[250px] object-contain" />
        </div>
        <PageFooter n={21} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 2 - Checklist</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <table className="w-full border-collapse border border-black text-[9.5pt]">
            <tbody>
              <tr>
                <td colSpan={4} className="border border-black p-2">
                  Student's name: <span className="ml-2">{studentName}</span>
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-black p-2 w-[60%] align-top">
                  Did the student:
                </td>
                <td colSpan={2} className="border border-black p-1 text-center align-middle text-[8.5pt]">
                  Completed<br/>successfully
                </td>
                <td rowSpan={2} className="border border-black p-2 text-center align-top w-[20%]">
                  Comments
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">Yes</td>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">No</td>
              </tr>
              {[{ id: 'pa2_cl_1', text: 'Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice' },
                { id: 'pa2_cl_2', text: 'Refer to all tool/equipment instructions/manufacturers guidelines prior to use.' },
                { id: 'pa2_cl_3', text: 'Refer to the completed JSA for the task' },
                { id: 'pa2_cl_4', text: 'Ensure gas detector is on and carried on your person' },
                { id: 'pa2_cl_5', text: 'Assemble cable drum stand and fit drum to cable following all manual handling requirements.' },
                { id: 'pa2_cl_6', text: 'Clean any silt from bottom of pit' },
                { id: 'pa2_cl_7', text: 'Rod conduit' },
                { id: 'pa2_cl_8', text: 'Attach hauling line and draw through conduit' },
                { id: 'pa2_cl_9', text: 'Attach cleaning brush to hauling line and clean debris from conduit' },
                { id: 'pa2_cl_10', text: 'Prove conduit with appropriate size slug' },
                { id: 'pa2_cl_11', text: 'Leave hauling line in conduit' },
                { id: 'pa2_cl_12', text: 'Flame brush cable end' },
                { id: 'pa2_cl_13', text: 'Fit endcap and shrink to seal cable' },
                { id: 'pa2_cl_14', text: 'Submit your completed work to your supervisor (assessor) for inspection' }
              ].map((q, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle">
                    <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Task Outcome:</td>
                <td colSpan={2} className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_outcome': compRecord['pa2_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa2_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
                <td className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa2_outcome': compRecord['pa2_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Not Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa2_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor signature</td>
                <td colSpan={3} className="border border-black p-2 text-center align-middle">
                  <div onClick={() => !isStudent && openSigModal('pa2_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                    {(compRecord.assessor_signature || compRecord['pa2_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa2_assessor_sig']} className="max-h-[40px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor name</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="text" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Date</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="date" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={22} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 3</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-2">Performance Criteria Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Criteria assessed in this task – ICTCBL249</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium ">1.1 Arrange access to site according to required procedure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_1': compRecord['pa3_pc_1_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.2 Inform appropriate personnel of identified hazards on worksite</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_2': compRecord['pa3_pc_1_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.3 Confirm hauling location of proposed cable according to appropriate plan specifications obtained from authorised personnel</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_3': compRecord['pa3_pc_1_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.4 Obtain information about proposed locations of other services from relevant authorities</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_4': compRecord['pa3_pc_1_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.5 Set up tools and equipment required for safe work practice according to enterprise guidelines</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_5': compRecord['pa3_pc_1_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.6 Check for dangerous gases and place guards around open manholes according to work health and safety (WHS) And environmental requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_6': compRecord['pa3_pc_1_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.1 Handle existing cables in a way that avoids cable damage</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_1': compRecord['pa3_pc_3_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.2 Use roping techniques to prove that underground conduit is clear for hauling</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_2': compRecord['pa3_pc_3_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.3 Attach cable to rope for hauling, lubricate cable as required and haul at correct tension, maintaining smooth passage between dispenser and hauler</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_3': compRecord['pa3_pc_3_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.4 Haul cable through conduit to facilitate aerial to underground transition/underground to aerial transition, as required by the design</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_4': compRecord['pa3_pc_3_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.5 Maintain cable and services separations in parallel runs and crossovers to meet manufacturer and regulatory requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_5': compRecord['pa3_pc_3_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.6 Maintain sufficient cable length allowance for jointing and ensure cable is laid up and bent within bending radius tolerance for cable materials in underground enclosure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_6': compRecord['pa3_pc_3_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.1 Seal cables according to enterprise requirements to ensure no sheath damage</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_1': compRecord['pa3_pc_4_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.2 Tag cable for future identification</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_2': compRecord['pa3_pc_4_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.3 Test cable for continuity</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_3': compRecord['pa3_pc_4_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.4 Record and report test results for escalation</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_4': compRecord['pa3_pc_4_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.5 Record any approved alteration to original design using correct symbols and return to appropriate personnel</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_5': compRecord['pa3_pc_4_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.5 Complete and sign reports, as required, according to enterprise policy</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_5': compRecord['pa3_pc_4_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.6 Reinstate site to customer satisfaction and dispose of waste in an environmentally safe manner</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_6': compRecord['pa3_pc_4_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">4.6 Certify by appropriate personnel about job completion and obtain sign-off</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_4_6': compRecord['pa3_pc_4_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_4_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
            </tbody>
          </table>
        </div>
        <div className="text-[10pt] text-red-600 font-bold mt-4">* Continued over page....</div>
        <PageFooter n={23} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 3</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] text-black text-left m-0 p-0 mb-2">Performance Criteria Mapping Continued</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Criteria assessed in this task – ICTCBL329</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium ">1.1 Access site according to required enterprise procedures</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_1': compRecord['pa3_pc_1_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.2 Verify cable installation requirements from plans and recognise constraints</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_2': compRecord['pa3_pc_1_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.3 Identify from plans, correct duct to be hauled</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_3': compRecord['pa3_pc_1_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.4 Inform appropriate personnel of existing and potential worksite hazards</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_4': compRecord['pa3_pc_1_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.5 Obtain information about location of other services from relevant authorities</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_5': compRecord['pa3_pc_1_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.6 Select suitable tools, equipment, and protective equipment to meet required industry standards.</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_6': compRecord['pa3_pc_1_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.7 Check for dangerous gases and place guards around open manholes following work health and safety (WHS) and environmental requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_7': compRecord['pa3_pc_1_7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.8 Confirm correct duct/conduit to be utilised for hauling at site and access to intermediate manholes/pits along the hauling route</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_8': compRecord['pa3_pc_1_8'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_8'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.10 Set-up cable installation equipment according to manufacturer requirements and enterprise guidelines</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_1_10': compRecord['pa3_pc_1_10'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_1_10'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.1 Attach cable to hauling feeder according to manufacturer specifications</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_2_1': compRecord['pa3_pc_2_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_2_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.2 Employ cable slippers or rollers to ensure no sheath damage when hauling into and out of enclosures</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_2_2': compRecord['pa3_pc_2_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_2_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.5 Lubricate cable and haul evenly at correct tension to reduce risk of cable damage</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_2_5': compRecord['pa3_pc_2_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_2_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.5 Maintain sufficient cable length allowance for jointing and ensure cable is housed within bending radius tolerance for cable materials in an underground enclosure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_5': compRecord['pa3_pc_3_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.7 Maintain cable and services separations in parallel runs and crossovers according to manufacturer and regulatory requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_2_7': compRecord['pa3_pc_2_7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_2_7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.1 Tag all cables to enable future identification</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_1': compRecord['pa3_pc_3_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.2.2 Seal cable ends according to enterprise requirements to prevent entrance of foreign material</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_2_2': compRecord['pa3_pc_3_2_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_2_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.3 Place cable on supports in enclosures to reduce damage to conductors and enable ease of access for maintenance</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_3': compRecord['pa3_pc_3_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.5 Complete installation reports and design amendments accurately, and file promptly according to customer requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_5': compRecord['pa3_pc_3_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.6 Reinstate site to customer satisfaction and dispose of waste in environmentally safe manner as required</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_6': compRecord['pa3_pc_3_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.7 Notify appropriate personnel and obtain sign-off</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pc_3_7': compRecord['pa3_pc_3_7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pc_3_7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa3')}
            </tbody>
          </table>
        </div>
        <PageFooter n={24} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 3</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] text-black text-left m-0 p-0 mb-2">Performance Evidence Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Evidence assessed in this task-ICTCBL249</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium ">PE1. plan the works and prepare the site</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe1': compRecord['pa3_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE2. read and interpret drawings and designs to interpret installation requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe2': compRecord['pa3_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE3. haul cable applying related work health and safety (WHS) requirements and work practices</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe3': compRecord['pa3_pe_pe3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE5. use cable dispensing equipment</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe5': compRecord['pa3_pe_pe5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE6. use specialised hand or power tools and equipment for hauling cable safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe6': compRecord['pa3_pe_pe6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE7. test the installation, document, and escalate the test result</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe7': compRecord['pa3_pe_pe7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE8. prepare all reports and records to industry and enterprise standards.</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe8': compRecord['pa3_pe_pe8'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe8'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Evidence assessed in this task-ICTCBL329</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr>
              <tr><td className="border border-black p-2 font-medium ">PE1. use correct type of rope for cable hauling</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe1': compRecord['pa3_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE2. use various rodding, roping and mandrel techniques as prior requirements to hauling cable</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe2': compRecord['pa3_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE3. haul cable safely applying related work health and safety (WHS) requirements and work practices</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe3': compRecord['pa3_pe_pe3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE4. restore site and complete documentation</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe4': compRecord['pa3_pe_pe4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE5. use specialised hand or power tools and equipment for hauling cabling safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe5': compRecord['pa3_pe_pe5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE7. comply with all related safety requirements and work practices.</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_pe_pe7': compRecord['pa3_pe_pe7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa3_pe_pe7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa3')}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[9pt] leading-relaxed">
          <p>2nd reattempt cannot be undertaken on the same date as the initial and 1st reattempt. (see Instructions to Students) The last date of this observation is to match the date for this assessment on the assessment outcome page.</p>
        </div>
        <PageFooter n={25} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 3</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Timing</div>
          <p>Your assessor will advise you of the due date of these submissions.</p>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Assessment Instructions</div>
          <div className="font-bold mb-4">Complete the following activities:</div>
          <ol className="list-decimal pl-8 whitespace-pre-wrap mb-4">
            <li>Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice</li>
            <li>Refer to all tool/equipment instructions/manufacturers guidelines prior to use.</li>
            <li>Refer to the completed JSA for the task</li>
            <li>Ensure gas detector is on and carried on your person</li>
            <li>6. Attach cable grip to cable and tape on</li>
            <li>Ensure cable guides/slippers are installed correctly</li>
            <li>Attach hauling rope to cable grip eye and tie off securely.</li>
            <li>Attach a new hauling rope to the cable grip eye</li>
            <li>Lubricate the cable</li>
            <li>Haul the cable ensuring that you do not exceed the manufacturers hauling tension</li>
            <li>Ensure sufficient cable is left in pits for jointing and cut from drum.</li>
            <li>Flame brush cable end</li>
            <li>Fit endcap and shrink to seal cable</li>
            <li>Fit cable tags to both ends of cable</li>
            <li>Coil excess cable and secure to cable supports</li>
            <li>Ensure sufficient separation from other services in pits</li>
            <li>Test the continuity of the cable</li>
            <li>Close pits</li>
            <li>Restore site and clean and return all tools and equipment to the appropriate location</li>
            <li>Complete red line mark-up of plan showing completed work</li>
            <li>Complete project sign off sheet and get customer (assessor) approval</li>
            <li>Submit your completed work to your supervisor (assessor) for inspection</li>
          </ol>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Timing</div>
          <p>Your assessor will advise you of the due date of these submissions.</p>
        </div>
        <div className="mb-6 flex flex-col items-center break-inside-avoid">
          <div className="text-[12pt] text-black text-left w-full m-0 p-0 mb-4">Plan of proposed work</div>
          <img src="/assets/question-15/task3.png" alt="Plan of proposed work" className="max-w-[700px] max-h-[300px] object-contain" />
        </div>
        <PageFooter n={26} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 3</h1>
        </div>
        <div className="mb-6 break-inside-avoid">
          <div className="text-[10pt] text-black text-left m-0 p-0 mb-4">Marked up plan of completed work</div>
          <img src="/assets/question-15/task3.png" alt="Marked up plan of completed work" className="max-w-[700px] max-h-[300px] object-contain" />
        </div>
        <div className="mb-6 break-inside-avoid mt-8">
          <div className="text-[10pt] text-black text-left m-0 p-0 mb-4">Test result</div>
          <div className="flex items-center text-[10pt]">
            <span>Loop resistance of 1" pair </span>
            <input type="text" className="border-b border-black w-32 mx-2 text-center focus:outline-none" value={compRecord['pa3_loop_resistance'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa3_loop_resistance': e.target.value })} readOnly={isStudent} />
            <span> Ohms</span>
          </div>
        </div>
        <PageFooter n={27} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 3 - Checklist</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <table className="w-full border-collapse border border-black text-[9.5pt]">
            <tbody>
              <tr>
                <td colSpan={4} className="border border-black p-2">
                  Student's name: <span className="ml-2">{studentName}</span>
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-black p-2 w-[60%] align-top">
                  Did the student:
                </td>
                <td colSpan={2} className="border border-black p-1 text-center align-middle text-[8.5pt]">
                  Completed<br/>successfully
                </td>
                <td rowSpan={2} className="border border-black p-2 text-center align-top w-[20%]">
                  Comments
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">Yes</td>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">No</td>
              </tr>
              {[{ id: 'pa3_cl_1', text: 'Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice' },
                { id: 'pa3_cl_2', text: 'Refer to all tool/equipment instructions/manufacturers guidelines prior to use.' },
                { id: 'pa3_cl_3', text: 'Refer to the completed JSA for the task' },
                { id: 'pa3_cl_4', text: 'Ensure gas detector is on and carried on your person' },
                { id: 'pa3_cl_5', text: 'Ensure cable guides/slippers are installed correctly' },
                { id: 'pa3_cl_6', text: 'Attach cable grip to cable and tape on' },
                { id: 'pa3_cl_7', text: 'Attach hauling rope to cable grip eye and tie off securely.' },
                { id: 'pa3_cl_8', text: 'Attach a new hauling rope to the cable grip eye' },
                { id: 'pa3_cl_9', text: 'Lubricate the cable' },
                { id: 'pa3_cl_10', text: 'Haul the cable ensuring hauling tension is not exceeded' },
                { id: 'pa3_cl_11', text: 'Ensure cable is cut with sufficient left in pits for jointing' },
                { id: 'pa3_cl_12', text: 'Flame brush cable end' },
                { id: 'pa3_cl_13', text: 'Fit endcap and shrink to seal cable' },
                { id: 'pa3_cl_14', text: 'Fit cable tags to both ends of cable' },
                { id: 'pa3_cl_15', text: 'Coil excess cable and secure to cable supports' },
                { id: 'pa3_cl_16', text: 'Test the continuity of the cable' },
                { id: 'pa3_cl_17', text: 'Close pits' },
                { id: 'pa3_cl_18', text: 'Ensure sufficient separation from other services in pits' },
                { id: 'pa3_cl_19', text: 'Restore site and clean and return all tools and equipment to the appropriate location' },
                { id: 'pa3_cl_20', text: 'Complete red line mark-up of plan showing completed work' },
                { id: 'pa3_cl_21', text: 'Complete project sign off sheet and get approval' },
                { id: 'pa3_cl_22', text: 'Submit your completed work to your supervisor (assessor) for inspection' }
              ].map((q, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle">
                    <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Task Outcome:</td>
                <td colSpan={2} className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_outcome': compRecord['pa3_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa3_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
                <td className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa3_outcome': compRecord['pa3_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Not Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa3_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor signature</td>
                <td colSpan={3} className="border border-black p-2 text-center align-middle">
                  <div onClick={() => !isStudent && openSigModal('pa3_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                    {(compRecord.assessor_signature || compRecord['pa3_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa3_assessor_sig']} className="max-h-[40px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor name</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="text" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Date</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="date" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={28} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 4 - Checklist</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <table className="w-full border-collapse border border-black text-[9.5pt]">
            <tbody>
              <tr>
                <td colSpan={4} className="border border-black p-2">
                  Student's name: <span className="ml-2">{studentName}</span>
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-black p-2 w-[60%] align-top">
                  Did the student:
                </td>
                <td colSpan={2} className="border border-black p-1 text-center align-middle text-[8.5pt]">
                  Completed<br/>successfully
                </td>
                <td rowSpan={2} className="border border-black p-2 text-center align-top w-[20%]">
                  Comments
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">Yes</td>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">No</td>
              </tr>
              {[{ id: 'pa4_cl_1', text: 'Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice' },
                { id: 'pa4_cl_2', text: 'Refer to all tool/equipment instructions/manufacturers guidelines prior to use.' },
                { id: 'pa4_cl_3', text: 'Refer to the completed JSA for the task' },
                { id: 'pa4_cl_4', text: 'Ensure gas detector is on and carried on your person' },
                { id: 'pa4_cl_5', text: 'Set up all equipment' },
                { id: 'pa4_cl_6', text: 'Excavate the site' },
                { id: 'pa4_cl_7', text: 'Shore up the excavation' },
                { id: 'pa4_cl_8', text: 'Install one of the pits' },
                { id: 'pa4_cl_9', text: 'Install the connecting conduits to the adjacent pits' },
                { id: 'pa4_cl_10', text: 'Backfill site' },
                { id: 'pa4_cl_11', text: 'Rod conduit' },
                { id: 'pa4_cl_12', text: 'Attach hauling line and draw through conduit' },
                { id: 'pa4_cl_13', text: 'Attach cleaning brush to hauling line and clean debris from conduit' },
                { id: 'pa4_cl_14', text: 'Prove conduit with appropriate size slug' },
                { id: 'pa4_cl_15', text: 'Leave hauling line in conduit' },
                { id: 'pa4_cl_16', text: 'Submit your completed work to your supervisor (assessor) for inspection' }
              ].map((q, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle">
                    <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Task Outcome:</td>
                <td colSpan={2} className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_outcome': compRecord['pa4_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa4_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
                <td className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_outcome': compRecord['pa4_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Not Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa4_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor signature</td>
                <td colSpan={3} className="border border-black p-2 text-center align-middle">
                  <div onClick={() => !isStudent && openSigModal('pa4_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                    {(compRecord.assessor_signature || compRecord['pa4_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa4_assessor_sig']} className="max-h-[40px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor name</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="text" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Date</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="date" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={29} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 4</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-2">Performance Criteria Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Criteria assessed in this task – ICTCBL334</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium ">1.1 Obtain construction design plan from appropriate personnel and determine and obtain type of underground enclosure specified</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_1': compRecord['pa4_pc_1_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.2 Arrange access to site according to required enterprise procedure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_2': compRecord['pa4_pc_1_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.3 Inform appropriate personnel of existing and potential worksite hazards</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_3': compRecord['pa4_pc_1_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.4 Verify location of proposed installation according to appropriate plans obtained from authorised personnel</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_4': compRecord['pa4_pc_1_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.5 Obtain information about location of other services from relevant authorities</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_5': compRecord['pa4_pc_1_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.6 Organise plant, tools and equipment for given work and safe work practice</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_6': compRecord['pa4_pc_1_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.7 Place recognised barriers during construction according to safety and enterprise requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_1_7': compRecord['pa4_pc_1_7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_1_7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.1 Excavate site, maintaining stability and allowing ease of access</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_2_1': compRecord['pa4_pc_2_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_2_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.2 Install enclosure or pit according to design specifications, and work health and safety (WHS) and environmental requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_2_2': compRecord['pa4_pc_2_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_2_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.3 Install conduit according to specifications and manufacturer requirements, ensuring internal surface from impediments and sharp edges for cable hauling</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_2_3': compRecord['pa4_pc_2_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_2_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.4 Seal conduit entry into enclosure against foreign matter</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_2_4': compRecord['pa4_pc_2_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_2_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.5 Install cable support structure and access facilities in pits according to specifications</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_2_5': compRecord['pa4_pc_2_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_2_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.1 Complete backfill safely using suitable soil and materials that ensure conduit protection</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_3_1': compRecord['pa4_pc_3_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_3_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.3 Restore site according to requirements of enterprise or approving authority and customer satisfaction</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_3_3': compRecord['pa4_pc_3_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_3_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.4 Complete reports on installation and design amendments accurately and file promptly according to requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_3_4': compRecord['pa4_pc_3_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_3_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">3.5 Notify appropriate personnel of job completion and obtain sign-off</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa4_pc_3_5': compRecord['pa4_pc_3_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa4_pc_3_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa4')}
            </tbody>
          </table>
        </div>
        <PageFooter n={30} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 4</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-4">Assessment Task Description</div>
          <p className="whitespace-pre-wrap">For this assessment, you are working as a telco technician. You have been assigned a task as part of a team by your supervisor to install 4 new pits in preparation for jointing. You will be required set up all equipment, excavate the site, shore up the excavation, install one of the pits, install the connecting conduits to the adjacent pits, install a joint support bar and reinstate the site and prove the conduit and install rope in preparation for hauling.<br /><br />Prior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and addressed hazards, unwanted events, and potential risks for the job.</p>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Resources Required</div>
          <ul className="list-disc pl-8 whitespace-pre-wrap mb-4">
            <li>Learners Guide</li>
            <li>Student Assessment Pack</li>
            <li>Blue or Black Pen</li>
            <li>WHS/OHS Acts/Regulations as applicable to the state of delivery</li>
            <li>Codes of practice<br />        ◦ How to manage work health and safety risks<br />        ◦ Managing the work environment and facilities<br />        ◦ Managing risks of plant in the workplace<br />        ◦ Managing noise preventing hearing loss work<br />        ◦ Managing the risk of falls at workplaces</li>
            <li>Workplace procedure 01687W01 Working at Telstra Manholes and Pits</li>
            <li>JSA-Included in this assessment pack</li>
            <li>Installed #6 pit</li>
            <li>#6 Pits x1</li>
            <li>Manhole guards*</li>
            <li>Pit keys x2*</li>
            <li>Gas detector*</li>
            <li>Gas action chart</li>
            <li>Shovel</li>
            <li>Shoring boards</li>
            <li>Conduit rodder</li>
            <li>Hauling rope*</li>
            <li>Sand scoop*</li>
            <li>Conduit cleaning brush*</li>
            <li>Conduits slug*</li>
            <li>50mm white UPV Conduit x 2 metres*</li>
            <li>50mm PVC Bush x 2*</li>
            <li>PVC Pipe adhesive and primer*</li>
            <li>Fibreglass joint support bar x 0.5metres</li>
            <li>10mm paintbrush*</li>
            <li>Hole saw 66mm*</li>
            <li>Hack saw*</li>
            <li>Deburring tool*</li>
            <li>Retro reflective vest*</li>
            <li>Gloves*</li>
            <li>Hard Hat*</li>
            <li>Safety glasses*</li>
          </ul>
          <p className="mt-4 text-[9pt]">Manufacturers specifications and operating instructions for all tools & equipment specified with a *</p>
        </div>
        <PageFooter n={31} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 4</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Timing</div>
          <p>Your assessor will advise you of the due date of these submissions.</p>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Assessment Instructions</div>
          <div className="font-bold mb-4">Complete the following activities:</div>
          <ol className="list-decimal pl-8 whitespace-pre-wrap mb-8">
            <li>Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice</li>
            <li>Refer to all tool/equipment instructions/manufacturers guidelines prior to use.</li>
            <li>Refer to the completed JSA for the task</li>
            <li>Ensure gas detector is on and carried on your person</li>
            <li>Set up all equipment</li>
            <li>Excavate the site</li>
            <li>Shore up the excavation</li>
            <li>Install one of the pits</li>
            <li>Install the connecting conduits to the adjacent pits</li>
            <li>Backfill site</li>
            <li>Rod conduit</li>
            <li>Attach hauling line and draw through conduit</li>
            <li>Attach cleaning brush to hauling line and clean debris from conduit</li>
            <li>Prove conduit with appropriate size slug</li>
            <li>Leave hauling line in conduit</li>
            <li>Install a joint support bar in the pit</li>
            <li>Fit the pit gasket and pit lid</li>
            <li>Submit your completed work to your supervisor (assessor) for inspection</li>
          </ol>
        </div>
        <div className="mb-6 flex flex-col items-center break-inside-avoid">
          <div className="text-[12pt] text-black text-left w-full m-0 p-0 mb-4">Plan of proposed work</div>
          <img src="/assets/question-15/task4.png" alt="Plan of proposed work" className="max-w-[500px] max-h-[400px] object-contain" />
        </div>
        <PageFooter n={32} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 5</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-2">Performance Criteria Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Criteria assessed in this task – ICTCBL249</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium ">1.1 Arrange access to site according to required procedure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_1_1': compRecord['pa5_pc_1_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_1_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.2 Inform appropriate personnel of identified hazards on worksite</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_1_2': compRecord['pa5_pc_1_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_1_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.3 Confirm hauling location of proposed cable according to appropriate plan specifications obtained from authorised personnel</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_1_3': compRecord['pa5_pc_1_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_1_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.4 Obtain information about proposed locations of other services from relevant authorities</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_1_4': compRecord['pa5_pc_1_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_1_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.5 Set up tools and equipment required for safe work practice according to enterprise guidelines</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_1_5': compRecord['pa5_pc_1_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_1_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">1.6 Check for dangerous gases and place guards around open manholes according to work health and safety (WHS) and environmental requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_1_6': compRecord['pa5_pc_1_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_1_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.1 InstaIl cable protection on pole for transition using approved hardware according to industry standards and asset owner requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_1': compRecord['pa5_pc_2_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.2 Connect conduit to pits or manholes as designed according to industry standards and asset owner requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_2': compRecord['pa5_pc_2_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.3 Haule existing cables in a way that avoids cable damage</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_3': compRecord['pa5_pc_2_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.4 Rodding techniques to prove that underground conduit is clear for hauling</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_4': compRecord['pa5_pc_2_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.5 Attach cable to rope for hauling, lubricate cable as required and haul at correct tension, maintaining smooth passage between dispenser and hauler</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_5': compRecord['pa5_pc_2_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.5 Pull cable through conduit to facilitate aerial to underground transition/underground to aerial transition, as required</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_5': compRecord['pa5_pc_2_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.5 Retain sufficient cable length allowance for jointing and ensure cable is laid up and bent within bending radius tolerance for materials in underground enclosure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_5': compRecord['pa5_pc_2_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.7 Cables according to enterprise requirements to ensure no sheath damage</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_7': compRecord['pa5_pc_2_7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.8 Attach ID tag for future identification</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_8': compRecord['pa5_pc_2_8'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_8'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.8 Clean the site to customer satisfaction and dispose of waste in an environmentally safe manner</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_8': compRecord['pa5_pc_2_8'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_8'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">2.9 Appropriate personnel about job completion and obtain sign-off</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pc_2_9': compRecord['pa5_pc_2_9'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pc_2_9'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa5')}
            </tbody>
          </table>
        </div>
        <PageFooter n={33} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 5</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-2">Performance Evidence Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Evidence assessed in this task-ICTCBL249</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium ">PE1. plan the works and prepare the site</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pe_pe1': compRecord['pa5_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE2. read and interpret drawings and designs to interpret installation requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pe_pe2': compRecord['pa5_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE3. haul cable applying related work health and safety (WHS) requirements and work practices</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pe_pe3': compRecord['pa5_pe_pe3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pe_pe3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE4. transition cable from aerial to underground or underground to aerial</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pe_pe4': compRecord['pa5_pe_pe4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pe_pe4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE5. use cable dispensing equipment</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pe_pe5': compRecord['pa5_pe_pe5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pe_pe5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium ">PE6. use specialized hand or power tools and equipment for hauling cable safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa5_pe_pe6': compRecord['pa5_pe_pe6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa5_pe_pe6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa5')}
            </tbody>
          </table>
          <p className="mt-4 text-[9pt]">2nd reattempt cannot be undertaken on the same date as the initial and 1st reattempt. (see Instructions to Students) The last date of this observation is to match the date for this assessment on the assessment outcome page.</p>
        </div>
        <PageFooter n={34} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 6</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <p className="mb-4">Your assessor will advise you of the due date of these submissions.</p>
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Assessment Instructions</div>
          <div className="font-bold mb-4">Complete the following activities:</div>
          <ol className="list-decimal pl-8 whitespace-pre-wrap mb-8">
            <li>Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice.</li>
            <li>Refer to all tool/equipment instructions/manufacturers guidelines prior to use.</li>
            <li>Refer to the completed JSA for the task.</li>
            <li>Ensure gas detector is on and carried on your person.</li>
            <li>Set up all equipment.</li>
            <li>Refer to the construction plan.</li>
            <li>Mark out the excavation area using marking paint.</li>
            <li>Excavate the site.</li>
            <li>Shore up the excavation.</li>
            <li>Install an earth mat and connecting earth wire in preparation for the manhole installation.</li>
            <li>Install a foundation base for the manhole.</li>
            <li>Install the prefabricated manhole and plinth.</li>
            <li>Install the #6 pit.</li>
            <li>Install the connecting conduits to the adjacent pits.</li>
            <li>Backfill site.</li>
            <li>Rod conduit.</li>
            <li>Attach hauling line and draw through conduit.</li>
            <li>Attach cleaning brush to hauling line and clean debris from conduit.</li>
            <li>Prove conduit with appropriate size slug.</li>
            <li>Leave hauling line in conduit.</li>
            <li>Install a joint support bar in the pit.</li>
            <li>Fit the pit gasket and pit lid.</li>
            <li>Submit your completed work to your supervisor (assessor) for inspection.</li>
          </ol>
        </div>
        <div className="mb-6 flex flex-col items-center break-inside-avoid">
          <div className="text-[12pt] text-black text-left w-full m-0 p-0 mb-4">Plan of proposed work</div>
          <img src="/assets/question-15/task6.png" alt="Plan of proposed work" className="max-w-[700px] max-h-[400px] object-contain" />
        </div>
        <PageFooter n={35} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 6</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-4">Assessment Task Description</div>
          <p className="whitespace-pre-wrap">For this assessment, you are working as a telco technician. You have been assigned a task as part of a team by your supervisor to install a prefabricated manhole, conduit and a 6 pit in preparation for jointing. You will be required set up all equipment, excavate the site, shore up the excavation, install base material, install an earth mat, install the prefabricated manhole, install the #6 pit, install the connecting conduits from the manhole to the adjacent pit and reinstate the site and prove the conduit and install rope in preparation for hauling.<br /><br />Prior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and addressed hazards, unwanted events, and potential risks for the job.</p>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Resources Required</div>
          <ul className="list-disc pl-8 whitespace-pre-wrap mb-4">
            <li>Learners Guide</li>
            <li>Student Assessment Pack</li>
            <li>Blue or Black Pen</li>
            <li>WHS/OHS Acts/Regulations as applicable to the state of delivery.</li>
            <li>Codes of practice<br />        ◦ How to manage work health and safety risks<br />        ◦ Managing the work environment and facilities<br />        ◦ Managing risks of plant in the workplace<br />        ◦ Managing noise preventing hearing loss work<br />        ◦ Managing the risk of falls at workplaces<br />        ◦ Managing electrical risks in the workplace</li>
            <li>Workplace procedure 01687W01 Working at Telstra Manholes and Pits</li>
            <li>JSA-Included in this assessment pack.</li>
            <li>Cable and Conduit Plans - Included in this assessment pack.</li>
            <li>1 x Prefabricated manhole with plinth and covers.</li>
            <li>1 x #6 Pits x1</li>
            <li>4 x sets of Manhole guards*</li>
            <li>Pit keys x2*</li>
            <li>Gas detector*</li>
            <li>Gas action chart</li>
            <li>Shovel</li>
            <li>Shoring boards</li>
            <li>Conduit rodder</li>
            <li>Hauling rope*</li>
            <li>Sand scoop*</li>
            <li>Conduit cleaning brush*</li>
            <li>Conduit slug*</li>
            <li>50mm white UPV Conduit x 2 meters*</li>
            <li>50mm PVC Bush x 2*</li>
            <li>PVC Pipe adhesive and primer*</li>
            <li>Fiberglass joint support bar x 0.5metres</li>
            <li>10mm paintbrush*</li>
            <li>Hole saw 66mm*</li>
            <li>Hack saw*</li>
            <li>Deburring tool*</li>
            <li>Backfill material (sand)</li>
          </ul>
        </div>
        <PageFooter n={36} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 6</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-4">Assessment Resources – Continued</div>
          <ul className="list-disc pl-8 whitespace-pre-wrap mb-4">
            <li>4 leg chain</li>
            <li>Excavator (optional)</li>
            <li>Large Builder's Square</li>
            <li>Marking paint</li>
            <li>Crane (as applicable to the type of prefabricated manhole)</li>
            <li>Crushed Rock</li>
            <li>Fixing adhesive</li>
            <li>Formwork material</li>
            <li>Manhole fittings, bearers, anchor irons and earthing systems</li>
            <li>Mechanical ditching machine (optional)</li>
            <li>Prefabricated concrete plinth and template.</li>
            <li>Ready mix concrete</li>
            <li>Shoring system</li>
            <li>Earthing Kit</li>
            <li>Warning Signs</li>
            <li>Wire Loops and associated lifting slings and shackles.</li>
            <li>Retro reflective vest*</li>
            <li>Gloves*</li>
            <li>Hard Hat*</li>
            <li>Safety glasses*</li>
          </ul>
          <p className="mt-4 text-[9pt] text-red-600">Manufacturer's specifications and operating instructions for all tools & equipment specifi *</p>
        </div>
        <PageFooter n={37} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 6 – Checklist</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <table className="w-full border-collapse border border-black text-[9.5pt]">
            <tbody>
              <tr>
                <td colSpan={4} className="border border-black p-2">
                  Student's name: <span className="ml-2">{studentName}</span>
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-black p-2 w-[60%] align-top">
                  Did the student:
                </td>
                <td colSpan={2} className="border border-black p-1 text-center align-middle text-[8.5pt]">
                  Completed<br/>successfully
                </td>
                <td rowSpan={2} className="border border-black p-2 text-center align-top w-[20%]">
                  Comments
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">Yes</td>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">No</td>
              </tr>
              {[{ id: 'pa6_cl_1', text: 'Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice' },
                { id: 'pa6_cl_2', text: 'Refer to all tool/equipment instructions/manufacturers guidelines prior to use.' },
                { id: 'pa6_cl_3', text: 'Refer to the completed JSA for the task' },
                { id: 'pa6_cl_4', text: 'Ensure gas detector is on and carried on your person' },
                { id: 'pa6_cl_5', text: 'Set up all equipment' },
                { id: 'pa6_cl_6', text: 'Refer to the construction plan.' },
                { id: 'pa6_cl_7', text: 'Mark out the excavation area using marking paint' },
                { id: 'pa6_cl_8', text: 'Excavate the site.' },
                { id: 'pa6_cl_9', text: 'Shore up the excavation' },
                { id: 'pa6_cl_10', text: 'Install an earth mat and connecting earth wire in preparation for the manhole installation.' },
                { id: 'pa6_cl_11', text: 'Install a foundation base for the manhole.' },
                { id: 'pa6_cl_12', text: 'Install the prefabricated manhole and plinth.' },
                { id: 'pa6_cl_13', text: 'Install the #6 pit.' },
                { id: 'pa6_cl_14', text: 'Install the connecting conduits to the adjacent pits.' },
                { id: 'pa6_cl_15', text: 'Backfill site' },
                { id: 'pa6_cl_16', text: 'Rod conduit' },
                { id: 'pa6_cl_17', text: 'Attach hauling line and draw through conduit' },
                { id: 'pa6_cl_18', text: 'Attach cleaning brush to hauling line and clean debris from conduit.' },
                { id: 'pa6_cl_19', text: 'Prove conduit with appropriate size slug.' },
                { id: 'pa6_cl_20', text: 'Leave hauling line in conduit.' },
                { id: 'pa6_cl_21', text: 'Install a joint support bar in the pit' },
                { id: 'pa6_cl_22', text: 'Fit the pit gasket and pit lid' },
                { id: 'pa6_cl_23', text: 'Submit your completed work to your supervisor (assessor) for inspection' }
              ].map((q, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle">
                    <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Task Outcome:</td>
                <td colSpan={2} className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa6_outcome': compRecord['pa6_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa6_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
                <td className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa6_outcome': compRecord['pa6_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Not Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa6_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor signature</td>
                <td colSpan={3} className="border border-black p-2 text-center align-middle">
                  <div onClick={() => !isStudent && openSigModal('pa6_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                    {(compRecord.assessor_signature || compRecord['pa6_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa6_assessor_sig']} className="max-h-[40px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor name</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="text" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Date</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="date" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={38} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 7</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-1">Performance Criteria Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt] mb-8">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Criteria assessed in this task – ICTCBL334</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.2 Arrange access to site according to required enterprise procedure</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_1_2': compRecord['pa7_pc_1_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_1_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.3 Inform appropriate personnel of existing and potential worksite hazards</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_1_3': compRecord['pa7_pc_1_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_1_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.4 Verify location of proposed installation according to appropriate plans obtained from authorized *</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_1_4': compRecord['pa7_pc_1_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_1_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.5 Obtain information about location of other services from relevant authorities</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_1_5': compRecord['pa7_pc_1_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_1_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.6 Organise plant, tools, and equipment for given work and safe work practice</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_1_6': compRecord['pa7_pc_1_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_1_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.7 Place recognised barriers during construction according to safety and enterprise requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_1_7': compRecord['pa7_pc_1_7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_1_7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.1 Excavate site, maintaining stability and allowing ease of access</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_2_1': compRecord['pa7_pc_2_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_2_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.1 Complete backfill safely using suitable soil and materials that ensure conduit protection</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_3_1': compRecord['pa7_pc_3_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_3_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.2 Recover obsolete materials and equipment and return to appropriate point for disposal</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_3_2': compRecord['pa7_pc_3_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_3_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.3 Restore site according to requirements of enterprise or approving authority and customer ***</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_3_3': compRecord['pa7_pc_3_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_3_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.4 Complete reports on installation and design amendments accurately and file promptly according requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_3_4': compRecord['pa7_pc_3_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_3_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.5 Notify appropriate personnel of job completion and obtain sign-off</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pc_3_5': compRecord['pa7_pc_3_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pc_3_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa7')}
            </tbody>
          </table>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-1">Performance Evidence Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Evidence assessed in this task-ICTCBL334</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE1. interpret and apply design plans and prepare for construction</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pe_pe1': compRecord['pa7_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE2. use specialised hand or power tools and equipment normally used for excavation ,installation and site restoration, safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pe_pe2': compRecord['pa7_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE3. excavate for installation of an enclosure and conduit according to industry standard Work health and safety requirements and work practices</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_pe_pe3': compRecord['pa7_pe_pe3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_pe_pe3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa7')}
            </tbody>
          </table>
        </div>
        <PageFooter n={39} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 7</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Assessment Instructions</div>
          <div className="font-bold mb-4">Complete the following activities:</div>
          <ol className="list-decimal pl-8 whitespace-pre-wrap mb-8">
            <li>Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice</li>
            <li>Refer to all tool/equipment instructions/manufacturers guidelines prior to use.</li>
            <li>Refer to the completed JSA for the task</li>
            <li>Ensure gas detector is on and carried on your person</li>
            <li>Set up all equipment</li>
            <li>Excavate the site</li>
            <li>Remove pit and conduit</li>
            <li>Install one of the pits</li>
            <li>Backfill site</li>
            <li>Compact and restore site to ground level</li>
            <li>Complete project sign off sheet</li>
            <li>Submit your completed work to your supervisor (assessor) for inspection</li>
          </ol>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Timing</div>
          <p>Your assessor will advise you of the due date of these submissions.</p>
        </div>
        <PageFooter n={40} />
      </div>


      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 7</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-4">Assessment Task Description</div>
          <p className="whitespace-pre-wrap">For this assessment, you are working as a telco technician. You have been assigned a task by your supervisor to recover an obsolete pit and ducts. You are to excavate and remove the pit and conduits, backfill, and reinstate the site and recover or dispose of all equipment as directed.<br /><br />Prior to commencing the task, you are required to assess the work site and complete a Job Safety Analysis (JSA) to capture and addressed hazards, unwanted events, and potential risks for the job.</p>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Resources Required</div>
          <ul className="list-disc pl-8 whitespace-pre-wrap mb-4">
            <li>Learners Guide</li>
            <li>Student Assessment Pack</li>
            <li>Blue or Black Pen</li>
            <li>WHS/OHS Acts/Regulations as applicable to the state of delivery</li>
            <li>Codes of practice<br />        ◦ How to manage work health and safety risks<br />        ◦ Managing the work environment and facilities<br />        ◦ Managing risks of plant in the workplace<br />        ◦ Managing noise preventing hearing loss work<br />        ◦ Managing the risk of falls at workplaces</li>
            <li>Workplace procedure 01687W01 Working at Telstra Manholes and Pits</li>
            <li>JSA-Included in this assessment pack</li>
            <li>Installed #6 Pit with conduits installed</li>
            <li>Manhole guards*</li>
            <li>Pit keys x2*</li>
            <li>Gas detector*</li>
            <li>Gas action chart</li>
            <li>Shovel</li>
            <li>Backfill material (sand)</li>
            <li>Retro reflective vest*</li>
            <li>Gloves*</li>
            <li>Hard Hat*</li>
            <li>Safety glasses*</li>
            <li>Manufacturers specifications and operating instructions for all tools & equipment specified with a*.</li>
          </ul>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[12pt] text-black text-left m-0 p-0 mb-2">Timing</div>
          <p>Your assessor will advise you of the due date of these submissions.</p>
        </div>
        <PageFooter n={41} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 7 – Checklist</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <table className="w-full border-collapse border border-black text-[9.5pt]">
            <tbody>
              <tr>
                <td colSpan={4} className="border border-black p-2">
                  Student's name: <span className="ml-2">{studentName}</span>
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="border border-black p-2 w-[60%] align-top">
                  Did the student:
                </td>
                <td colSpan={2} className="border border-black p-1 text-center align-middle text-[8.5pt]">
                  Completed<br/>successfully
                </td>
                <td rowSpan={2} className="border border-black p-2 text-center align-top w-[20%]">
                  Comments
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">Yes</td>
                <td className="border border-black p-1 text-center text-[8.5pt] w-[10%]">No</td>
              </tr>
              {[{ id: 'pa7_cl_1', text: 'Ensure that all tasks will follow all applicable WHS/OHS requirements and procedures in appropriate Codes of Practice' },
                { id: 'pa7_cl_2', text: 'Refer to all tool/equipment instructions/manufacturers guidelines prior to use.' },
                { id: 'pa7_cl_3', text: 'Refer to the completed JSA for the task' },
                { id: 'pa7_cl_4', text: 'Ensure gas detector is on and carried on your person' },
                { id: 'pa7_cl_5', text: 'Set up all equipment' },
                { id: 'pa7_cl_6', text: 'Excavate the site.' },
                { id: 'pa7_cl_7', text: 'Remove pit and conduit' },
                { id: 'pa7_cl_8', text: 'Install one of the pits' },
                { id: 'pa7_cl_9', text: 'Backfill site' },
                { id: 'pa7_cl_10', text: 'Compact and restore site to ground level' },
                { id: 'pa7_cl_11', text: 'Complete project sign off sheet' },
                { id: 'pa7_cl_12', text: 'Submit your completed work to your supervisor (assessor) for inspection' }
              ].map((q, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2">{q.text}</td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'Yes' ? '' : 'Yes' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'Yes' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, [q.id]: compRecord[q.id] === 'No' ? '' : 'No' })}>
                    <div className="flex items-center justify-center min-h-[20px] relative">
                      {compRecord[q.id] === 'No' && <span className="text-red-600 font-bold text-3xl absolute -top-1.5">✓</span>}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle">
                    <input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord[`${q.id}_comments`] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, [`${q.id}_comments`]: e.target.value })} readOnly={isStudent} />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Task Outcome:</td>
                <td colSpan={2} className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_outcome': compRecord['pa7_outcome'] === 'Satisfactory' ? '' : 'Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa7_outcome'] === 'Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
                <td className="border border-black p-2 align-middle">
                  <div className="flex gap-2 items-center justify-start pl-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_outcome': compRecord['pa7_outcome'] === 'Not Satisfactory' ? '' : 'Not Satisfactory' })}>
                    <span className="font-bold text-[9.5pt]">Not Satisfactory</span>
                    <div className="w-[14px] h-[14px] border-[2px] border-black bg-white relative flex justify-center items-center">
                      {compRecord['pa7_outcome'] === 'Not Satisfactory' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor signature</td>
                <td colSpan={3} className="border border-black p-2 text-center align-middle">
                  <div onClick={() => !isStudent && openSigModal('pa7_assessor_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer flex items-center justify-center">
                    {(compRecord.assessor_signature || compRecord['pa7_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa7_assessor_sig']} className="max-h-[40px] max-w-[120px] object-contain inline-block" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Assessor name</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="text" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} />
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-[9.5pt]">Date</td>
                <td colSpan={3} className="border border-black p-2 text-left align-middle">
                  <input type="date" className="w-full bg-transparent pl-2 focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={42} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Practical Assessment Task 7 - Checklist</h1>
        </div>
        <div className="text-[12pt] text-black text-left m-0 p-0 mb-6">Project Signoff Sheet</div>
        <div className="border border-black p-8 mx-auto w-[90%] max-w-[800px]">
          <h2 className="text-center font-bold text-[14pt] mb-6">Project Sign-off Sheet</h2>
          <table className="w-full border-collapse border border-black text-[10pt] mb-6">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-1/2">Project Name:<br /><input type="text" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord['pa7_project_name'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_project_name': e.target.value })} readOnly={isStudent} /></td>
                <td className="border border-black p-2 w-1/2">Project Manager:<br /><input type="text" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord['pa7_project_manager'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_project_manager': e.target.value })} readOnly={isStudent} /></td>
              </tr>
              <tr>
                <td className="border border-black p-2 w-1/2">Start Date:<br /><input type="date" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td>
                <td className="border border-black p-2 w-1/2">Completion Date:<br /><input type="date" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td>
              </tr>
              <tr>
                <td className="border border-black p-2 w-1/2">Project Duration:<br /><input type="text" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord['pa7_project_duration'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_project_duration': e.target.value })} readOnly={isStudent} /></td>
                <td className="border border-black p-2 w-1/2">Customer:<br /><input type="text" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord['pa7_customer'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_customer': e.target.value })} readOnly={isStudent} /></td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black p-2 align-top h-[80px]">Project Goal:<br /><textarea className="w-full h-[50px] resize-none bg-transparent focus:outline-none mt-1" value={compRecord['pa7_project_goal'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_project_goal': e.target.value })} readOnly={isStudent} /></td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black p-2 align-top h-[80px]">Project Deliverables:<br /><textarea className="w-full h-[50px] resize-none bg-transparent focus:outline-none mt-1" value={compRecord['pa7_project_deliverables'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_project_deliverables': e.target.value })} readOnly={isStudent} /></td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black p-2 align-top h-[60px]">Clients:<br /><input type="text" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord['pa7_clients'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_clients': e.target.value })} readOnly={isStudent} /></td>
              </tr>
              <tr>
                <td className="border border-black p-2 w-1/2 align-top">By signing this document, I acknowledge that I have delivered all levels the stated deliverables at the agreed to quality levels.</td>
                <td className="border border-black p-2 w-1/2 align-top">By signing this document, I acknowledge that I have received all the stated deliverables at the agreed to quality levels</td>
              </tr>
              <tr>
                <td className="border border-black p-2 w-1/2 align-top h-[80px]">Project Manager Name and Signature:<br /><input type="text" className="w-full bg-transparent focus:outline-none mb-1 mt-1" value={compRecord['pa7_pm_name'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_pm_name': e.target.value })} readOnly={isStudent} placeholder="Name" /><div onClick={() => !isStudent && openSigModal('pa7_pm_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer">{(compRecord.assessor_signature || compRecord['pa7_pm_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa7_pm_sig']} className="max-h-[30px] max-w-[100px] object-contain" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}</div></td>
                <td className="border border-black p-2 w-1/2 align-top h-[80px]">Customer Name and Signature:<br /><input type="text" className="w-full bg-transparent focus:outline-none mb-1 mt-1" value={compRecord['pa7_cust_name'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_cust_name': e.target.value })} readOnly={isStudent} placeholder="Name" /><div onClick={() => !isStudent && openSigModal('pa7_cust_sig', 'comp')} className="w-full min-h-[30px] cursor-pointer">{(compRecord.assessor_signature || compRecord['pa7_cust_sig']) ? <img src={compRecord.assessor_signature || compRecord['pa7_cust_sig']} className="max-h-[30px] max-w-[100px] object-contain" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}</div></td>
              </tr>
              <tr>
                <td className="border border-black p-2 w-1/2">Date:<br /><input type="date" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td>
                <td className="border border-black p-2 w-1/2">Date:<br /><input type="date" className="w-full bg-transparent focus:outline-none mt-1" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td>
              </tr>
            </tbody>
          </table>
          <div className="border border-black p-2 h-[200px]">
            <span className="underline">Remarks</span><br />
            <textarea className="w-full h-[150px] resize-none bg-transparent focus:outline-none mt-1" value={compRecord['pa7_remarks'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'pa7_remarks': e.target.value })} readOnly={isStudent} />
          </div>
        </div>
        <PageFooter n={43} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-1">Performance Criteria Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt] mb-8">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Criteria assessed in this task - ICTCBL253</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.1 Obtain construction design plan from appropriate personnel to scope work and arrange for site access</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_1_1': compRecord['pa7_253_pc_1_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_1_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.2 Notify appropriate personnel of identified safety hazards and other services that will need to be considered</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_1_2': compRecord['pa7_253_pc_1_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_1_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.3 Obtain plant, tools, and safety equipment to perform tasks safely and efficiently</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_1_3': compRecord['pa7_253_pc_1_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_1_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">1.4 Determine type of underground pit/manhole required for project as specified in construction design plan</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_1_4': compRecord['pa7_253_pc_1_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_1_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.1 Use tools according to enterprise guidelines and work health and safety (WHS) regulations</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_2_1': compRecord['pa7_253_pc_2_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_2_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.2 Determine excavation meets specification of design plan</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_2_2': compRecord['pa7_253_pc_2_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_2_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.3 Place foundation of suitable material to provide safe and stable footing prior to installing underground enclosure in excavation</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_2_3': compRecord['pa7_253_pc_2_3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_2_3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.4 Place recognised barrier over construction where enclosure is to be installed overpower cables according to enterprise requirements or agreements with other authorities</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_2_4': compRecord['pa7_253_pc_2_4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_2_4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.5 Install earth mat facility under enclosure as required by enterprise</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_2_5': compRecord['pa7_253_pc_2_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_2_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">2.6 Install enclosure specified in construction design plan according to manufacturer specifications using specified materials</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_2_6': compRecord['pa7_253_pc_2_6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_2_6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.1 Install conduit in trench to enterprise specifications</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_3_1': compRecord['pa7_253_pc_3_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_3_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">3.2 Connect conduit to enclosure according to manufacturer specifications and industry practice</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_3_2': compRecord['pa7_253_pc_3_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_3_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">4.1 Complete reports and record alterations to plans using appropriate symbols, according to enterprise policy</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_4_1': compRecord['pa7_253_pc_4_1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_4_1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">4.2 Complete all labelling requirements according to industry standard</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_4_2': compRecord['pa7_253_pc_4_2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_4_2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">4.5 Notify appropriate personnel of job completion and obtain sign-off</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pc_4_5': compRecord['pa7_253_pc_4_5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pc_4_5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa7_253')}
            </tbody>
          </table>
        </div>
        <div className="mb-4 break-inside-avoid">
          <div className="text-[11pt] font-bold text-black text-left m-0 p-0 mb-1">Performance Evidence Mapping</div>
          <table className="w-full border-collapse border border-black text-[9pt]">
            <thead><tr><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap">Performance Evidence assessed in this task-ICTCBL253</th><th className="border border-black bg-gray-200 p-2 text-center font-bold whitespace-pre-wrap w-[15%]">Tick Completed</th></tr></thead>
            <tbody>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE1. interpret and apply design plans and prepare for construction</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe1': compRecord['pa7_253_pe_pe1'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe1'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE2. install enclosures including pipe, pit, and prefabricated manholes</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe2': compRecord['pa7_253_pe_pe2'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe2'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE3. construct in two different soil types: sand, rock, soil, or combination soil types</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe3': compRecord['pa7_253_pe_pe3'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe3'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE4. shore an excavation site to meet enterprise and regulatory requirements</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe4': compRecord['pa7_253_pe_pe4'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe4'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE5. use specialised hand or power tools and equipment normally used for excavation, pipe, conduit installation and site restoration safely</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe5': compRecord['pa7_253_pe_pe5'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe5'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE6. complete and document specified work</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe6': compRecord['pa7_253_pe_pe6'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe6'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              <tr><td className="border border-black p-2 font-medium w-3/5">PE7. apply related work health and safety (WHS) requirements and work practices associated with excavation, enclosure installation and site restoration.</td><td colSpan={1} className="border border-black p-2 text-center align-middle"><div className="flex flex-col gap-1 items-center justify-center"><div className="flex gap-2 items-center cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'pa7_253_pe_pe7': compRecord['pa7_253_pe_pe7'] === 'Completed' ? '' : 'Completed' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['pa7_253_pe_pe7'] === 'Completed' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span></span></div></div></td></tr>
              {renderAttemptsSignature('pa7_253')}
            </tbody>
          </table>
          <div className="mt-4 text-[9pt] text-[#cc0000]">2nd reattempt cannot be undertaken on the same date as the initial and 1st reattempt. (see Instructions to Students) The last date of this observation is to match the date for this assessment on the assessment outcome page.</div>
        </div>
        <PageFooter n={44} />
      </div>

      <div className="page">
        <CustomTaskHeader />
        <div className="bg-[#dae3f3] py-2 px-3 mb-6 w-full flex-shrink-0 mt-4">
          <h1 className="text-[14pt] font-bold text-black text-left m-0 p-0">Assessment Outcome</h1>
        </div>
        <div className="mb-4 break-inside-avoid">
          <table className="w-full border-collapse border border-black text-[9pt]">
            <tbody>
              <tr><td className="border border-black p-2 w-[25%]">Unit Code & Title:</td><td className="border border-black p-2 font-bold w-[50%]">ICTCBL334 ICTCBL329 ICTCBL249<br />ICTCBL253</td><td className="border border-black p-2">USI</td><td className="border border-black p-2 w-[15%]"><input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord['usi'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'usi': e.target.value })} readOnly={isStudent} /></td></tr>
              <tr><td className="border border-black p-2">Course Title:</td><td colSpan={3} className="border border-black p-2">Pit, Pipe, Manholes and Cable Hauling</td></tr>
              <tr><td className="border border-black p-2">Student Name:</td><td colSpan={3} className="border border-black p-2"><input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord['student_name'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'student_name': e.target.value })} readOnly={isStudent} /></td></tr>
              <tr><td className="border border-black p-2">Cohort (if known):</td><td colSpan={1} className="border border-black p-2"><input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord['cohort'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'cohort': e.target.value })} readOnly={isStudent} /></td><td className="border border-black p-2">Date Submitted:</td><td className="border border-black p-2"><input type="date" className="w-full bg-transparent focus:outline-none" value={compRecord['date_submitted'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'date_submitted': e.target.value })} readOnly={isStudent} /></td></tr>
              <tr><td className="border border-black p-2">Trainer:</td><td colSpan={1} className="border border-black p-2"><input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord['trainer'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'trainer': e.target.value })} readOnly={isStudent} /></td><td className="border border-black p-2">Campus/Online/Distance:</td><td className="border border-black p-2"><input type="text" className="w-full bg-transparent focus:outline-none" value={compRecord['campus'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'campus': e.target.value })} readOnly={isStudent} /></td></tr>
              <tr><td className="border border-black p-2">Learner Instructions:</td><td colSpan={3} className="border border-black p-2 font-bold">All Learner information MUST be completed for your assignment to be accepted for marking.</td></tr>
              <tr><td className="border border-black p-2">Submission/presentation details:</td><td colSpan={3} className="border border-black p-2"><span className="font-bold">Hard Copy:</span> Complete your assessment, sign the Learner declaration below and submit it to your trainer.<br /><br /><span className="font-bold">Soft Copy:</span> If submitting via the LMS, email or another electronic format, you must include a copy of the learner declaration below (this is provided with the Submit Button in the LMS)</td></tr>
              <tr>
                <td colSpan={2} className="border border-black p-2 align-top"><span className="font-bold">Learner Declaration:</span><br />I certify that the attached material is my original work. I consent to my assessment being checked, electronically or otherwise, for plagiarism, collusion, and use of model answers, correct referencing or any other form of misrepresentation. I have not submitted this assessment for any other course or unit.</td>
                <td colSpan={2} className="border border-black p-2 align-top">
                  <div className="flex items-center mb-4"><span className="font-bold w-[80px]">Signature:</span><div onClick={() => !isStudent && openSigModal('learner_dec_sig', 'comp')} className="w-full border-b border-black min-h-[20px] cursor-pointer inline-flex items-center justify-center">{(compRecord.assessor_signature || compRecord['learner_dec_sig']) ? <img src={compRecord.assessor_signature || compRecord['learner_dec_sig']} className="max-h-[25px] max-w-[100px] object-contain" /> : <span className="text-[10px] text-slate-400 italic no-print">Click to sign</span>}</div></div>
                  <div className="flex items-center"><span className="font-bold w-[80px]">Date:</span><input required={isStudent} type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={answers['student_decl_date'] || (submitDate ? submitDate.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'student_decl_date': e.target.value })} disabled={!isStudent} /></div>
                </td>
              </tr>
              <tr><td colSpan={4} className="border border-black p-2 align-top"><span className="font-bold">Assessor Instructions:</span><br />Mark each assessment task as either Satisfactory (S) or Not Yet Satisfactory (NYS) and the complete the appropriate date. Tick the box appropriate to the assessment judgment, indicate if verbal feed was given and add written feedback as required for learners. Read and agree to the assessor declaration, sign and date this cover sheet, and if applicable record the result on the Institute's LMS and hand the completed SAP to student administration or the training manager.</td></tr>
              <tr><td colSpan={2} className="border border-black p-2 text-center font-bold">Assessment Task</td><td className="border border-black p-2 text-center font-bold">Circle S or<br />NYS</td><td className="border border-black p-2 text-center font-bold">Date</td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 1</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat1_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat1_result': compRecord['outcome_pat1_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat1_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat1_result': compRecord['outcome_pat1_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Knowledge Assessment Task 1</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_kat1_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_kat1_result': compRecord['outcome_kat1_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_kat1_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_kat1_result': compRecord['outcome_kat1_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 2</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat2_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat2_result': compRecord['outcome_pat2_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat2_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat2_result': compRecord['outcome_pat2_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 3</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat3_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat3_result': compRecord['outcome_pat3_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat3_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat3_result': compRecord['outcome_pat3_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 4</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat4_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat4_result': compRecord['outcome_pat4_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat4_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat4_result': compRecord['outcome_pat4_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 5</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat5_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat5_result': compRecord['outcome_pat5_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat5_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat5_result': compRecord['outcome_pat5_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 6</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat6_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat6_result': compRecord['outcome_pat6_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat6_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat6_result': compRecord['outcome_pat6_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2">Practical Assessment Task 7</td><td className="border border-black p-2 text-center"><div className="flex gap-2 justify-center items-center"><div className={`cursor-pointer font-bold ${compRecord['outcome_pat7_result'] === 'S' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat7_result': compRecord['outcome_pat7_result'] === 'S' ? '' : 'S' })}>S</div><div className={`cursor-pointer font-bold ${compRecord['outcome_pat7_result'] === 'NYS' ? 'text-red-600 border border-red-600 rounded-full px-1' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_pat7_result': compRecord['outcome_pat7_result'] === 'NYS' ? '' : 'NYS' })}>NYS</div></div></td><td className="border border-black p-2 text-center"><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></td></tr>
              <tr><td colSpan={2} className="border border-black p-2"><span className="font-bold">Final Result</span><span className="ml-8">(Please check box)</span></td><td colSpan={2} className="border border-black p-2"><div className="flex justify-between items-center w-full"><div className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_final_result': compRecord['outcome_final_result'] === 'NYC' ? '' : 'NYC' })}><span>Not Yet Competent</span><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['outcome_final_result'] === 'NYC' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div></div><div className="flex items-center gap-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_final_result': compRecord['outcome_final_result'] === 'C' ? '' : 'C' })}><span>Competent</span><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['outcome_final_result'] === 'C' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div></div></div></td></tr>
              <tr><td colSpan={1} className="border border-black p-2 font-bold align-top">Assessor Feedback</td><td colSpan={3} className="border border-black p-2"><div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => !isStudent && setCompRecord({ ...compRecord, 'outcome_verbal_feedback_provided': compRecord['outcome_verbal_feedback_provided'] === 'Yes' ? '' : 'Yes' })}><div className="w-4 h-4 border border-black rounded-sm flex items-center justify-center bg-white">{compRecord['outcome_verbal_feedback_provided'] === 'Yes' && <span className="text-red-600 font-bold text-lg leading-none">✓</span>}</div><span className="font-bold">Verbal feedback Provided –</span></div><div className="ml-6 italic text-sm">Additional feedback (if required)</div><textarea className="w-full h-[40px] resize-none bg-transparent focus:outline-none mt-2" value={compRecord['outcome_assessor_comments'] || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, 'outcome_assessor_comments': e.target.value })} readOnly={isStudent} /></td></tr>
              <tr>
                <td colSpan={2} className="border border-black p-2 align-top"><span className="font-bold">Assessor:</span><br />I declare that I have conducted a fair, valid, reliable and flexible judgement of this assessment in accordance to the Principles of Assessment and the Rules of Evidence as outlined in the Standards for RTOS 2015.<br />I have provided appropriate feedback. I also declare that I have undertaken appropriate assessment integrity checks:<br /><ul className="list-disc pl-8"><li>Check for plagiarism</li><li>Check for Copying/Collusion/Authenticity (learner's own work)</li><li>Cheating or use of model answers</li></ul></td>
                <td colSpan={2} className="border border-black p-2 align-top">
                  <div className="flex items-center mb-4"><span className="font-bold w-[80px]">Assessor<br />Name :</span><input type="text" className="w-full border-b border-black bg-transparent focus:outline-none ml-2" value={compRecord.assessor_name || ''} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessor_name: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'text' }} /></div>
                  <div className="flex items-center mb-4"><span className="font-bold w-[80px]">Assessor<br />Signature:</span><div onClick={() => !isStudent && openSigModal('outcome_assessor_sig', 'comp')} className="w-full border-b border-black min-h-[30px] cursor-pointer inline-flex items-center justify-center ml-2">{(compRecord.assessor_signature || compRecord['outcome_assessor_sig']) ? <img src={compRecord.assessor_signature || compRecord['outcome_assessor_sig']} className="max-h-[30px] max-w-[100px] object-contain" /> : <span className="text-[10px] text-slate-400 italic no-print">{isStudent ? '' : 'Click to sign'}</span>}</div></div>
                  <div className="flex items-center"><span className="font-bold w-[80px]">Date:</span><input type="date" className="w-full border-b border-black bg-transparent focus:outline-none ml-2" value={compRecord.assessment_date || new Date().toISOString().split('T')[0]} onChange={(e) => !isStudent && setCompRecord({ ...compRecord, assessment_date: e.target.value })} disabled={isStudent} style={{ cursor: isStudent ? 'default' : 'pointer' }} /></div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black p-2 align-top">I acknowledge that I have been advised of the assessment outcome. If the outcome was NYC, I have also received feedback on reassessment</td>
                <td colSpan={2} className="border border-black p-2 align-top">
                  <div className="flex items-center"><span className="font-bold w-[80px]">Student<br />Signature:</span><div onClick={() => openSigModal('outcome_student_ack_sig', 'comp')} className="w-full border-b border-black min-h-[30px] cursor-pointer inline-flex items-center justify-center ml-2">{(answers['outcome_student_ack_sig'] || compRecord['outcome_student_ack_sig']) ? <img src={answers['outcome_student_ack_sig'] || compRecord['outcome_student_ack_sig']} className="max-h-[30px] max-w-[100px] object-contain" /> : <span className="text-[10px] text-slate-400 italic no-print">Click to sign</span>}</div></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PageFooter n={45} />
      </div>

    </div>
  );
};