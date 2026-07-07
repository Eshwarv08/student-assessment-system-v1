import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { ArrowLeft, Save, Printer, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Q2BookletProps {
  answers: any;
  setAnswers: (val: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  studentName?: string;
  submitDate?: string;
  isStudent?: boolean;
}

export const Q2Booklet: React.FC<Q2BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent }) => {
  const navigate = useNavigate();

  // Dummy variables to prevent errors and hide assessor functionality
  const grades: Record<string, string> = {};
  const setGrades = (val: any) => { };
  const taskResults: Record<string, string> = {};
  const setTaskResults = (val: any) => { };
  const compRecord: any = { tasks: {}, attempts: [], evidence: {} };
  const setCompRecord = (val: any) => { };
  const finalResult: string = '';
  const setFinalResult = (val: any) => { };
  const markAllCorrect = () => { };
  const handleDownload = () => window.print();

  // The signature pad logic for Q2 Booklet
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

  const saveMutation = { isPending: submitting, mutate: onSubmit };
  const submission = { submitted_at: submitDate || '', signature_url: '' };
  const studentInfo = { name: studentName || '' };

  const formatDisplayDate = (d: string) => d || '';

  const q2Styles = `
      .q2-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q2-booklet-view * {
        box-sizing: border-box;
      }
      .q2-booklet-view .page {
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
      .q2-booklet-view h1.section-title {
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
      .q2-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q2-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q2-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q2-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q2-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q2-booklet-view table td, .q2-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q2-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q2-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q2-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q2-booklet-view .comp-table td { padding: 6px 8px; font-size: 9.5pt; }
      .q2-booklet-view .comp-table .label-col { font-weight: bold; background: #bfbfbf; width: 34%; }
      .q2-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q2-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q2-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 15px; height: 15px;
        font-size: 7pt;
        justify-content: center;
        color: #000;
      }
      .q2-booklet-view .attempt-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
      .q2-booklet-view .attempt-table td, .q2-booklet-view .attempt-table th { border: 1px solid #555; padding: 3px 6px; }
      .q2-booklet-view .attempt-table .attempt-num { width: 12%; text-align: center; font-weight: bold; }
      .q2-booklet-view .attempt-table .attempt-date { width: 18%; }
      .q2-booklet-view .attempt-table .attempt-fb { width: 70%; }
      .q2-booklet-view .sig-line { border-bottom: 1px solid #000; min-width: 100px; display: inline-block; margin-left: 4px; }
      .q2-booklet-view .unit-info-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 5px; }
      .q2-booklet-view .unit-info-table td { border: 1px solid #555; padding: 4px 7px; vertical-align: top; }
      .q2-booklet-view .unit-info-table .key-col { font-weight: bold; background: #f0f0f0; width: 28%; }
      .q2-booklet-view .unit-info-table ul { padding-left: 16px; margin: 2px 0; }
      .q2-booklet-view .unit-info-table li { margin-bottom: 1px; }
      .q2-booklet-view .ra-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 4px 0; }
      .q2-booklet-view .ra-table td, .q2-booklet-view .ra-table th { border: 1px solid #555; padding: 4px 7px; vertical-align: top; }
      .q2-booklet-view .ra-table th { background: #e0e0e0; font-weight: bold; }
      .q2-booklet-view .chk-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 16px; }
      .q2-booklet-view .chk-table td { border: 1px solid #777; padding: 13px 14px; vertical-align: middle; line-height: 1.45; }
      .q2-booklet-view .chk-table .chk-q { width: 68%; }
      .q2-booklet-view .chk-table .chk-case { width: 17%; text-align: center; }
      .q2-booklet-view .chk-table .chk-comment { width: 15%; }
      .q2-booklet-view .chk-table thead td { background: #e8e8e8; color: #000; font-weight: bold; text-align: center; border: 1.5px solid #777; padding: 13px 14px; }
      .q2-booklet-view .obs-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 28px auto;
        font-size: 10pt;
        max-width: 550px;
        padding-left: 0;
      }
      .q2-booklet-view .obs-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
      .q2-booklet-view .checked-box { display: inline-block; width: 14px; height: 14px; border: 1.5px solid #444; background: #fff; position: relative; vertical-align: middle; }
      .q2-booklet-view .checked-box.is-checked::after { content: '✓'; position: absolute; top: -4.5px; left: 0px; font-size: 14px; color: #cc0000; font-weight: bold; }
      .q2-booklet-view .yn-cell { white-space: nowrap; }
      .q2-booklet-view .cb { display: inline-block; width: 13px; height: 13px; border: 1.5px solid #555; background: #fff; vertical-align: middle; position: relative; margin-right: 4px; }
      .q2-booklet-view .cb.checked::after { content: '✓'; position: absolute; top: -5px; left: 0px; font-size: 14px; color: #cc0000; font-weight: bold; }
      .q2-booklet-view .cb-label { font-size: 9pt; }
      .q2-booklet-view .cb-sq { display: inline-block; width: 12px; height: 12px; border: 1px solid #555; background: #fff; vertical-align: middle; position: relative; margin-right: 2px; }
      .q2-booklet-view .cb-sq.checked::after { content: '✓'; position: absolute; top: -3.5px; left: 0px; font-size: 12px; color: #d32f2f; font-weight: bold; }
      .q2-booklet-view .result-circle-red {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border: 2px solid #d32f2f;
        border-radius: 50%;
        color: #d32f2f;
        font-weight: bold;
        font-size: 9pt;
        text-align: center;
        line-height: 1;
        cursor: pointer;
      }
      .q2-booklet-view .result-inactive {
        color: #777;
        font-size: 9pt;
        cursor: pointer;
        padding: 0 4px;
      }
      .q2-booklet-view .result-line {
        text-align: center;
        font-size: 12pt;
        font-weight: bold;
        margin: 6px 0 4px;
      }
      .q2-booklet-view .result-circle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 2px solid transparent;
        border-radius: 50%;
        width: 22px; height: 22px;
        text-align: center;
        font-size: 11pt;
        vertical-align: middle;
        cursor: pointer;
        color: #777;
      }
      .q2-booklet-view .result-circle.active {
        border-color: #d32f2f;
        color: #d32f2f;
        font-weight: bold;
        background: transparent;
      }
      .q2-booklet-view .tick-icon { display: inline-block; width: 13px; height: 13px; border: 1px solid #555; background: #fff; position: relative; vertical-align: middle; margin-right: 2px; }
      .q2-booklet-view .tick-icon.checked::after { content: '✓'; position: absolute; top: -3px; left: 0; font-size: 12px; }
      .q2-booklet-view .choice-item { margin: 1px 0; font-size: 9.5pt; }
      .q2-booklet-view .steps-list { padding-left: 20px; margin: 3px 0; font-size: 9.5pt; }
      .q2-booklet-view .steps-list li { margin-bottom: 2px; }
      .q2-booklet-view .sub-alpha { list-style-type: lower-alpha; padding-left: 18px; margin-top: 2px; }
      .q2-booklet-view .bold-para { font-weight: bold; margin: 3px 0 1px; font-size: 9.5pt; }
      .q2-booklet-view .note-para { font-size: 9pt; margin: 3px 0; }
      .q2-booklet-view .sig-visual {
        display: inline-block;
        font-family: 'Times New Roman', serif;
        font-style: italic;
        font-size: 13pt;
        color: #222;
        border-bottom: 1px solid #000;
        padding: 0 10px 0 0;
        min-width: 60px;
        line-height: 1;
      }
      .q2-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q2-booklet-view .inner-header {
        border-top: 2px solid #1a5fa8;
        margin-bottom: 8px;
        padding-top: 4px;
        width: 100%;
      }
      .q2-booklet-view .inner-header .top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-size: 8.5pt;
        width: 100%;
      }
      .q2-booklet-view .inner-header .top-row .title-block {
        text-align: left;
        line-height: 1.35;
      }
      .q2-booklet-view .inner-header .top-row .logo-block {
        flex-shrink: 0;
      }
      .q2-booklet-view .page-footer {
        margin-top: auto;
        font-size: 8pt;
        color: #333;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #bbb;
        padding-top: 4px;
        width: 100%;
        padding-bottom: 2mm;
      }
      .q2-booklet-view .checkbox-row { display: flex; align-items: center; gap: 4px; margin: 2px 0; }
      .q2-booklet-view .instructions-note { font-size: 10pt; margin: 4px 0 6px; }
      .q2-booklet-view .instructions-note .blue-word { color: #1a3fa8; text-decoration: underline; font-weight: bold; }
      .q2-booklet-view .instructions-note .red-word { color: #cc0000; text-decoration: underline; font-weight: bold; }
      .q2-booklet-view .spacer-sm { height: 2mm; }
      .q2-booklet-view .italic-note { font-style: italic; font-size: 9pt; margin: 3px 0; }

      @media print {
        @page { size: A4; margin: 0; }
        body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
        .q2-booklet-view { background: transparent !important; padding: 0 !important; margin: 0 !important; }
        .q2-booklet-view .page {
          margin: 0 !important;
          box-shadow: none !important;
          width: 210mm !important;
          height: 297mm !important;
          max-height: 297mm !important;
          padding: 8mm 10mm 6mm 10mm !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          page-break-after: always !important;
          break-after: page !important;
          overflow: hidden !important;
          position: relative !important;
        }
        .q2-booklet-view .page:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        .q2-booklet-view .page * {
          font-size: 8.2pt !important;
          line-height: 1.2 !important;
        }
        .q2-booklet-view h1.section-title {
          font-size: 11pt !important;
          margin: 3mm 0 2mm !important;
        }
        .q2-booklet-view h2.sub-title {
          font-size: 10pt !important;
          margin: 1mm 0 !important;
        }
        .q2-booklet-view h3.task-label {
          font-size: 9.5pt !important;
          margin: 1mm 0 2mm !important;
        }
        .q2-booklet-view p {
          margin-top: 0 !important;
          margin-bottom: 3px !important;
        }
        .q2-booklet-view table {
          margin-bottom: 4px !important;
          font-size: 8pt !important;
        }
        .q2-booklet-view table td,
        .q2-booklet-view table th {
          padding: 2.5px 5px !important;
        }
        .q2-booklet-view .obs-grid {
          margin: 8px auto !important;
          gap: 5px !important;
        }
        .q2-booklet-view .obs-row { padding: 3px 0 !important; }
        .q2-booklet-view .chk-table td {
          padding: 4px 6px !important;
          font-size: 7.8pt !important;
          line-height: 1.15 !important;
        }
        .q2-booklet-view .chk-table thead td {
          padding: 4px 6px !important;
        }
        .q2-booklet-view .chk-table tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .q2-booklet-view .spacer-sm { height: 1mm !important; }
        .q2-booklet-view .page-footer {
          margin-top: auto !important;
          flex-shrink: 0 !important;
          padding-bottom: 1mm !important;
        }
        .q2-booklet-view .no-print { display: none !important; }
        .q2-booklet-view input[type="text"],
        .q2-booklet-view textarea {
          border: none !important;
          border-bottom: 1px dotted #999 !important;
          font-size: 7.8pt !important;
          padding: 1px 3px !important;
        }
        .q2-booklet-view .sig-visual {
          min-width: 60px !important;
          height: 18px !important;
          line-height: 1 !important;
        }
        .q2-booklet-view .sig-visual img {
          max-height: 16px !important;
          display: inline-block !important;
        }
        .q2-booklet-view .result-line {
          margin: 2px 0 3px !important;
          font-size: 8.5pt !important;
          text-align: center !important;
        }
        .q2-booklet-view .result-circle {
          width: 15px !important;
          height: 15px !important;
          font-size: 7.5pt !important;
        }
        .q2-booklet-view .result-circle-red {
          width: 15px !important;
          height: 15px !important;
          font-size: 7.5pt !important;
        }
      }
      @media screen and (max-width: 240mm) {
        .q2-booklet-view .page { width: 100% !important; margin: 0 !important; padding: 4mm !important; }
      }
  
      @media screen and (max-width: 800px) {
        .q2-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q2-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q2-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q2-booklet-view .flex, .q2-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q2-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q2-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q2-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q2-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q2-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q2-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  `;

  return (
    <div className="q2-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q2Styles }} />

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

            {/* Skilscope Logo */}
            <img
              src="/assets/Skilscope.png"
              alt="Skilscope Logo"
              style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }}
            />

            {/* <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#991b1b', marginBottom: '10mm', fontFamily: 'Arial, sans-serif', letterSpacing: '0.3px' }}>RTO NO: 40954</div> */}
            <div className="cover-title" style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
            <div className="cover-subtitle" style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>ICTCBL330</div>
            <div className="cover-subtitle" style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>
              Splice and terminate optical fibre cable<br />for telecommunications projects
            </div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="cover-student-name-container" style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '100%', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '18mm' }}>ACTA College Pty. Ltd</div>
            </div>

          </div>
        </div>
        <div className="page-footer"><span></span><span>Page 1 of 18</span></div>
      </div>

      {/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div className="title-block">
              <div><span className="underline-bold">Assessment book</span></div>
              <div><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
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

        <table className="comp-table" style={{ marginBottom: '16px' }}>
          <tbody>
            <tr><td className="label-col">Student's Name</td><td className="field-value-cell font-bold">{studentName}</td></tr>
            <tr>
              <td className="label-col">Assessor's Name</td>
              <td className="field-value-cell">
                <input
                  type="text"
                  className={`w-full bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 outline-none px-2 py-0.5 text-slate-800 font-bold ${isStudent ? 'cursor-default pointer-events-none' : ''}`}
                  value={compRecord.assessor_name || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })}
                  placeholder="Enter Assessor Name"
                  readOnly={isStudent}
                  tabIndex={isStudent ? -1 : 0}
                />
              </td>
            </tr>
            <tr>
              <td className="label-col">Assessment Site</td>
              <td className="field-value-cell">
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 outline-none px-2 py-0.5 text-slate-800 font-bold"
                  value={compRecord.assessment_site || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_site: e.target.value })}
                  placeholder="Enter Assessment Site"
                />
              </td>
            </tr>
            <tr>
              <td className="label-col">Assessment Date/s</td>
              <td className="field-value-cell font-bold">
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => { 
                    if (!isStudent) {
                      setCompRecord({ 
                        ...compRecord, 
                        assessment_date: e.target.value,
                        assessor_sig_date: e.target.value,
                        db_entry_date: e.target.value 
                      });
                    }
                  }}
                  readOnly={isStudent}
                />
                <span className="hidden print:inline">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Assessor Declaration Block */}
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td colSpan={5} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '5px 8px', fontSize: '9.5pt' }}>Assessor Declaration</td>
              </tr>
              <tr>
                <td colSpan={5} style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt' }}>In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #555', background: '#bfbfbf', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold', width: '40%' }}>Evidence is Confirmed as:</td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center', width: '15%' }}>
                  <span className={`cb cursor-pointer ${compRecord.evidence?.valid ? 'checked' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, valid: !compRecord.evidence?.valid } })}></span> Valid
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center', width: '15%' }}>
                  <span className={`cb cursor-pointer ${compRecord.evidence?.sufficient ? 'checked' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, sufficient: !compRecord.evidence?.sufficient } })}></span> Sufficient
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center', width: '15%' }}>
                  <span className={`cb cursor-pointer ${compRecord.evidence?.current ? 'checked' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, current: !compRecord.evidence?.current } })}></span> Current
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center', width: '15%' }}>
                  <span className={`cb cursor-pointer ${compRecord.evidence?.authentic ? 'checked' : ''}`} onClick={() => !isStudent && setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, authentic: !compRecord.evidence?.authentic } })}></span> Authentic
                </td>
              </tr>
            </tbody>
          </table>
          <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: 'none' }}>
            <tbody>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #555', borderTop: 'none', padding: '6px 8px', fontWeight: 'bold', fontSize: '9pt', width: '55%' }}>Please attach the following documentation to this form</td>
                <td style={{ border: '1px solid #555', borderTop: 'none', padding: '6px 8px', fontWeight: 'bold', fontSize: '9pt', width: '20%', textAlign: 'center' }}>Result</td>
                <td rowSpan={5} style={{ border: '1px solid #555', borderTop: 'none', background: '#bfbfbf', padding: '8px', fontSize: '9.5pt', verticalAlign: 'middle', width: '25%' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>FINAL ASSESSMENT<br/>RESULT:</div>
                  <div className="checkbox-row cursor-pointer" style={{ marginBottom: '8px', paddingLeft: '8px' }} onClick={() => !isStudent && setFinalResult('C')}>
                    <span className={`cb-sq ${finalResult === 'C' ? 'checked' : ''}`}></span> Competent (C)
                  </div>
                  <div className="checkbox-row cursor-pointer" style={{ paddingLeft: '8px' }} onClick={() => !isStudent && setFinalResult('NC')}>
                    <span className={`cb-sq ${finalResult === 'NC' ? 'checked' : ''}`}></span> Not Competent (NC)
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold', width: '25%' }}>
                  Assessment Task 1
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', width: '30%' }}>
                  <div className="checkbox-row" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t1: !compRecord.tasks?.t1 } })}>
                    <span className={`cb-sq ${compRecord.tasks?.t1 ? 'checked' : ''}`} style={{ marginRight: '6px' }}></span> Observation 1
                  </div>
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center' }}>
                  <span className={taskResults['t1'] === 'S' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t1: taskResults['t1'] === 'S' ? 'NS' : 'S' })}>S</span>
                  {' '}/{' '}
                  <span className={taskResults['t1'] === 'NS' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t1: taskResults['t1'] === 'NS' ? 'S' : 'NS' })}>NS</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold' }}>
                  Assessment Task 2
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt' }}>
                  <div className="checkbox-row" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t2: !compRecord.tasks?.t2 } })}>
                    <span className={`cb-sq ${compRecord.tasks?.t2 ? 'checked' : ''}`} style={{ marginRight: '6px' }}></span> Observation 2
                  </div>
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center' }}>
                  <span className={taskResults['t2'] === 'S' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t2: taskResults['t2'] === 'S' ? 'NS' : 'S' })}>S</span>
                  {' '}/{' '}
                  <span className={taskResults['t2'] === 'NS' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t2: taskResults['t2'] === 'NS' ? 'S' : 'NS' })}>NS</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold' }}>
                  Assessment Task 3
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt' }}>
                  <div className="checkbox-row" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t3: !compRecord.tasks?.t3 } })}>
                    <span className={`cb-sq ${compRecord.tasks?.t3 ? 'checked' : ''}`} style={{ marginRight: '6px' }}></span> Observation 3
                  </div>
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center' }}>
                  <span className={taskResults['t3'] === 'S' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t3: taskResults['t3'] === 'S' ? 'NS' : 'S' })}>S</span>
                  {' '}/{' '}
                  <span className={taskResults['t3'] === 'NS' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t3: taskResults['t3'] === 'NS' ? 'S' : 'NS' })}>NS</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold' }}>
                  Assessment Task 4
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt' }}>
                  <div className="checkbox-row" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t4: !compRecord.tasks?.t4 } })}>
                    <span className={`cb-sq ${compRecord.tasks?.t4 ? 'checked' : ''}`} style={{ marginRight: '6px' }}></span> Written question and answers
                  </div>
                </td>
                <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', textAlign: 'center' }}>
                  <span className={taskResults['t4'] === 'S' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t4: taskResults['t4'] === 'S' ? 'NS' : 'S' })}>S</span>
                  {' '}/{' '}
                  <span className={taskResults['t4'] === 'NS' ? 'result-circle-red' : 'result-inactive'} onClick={() => !isStudent && setTaskResults({ ...taskResults, t4: taskResults['t4'] === 'NS' ? 'S' : 'NS' })}>NS</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Attempt table */}
        <table className="attempt-table" style={{ marginBottom: '16px' }}>
          <tbody>
            <tr>
              <td className="attempt-num" style={{ background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Attempt</td>
              <td className="attempt-date" style={{ background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Date</td>
              <td className="attempt-fb" style={{ background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Assessor's Feedback (as Required):</td>
            </tr>
            <tr>
              <td className="attempt-num" style={{ padding: '6px' }}>1</td>
              <td className="attempt-date" style={{ padding: '6px' }}>
                <input
                  type="date"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print"
                  value={compRecord.attempts?.[0]?.date || ''}
                  onChange={(e) => {
                    if (isStudent) return;
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[0]) att[0] = { date: '', feedback: '' };
                    att[0].date = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[0]?.date)}</span>
              </td>
              <td className="attempt-fb" style={{ padding: '6px' }}>
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                  value={compRecord.attempts?.[0]?.feedback || ''}
                  onChange={(e) => {
                    if (isStudent) return;
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[0]) att[0] = { date: '', feedback: '' };
                    att[0].feedback = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                  placeholder="Provide attempt 1 feedback"
                />
              </td>
            </tr>
            <tr>
              <td className="attempt-num" style={{ padding: '6px' }}>2</td>
              <td className="attempt-date" style={{ padding: '6px' }}>
                <input
                  type="date"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print"
                  value={compRecord.attempts?.[1]?.date || ''}
                  onChange={(e) => {
                    if (isStudent) return;
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[1]) att[1] = { date: '', feedback: '' };
                    att[1].date = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[1]?.date)}</span>
              </td>
              <td className="attempt-fb" style={{ padding: '6px' }}>
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                  value={compRecord.attempts?.[1]?.feedback || ''}
                  onChange={(e) => {
                    if (isStudent) return;
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[1]) att[1] = { date: '', feedback: '' };
                    att[1].feedback = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                  placeholder="Provide attempt 2 feedback"
                />
              </td>
            </tr>
            <tr>
              <td className="attempt-num" style={{ padding: '6px' }}>3</td>
              <td className="attempt-date" style={{ padding: '6px' }}>
                <input
                  type="date"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print"
                  value={compRecord.attempts?.[2]?.date || ''}
                  onChange={(e) => {
                    if (isStudent) return;
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[2]) att[2] = { date: '', feedback: '' };
                    att[2].date = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[2]?.date)}</span>
              </td>
              <td className="attempt-fb" style={{ padding: '6px' }}>
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                  value={compRecord.attempts?.[2]?.feedback || ''}
                  onChange={(e) => {
                    if (isStudent) return;
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[2]) att[2] = { date: '', feedback: '' };
                    att[2].feedback = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                  placeholder="Provide attempt 3 feedback"
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', textAlign: 'center', fontSize: '9pt' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #555', padding: '6px', fontSize: '9pt' }}>
                <textarea
                  className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs py-0.5"
                  value={compRecord.final_feedback || ''}
                  onChange={(e) => {
                    if (!isStudent) setCompRecord({ ...compRecord, final_feedback: e.target.value });
                  }}
                  placeholder="Enter final summary feedback here..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Declaration */}
        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '6px' }}>Declaration</div>
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
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  Date:
                  <input
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1"
                    value={compRecord.assessor_sig_date || ''}
                    onChange={(e) => { 
                      if (!isStudent) {
                        setCompRecord({ 
                          ...compRecord, 
                          assessor_sig_date: e.target.value,
                          assessment_date: e.target.value,
                          db_entry_date: e.target.value
                        });
                      }
                    }}
                    readOnly={isStudent}
                  />
                  <span className="hidden print:inline ml-1 font-bold">{formatDisplayDate(compRecord.assessor_sig_date)}</span>
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
                    onClick={() => openSigModal('student_signature', 'submission')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {answers.student_signature_url || submission.signature_url ? (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  Date:
                  <input required={isStudent} 
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')}
                    onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })}
                  />
                  <span className="hidden print:inline border-b border-dashed border-gray-400 min-w-[100px] text-center ml-1">
                    {formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 2 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 3 – UNIT INFO ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Admin Use Only */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#f0f0f0', fontWeight: 'bold', padding: '3px 6px', fontSize: '9pt' }}>Administrative Use Only:</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt', width: '50%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt' }}>
                <span
                  className={`cb cursor-pointer ${compRecord.entered_db ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, entered_db: !compRecord.entered_db })}
                ></span>
                Signature/Initial:
                <div
                  onClick={() => openSigModal('assessor_signature', 'comp')}
                  className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[20px] px-2 ml-1"
                >
                  {compRecord.assessor_signature ? (
                    <img src={compRecord.assessor_signature} className="max-h-[16px] max-w-[80px] object-contain inline-block" />
                  ) : (
                    <span className="text-[9px] text-slate-400">Sign</span>
                  )}
                </div>
                &nbsp; Date:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent text-xs ml-1 cursor-pointer w-24"
                  value={compRecord.db_entry_date || compRecord.assessor_sig_date || ''}
                  onChange={(e) => { 
                    if (!isStudent) {
                      setCompRecord({ 
                        ...compRecord, 
                        db_entry_date: e.target.value,
                        assessor_sig_date: e.target.value,
                        assessment_date: e.target.value
                      });
                    }
                  }}
                  readOnly={isStudent}
                />
                <span className="hidden print:inline ml-1">{formatDisplayDate(compRecord.db_entry_date || compRecord.assessor_sig_date)}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Unit info table */}
        <table className="unit-info-table">
          <tbody>
            <tr><td className="key-col">Unit Code/Name</td><td className="font-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</td></tr>
            <tr><td className="key-col">Pre-requisites</td><td>N/A</td></tr>
            <tr><td className="key-col">Co-requisites</td><td>N/A</td></tr>
            <tr>
              <td className="key-col">Unit Summary</td>
              <td>This unit describes the skills and knowledge required to splice and terminate optical fibre cable within an optical telecommunications transmission environment for new installations or upgrades of an optical backbone or access network, to achieve greater bandwidth and capacity required by emerging technology convergence for next generation networks (NGN).</td>
            </tr>
            <tr>
              <td className="key-col">Target Group</td>
              <td>
                <p>It applies to technical staff who splice and terminate optical fibre cable for telecommunications projects for commercial or industrial fibre to the premises (FTTP) non-mechanical splicing installations.</p>
                <p style={{ marginTop: '3px' }}>All client cabling work in the telecommunications, fire, security and data industries must be performed by a registered cabler. All cablers are required to register with an Australian Communications and Media Authority (ACMA) accredited registrar.</p>
              </td>
            </tr>
            <tr>
              <td className="key-col">Conditions and Context of the Assessments</td>
              <td>
                <p>Skills must be assessed in a workplace or simulated environment where conditions are typical of those in a telecommunications work environment or workplace.</p>
                <p style={{ marginTop: '3px' }}>Access is required to:</p>
                <ul style={{ paddingLeft: '16px', margin: '2px 0' }}>
                  <li>site/s where splicing and termination of optical fibre cable can be conducted</li>
                  <li>special purpose tools, equipment and materials currently used in industry such as optical fibre testing equipment</li>
                  <li>relevant regulatory and equipment documentation that impacts on optical fibre cable installation activities.</li>
                </ul>
                <p style={{ marginTop: '3px' }}>Assessors of this unit must satisfy the requirements for assessors in applicable vocational education and training legislation, frameworks and/or standards.</p>
              </td>
            </tr>
            <tr>
              <td className="key-col">Specific Resources Required</td>
              <td>
                <ul style={{ paddingLeft: '16px', margin: '2px 0' }}>
                  <li>Learner Guide</li>
                  <li>Assessment Booklet</li>
                  <li>Practical Workshop</li>
                  <li>Manufacturers Manuals and specifications</li>
                  <li>Workplace policy and procedures</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className="key-col">Re-Assessment</td>
              <td>
                <p>Students who are unsuccessful at achieving competency at the first attempt will be offered coaching, information and additional time (other needs if required) before a second and possibly a third attempt is made. If the student is not able to satisfactorily complete the assessment after the third attempt the student will be deemed Not Competent and resulted as such. The student may re-enrol in the qualification at a later to date to gain successful completion of the unit/s.</p>
                <p style={{ marginTop: '3px' }}>For further details refer to ACTA College Assessment Policy and Procedure.</p>
              </td>
            </tr>
            <tr>
              <td className="key-col">Plagiarism</td>
              <td>ACTA College considers plagiarism and cheating as serious student misconduct and this may result either in a student's exclusion from a unit or course or may have to complete a reassessment depending on individual case.</td>
            </tr>
            <tr>
              <td className="key-col">Complaints and Appeal</td>
              <td>Where a student wishes to appeal an assessment decision they are required to notify their assessor in the first instance. Where appropriate the assessor may decide to re-assess the student to ensure a fair and equitable decision is gained. The assessor shall complete a written report regarding the reassessment outlining the reasons why assessment was or was not granted.</td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 3 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 4 – INSTRUCTIONS ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <table className="unit-info-table">
          <tbody>
            <tr>
              <td className="key-col">Assessors Intervention</td>
              <td>
                <p>Assessors are to check that the student is ready for assessment, and defer the assessment if they are not. It is important that assessors do not teach at the assessment but allow students to competence for themselves.</p>
                <p style={{ marginTop: '3px' }}>Feedback is to be given at the completion of the assessment using the feedback to student. If a student does not meet a standard, the assessor is to sit down with them and assist them in their understanding. Should you disagree with the assessment outcome, you can appeal the decision as stated in the Student Handbook.</p>
                <p style={{ marginTop: '3px' }}>Your student record must indicate that you have all required skills and knowledge in completing the task. For each assessment, the assessor is to act as a supervisor and not interfere with the assessment. In the event that the assessment activities will impact on your safety or that of others, the assessment must be stopped immediately.</p>
              </td>
            </tr>
            <tr>
              <td className="key-col">Attaching Documents</td>
              <td>
                <p>Attached documents are accepted but must be labelled with the following information:</p>
                <p>Unit Name and Title, Students name, Student ID, Date of Submissions, Student signature.</p>
              </td>
            </tr>
            <tr>
              <td className="key-col">Assessment Instruction</td>
              <td>
                <p>Assessment is mapped to the unit and must be completed by the end of each unit. This is a summative assessment, which requires each student to have adequate practice prior to undertaking this assessment.</p>
                <p style={{ marginTop: '3px' }}>The assessment consists of 4 tasks. Assessment Task 1, Assessment Task 2, Assessment Task 3 and Assessment Task 4</p>
                <p style={{ marginTop: '3px' }}>Assessment Task 1 is Observation 1</p>
                <p>Assessment Task 2 is Observation 2</p>
                <p>Assessment Task 3 is Observation 3</p>
                <p>Assessment Task 4 is written Q&amp;A</p>
                <p style={{ marginTop: '3px' }}>For answers to written questions, reports and projects, you must:</p>
                <p>• Print clearly in black or blue pen or type it as a word document</p>
                <p>• Answer each of the key points and /or follow instructions</p>
                <p>• Assessments written in pencil or are illegible will not be accepted.</p>
                <p style={{ marginTop: '3px' }}>Ask your assessor if you do not understand any part of the assessment. Whist your assessor cannot tell you the answer, he/she may be able to re-word a question or instruction to assist in a better understanding for you.</p>
              </td>
            </tr>
            <tr>
              <td className="key-col">Assessment Task 1:</td>
              <td>In this assessment the candidate need to demonstrate their skills in preparing cables for a fibre termination point (FTP) such as fibre cabinet or an underground closure. As instructed by the assessor the candidate will have to work on the equipment depending on the FTP and the resources available. The candidate needs to follow the instructions and carry out the task appropriately.</td>
            </tr>
            <tr>
              <td className="key-col">Assessment Task 2:</td>
              <td>In this assessment task the candidate should complete a fusion splice by following the given instructions. The process adopted for fusion splice depends on the assessment environment and the resources available. Based on the information provided by the assessor the fusion splice need to demonstrate on the appropriate cable.</td>
            </tr>
            <tr>
              <td className="key-col">Assessment Task 3:</td>
              <td>In this assessment, the candidate should demonstrate their knowledge in completing an "in-line" mechanical splice by following the industry and organisational policy and procedures. The process adopted for fusion splice depends on the assessment environment and the resources available. Based on the information provided by the assessor the fusion splice need to demonstrate on the appropriate cable.</td>
            </tr>
            <tr>
              <td className="key-col">Assessment Task 4:</td>
              <td>This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45-60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 5 in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.</td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 4 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 5 – COMPETENCY DECISION + REASONABLE ADJUSTMENT + COVER SHEET ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <table className="unit-info-table" style={{ marginBottom: '8px' }}>
          <tbody>
            <tr>
              <td className="key-col">Competency Decision</td>
              <td>Student must satisfactorily complete each assessment tasks to be Competent (C) in the unit. Student with unsatisfactory completion of any of the assignment tasks will be deemed Not Yet Competent (NYC).</td>
            </tr>
          </tbody>
        </table>

        {/* Reasonable Adjustment */}
        <div style={{ border: '1px solid #555', padding: '6px 8px', marginBottom: '8px', fontSize: '9pt' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>Reasonable Adjustment</div>
          <p>To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.</p>
          <p style={{ marginTop: '4px' }}>ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.</p>
          <div className="spacer-sm"></div>
          <table className="ra-table">
            <thead>
              <tr>
                <th>Reasonable Adjustment Provided</th>
                <th>Reason for Reasonable Adjustment</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, edu_support: !compRecord.reasonable_adjustment?.edu_support } })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {compRecord.reasonable_adjustment?.edu_support && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '9pt' }}>Educational and bilingual support</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, oral_q: !compRecord.reasonable_adjustment?.oral_q } })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {compRecord.reasonable_adjustment?.oral_q && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '9pt' }}>Presenting questions orally</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, diagram_instructions: !compRecord.reasonable_adjustment?.diagram_instructions } })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {compRecord.reasonable_adjustment?.diagram_instructions && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '9pt' }}>Presenting work instructions in diagrammatic form</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, extra_time: !compRecord.reasonable_adjustment?.extra_time } })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {compRecord.reasonable_adjustment?.extra_time && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '9pt' }}>Extra time to complete</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isStudent ? 'default' : 'pointer' }} onClick={() => !isStudent && setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, others: !compRecord.reasonable_adjustment?.others } })}>
                    <div style={{ width: '14px', height: '14px', border: '1px solid #000', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {compRecord.reasonable_adjustment?.others && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '9pt' }}>Others:</span>
                  </div>
                </td>
                <td>
                  <textarea
                    className="w-full bg-transparent border-none outline-none resize-none h-24 text-xs text-slate-800"
                    value={compRecord.reasonable_adjustment?.reason || ''}
                    onChange={(e) => setCompRecord({
                      ...compRecord,
                      reasonable_adjustment: { ...compRecord.reasonable_adjustment, reason: e.target.value }
                    })}
                    placeholder="Reason for adjustment..."
                  />
                </td>
                <td>
                  <textarea
                    className="w-full bg-transparent border-none outline-none resize-none h-24 text-xs text-slate-800"
                    value={compRecord.reasonable_adjustment?.outcome || ''}
                    onChange={(e) => setCompRecord({
                      ...compRecord,
                      reasonable_adjustment: { ...compRecord.reasonable_adjustment, outcome: e.target.value }
                    })}
                    placeholder="Outcome details..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cover Sheet */}
        <div style={{ marginTop: '10mm', textAlign: 'center' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5mm' }}>COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</div>
          <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '2mm' }}>A cover sheet must be included with each submission of work.</div>
          <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>Work submitted without a signed cover sheet will be returned unmarked.</div>
        </div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 5 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 6 – TASK 1 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 1 OBSERVATION</h1>
        <h2 className="sub-title">Practical Demonstration</h2>
        <h3 className="task-label">Cable Sheath Removal, Loose Tube Preparation and Fibre Cleaning</h3>

        <p style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '9.5pt' }}>Student instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '4px' }}>In this assessment the candidate need to demonstrate their skills in preparing cables for a fibre termination point (FTP) such as fibre cabinet or an underground closure. As instructed by the assessor the candidate will have to work on the equipment depending on the FTP and the resources available. The candidate needs to follow the instructions and carry out the task appropriately.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '4px' }}>The candidate must ensure that all work planned will be conducted in line with regulatory requirements and safety/OHS considerations.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '6px' }}>The time your facilitator/assessor allocates you to complete the task will depend on the type of cable being prepared and the environment in which you are undertaking the task.</p>

        <p style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '9.5pt' }}>Steps involved:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>Participants are required to prepare a single-end cable for an FTP. You will need to:</p>
        <ol className="steps-list" style={{ marginBottom: '4px' }}>
          <li>Remove the outer cable sheath of a standard cable for approximately two metres</li>
          <li>Clean and expose the loose tubes, separate one or more tubes, remove the loose tube and clean the fibres ready for splicing</li>
        </ol>

        {/* Cable diagram 1 */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
          <img src="/assets/question-2/Screenshot from 2026-05-03 17-23-19.png" alt="Cable preparation" style={{ width: '78%', height: 'auto', objectFit: 'contain', background: 'transparent' }} />
        </div>

        <ol className="steps-list" start={3} style={{ marginBottom: '4px' }}>
          <li>Prepare a 'loop' cable for expressing loose tubes through an underground closure (oval port cable installation)</li>
          <li>Window cut a 'loop' of cable by removing a section of approximately three metres of outer cable sheath</li>
          <li>Clean and prepare the loose tubes ready for inserting through an oval port of an underground closure.</li>
        </ol>

        {/* Cable diagram 2 (loop) */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
          <img src="/assets/question-2/Screenshot from 2026-05-03 17-24-09.png" alt="Loop cable preparation" style={{ width: '78%', height: 'auto', objectFit: 'contain', background: 'transparent' }} />
        </div>

        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>You are now required to follow a similar procedure to prepare an indoor tight buffered fibre cable for an FTP unit. You will need to:</p>
        <ol className="steps-list">
          <li>Remove the outer cable sheath of a distribution or riser cable</li>
          <li>Remove bindings (kevlar, etc.) And prepare tight buffered fibres for splicing.</li>
        </ol>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 6 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 7 – TASK 1 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 1 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '4px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Assessor Instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '5px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carry out the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '9.5pt' }}>The following was observed during the observations:</p>

        <div className="obs-grid">
          <div className="obs-row"><span>Interpret technical documents</span><span><span className={grades['t1obs0'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Liaison with experts</span><span><span className={grades['t1obs1'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Communication skills</span><span><span className={grades['t1obs2'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Read equipment manuals</span><span><span className={grades['t1obs3'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Appropriate cable installation</span><span><span className={grades['t1obs4'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Taking measurements</span><span><span className={grades['t1obs5'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Identify signal strength loss</span><span><span className={grades['t1obs6'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Identify the faults</span><span><span className={grades['t1obs7'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Suggest remedies</span><span><span className={grades['t1obs8'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
        </div>

        <table className="chk-table">
          <thead>
            <tr><td className="chk-q">Checklist</td><td className="chk-case">Case 1</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => { 
                    if (!isStudent) {
                      setCompRecord({ 
                        ...compRecord, 
                        assessment_date: e.target.value,
                        assessor_sig_date: e.target.value,
                        db_entry_date: e.target.value 
                      });
                    }
                  }}
                  readOnly={isStudent}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
            {[
              "Did the Student accessed and read job instructions, including specific method & process requirements",
              "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
              "Did the student apply precautions required to minimise hazard",
              "Did the student exhibit good communication skills",
              "Did the student liaise with internal and external personnel on technical and operational matters",
              "Did the student relate to work associates, supervisors, team members and clients"
            ].map((itemText, idx) => {
              const qKey = `t1q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{idx + 1}. {itemText}</td>
                  <td className="chk-case yn-cell">
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'correct' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
                    ></span>
                    <span className="cb-label cursor-pointer mr-2" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>Yes</span>
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'incorrect' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
                    ></span>
                    <span className="cb-label cursor-pointer" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>No</span>
                  </td>
                  <td className="chk-comment">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 text-xs text-slate-800"
                      value={grades[`${qKey}_cmt`] || ''}
                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 7 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 8 – TASK 1 CHECKLIST continued + Result ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <table className="chk-table">
          <tbody>
            {[
              "Did the student exhibit skills in interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation",
              "Did the student take measurements in a correct manner",
              "Did the student analyse the output",
              "Did the student identify the causes of signal strength loss in optical fibre",
              "Did the student explain the reasons for signal strength loss",
              "Did the student comply with all related health and safety requirements and work practices",
              "Did the Student recognise the features and operating requirements of test equipment",
              "Did the Student describe how to operate equipment according to a test specification",
              "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
              "Did the student undertake the task independently?",
              "Did the student demonstrate time management skill through the task?",
              "Did the student exhibit good communication skills?",
              "Did the student meet all the criteria for the task?"
            ].map((itemText, idx) => {
              const qKey = `t1q${idx + 7}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{idx + 7}. {itemText}</td>
                  <td className="chk-case yn-cell">
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'correct' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
                    ></span>
                    <span className="cb-label cursor-pointer mr-2" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>Yes</span>
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'incorrect' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
                    ></span>
                    <span className="cb-label cursor-pointer" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>No</span>
                  </td>
                  <td className="chk-comment">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 text-xs text-slate-800"
                      value={grades[`${qKey}_cmt`] || ''}
                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '3px' }}>Comments/Feedback to Participant</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('student_signature', 'submission')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {answers.student_signature_url || submission.signature_url ? (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input required={isStudent} 
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')}
                    onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })}
                  />
                  <span className="hidden print:inline border-b border-dashed border-gray-400 min-w-[100px] text-center ml-1">
                    {formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '5px 8px', minHeight: '60px', fontSize: '9pt', marginBottom: '5px' }}>
          <strong>Assessor's Feedback:</strong>
          <textarea
            className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs mt-1"
            value={taskResults['t1_feedback'] || ''}
            onChange={(e) => setTaskResults({ ...taskResults, t1_feedback: e.target.value })}
            placeholder="Enter Assessor Feedback for Task 1..."
          />
        </div>

        <div className="result-line">
          Result:{' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t1'] === 'S' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t1: 'S' })}
          >S</span>
          {' '}/ Not Satisfactory (NS){' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t1'] === 'NS' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t1: 'NS' })}
          >NS</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '55%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '45%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('assessor_signature', 'comp')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={compRecord.assessment_date || ''}
                    onChange={(e) => { 
                      if (!isStudent) {
                        setCompRecord({ 
                          ...compRecord, 
                          assessment_date: e.target.value,
                          assessor_sig_date: e.target.value,
                          db_entry_date: e.target.value 
                        });
                      }
                    }}
                  readOnly={isStudent}
                  />
                  <span className="hidden print:inline underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 8 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 9 – TASK 2 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 2 – OBSERVATION</h1>
        <h2 className="sub-title">Practical Demonstration</h2>
        <h3 className="task-label">Fusion splice</h3>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Assessment Description</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>In this assessment task the candidate should complete a fusion splice by following the given instructions. The process adopted for fusion splice depends on the assessment environment and the resources available. Based on the information provided by the assessor the fusion splice need to demonstrate on the appropriate cable.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>For better understanding the assessor will demonstrate fusion splicing techniques for:</p>
        <ul className="steps-list" style={{ marginBottom: '4px' }}>
          <li>250µm to 250µm (external to external fibres)</li>
          <li>250µm to 900µm (external fibres to 900µm tight buffered pigtail connectors)</li>
          <li>900µm to 900µm (internal to internal tight buffered fibres)</li>
        </ul>
        <p style={{ fontSize: '9.5pt', marginBottom: '5px' }}>You must ensure that all work planned will be conducted in line with regulatory requirements and safety/OHS considerations.</p>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Procedure</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>This assessment task is divided into four stages for proper understanding.</p>
        <ol className="steps-list" style={{ marginBottom: '4px' }}>
          <li>Fibre preparation</li>
          <li>Fibre cleaving</li>
          <li>Fibre splicing</li>
          <li>Protecting the fibre joint.</li>
        </ol>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>Step by step process:</p>
        <ol className="steps-list" style={{ marginBottom: '4px' }}>
          <li>Insert the heatshrink splice protector over one end of the fibre</li>
          <li>Strip away the protective jacket/coating (nylon and/or acrylate coating) from the fibre using appropriate fibre stripping tools</li>
          <li>Strip away approximately 20–25mm of coating</li>
          <li>Clean the bare fibre using lint free wipe tissues and isopropyl alcohol (IPA fluid) – ensuring the fibre is dry before inserting into the splicer.</li>
        </ol>

        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>The key to successful splicing is a good clean sharp cleave – a splice can only be good as the cleave. The goal is to produce a cleave end that is as perpendicular as possible. You will need to:</p>
        <ol className="steps-list" start={5} style={{ marginBottom: '4px' }}>
          <li>Use a high precision fibre cleaver to give a perpendicular mirror smooth end face cut:
            <ol className="sub-alpha">
              <li>For 40mm splice protectors the cleaved length of the fibres need to be approximately 10–12mm</li>
              <li>For 60mm splice protectors need to be approximately 15-17mm</li>
            </ol>
          </li>
        </ol>

        <p style={{ fontSize: '9pt', marginBottom: '3px' }}><em>Note: do not clean the fibre again after cleaving. Do not allow to make contact the end of the cleaved fibre with any surfaces while inserting and placing into the splicing unit.</em></p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>When inserting the fibres into the fusion splicer, ensure the ends are placed approximately 1mm off centre from the electrode. Do not insert the fibre into the centre of the electrodes or pass the electrodes. You will need to:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>6.&nbsp;&nbsp;&nbsp;&nbsp;Splice in auto mode to align the core of both fibres automatically</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>7.&nbsp;&nbsp;&nbsp;&nbsp;View the quality of the cleaved fibre end face by setting the splicer to 'pause' mode – the splicer will provide an estimated cleaved angle for both fibre end faces</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>If any cleave angles exceed the splicer's set threshold the unit will identify the error and request the appropriate fibre to be re-cleaved.</p>
        <p style={{ fontSize: '9.5pt' }}>A high voltage electric arc passes through the gap between the aligned fibre ends. The arc melts the tips of the fibres and the ends are pushed or fed together. When the arc ceases the glass re-solidifies and the fusion splice is complete.</p>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 9 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 10 – TASK 2 continued + Equipment ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>8.&nbsp; View the LCD display to check that there is no shadow, bubble, ballooning, necking across the joint</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '5px' }}>9.&nbsp; Check the LCD display for estimated loss acceptance level – industry specification of less than 0.05 dB is an acceptable level – anything higher than that means that the joint will need to be re-spliced.</p>

        {/* Fusion splice screen profiles and ARC */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
          <img src="/assets/question-2/Screenshot from 2026-05-03 17-24-41.png" alt="Fusion splice screen profiles and ARC" style={{ width: '88%', height: 'auto', objectFit: 'contain', background: 'transparent' }} />
        </div>

        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>Protecting the fibre joint is the final step in the splicing process. For long term protection a splice heatshrink protector must be applied.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>The most common splice protector is a heatshrink tube that has an inbuilt metal split. There are two types: 40mm and 60mm.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>You will need to:</p>
        <ol className="steps-list" start={8} style={{ marginBottom: '6px' }}>
          <li>Place the heatshrink on one end of the fibre before splicing</li>
          <li>At the completion of the splice, position the heatshrink protector over the joint and shrink it into place with the splicer's inbuilt heater.</li>
        </ol>

        <p style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '9.5pt' }}>Equipments Required:</p>

        {/* Equipment photo placeholder */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
          <img src="/assets/question-2/Screenshot from 2026-05-03 17-24-57.png" alt="Equipment and tool requirements" style={{ width: '55%', height: 'auto', objectFit: 'contain', background: 'transparent' }} />
        </div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 10 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '4px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Assessor Instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '5px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carry out the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '9.5pt' }}>The following was observed during the observations:</p>

        <div className="obs-grid">
          <div className="obs-row"><span>Install customer access network cable</span><span><span className={grades['t2obs0'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Operation of test equipment</span><span><span className={grades['t2obs1'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Perform fault clearance</span><span><span className={grades['t2obs2'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Use of diagnostic equipment</span><span><span className={grades['t2obs3'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Joining techniques adopted</span><span><span className={grades['t2obs4'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Use of tools and equipment</span><span><span className={grades['t2obs5'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Use of hand and power tools</span><span><span className={grades['t2obs6'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Follow safety standards and procedures</span><span><span className={grades['t2obs7'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Termination process</span><span><span className={grades['t2obs8'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
        </div>

        <table className="chk-table">
          <thead>
            <tr><td className="chk-q">Checklist</td><td className="chk-case">Case 1</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => { 
                    if (!isStudent) {
                      setCompRecord({ 
                        ...compRecord, 
                        assessment_date: e.target.value,
                        assessor_sig_date: e.target.value,
                        db_entry_date: e.target.value 
                      });
                    }
                  }}
                  readOnly={isStudent}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
            {[
              "Did the Student accessed and read job instructions, including specific method & process requirements",
              "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
              "Did the student apply precautions required to minimise hazard",
              "Did the student communicate with technical experts professionally",
              "Did the student interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation",
              "Did the student exhibit numeracy skills to take and analyse measurements",
              "Did the student select and use required personal protective equipment conforming to industry and OHS standards"
            ].map((itemText, idx) => {
              const qKey = `t2q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{idx + 1}. {itemText}</td>
                  <td className="chk-case yn-cell">
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'correct' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
                    ></span>
                    <span className="cb-label cursor-pointer mr-2" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>Yes</span>
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'incorrect' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
                    ></span>
                    <span className="cb-label cursor-pointer" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>No</span>
                  </td>
                  <td className="chk-comment">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 text-xs text-slate-800"
                      value={grades[`${qKey}_cmt`] || ''}
                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 11 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2 CHECKLIST cont. + Result ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <table className="chk-table">
          <tbody>
            {[
              "Did the student follow the safety procedures while setting the equipment",
              "Did the student install customer access network (CAN) cable",
              "Did the student operate test equipment to perform measurements on optical fibre",
              "Did the student perform fault clearance",
              "Did the student use diagnostic equipment",
              "Did the student use optical fibre jointing techniques",
              "Did the student use specialised tools and test equipment",
              "Did the Student exhibit knowledge in direct termination techniques",
              "Did the student exhibit knowledge in fusion splicing",
              "Did the student exhibit knowledge in mechanical splicing",
              "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
              "Did the student undertake the task independently?",
              "Did the student demonstrate time management skill through the task?",
              "Did the student exhibit good communication skills?",
              "Did the student meet all the criteria for the task?"
            ].map((itemText, idx) => {
              const qKey = `t2q${idx + 8}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{idx + 8}. {itemText}</td>
                  <td className="chk-case yn-cell">
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'correct' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
                    ></span>
                    <span className="cb-label cursor-pointer mr-2" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>Yes</span>
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'incorrect' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
                    ></span>
                    <span className="cb-label cursor-pointer" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>No</span>
                  </td>
                  <td className="chk-comment">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 text-xs text-slate-800"
                      value={grades[`${qKey}_cmt`] || ''}
                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '3px' }}>Comments/Feedback to Participant</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('student_signature', 'submission')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {answers.student_signature_url || submission.signature_url ? (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input required={isStudent} 
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')}
                    onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })}
                  />
                  <span className="hidden print:inline border-b border-dashed border-gray-400 min-w-[100px] text-center ml-1">
                    {formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '5px 8px', minHeight: '28px', fontSize: '9pt', marginBottom: '5px' }}>
          <strong>Assessor's Feedback:</strong>
          <textarea
            className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs mt-1"
            value={taskResults['t2_feedback'] || ''}
            onChange={(e) => setTaskResults({ ...taskResults, t2_feedback: e.target.value })}
            placeholder="Enter Assessor Feedback for Task 2..."
          />
        </div>

        <div className="result-line">
          Result:{' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t2'] === 'S' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t2: 'S' })}
          >S</span>
          {' '}/ Not Satisfactory (NS){' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t2'] === 'NS' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t2: 'NS' })}
          >NS</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '55%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '45%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('assessor_signature', 'comp')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={compRecord.assessment_date || ''}
                    onChange={(e) => { 
                      if (!isStudent) {
                        setCompRecord({ 
                          ...compRecord, 
                          assessment_date: e.target.value,
                          assessor_sig_date: e.target.value,
                          db_entry_date: e.target.value 
                        });
                      }
                    }}
                  readOnly={isStudent}
                  />
                  <span className="hidden print:inline underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 12 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 3 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 3 – OBSERVATION</h1>
        <h2 className="sub-title">Practical Demonstration</h2>
        <h3 className="task-label">Mechanical splice</h3>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Student instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>In this assessment, the candidate should demonstrate their knowledge in completing an "in-line" mechanical splice by following the industry and organisational policy and procedures. The process adopted for fusion splice depends on the assessment environment and the resources available. Based on the information provided by the assessor the fusion splice need to demonstrate on the appropriate cable.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>For better understanding the assessor will demonstrate fusion splicing techniques for:</p>
        <ul className="steps-list" style={{ marginBottom: '4px' }}>
          <li>250µm to 250µm (external to external fibres)</li>
          <li>250µm to 900µm (external fibres to 900µm tight buffered pigtail connectors)</li>
          <li>900µm to 900µm (internal to internal tight buffered fibres)</li>
        </ul>
        <p style={{ fontSize: '9.5pt', marginBottom: '5px' }}>You must ensure that all work planned will be conducted in line with regulatory requirements and safety/OHS considerations.</p>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Procedure:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>As with the previous assessment task, this task should be divided into the four same stages:</p>
        <ol className="steps-list" style={{ marginBottom: '4px' }}>
          <li>Fibre preparation</li>
          <li>Fibre cleaving</li>
          <li>Fibre splicing</li>
          <li>Protecting the fibre joint.</li>
        </ol>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>You will need to:</p>
        <ol className="steps-list" style={{ marginBottom: '4px' }}>
          <li>Prepare the fibre in the same manner as for fusion splicing</li>
          <li>Cleave the fibre in the same manner as for fusion splicing – however the cleaved fibre length must be adhered to as per the manufacture's specifications (each manufacture may have a specific length requirement which must be followed in order to achieve the best performance)</li>
          <li>Insert/align fibres into the mechanical splice</li>
          <li>Lock or crimp the fibres into position.</li>
        </ol>
        <p style={{ fontSize: '9.5pt' }}>You may wish to incorporate the group activities into this assessment task, in which case you should use the group activities to gather the evidence required for this task.</p>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 13 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 3 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '4px' }}>The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Assessor Instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '5px' }}>The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carry out the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.</p>
        <p style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '9.5pt' }}>The following was observed during the observations:</p>

        <div className="obs-grid">
          <div className="obs-row"><span>Install customer access network cable</span><span><span className={grades['t3obs0'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Operation of test equipment</span><span><span className={grades['t3obs1'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Perform fault clearance</span><span><span className={grades['t3obs2'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Use of diagnostic equipment</span><span><span className={grades['t3obs3'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Joining techniques adopted</span><span><span className={grades['t3obs4'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Use of tools and equipment</span><span><span className={grades['t3obs5'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Use of hand and power tools</span><span><span className={grades['t3obs6'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Follow safety standards and procedures</span><span><span className={grades['t3obs7'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
          <div className="obs-row"><span>Termination process</span><span><span className={grades['t3obs8'] ? "checked-box is-checked" : "checked-box"}></span> Observation 1</span></div>
        </div>

        <table className="chk-table">
          <thead>
            <tr><td className="chk-q">Checklist</td><td className="chk-case">Case 1</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => { 
                    if (!isStudent) {
                      setCompRecord({ 
                        ...compRecord, 
                        assessment_date: e.target.value,
                        assessor_sig_date: e.target.value,
                        db_entry_date: e.target.value 
                      });
                    }
                  }}
                  readOnly={isStudent}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
            {[
              "Did the Student accessed and read job instructions, including specific method & process requirements",
              "Did the Student sourced appropriate workplace procedures and State / Territory requirements prior to commencing work",
              "Did the student apply precautions required to minimise hazard",
              "Did the student communicate with technical experts professionally",
              "Did the student interpret technical documentation such as equipment manuals, specifications and requirements for optical fibre cable installation",
              "Did the student exhibit numeracy skills to take and analyse measurements"
            ].map((itemText, idx) => {
              const qKey = `t3q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{idx + 1}. {itemText}</td>
                  <td className="chk-case yn-cell">
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'correct' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
                    ></span>
                    <span className="cb-label cursor-pointer mr-2" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>Yes</span>
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'incorrect' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
                    ></span>
                    <span className="cb-label cursor-pointer" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>No</span>
                  </td>
                  <td className="chk-comment">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 text-xs text-slate-800"
                      value={grades[`${qKey}_cmt`] || ''}
                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 14 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 3 CHECKLIST cont. + Result ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <table className="chk-table">
          <tbody>
            {[
              "Did the student select and use required personal protective equipment conforming to industry and OHS standards",
              "Did the student follow the safety procedures while setting the equipment",
              "Did the student install customer access network (CAN) cable",
              "Did the student operate test equipment to perform measurements on optical fibre",
              "Did the student perform fault clearance",
              "Did the student use diagnostic equipment",
              "Did the student use optical fibre jointing techniques",
              "Did the student use specialised tools and test equipment",
              "Did the Student exhibit knowledge in direct termination techniques",
              "Did the student exhibit knowledge in fusion splicing",
              "Did the student exhibit knowledge in mechanical splicing",
              "Did the student describe the specific work health and safety (WHS) requirements relating to the activity and site conditions",
              "Did the student undertake the task independently?",
              "Did the student demonstrate time management skill through the task?",
              "Did the student exhibit good communication skills?",
              "Did the student meet all the criteria for the task?"
            ].map((itemText, idx) => {
              const qKey = `t3q${idx + 7}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{idx + 7}. {itemText}</td>
                  <td className="chk-case yn-cell">
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'correct' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
                    ></span>
                    <span className="cb-label cursor-pointer mr-2" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>Yes</span>
                    <span
                      className={`cb cursor-pointer ${grades[qKey] === 'incorrect' ? 'checked' : ''}`}
                      onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
                    ></span>
                    <span className="cb-label cursor-pointer" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>No</span>
                  </td>
                  <td className="chk-comment">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none px-1 text-xs text-slate-800"
                      value={grades[`${qKey}_cmt`] || ''}
                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '3px' }}>Comments/Feedback to Participant</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('student_signature', 'submission')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {answers.student_signature_url || submission.signature_url ? (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input required={isStudent} 
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')}
                    onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })}
                  />
                  <span className="hidden print:inline border-b border-dashed border-gray-400 min-w-[100px] text-center ml-1">
                    {formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '5px 8px', minHeight: '28px', fontSize: '9pt', marginBottom: '5px' }}>
          <strong>Assessor's Feedback:</strong>
          <textarea
            className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs mt-1"
            value={taskResults['t3_feedback'] || ''}
            onChange={(e) => setTaskResults({ ...taskResults, t3_feedback: e.target.value })}
            placeholder="Enter Assessor Feedback for Task 3..."
          />
        </div>

        <div className="result-line">
          Result:{' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t3'] === 'S' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t3: 'S' })}
          >S</span>
          {' '}/ Not Satisfactory (NS){' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t3'] === 'NS' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t3: 'NS' })}
          >NS</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '55%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '45%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('assessor_signature', 'comp')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={compRecord.assessment_date || ''}
                    onChange={(e) => { 
                      if (!isStudent) {
                        setCompRecord({ 
                          ...compRecord, 
                          assessment_date: e.target.value,
                          assessor_sig_date: e.target.value,
                          db_entry_date: e.target.value 
                        });
                      }
                    }}
                  readOnly={isStudent}
                  />
                  <span className="hidden print:inline underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 15 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 16 – TASK 4 WRITTEN Q&A ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 4: WRITTEN QUESTIONS AND ANSWERS</h1>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Student Instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45-60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 5 in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.</p>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Make sure you:</p>
        <ul className="steps-list" style={{ marginBottom: '5px' }}>
          <li>Answer all questions</li>
          <li>Print clearly or select and circle the appropriate answer or type it as a word document.</li>
          <li>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
          <li>Ask your assessor if you do not understand a question. Whist your assessor cannot tell you the answer, he/she may be able to re-word the question for you</li>
          <li>Do not talk to your classmates. If you are caught discussion the answers you will be asked to leave and your assessment will not be marked.</li>
          <li>Do not cheat. Anyone caught cheating will automatically be marked Not Competent for this unit. There are NO EXCEPTIONS to this rule.</li>
        </ul>

        <p className="instructions-note">Any instructions will be in <span className="blue-word">Blue</span> and Responses will be in <span className="red-word">Red</span></p>

        {/* Questions table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><td style={{ border: '1px solid #555', background: '#1a3fa8', color: '#fff', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', padding: '4px' }}>Questions</td></tr>
          </thead>
        </table>

        {/* Q1 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>1. &nbsp; What are the safety equipment required while working with optical fibre cables? (PC 1.1)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q1'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q1': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q1: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q1'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q1: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q1'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q2 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>2. &nbsp; List the three fibre optic installations. (PC 1.2)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q2'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q2': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q2: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q2'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q2: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q2'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q3 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>3. &nbsp; What are the precautions to be observed when handling optical fibre cable? (PC 1.3)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '120px', height: '140px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q3'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q3': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q3: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q3'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q3: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q3'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 16 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 17 – Q4–Q8 ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Q4 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', background: '#f5f5f5' }}>
                <strong>4. &nbsp; Which Australian standard should be followed for optical fibre safety? (Choose one)</strong>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[
                  { val: 'a', text: 'AS/NZS 2967:2014' },
                  { val: 'b', text: 'AS/NZS 2387' },
                  { val: 'c', text: 'AS/NZS 3080:2003' },
                  { val: 'd', text: 'AS/NZS 1268' }
                ].map((opt) => {
                  const isSelected = (answers['t4q4'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't4q4': opt.val })}>
                      <input type="radio" name="t4q4" required={isStudent} checked={answers['t4q4'] === opt.val || (answers['t4q4'] || '').toLowerCase() === opt.val || (answers['t4q4'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span className={`cb ${isSelected ? 'checked' : ''}`} style={{ marginRight: '6px' }}></span>
                      {opt.val.toUpperCase()}. &nbsp; {opt.text}
                    </div>
                  );
                })}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q4: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q4'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q4: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q4'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q5 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>5. &nbsp; What is the significance of conducting a pre-installation test? (PC 1.5)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '60px', height: '70px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q5'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q5': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q5: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q5'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q5: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q5'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q6 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td colSpan={2} style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>6. &nbsp; Match the fibre dimension standards. (PC 2.1)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '0', width: '50%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #777', padding: '5px 8px', background: '#e8e8e8', fontSize: '9pt', color: '#000', fontWeight: 'bold' }}>Type</th>
                      <th style={{ border: '1px solid #777', padding: '5px 8px', background: '#e8e8e8', fontSize: '9pt', color: '#000', fontWeight: 'bold' }}>Core diameter in microns</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>S/M 9/125</td><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>9 microns</td></tr>
                    <tr><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>S/M 10/125</td><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>10 microns</td></tr>
                    <tr><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>M/M 50/125</td><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>50 microns</td></tr>
                    <tr><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>M/M 62.5/125</td><td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt' }}>62.5 microns</td></tr>
                  </tbody>
                </table>
              </td>
              <td style={{ border: '1px solid #777', padding: '8px 12px', width: '50%', verticalAlign: 'top' }}>
                <div className="text-xs font-bold text-slate-500 mb-1">Student Matches:</div>
                <div className="space-y-1 text-red-600 font-bold text-xs italic">
                  <div className="flex items-center gap-1">S/M 9/125: <input required={isStudent} className="w-16 bg-transparent border-b border-gray-400 outline-none text-center" value={answers['t4q6_a'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q6_a': e.target.value })} /> microns</div>
                  <div className="flex items-center gap-1">S/M 10/125: <input required={isStudent} className="w-16 bg-transparent border-b border-gray-400 outline-none text-center" value={answers['t4q6_b'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q6_b': e.target.value })} /> microns</div>
                  <div className="flex items-center gap-1">M/M 50/125: <input required={isStudent} className="w-16 bg-transparent border-b border-gray-400 outline-none text-center" value={answers['t4q6_c'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q6_c': e.target.value })} /> microns</div>
                  <div className="flex items-center gap-1">M/M 62.5/125: <input required={isStudent} className="w-16 bg-transparent border-b border-gray-400 outline-none text-center" value={answers['t4q6_d'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q6_d': e.target.value })} /> microns</div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q6: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q6'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q6: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q6'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q7 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>7. &nbsp; Mention the steps involved in aerial installation (PC 3.2)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '100px', height: '110px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q7'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q7': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q7: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q7'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q7: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q7'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q8 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>8. &nbsp; Name the types of connectors used in connecting ends of optical fibres. (pc 3.2)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '60px', height: '70px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q8'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q8': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q8: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q8'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q8: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q8'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 17 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 18 – Q9–Q10 + End ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL330 - Splice and terminate optical fibre cable for telecommunications projects</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Q9 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', background: '#f5f5f5' }}>
                <strong>9. &nbsp; Which splicing method melts the ends of two fibres so they fuse, like welding metal? (PC 4.3)</strong>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[
                  { val: 'a', text: 'Fusion splicing' },
                  { val: 'b', text: 'Mechanical splicing' },
                  { val: 'c', text: 'Temporary splicing' },
                  { val: 'd', text: 'Permanent splicing' }
                ].map((opt) => {
                  const isSelected = (answers['t4q9'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't4q9': opt.val })}>
                      <input type="radio" name="t4q9" required={isStudent} checked={answers['t4q9'] === opt.val || (answers['t4q9'] || '').toLowerCase() === opt.val || (answers['t4q9'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span className={`cb ${isSelected ? 'checked' : ''}`} style={{ marginRight: '6px' }}></span>
                      {opt.text}
                    </div>
                  );
                })}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q9: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q9'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q9: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q9'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Q10 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>10. &nbsp; Distinguish between connectors and splices? (pc 4.1,4.2)</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold', background: '#e8e8e8', width: '50%' }}>Connectors</td>
              <td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt', fontWeight: 'bold', background: '#e8e8e8', width: '50%' }}>Splices</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #777', minHeight: '60px', height: '70px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t4q10'] || ''} onChange={(e) => setAnswers({ ...answers, 't4q10': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}><span style={{ position: 'absolute', top: '-4px', left: '0px', fontSize: '11px', color: '#1a3fa8', fontWeight: 'bold' }}>✓</span></span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q10: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q10'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t4q10: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t4q10'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '3px' }}>Comments/Feedback to Participant</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '50%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('student_signature', 'submission')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {answers.student_signature_url || submission.signature_url ? (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign Here</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input required={isStudent} 
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')}
                    onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })}
                  />
                  <span className="hidden print:inline border-b border-dashed border-gray-400 min-w-[100px] text-center ml-1">
                    {formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '5px 8px', minHeight: '28px', fontSize: '9pt', marginBottom: '5px' }}>
          <strong>Assessor's Feedback:</strong>
          <textarea
            className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs mt-1"
            value={taskResults['t4_feedback'] || ''}
            onChange={(e) => setTaskResults({ ...taskResults, t4_feedback: e.target.value })}
            placeholder="Enter Assessor Feedback for Task 4..."
          />
        </div>

        <div className="result-line">
          Result:{' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t4'] === 'S' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t4: 'S' })}
          >S</span>
          {' '}/ Not Satisfactory (NS){' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t4'] === 'NS' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t4: 'NS' })}
          >NS</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px', marginBottom: '10mm' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '55%', verticalAlign: 'top' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '8.5pt', width: '45%', verticalAlign: 'top' }}>
                <div className="flex items-center gap-2">
                  Signature:
                  <div
                    onClick={() => openSigModal('assessor_signature', 'comp')}
                    className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2 hover:bg-blue-50/50"
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sign</span>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  Date:
                  <input
                    type="date"
                    className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-1 font-bold"
                    value={compRecord.assessment_date || ''}
                    onChange={(e) => { 
                      if (!isStudent) {
                        setCompRecord({ 
                          ...compRecord, 
                          assessment_date: e.target.value,
                          assessor_sig_date: e.target.value,
                          db_entry_date: e.target.value 
                        });
                      }
                    }}
                  readOnly={isStudent}
                  />
                  <span className="hidden print:inline underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '10mm' }}>
          <span style={{ fontSize: '14pt', fontWeight: 'bold', fontStyle: 'italic', letterSpacing: '1px' }}>END OF ASSESSMENT</span>
        </div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 18 of 18</span>
        </div>
      </div>

    </div>
  );
};
