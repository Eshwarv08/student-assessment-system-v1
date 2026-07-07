import React, { useState, useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { ArrowLeft, Save, Printer, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Q3BookletProps {
  answers: any;
  setAnswers: (val: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  studentName?: string;
  submitDate?: string;
  isStudent?: boolean;
  compRecord?: any;
  setCompRecord?: (val: any) => void;
  grades?: Record<string, string>;
  setGrades?: (val: any) => void;
  taskResults?: Record<string, string>;
  setTaskResults?: (val: any) => void;
  finalResult?: string;
  setFinalResult?: (val: any) => void;
}

export const Q3Booklet: React.FC<Q3BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent, compRecord: externalCompRecord, setCompRecord: externalSetCompRecord, grades: externalGrades, setGrades: externalSetGrades, taskResults: externalTaskResults, setTaskResults: externalSetTaskResults, finalResult: externalFinalResult, setFinalResult: externalSetFinalResult }) => {
  const navigate = useNavigate();

  const [internalCompRecord, setInternalCompRecord] = useState<any>({ tasks: {}, attempts: [], evidence: {} });
  const [internalGrades, setInternalGrades] = useState<Record<string, string>>({});
  const [internalTaskResults, setInternalTaskResults] = useState<Record<string, string>>({});
  const [internalFinalResult, setInternalFinalResult] = useState<string>('');

  const grades = externalGrades ?? internalGrades;
  const _setGrades = externalSetGrades ?? setInternalGrades;
  const setGrades = (val: any) => { if (!isStudent) _setGrades(val); };
  
  const taskResults = externalTaskResults ?? internalTaskResults;
  const _setTaskResults = externalSetTaskResults ?? setInternalTaskResults;
  const setTaskResults = (val: any) => { if (!isStudent) _setTaskResults(val); };
  
  const compRecord = externalCompRecord ?? internalCompRecord;
  const _setCompRecord = externalSetCompRecord ?? setInternalCompRecord;
  const setCompRecord = (val: any) => { if (!isStudent) _setCompRecord(val); };
  
  const finalResult = externalFinalResult ?? internalFinalResult;
  const _setFinalResult = externalSetFinalResult ?? setInternalFinalResult;
  const setFinalResult = (val: any) => { if (!isStudent) _setFinalResult(val); };
  
  const markAllCorrect = () => { };
  const handleDownload = () => onSubmit();

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

  const q3Styles = `
      .q3-booklet-view {
        background: #d0d0d0;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 10pt;
        color: #000;
        line-height: 1.35;
        padding: 20px 0;
      }
      .q3-booklet-view * {
        box-sizing: border-box;
      }
      .q3-booklet-view .page {
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
      .q3-booklet-view h1.section-title {
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
      .q3-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
      }
      .q3-booklet-view h2.sub-title {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 2mm 0;
      }
      .q3-booklet-view h3.task-label {
        font-size: 10.5pt;
        font-weight: bold;
        text-align: center;
        margin: 1mm 0 3mm;
      }
      .q3-booklet-view .intro-box {
        background: #f5f5f5;
        border: 1px solid #999;
        padding: 4px 8px;
        margin-bottom: 5px;
        font-size: 9pt;
      }
      .q3-booklet-view table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 4px;
        font-size: 9.5pt;
      }
      .q3-booklet-view table td, .q3-booklet-view table th {
        border: 1px solid #555;
        padding: 3px 6px;
        vertical-align: top;
      }
      .q3-booklet-view table th {
        background: #e8e8e8;
        font-weight: bold;
      }
      .q3-booklet-view .field-label-cell {
        font-weight: bold;
        background: #f0f0f0;
        width: 38%;
        border: 1px solid #555;
        padding: 5px 6px;
      }
      .q3-booklet-view .field-value-cell {
        border: 1px solid #555;
        padding: 5px 6px;
        min-height: 22px;
      }
      .q3-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q3-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
      .q3-booklet-view .evidence-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 3px 0;
        font-size: 9pt;
      }
      .q3-booklet-view .evidence-item { display: flex; align-items: center; gap: 4px; }
      .q3-booklet-view .result-badge {
        display: inline-flex; align-items: center; gap: 3px;
        background: #cde;
        border: 1px solid #67a;
        border-radius: 50%;
        width: 15px; height: 15px;
        font-size: 7pt;
        justify-content: center;
        color: #000;
      }
      .q3-booklet-view .attempt-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
      .q3-booklet-view .attempt-table td, .q3-booklet-view .attempt-table th { border: 1px solid #555; padding: 3px 6px; }
      .q3-booklet-view .attempt-table .attempt-num { width: 12%; text-align: center; font-weight: bold; }
      .q3-booklet-view .attempt-table .attempt-date { width: 18%; }
      .q3-booklet-view .attempt-table .attempt-fb { width: 70%; }
      .q3-booklet-view .sig-line { border-bottom: 1px solid #000; min-width: 100px; display: inline-block; margin-left: 4px; }
      .q3-booklet-view .unit-info-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 5px; }
      .q3-booklet-view .unit-info-table td { border: 1px solid #555; padding: 4px 7px; vertical-align: top; }
      .q3-booklet-view .unit-info-table .key-col { font-weight: bold; background: #f0f0f0; width: 28%; }
      .q3-booklet-view .unit-info-table ul { padding-left: 16px; margin: 2px 0; }
      .q3-booklet-view .unit-info-table li { margin-bottom: 1px; }
      .q3-booklet-view .ra-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 4px 0; }
      .q3-booklet-view .ra-table td, .q3-booklet-view .ra-table th { border: 1px solid #555; padding: 4px 7px; vertical-align: top; }
      .q3-booklet-view .ra-table th { background: #e0e0e0; font-weight: bold; }
      .q3-booklet-view .chk-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 16px; }
      .q3-booklet-view .chk-table td { border: 1px solid #777; padding: 13px 14px; vertical-align: middle; line-height: 1.45; }
      .q3-booklet-view .chk-table .chk-q { width: 68%; }
      .q3-booklet-view .chk-table .chk-case { width: 17%; text-align: center; }
      .q3-booklet-view .chk-table .chk-comment { width: 15%; }
      .q3-booklet-view .chk-table thead td { background: #e8e8e8; color: #000; font-weight: bold; text-align: center; border: 1.5px solid #777; padding: 13px 14px; }
      .q3-booklet-view .obs-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 28px auto;
        font-size: 10pt;
        max-width: 550px;
        padding-left: 0;
      }
      .q3-booklet-view .obs-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
      .q3-booklet-view .checked-box { display: inline-block; width: 14px; height: 14px; border: 1.5px solid #444; background: #fff; position: relative; vertical-align: middle; }
      .q3-booklet-view .checked-box.is-checked::after { content: '✓'; position: absolute; top: -4.5px; left: 0px; font-size: 14px; color: #cc0000; font-weight: bold; }
      .q3-booklet-view .yn-cell { white-space: nowrap; }
      .q3-booklet-view .cb { display: inline-block; width: 13px; height: 13px; border: 1.5px solid #555; background: #fff; vertical-align: middle; position: relative; margin-right: 4px; }
      .q3-booklet-view .cb.checked::after { content: '✓'; position: absolute; top: -5px; left: 0px; font-size: 14px; color: #cc0000; font-weight: bold; }
      .q3-booklet-view .cb-label { font-size: 9pt; }
      .q3-booklet-view .cb-sq { display: inline-block; width: 12px; height: 12px; border: 1px solid #555; background: #fff; vertical-align: middle; position: relative; margin-right: 2px; }
      .q3-booklet-view .cb-sq.checked::after { content: '✓'; position: absolute; top: -3.5px; left: 0px; font-size: 12px; color: #d32f2f; font-weight: bold; }
      .q3-booklet-view .result-circle-red {
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
      .q3-booklet-view .result-inactive {
        color: #777;
        font-size: 9pt;
        cursor: pointer;
        padding: 0 4px;
      }
      .q3-booklet-view .result-line {
        text-align: center;
        font-size: 12pt;
        font-weight: bold;
        margin: 6px 0 4px;
      }
      .q3-booklet-view .result-circle {
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
      .q3-booklet-view .result-circle.active {
        border-color: #d32f2f;
        color: #d32f2f;
        font-weight: bold;
        background: transparent;
      }
      .q3-booklet-view .tick-icon { display: inline-block; width: 13px; height: 13px; border: 1px solid #555; background: #fff; position: relative; vertical-align: middle; margin-right: 2px; }
      .q3-booklet-view .tick-icon.checked::after { content: '✓'; position: absolute; top: -3px; left: 0; font-size: 12px; }
      .q3-booklet-view .choice-item { margin: 1px 0; font-size: 9.5pt; }
      .q3-booklet-view .steps-list { padding-left: 20px; margin: 3px 0; font-size: 9.5pt; }
      .q3-booklet-view .steps-list li { margin-bottom: 2px; }
      .q3-booklet-view .sub-alpha { list-style-type: lower-alpha; padding-left: 18px; margin-top: 2px; }
      .q3-booklet-view .bold-para { font-weight: bold; margin: 3px 0 1px; font-size: 9.5pt; }
      .q3-booklet-view .note-para { font-size: 9pt; margin: 3px 0; }
      .q3-booklet-view .sig-visual {
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
      .q3-booklet-view .underline-bold { text-decoration: underline; font-weight: bold; }
      .q3-booklet-view .inner-header {
        border-top: 2px solid #1a5fa8;
        margin-bottom: 8px;
        padding-top: 4px;
        width: 100%;
      }
      .q3-booklet-view .inner-header .top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-size: 8.5pt;
        width: 100%;
      }
      .q3-booklet-view .inner-header .top-row .title-block {
        text-align: left;
        line-height: 1.35;
      }
      .q3-booklet-view .inner-header .top-row .logo-block {
        flex-shrink: 0;
      }
      .q3-booklet-view .page-footer {
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
      .q3-booklet-view .checkbox-row { display: flex; align-items: center; gap: 4px; margin: 2px 0; }
      .q3-booklet-view .instructions-note { font-size: 10pt; margin: 4px 0 6px; }
      .q3-booklet-view .instructions-note .blue-word { color: #1a3fa8; text-decoration: underline; font-weight: bold; }
      .q3-booklet-view .instructions-note .red-word { color: #cc0000; text-decoration: underline; font-weight: bold; }
      .q3-booklet-view .spacer-sm { height: 2mm; }
      .q3-booklet-view .italic-note { font-style: italic; font-size: 9pt; margin: 3px 0; }

      @media print {
        @page { size: A4; margin: 0; }
        body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
        .q3-booklet-view { background: transparent !important; padding: 0 !important; margin: 0 !important; }
        .q3-booklet-view .page {
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
        .q3-booklet-view .page:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        .q3-booklet-view .page * {
          font-size: 8.2pt !important;
          line-height: 1.2 !important;
        }
        .q3-booklet-view h1.section-title {
          font-size: 11pt !important;
          margin: 3mm 0 2mm !important;
        }
        .q3-booklet-view h2.sub-title {
          font-size: 10pt !important;
          margin: 1mm 0 !important;
        }
        .q3-booklet-view h3.task-label {
          font-size: 9.5pt !important;
          margin: 1mm 0 2mm !important;
        }
        .q3-booklet-view p {
          margin-top: 0 !important;
          margin-bottom: 3px !important;
        }
        .q3-booklet-view table {
          margin-bottom: 4px !important;
          font-size: 8pt !important;
        }
        .q3-booklet-view table td,
        .q3-booklet-view table th {
          padding: 2.5px 5px !important;
        }
        .q3-booklet-view .obs-grid {
          margin: 8px auto !important;
          gap: 5px !important;
        }
        .q3-booklet-view .obs-row { padding: 3px 0 !important; }
        .q3-booklet-view .chk-table td {
          padding: 4px 6px !important;
          font-size: 7.8pt !important;
          line-height: 1.15 !important;
        }
        .q3-booklet-view .chk-table thead td {
          padding: 4px 6px !important;
        }
        .q3-booklet-view .chk-table tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .q3-booklet-view .spacer-sm { height: 1mm !important; }
        .q3-booklet-view .page-footer {
          margin-top: auto !important;
          flex-shrink: 0 !important;
          padding-bottom: 1mm !important;
        }
        .q3-booklet-view .no-print { display: none !important; }
        .q3-booklet-view input[type="text"],
        .q3-booklet-view textarea {
          border: none !important;
          border-bottom: 1px dotted #999 !important;
          font-size: 7.8pt !important;
          padding: 1px 3px !important;
        }
        .q3-booklet-view .sig-visual {
          min-width: 60px !important;
          height: 18px !important;
          line-height: 1 !important;
        }
        .q3-booklet-view .sig-visual img {
          max-height: 16px !important;
          display: inline-block !important;
        }
        .q3-booklet-view .result-line {
          margin: 2px 0 3px !important;
          font-size: 8.5pt !important;
          text-align: center !important;
        }
        .q3-booklet-view .result-circle {
          width: 15px !important;
          height: 15px !important;
          font-size: 7.5pt !important;
        }
        .q3-booklet-view .result-circle-red {
          width: 15px !important;
          height: 15px !important;
          font-size: 7.5pt !important;
        }
      }
      @media screen and (max-width: 240mm) {
        .q3-booklet-view .page { width: 100% !important; margin: 0 !important; padding: 4mm !important; }
      }
  
      @media screen and (max-width: 800px) {
        .q3-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q3-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q3-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q3-booklet-view .flex, .q3-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q3-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q3-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q3-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q3-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q3-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q3-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }
  `;

  return (
    <div className="q3-booklet-view">
      <style dangerouslySetInnerHTML={{ __html: q3Styles }} />
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
        <div className="cover-outer-border" style={{ border: '3.5px solid #5b9bd5', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="cover-inner-border" style={{ border: '1.2px solid #5b9bd5', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>

            {/* ACTA Logo */}
            <img
              src="/assets/acta-logo.png"
              alt="ACTA Logo"
              style={{ width: '220px', height: 'auto', objectFit: 'contain', marginBottom: '4mm', marginTop: '15mm' }}
            />

            <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#8b0000', marginBottom: '15mm', fontFamily: 'Arial, sans-serif', letterSpacing: '0.3px' }}>RTO NO: 40954</div>
            
            <div className="cover-title" style={{ fontSize: '46pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#5b9bd5', height: '12px', width: '100%', margin: '4mm 0' }}></div>
            <div className="cover-subtitle" style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '6mm', marginTop: '6mm' }}>ICTCBL322</div>
            <div className="cover-subtitle" style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>
              Install, test and terminate optical<br />fiber cable on customer premises
            </div>
            
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '15pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', paddingLeft: '8%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1px solid #000', width: '100%', fontWeight: 'normal', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left', marginLeft: '6px' }}>{studentName}</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginTop: '35mm', marginBottom: '10mm' }}>ACTA College Pty. Ltd</div>
            </div>

          </div>
        </div>
      </div>

      
{/* ═══════════════════ PAGE 2 – ASSESSMENT COMPETENCY RECORD ═══════════════════ */}
      <div className="page">
        {/* Header matching image */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4mm 0' }}>ASSESSMENT COMPETENCY RECORD</h1>
        
        <div style={{ background: '#d9d9d9', border: '1px solid #555', padding: '6px 8px', fontSize: '9pt', marginBottom: '6mm', textAlign: 'left', lineHeight: '1.4' }}>
          This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px', width: '35%' }}>Student's Name</td>
              <td style={{ border: '1px solid #555', padding: '6px' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px' }}>Assessor's Name</td>
              <td style={{ border: '1px solid #555', padding: '6px' }}>
                <input type="text" className={`w-full bg-transparent border-none outline-none font-bold text-slate-800 ${isStudent ? 'cursor-default pointer-events-none' : ''}`} value={compRecord.assessor_name || ''} onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })} readOnly={isStudent} tabIndex={isStudent ? -1 : 0} />
              </td>
            </tr>
            <tr>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px' }}>Assessment Site</td>
              <td style={{ border: '1px solid #555', padding: '6px' }}>
                <input type="text" className="w-full bg-transparent border-none outline-none font-bold text-slate-800" value={compRecord.assessment_site || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_site: e.target.value })} />
              </td>
            </tr>
            <tr>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px' }}>Assessment Date</td>
              <td style={{ border: '1px solid #555', padding: '6px' }}>
                <input type="date" className={`no-print w-full bg-transparent border-none outline-none font-bold text-slate-800 ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                <span className="hidden print:inline font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Assessor Declaration Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={5} style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '1px solid #555', padding: '6px' }}>In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.</td>
            </tr>
            <tr>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px', width: '45%' }}>Evidence is Confirmed as:</td>
              <td style={{ border: '1px solid #555', padding: '6px', textAlign: 'center', width: '13.75%' }}>
                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, valid: !compRecord.evidence?.valid } })}>
                  <div className="w-[14px] h-[14px] border-[1px] border-black bg-white relative flex justify-center items-center">
                    {compRecord.evidence?.valid && <span className="text-red-600 font-bold text-lg absolute -top-[3px]">✓</span>}
                  </div> Valid
                </div>
              </td>
              <td style={{ border: '1px solid #555', padding: '6px', textAlign: 'center', width: '13.75%' }}>
                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, sufficient: !compRecord.evidence?.sufficient } })}>
                  <div className="w-[14px] h-[14px] border-[1px] border-black bg-white relative flex justify-center items-center">
                    {compRecord.evidence?.sufficient && <span className="text-red-600 font-bold text-lg absolute -top-[3px]">✓</span>}
                  </div> Sufficient
                </div>
              </td>
              <td style={{ border: '1px solid #555', padding: '6px', textAlign: 'center', width: '13.75%' }}>
                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, current: !compRecord.evidence?.current } })}>
                  <div className="w-[14px] h-[14px] border-[1px] border-black bg-white relative flex justify-center items-center">
                    {compRecord.evidence?.current && <span className="text-red-600 font-bold text-lg absolute -top-[3px]">✓</span>}
                  </div> Current
                </div>
              </td>
              <td style={{ border: '1px solid #555', padding: '6px', textAlign: 'center', width: '13.75%' }}>
                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, authentic: !compRecord.evidence?.authentic } })}>
                  <div className="w-[14px] h-[14px] border-[1px] border-black bg-white relative flex justify-center items-center">
                    {compRecord.evidence?.authentic && <span className="text-red-600 font-bold text-lg absolute -top-[3px]">✓</span>}
                  </div> Authentic
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Attach docs + Final Result Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', padding: '6px', fontWeight: 'bold', width: '58.75%' }}>Please attach the following documentation to this form</td>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '13.75%' }}>Result</td>
              <td rowSpan={6} style={{ border: '1px solid #555', background: '#bfbfbf', padding: '6px', verticalAlign: 'middle', width: '27.5%', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>FINAL ASSESSMENT<br/>RESULT:</div>
                <div className="flex flex-col items-start gap-3 ml-[15%]">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFinalResult('C')}>
                    <div className="w-[14px] h-[14px] border-[1px] border-black bg-white relative flex justify-center items-center shrink-0">
                      {finalResult === 'C' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div> <span className="font-bold whitespace-nowrap">Competent (C)</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFinalResult('NC')}>
                    <div className="w-[14px] h-[14px] border-[1px] border-black bg-white relative flex justify-center items-center shrink-0">
                      {finalResult === 'NC' && <span className="text-red-600 font-bold text-xl absolute -top-[5px]">✓</span>}
                    </div> <span className="font-bold whitespace-nowrap">Not Competent (NC)</span>
                  </div>
                </div>
              </td>
            </tr>
            {/* Task rows */}
            {[
              { id: 't1', label: 'Assessment Task 1', type: 'Questions and Answers' },
              { id: 't2', label: 'Assessment Task 2', type: 'Observation' },
              { id: 't3', label: 'Assessment Task 3', type: 'Observation' },
              { id: 't4', label: 'Assessment Task 4', type: 'Observation' },
              { id: 't5', label: 'Assessment Task 5', type: 'Observation' }
            ].map((task) => (
              <tr key={task.id}>
                <td style={{ border: '1px solid #555', padding: '8px 6px', fontWeight: 'bold', width: '25%' }}>{task.label}</td>
                <td style={{ border: '1px solid #555', padding: '8px 6px' }}>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, [task.id]: !compRecord.tasks?.[task.id] } })}>
                    <div className="w-[12px] h-[12px] border-[1px] border-black bg-white relative flex justify-center items-center shrink-0">
                      {compRecord.tasks?.[task.id] && <span className="text-red-600 font-bold text-sm absolute -top-[2px]">✓</span>}
                    </div> <span>{task.type}</span>
                  </div>
                </td>
                <td style={{ border: '1px solid #555', padding: '8px 6px', textAlign: 'center' }}>
                  <div className="flex justify-center items-center gap-1">
                    <span className="cursor-pointer px-1 relative" onClick={() => setTaskResults({ ...taskResults, [task.id]: 'S' })}>
                      S
                      {taskResults[task.id] === 'S' && <div className="absolute inset-0 border-[1.5px] border-red-600 rounded-full scale-[1.3] -top-[1px]"></div>}
                    </span>
                    <span>/</span>
                    <span className="cursor-pointer px-1 relative" onClick={() => setTaskResults({ ...taskResults, [task.id]: 'NS' })}>
                      NS
                      {taskResults[task.id] === 'NS' && <div className="absolute inset-0 border-[1.5px] border-red-600 rounded-full scale-[1.1] -top-[1px]"></div>}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Attempt table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px', textAlign: 'center', width: '12%' }}>Attempt</td>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px', textAlign: 'center', width: '25%' }}>Date</td>
              <td style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px', textAlign: 'center' }}>Assessor's Feedback (as Required):</td>
            </tr>
            {[0, 1, 2].map((idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #555', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #555', padding: '6px' }}>
                  <input type="date" className="w-full bg-transparent border-none outline-none text-slate-800 py-0.5 cursor-pointer no-print text-center" value={compRecord.attempts?.[idx]?.date || ''} onChange={(e) => { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[idx]) att[idx] = { date: '', feedback: '' }; att[idx].date = e.target.value; setCompRecord({ ...compRecord, attempts: att }); }} />
                  <span className="hidden print:block text-center">{formatDisplayDate(compRecord.attempts?.[idx]?.date)}</span>
                </td>
                <td style={{ border: '1px solid #555', padding: '6px' }}>
                  <input type="text" className="w-full bg-transparent border-none outline-none text-slate-800 py-0.5" value={compRecord.attempts?.[idx]?.feedback || ''} onChange={(e) => { const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])]; if (!att[idx]) att[idx] = { date: '', feedback: '' }; att[idx].feedback = e.target.value; setCompRecord({ ...compRecord, attempts: att }); }} />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ background: '#bfbfbf', fontWeight: 'bold', border: '1px solid #555', padding: '6px', textAlign: 'center' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #555', padding: '6px' }}>
                <textarea className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 py-0.5" value={compRecord.final_feedback || ''} onChange={(e) => setCompRecord({ ...compRecord, final_feedback: e.target.value })} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Declaration */}
        <div style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '2px' }}>Declaration</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '10px 8px', width: '60%', verticalAlign: 'top', lineHeight: '1.4' }}>
                <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '10px 8px', verticalAlign: 'middle' }}>
                <div className="flex items-center gap-2 mb-4">
                  Signature:
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 flex-1 relative">
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} className="max-h-[35px] max-w-[120px] object-contain inline-block absolute bottom-0" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  Date:
                  <input type="date" className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 flex-1 ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px]">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '10px 8px', verticalAlign: 'top', lineHeight: '1.4' }}>
                <strong>Student:</strong> I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '10px 8px', verticalAlign: 'middle' }}>
                <div className="flex items-center gap-2 mb-4">
                  Signature:
                  <div onClick={() => openSigModal('student_signature', 'submission')} className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[30px] border-b border-black px-2 flex-1 relative">
                    {(answers.student_signature_url || submission.signature_url) && <img src={answers.student_signature_url || submission.signature_url} className="max-h-[35px] max-w-[120px] object-contain inline-block absolute bottom-0" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  Date:
                  <input required={isStudent} type="date" className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer flex-1" value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px]">{formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 2 of 18</span>
        </div>
      </div>

      
{/* ═══════════════════ PAGE 3 – UNIT INFO ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        {/* Admin Use Only */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', fontSize: '10.5pt' }}>Administrative Use Only:</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', borderTop: 'none', padding: '10px 6px', width: '40%' }}>Entered into Student Management Database</td>
              <td style={{ border: '1px solid #555', borderTop: 'none', padding: '10px 6px' }}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, entered_db: !compRecord.entered_db })}>
                    <div className="w-[12px] h-[12px] border-[1px] border-black bg-white relative flex justify-center items-center">
                      {compRecord.entered_db && <span className="text-red-600 font-bold text-sm absolute -top-[2px]">✓</span>}
                    </div> Signature/Initial
                  </div>
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[20px] border-b border-black px-2 flex-1 relative mx-1">
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} className="max-h-[30px] max-w-[100px] object-contain inline-block absolute bottom-0" />}
                  </div>
                  Date:
                  <input type="date" className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 w-28 ml-1 ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline border-b border-black w-28 text-center ml-1">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Unit info table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #555', borderTop: 'none', padding: '6px', width: '22%', fontWeight: 'bold' }}>Unit Code/Name</td><td style={{ border: '1px solid #555', borderTop: 'none', padding: '6px' }}>ICTCBL322 – Install, test and terminate optical fibre cable on customer premises</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Pre-requisites</td><td style={{ border: '1px solid #555', padding: '6px' }}>N/A</td></tr>
            <tr><td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Co-requisites</td><td style={{ border: '1px solid #555', padding: '6px' }}>N/A</td></tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Unit Summary</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>This unit describes the skills and knowledge required to install and test optical fibre cable on a customer's premises for communications applications using a range of terminations that may include direct termination, fusion splicing and mechanical splicing.</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Target Group</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <p>It applies to technical staff who place, secure and terminate optical fibre cable in new installations and upgrades or maintain existing networks in domestic, commercial and industrial installations. Communications applications include digital and analogy, telephony, data, video, digital broadcasting, computer networks, local area networks (LAN), wide area networks (WAN) and multimedia.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Conditions and Context of the Assessments</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <p>Gather evidence to demonstrate consistent performance in conditions that are safe and replicate the workplace. Noise levels, production flow, interruptions and time variances should be typical of those experienced in the telecommunications – cabling field of work and include access to special purpose tools, equipment and materials.</p>
                <p style={{ marginTop: '8px' }}>These include access to:</p>
                <ul style={{ paddingLeft: '16px', margin: '4px 0', listStyleType: 'disc' }}>
                  <li>site/s where installation and termination of optical fibre cable can be conducted</li>
                  <li style={{ marginTop: '4px' }}>special purpose tools, equipment and materials currently used in industry such as optical fibre testing equipment</li>
                  <li style={{ marginTop: '4px' }}>relevant regulatory and equipment documentation that impacts on optical fibre cable installation activities.</li>
                </ul>
                <p style={{ marginTop: '8px' }}>Assessors of this unit must satisfy the requirements for assessors in applicable vocational education and training legislation, frameworks and/or standards.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Specific Resources Required</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <ul style={{ paddingLeft: '16px', margin: '2px 0', listStyleType: 'disc' }}>
                  <li>Learner Guide</li>
                  <li style={{ marginTop: '4px' }}>Assessment Booklet</li>
                  <li style={{ marginTop: '4px' }}>Practical Workshop</li>
                  <li style={{ marginTop: '4px' }}>Manufacturers Manuals and specifications</li>
                  <li style={{ marginTop: '4px' }}>Workplace policy and procedures</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Re-assessment</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <p>Students who are unsuccessful at achieving competency at the first attempt will be offered coaching, information and additional time (other needs if required) before a second and possibly a third attempt is made. If the student is not able to satisfactorily complete the assessment after the third attempt the student will be deemed Not Competent and resulted as such. The student may re-enrol in the qualification at a later to date to gain successful completion of the unit/s.</p>
                <p style={{ marginTop: '8px' }}>For further details refer to ACTA College Assessment Policy and Procedure.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Plagiarism</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>ACTA College considers plagiarism and cheating as serious student misconduct and this may result either in a student's exclusion from a unit or course or may have to complete a re-assessment depending on individual case.</td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 3 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 4 – INSTRUCTIONS ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', width: '22%', fontWeight: 'bold' }}>Complaints and Appeal</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>Where a student wishes to appeal an assessment decision they are required to notify their assessor in the first instance. Where appropriate the assessor may decide to re-assess the student to ensure a fair and equitable decision is gained. The assessor shall complete a written report regarding the re-assessment outlining the reasons why assessment was or was not granted.</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Assessors Intervention</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <p>Assessors are to check that the student is ready for assessment, and defer the assessment if they are not. It is important that assessors do not teach at the assessment but allow students to competence for themselves.</p>
                <p style={{ marginTop: '8px' }}>Feedback is to be given at the completion of the assessment using the feedback to student. If a student does not meet a standard, the assessor is to sit down with them and assist them in their understanding. Should you disagree with the assessment outcome, you can appeal the decision as stated in the Student Handbook.</p>
                <p style={{ marginTop: '8px' }}>Your student record must indicate that you have all required skills and knowledge in completing the task. For each assessment, the assessor is to act as a supervisor and not interfere with the assessment. In the event that the assessment activities will impact on your safety or that of others, the assessment must be stopped immediately.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Attaching Documents</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <p>Attached documents are accepted but must be labelled with the following information:</p>
                <p style={{ marginTop: '4px' }}>Unit Name and Title, Students name, Student ID, Date of Submissions, Student signature.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Assessment Instruction</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>
                <p>Assessment is mapped to the unit and must be completed by the end of each unit. This is a summative assessment, which requires each student to have adequate practice prior to undertaking this assessment</p>
                <p style={{ marginTop: '8px' }}>The assessment consists of five tasks. Assessment Task 1, Assessment Task 2, Assessment Task 3, Assessment Task 4 and Assessment Task 5.</p>
                <p style={{ marginTop: '8px' }}>Assessment Task 1 is Written questions and answers</p>
                <p style={{ marginTop: '4px' }}>Assessment Task 2 is Observation</p>
                <p style={{ marginTop: '4px' }}>Assessment Task 3 is Observation</p>
                <p style={{ marginTop: '4px' }}>Assessment Task 4 is Observation</p>
                <p style={{ marginTop: '4px' }}>Assessment Task 5 is Observation</p>
                <p style={{ marginTop: '8px' }}>For answers to written questions, reports and projects, you must:</p>
                <p style={{ marginTop: '4px' }}>• Print clearly in black or blue pen or type it as a word document</p>
                <p style={{ marginTop: '4px' }}>• Answer each of the key points and /or follow instructions</p>
                <p style={{ marginTop: '4px' }}>• Assessments written in pencil or are illegible will not be accepted.</p>
                <p style={{ marginTop: '8px' }}>Ask your assessor if you do not understand any part of the assessment. Whist your assessor cannot tell you the answer, he/she may be able to re-word a question or instruction to assist in a better understanding for you.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Assessment Task 1:</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>This is a questions and answers assessment over time. The assessor must provide students with sufficient information to complete this assessment over the duration of the full day training session. At the beginning of each review session the students should be given a few minutes to familiarize yourself with the questions. Students should be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor. The assessor must follow the session plan aligning on which day to conduct the practical observation</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Assessment Task 2:</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>Assume your own home is a property into which you will be installing optical fiber. Prepare a check list for gaining entry to your home as if it were not your own</td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 4 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 5 – COMPETENCY DECISION + REASONABLE ADJUSTMENT + COVER SHEET ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '6mm' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', width: '22%', fontWeight: 'bold' }}>Assessment Task 3:</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>This assessment task requires candidates to demonstrate a fusion splice</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Assessment Task 4:</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>This assessment task requires candidates to Demonstrate an 'in-line' mechanical splice</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Assessment Task 5:</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>This assessment task require candidates to Undertake testing to make an insertion loss measurement.</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Competency Decision</td>
              <td style={{ border: '1px solid #555', padding: '6px', lineHeight: '1.4' }}>Student must satisfactorily complete each assessment tasks to be Competent (C) in the unit. Student with unsatisfactory completion of any of the assignment tasks will be deemed Not Yet Competent (NYC).</td>
            </tr>
          </tbody>
        </table>

        {/* Reasonable Adjustment */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', fontSize: '10pt' }}>Reasonable Adjustment</td>
            </tr>
            <tr>
              <td colSpan={3} style={{ border: '1px solid #555', padding: '10px 8px', lineHeight: '1.4' }}>
                <p>To meet the needs of all learners' adjustments can be made to the way assessments are conducted but not to the requirements of the assessment. The purpose of these adjustments is to enhance fairness and flexibility so that the specific needs of students can be met.</p>
                <p style={{ marginTop: '8px' }}>ACTA college will take meaningful, transparent and reasonable steps to consult, consider and implement reasonable adjustments for students with disability and learning difficulties.</p>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '35%' }}>Reasonable Adjustment Provided</td>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold', textAlign: 'center', width: '35%' }}>Reason for Reasonable Adjustment</td>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Outcome</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', verticalAlign: 'top', lineHeight: '1.5' }}>
                <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, edu_support: !compRecord.reasonable_adjustment?.edu_support } })}>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center shrink-0">
                    {compRecord.reasonable_adjustment?.edu_support && <span className="text-red-600 font-bold text-lg absolute -top-[3.5px]">✓</span>}
                  </div> <span>Educational and bilingual support</span>
                </div>
                <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, oral_q: !compRecord.reasonable_adjustment?.oral_q } })}>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center shrink-0">
                    {compRecord.reasonable_adjustment?.oral_q && <span className="text-red-600 font-bold text-lg absolute -top-[3.5px]">✓</span>}
                  </div> <span>Presenting questions orally</span>
                </div>
                <div className="flex items-start gap-2 mb-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, diagram_instructions: !compRecord.reasonable_adjustment?.diagram_instructions } })}>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center shrink-0 mt-[2px]">
                    {compRecord.reasonable_adjustment?.diagram_instructions && <span className="text-red-600 font-bold text-lg absolute -top-[3.5px]">✓</span>}
                  </div> <span>Presenting work instructions in diagrammatic or pictorial form instead of words and sentences</span>
                </div>
                <div className="flex items-start gap-2 mb-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, extra_time: !compRecord.reasonable_adjustment?.extra_time } })}>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center shrink-0 mt-[2px]">
                    {compRecord.reasonable_adjustment?.extra_time && <span className="text-red-600 font-bold text-lg absolute -top-[3.5px]">✓</span>}
                  </div> <span>Extra time to complete a course or assessment</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, others: !compRecord.reasonable_adjustment?.others } })}>
                  <div className="w-[14px] h-[14px] border-[1.5px] border-black bg-white relative flex justify-center items-center shrink-0">
                    {compRecord.reasonable_adjustment?.others && <span className="text-red-600 font-bold text-lg absolute -top-[3.5px]">✓</span>}
                  </div> <span>Others:</span>
                </div>
              </td>
              <td style={{ border: '1px solid #555', padding: '6px', verticalAlign: 'top' }}>
                <textarea className="w-full bg-transparent border-none outline-none resize-none h-40 text-[9.5pt] text-slate-800" value={compRecord.reasonable_adjustment?.reason || ''} onChange={(e) => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, reason: e.target.value } })} />
              </td>
              <td style={{ border: '1px solid #555', padding: '6px', verticalAlign: 'top' }}>
                <textarea className="w-full bg-transparent border-none outline-none resize-none h-40 text-[9.5pt] text-slate-800" value={compRecord.reasonable_adjustment?.outcome || ''} onChange={(e) => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, outcome: e.target.value } })} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Cover Sheet */}
        <div style={{ marginTop: '10mm', paddingBottom: '10mm' }}>
          <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5mm', background: '#99ccff', padding: '4px 8px', display: 'inline-block', width: '100%' }}>COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</div>
          <div style={{ fontSize: '9.5pt', fontWeight: 'bold', marginBottom: '5mm', marginLeft: '2mm' }}>A cover sheet must be included with each submission of work.</div>
          <div style={{ fontSize: '9.5pt', fontWeight: 'bold', marginLeft: '2mm' }}>Work submitted without a signed cover sheet will be returned unmarked.</div>
        </div>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 5 of 18</span>
        </div>
      </div>

      
      {/* ═══════════════════ PAGE 6 – ASSESSMENT TASK 1 ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 1 – WRITTEN QUESTIONS AND ANSWERS</div>
        </div>

        <div style={{ fontSize: '10.5pt', lineHeight: '1.3' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Student Instructions:</div>
          <div style={{ marginBottom: '8px' }}>This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45 - 60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 1 in front of you and answer the questions as the information becomes clear to you. At the beginning of each review session you will be given a few minutes to familiarise yourself with the questions. You will be given extra time at the end of the day to complete this assessment or to clarify facts with the Trainer/Assessor.</div>

          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Make sure you:</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 12px 0', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '2px' }}>Answer all questions</li>
            <li style={{ marginBottom: '2px' }}>Print clearly or select and circle the appropriate answer or type it as a word document.</li>
            <li style={{ marginBottom: '2px' }}>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
            <li style={{ marginBottom: '2px' }}>Ask your assessor if you do not understand a question. Whist your assessor cannot tell you the answer, he/she may be able to re-word the question for you</li>
            <li style={{ marginBottom: '2px' }}>Do not talk to your classmates. If you are caught discussion the answers you will be asked to leave and your assessment will not be marked.</li>
            <li style={{ marginBottom: '2px' }}>Do not cheat. Anyone caught cheating will automatically be marked Not Competent for this unit. There are NO EXCEPTIONS to this rule.</li>
          </ul>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <thead>
            <tr><th colSpan={3} style={{ border: '1px solid #555', background: '#5b9bd5', padding: '6px', fontSize: '13pt', textAlign: 'center', fontWeight: 'bold', color: 'black' }}>Questions</th></tr>
          </thead>
          <tbody>
            {/* Q1 */}
            <tr>
              <td colSpan={3} style={{ border: '1px solid #555', padding: '8px 12px', fontSize: '10.5pt' }}>
                <div style={{ marginBottom: '4px' }}>1. Optical fibre is normally made from: (PC 1.5)</div>
                <div style={{ paddingLeft: '24px' }}>
                  {[{"val": "a", "text": "Window glass"}, {"val": "b", "text": "Water"}, {"val": "c", "text": "Lead crystal"}, {"val": "d", "text": "Silica glass or plastic"}].map((opt) => {
                    const isSelected = (answers['t1q1'] || '').toLowerCase() === opt.val;
                    return (
                      <div key={opt.val} className={`cursor-pointer hover:opacity-80`} style={{ marginTop: '4px' }} onClick={() => setAnswers({ ...answers, 't1q1': opt.val })}>
                      <input type="radio" name="t1q1" required={isStudent} checked={answers['t1q1'] === opt.val || (answers['t1q1'] || '').toLowerCase() === opt.val || (answers['t1q1'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span style={{ display: 'inline-block', width: '24px', position: 'relative' }}>
                          <span className={isSelected ? 'text-red-600 font-bold' : ''}>{opt.val.toUpperCase()}.</span>
                          {isSelected && <span style={{ position: 'absolute', top: '-1px', left: '-4px', width: '20px', height: '20px', border: '2px solid red', borderRadius: '50%' }}></span>}
                        </span>
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ borderLeft: '1px solid #555', borderRight: '1px solid #555', borderBottom: '1px solid #555', height: '24px' }}></td>
            </tr>
            <tr>
              <td style={{ width: '38%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold' }}>
                Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px', textAlign: 'center', lineHeight: '10px' }}><span style={{ color: '#1a3fa8', fontSize: '12px', fontWeight: 'bold' }}>✓</span></span>)
              </td>
              <td onClick={() => setGrades({ ...grades, t1q1: 'correct' })} style={{ width: '31%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {grades['t1q1'] === 'correct' && <span style={{ position: 'absolute', top: '-4px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>
                Satisfactory (S)
              </td>
              <td onClick={() => setGrades({ ...grades, t1q1: 'incorrect' })} style={{ width: '31%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {grades['t1q1'] === 'incorrect' && <span style={{ position: 'absolute', top: '-4px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>
                Not Satisfactory (NS)
              </td>
            </tr>

            {/* Q2 */}
            <tr>
              <td colSpan={3} style={{ border: '1px solid #555', padding: '8px 12px', fontSize: '10.5pt' }}>
                <div style={{ marginBottom: '4px' }}>2. As a ray enters glass from air, its velocity will change because of the refractive index of glass. As a consequence, the ………change. (PC 1.6)</div>
                <div style={{ paddingLeft: '24px' }}>
                  {[{"val": "a", "text": "Frequency"}, {"val": "b", "text": "Wave length"}, {"val": "c", "text": "Frequency and wave length"}, {"val": "d", "text": "None of the above"}].map((opt) => {
                    const isSelected = (answers['t1q2'] || '').toLowerCase() === opt.val;
                    return (
                      <div key={opt.val} className={`cursor-pointer hover:opacity-80`} style={{ marginTop: '4px' }} onClick={() => setAnswers({ ...answers, 't1q2': opt.val })}>
                      <input type="radio" name="t1q2" required={isStudent} checked={answers['t1q2'] === opt.val || (answers['t1q2'] || '').toLowerCase() === opt.val || (answers['t1q2'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span style={{ display: 'inline-block', width: '24px', position: 'relative' }}>
                          <span className={isSelected ? 'text-red-600 font-bold' : ''}>{opt.val.toUpperCase()}.</span>
                          {isSelected && <span style={{ position: 'absolute', top: '-1px', left: '-4px', width: '20px', height: '20px', border: '2px solid red', borderRadius: '50%' }}></span>}
                        </span>
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ borderLeft: '1px solid #555', borderRight: '1px solid #555', borderBottom: '1px solid #555', height: '24px' }}></td>
            </tr>
            <tr>
              <td style={{ width: '38%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold' }}>
                Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px', textAlign: 'center', lineHeight: '10px' }}><span style={{ color: '#1a3fa8', fontSize: '12px', fontWeight: 'bold' }}>✓</span></span>)
              </td>
              <td onClick={() => setGrades({ ...grades, t1q2: 'correct' })} style={{ width: '31%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {grades['t1q2'] === 'correct' && <span style={{ position: 'absolute', top: '-4px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>
                Satisfactory (S)
              </td>
              <td onClick={() => setGrades({ ...grades, t1q2: 'incorrect' })} style={{ width: '31%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {grades['t1q2'] === 'incorrect' && <span style={{ position: 'absolute', top: '-4px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>
                Not Satisfactory (NS)
              </td>
            </tr>

            {/* Q3 */}
            <tr>
              <td colSpan={3} style={{ border: '1px solid #555', padding: '8px 12px', fontSize: '10.5pt' }}>
                <div style={{ marginBottom: '4px' }}>3. The two fields that makeup an electromagnetic wave are called: (PC 1.2)</div>
                <div style={{ paddingLeft: '24px' }}>
                  {[{"val": "a", "text": "Electric and magnetostrictive"}, {"val": "b", "text": "Electric and magnetic"}, {"val": "c", "text": "Electronic and magnetic"}, {"val": "d", "text": "Electronic and magnetostrictive"}].map((opt) => {
                    const isSelected = (answers['t1q3'] || '').toLowerCase() === opt.val;
                    return (
                      <div key={opt.val} className={`cursor-pointer hover:opacity-80`} style={{ marginTop: '4px' }} onClick={() => setAnswers({ ...answers, 't1q3': opt.val })}>
                      <input type="radio" name="t1q3" required={isStudent} checked={answers['t1q3'] === opt.val || (answers['t1q3'] || '').toLowerCase() === opt.val || (answers['t1q3'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
                      <span style={{ display: 'inline-block', width: '24px', position: 'relative' }}>
                          <span className={isSelected ? 'text-red-600 font-bold' : ''}>{opt.val.toUpperCase()}.</span>
                          {isSelected && <span style={{ position: 'absolute', top: '-1px', left: '-4px', width: '20px', height: '20px', border: '2px solid red', borderRadius: '50%' }}></span>}
                        </span>
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ borderLeft: '1px solid #555', borderRight: '1px solid #555', borderBottom: '1px solid #555', height: '24px' }}></td>
            </tr>
            <tr>
              <td style={{ width: '38%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold' }}>
                Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px', textAlign: 'center', lineHeight: '10px' }}><span style={{ color: '#1a3fa8', fontSize: '12px', fontWeight: 'bold' }}>✓</span></span>)
              </td>
              <td onClick={() => setGrades({ ...grades, t1q3: 'correct' })} style={{ width: '31%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {grades['t1q3'] === 'correct' && <span style={{ position: 'absolute', top: '-4px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>
                Satisfactory (S)
              </td>
              <td onClick={() => setGrades({ ...grades, t1q3: 'incorrect' })} style={{ width: '31%', border: '1px solid #555', padding: '6px', background: '#fce4d6', color: '#1a3fa8', fontSize: '9.5pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                  {grades['t1q3'] === 'incorrect' && <span style={{ position: 'absolute', top: '-4px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                </span>
                Not Satisfactory (NS)
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 6 of 18</span>
        </div>
      </div>

      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        {/* Q4 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>4. Attenuation is which of the following? (PC 1.7)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "The inherent curvature along a specific length of optical fibre"}, {"val": "b", "text": "The wave leng6th above which a single-mode fibre of optical length"}, {"val": "c", "text": "The reduction of signal strength over the length of the light- carrying medium"}, {"val": "d", "text": "Smearing an optical signal that results from the many discrete wavelength components travelling at different rates."}].map((opt) => {
                  const isSelected = (answers['t1q4'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q4': opt.val })}>
                      <input type="radio" name="t1q4" required={isStudent} checked={answers['t1q4'] === opt.val || (answers['t1q4'] || '').toLowerCase() === opt.val || (answers['t1q4'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q4: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q4'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q4: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q4'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q5 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>5. Dispersion is which of the following? (PC 1.3)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Inherent curvature along a specific length of the optical length"}, {"val": "b", "text": "The wavelength above which a single-mode fibre only one mode or ray of light"}, {"val": "c", "text": "The reduction of signal strength over the length of the light-carrying medium"}, {"val": "d", "text": "Pulse spreading or smearing an optical signal that results from the many discrete wavelength components travelling at different rates."}].map((opt) => {
                  const isSelected = (answers['t1q5'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q5': opt.val })}>
                      <input type="radio" name="t1q5" required={isStudent} checked={answers['t1q5'] === opt.val || (answers['t1q5'] || '').toLowerCase() === opt.val || (answers['t1q5'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q5: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q5'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q5: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q5'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q6 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>6. Regarding optical fibre waste. Fill in the following missing words.(PC 3.2, 1.3)
Wear…….glasses when working with fibre. Wash you’re ……. Before rubbing you’re….</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Safety, hands, eyes"}, {"val": "b", "text": "Transition, eyes, hands"}, {"val": "c", "text": "Prescription, hands, eyes"}].map((opt) => {
                  const isSelected = (answers['t1q6'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q6': opt.val })}>
                      <input type="radio" name="t1q6" required={isStudent} checked={answers['t1q6'] === opt.val || (answers['t1q6'] || '').toLowerCase() === opt.val || (answers['t1q6'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q6: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q6'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q6: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q6'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q7 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>7. Optical fibre cleaving is the process of : (PC 1.4, 3.1)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Removing the cladding before connecting the fibre together"}, {"val": "b", "text": "Cutting the end of the fibre in preparation for connecting the fibre together"}, {"val": "c", "text": "Cleaning the surface of optics fibres"}, {"val": "d", "text": "Inspecting optical fibres for flaws"}].map((opt) => {
                  const isSelected = (answers['t1q7'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q7': opt.val })}>
                      <input type="radio" name="t1q7" required={isStudent} checked={answers['t1q7'] === opt.val || (answers['t1q7'] || '').toLowerCase() === opt.val || (answers['t1q7'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q7: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q7'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q7: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q7'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q8 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>8. Optical fibre are manufactured to consist of a core, cladding and an inner buffer. The diameters of these components for a typical single-mode fibre are: ( PC 4.1)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "10/125/250pm"}, {"val": "b", "text": "10/125/250nm"}, {"val": "c", "text": "10/125/250\u00b5m"}, {"val": "d", "text": "10/125/250mm"}].map((opt) => {
                  const isSelected = (answers['t1q8'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q8': opt.val })}>
                      <input type="radio" name="t1q8" required={isStudent} checked={answers['t1q8'] === opt.val || (answers['t1q8'] || '').toLowerCase() === opt.val || (answers['t1q8'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q8: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q8'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q8: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q8'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 7 of 18</span>
        </div>
      </div>

      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        {/* Q9 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>9. Visible light is composed of seven colours. They are: (PC 2.1)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "ROYBGVI"}, {"val": "b", "text": "RYOBGIV"}, {"val": "c", "text": "RYOBGVI"}, {"val": "d", "text": "ROYGBIV"}].map((opt) => {
                  const isSelected = (answers['t1q9'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q9': opt.val })}>
                      <input type="radio" name="t1q9" required={isStudent} checked={answers['t1q9'] === opt.val || (answers['t1q9'] || '').toLowerCase() === opt.val || (answers['t1q9'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q9: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q9'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q9: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q9'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q10 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>10. In single mode fibres, which kind of dispersion is eliminated? (PC 2.3)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Polarization"}, {"val": "b", "text": "Material"}, {"val": "c", "text": "modal"}].map((opt) => {
                  const isSelected = (answers['t1q10'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q10': opt.val })}>
                      <input type="radio" name="t1q10" required={isStudent} checked={answers['t1q10'] === opt.val || (answers['t1q10'] || '').toLowerCase() === opt.val || (answers['t1q10'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q10: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q10'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q10: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q10'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q11 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>11. list at least five advantages that optical fibre cables have over conventional copper cables: (PC 3.3)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q11'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q11': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q11: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q11'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q11: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q11'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q12 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>12. Name the patch cord colours? (PC 1.1)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q12'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q12': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q12: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q12'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q12: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q12'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q13 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>13. With regards to fibre, explain elongation? (PC 4.2)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q13'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q13': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q13: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q13'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q13: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q13'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 8 of 18</span>
        </div>
      </div>

      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        {/* Q14 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>14. List the equipment required for continuity test. (PC 2.4)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q14'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q14': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q14: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q14'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q14: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q14'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q15 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>15. Explain mechanical splicing? ( PC 2.2)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q15'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q15': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q15: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q15'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q15: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q15'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q16 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>16. What are the safety equipment required while working with optical fibre cables?</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q16'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q16': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q16: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q16'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q16: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q16'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q17 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>17. List the three losses in fibre installation</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q17'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q17': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q17: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q17'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q17: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q17'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q18 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>18. What are the precautions to be observed when handling optical fibre cable?</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q18'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q18': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q18: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q18'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q18: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q18'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 9 of 18</span>
        </div>
      </div>

      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        {/* Q19 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>19. Which Australian standard should be followed for optical fibre safety? (Choose one)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "AS/NZS 2967:2014"}, {"val": "b", "text": "AS/NZS 2387"}, {"val": "c", "text": "AS/NZS 3080:2003"}, {"val": "d", "text": "AS/NZS 1268"}].map((opt) => {
                  const isSelected = (answers['t1q19'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q19': opt.val })}>
                      <input type="radio" name="t1q19" required={isStudent} checked={answers['t1q19'] === opt.val || (answers['t1q19'] || '').toLowerCase() === opt.val || (answers['t1q19'] || '').toLowerCase() === String(opt.val).toLowerCase()} onChange={()=>{}} className="hidden-validation-radio" style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px', pointerEvents: 'none' }} />
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
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q19: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q19'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q19: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q19'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q20 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>20. What is the use of a PON Power meter</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', minHeight: '70px', height: '80px', padding: '10px 12px', verticalAlign: 'top', color: '#cc0000', fontStyle: 'italic', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>
                <textarea required={isStudent} className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q20'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q20': e.target.value })} placeholder="No answer provided" />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0', border: 'none' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '38%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center' }}>
                        Assessor to tick (<span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', verticalAlign: 'middle', marginLeft: '2px' }}>✓</span>)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q20: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q20'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q20: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q20'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
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
                    className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 text-xs ml-1 font-bold ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                    value={compRecord.assessment_date || ''}
                    onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
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
          <span>Page 10 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 11 – TASK 2 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 2 – OBSERVATION</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: '3mm' }}>Prepare for Optical Cable Installation</div>
        </div>

        <div style={{ fontSize: '10.5pt', lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Step1:</div>
          <div style={{ marginBottom: '4px' }}>Assume your own home is a property into which you will be installing optical fibre. Prepare a check list for gaining entry to your home as if it were not your own. In that list:</div>
          <div style={{ marginBottom: '2px' }}>AT2.1 Identify and locate regulations relevant to optical fibre cabling and obtain as sample (one page) of ACMA or Australian standards regulations</div>
          <div style={{ marginBottom: '2px' }}>AT2.2 List the administrative steps you would take to gain access to the property</div>
          <div style={{ marginBottom: '2px' }}>AT2.3 Identify a common hazard found in most cabling worksites</div>
          <div style={{ marginBottom: '2px' }}>AT2.4 Select the correct authority to report tis WHS hazard</div>
          <div style={{ marginBottom: '2px' }}>AT2.5 Select the tools suitable for installing cable-including installing a lead in from a Telco pit and splicing fibres.</div>
          <div style={{ marginBottom: '2px' }}>AT2.6 Select suitable cable and hardware for a standard domestic cable installation</div>
          <div style={{ marginBottom: '2px' }}>AT2.7 Select a route for the cable installation with suitable bend ratios and discuss and adapt it by consulting with the customer-role played by your assessor</div>
          <div style={{ marginBottom: '2px' }}>AT2.8 Conduct and record the results of a cable drum test. Prepare cables for a fibre termination</div>
          <div style={{ marginBottom: '2px' }}>AT2.9 Clean and inspect a connector end face using wet and dry cleaning and inspection methods</div>
          <div style={{ marginBottom: '2px' }}>AT2.10 All work to be conducted in line with regulatory and WHS requirements including avoiding hazards of laser based systems and risk injury due to optical fibres.</div>
          <div style={{ marginBottom: '8px' }}>AT2.11 List the PPE used to control hazards when working with laser and optical fibre.</div>

          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Step2:</div>
          <div style={{ marginBottom: '2px' }}>Candidates are required to prepare a single-end cable for termination</div>
          <div style={{ marginBottom: '2px' }}>AT2.12 Cable preparation process</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 4px 0', listStyleType: 'disc' }}>
            <li>Remove the outer cable sheath of a standard cable</li>
            <li>Expose the loose tubes and separate one tube</li>
            <li>Clean the fibres for splicing</li>
          </ul>
          <div style={{ marginBottom: '2px' }}>AT2.13 Connector inspection and cleaning process</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 8px 0', listStyleType: 'disc' }}>
            <li>Connector dismantled and reassembled</li>
            <li>Connector inspection to asses cleaning need</li>
            <li>Dry clean connectors</li>
            <li>Wet clean connectors</li>
            <li>Inspect the connector after each cleaning</li>
          </ul>

          <div style={{ fontWeight: 'bold', fontSize: '11.5pt', marginBottom: '4px' }}>Required Documents and Equipment</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0', listStyleType: 'disc' }}>
            <li>Cleaning agents and devices</li>
            <li>Cable stripping tool</li>
            <li>Cable cleaving tool</li>
            <li>Samples of single end cable</li>
            <li>Multi-fibre connectors and single fibre connectors</li>
            <li>A range of adaptors</li>
            <li>Cleaning products</li>
            <li>Manual inspection ,microscopes and/or video inspection probes</li>
            <li>PPE for working with cable</li>
          </ul>
        </div>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 11 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 12 – TASK 2 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</div>
        </div>

        <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '4px', lineHeight: '1.4' }}>
          This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.
        </div>
        <div style={{ fontSize: '10pt', marginBottom: '4px', lineHeight: '1.4' }}>
          The observation checklist provided below shows you the tasks your assessor plans to assess. To prepare for this assessment, you should familiarise yourself with this check list to ensure full understanding of the requirements and to give you the best possibility of success.
        </div>
        <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '2px' }}>Assessor Instructions:</div>
        <div style={{ fontSize: '10pt', marginBottom: '6px', lineHeight: '1.4' }}>
          The assessor will use verbal and observation methods during this assessment regularly asking the student to explain his/her interpretation of processes, information and task as well as to observe the student carryout the tasks. The assessor will use the observation checklist below to ensure all required tasks are carried out successfully or to provide comment where improvement is required.
        </div>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Record of Performance:</div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '6mm' }}>
          <thead>
            <tr>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '70%' }}>Did the Candidate:</td>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Satisfactory</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontStyle: 'italic', padding: '6px' }}>*See assessment task 2 AT2.13 cable preparation and AT1.14 connector inspection and cleaning</td>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>Yes</td>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>No</td>
            </tr>
          </thead>
          <tbody>
            {[
              "Obtain or describe the regulations for optical fibre cabling?",
              "Observe correct procedures for gaining access to a cabling worksite?",
              "Follow correct identification and reporting procedures for a safety risks?",
              "Plan a cable route in consultation with the customer (the assessor)?",
              "Select tools suitable for installation along cable route?",
              "Select suitable hardware-cable and connectors-for the cable route and customer needs?",
              "Expose, clean and prepare the loose tubes ready for splicing?*",
              "Demonstrate wet and dry cleaning methods for connector end faces and adaptors?",
              "Perform and record a cable drum test?"
            ].map((itemText, idx) => {
              const qKey = `t2q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td style={{ border: '1px solid #555', padding: '6px' }}>{itemText}</td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>
                      {grades[qKey] === 'correct' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>
                      {grades[qKey] === 'incorrect' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Comments/Feedback to Participant</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top' }}>
                <div className="flex items-center mb-4">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('student_signature', 'submission')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 relative min-h-[20px]">
                    {(answers.student_signature_url || submission.signature_url) && (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[30px] max-w-[150px] object-contain absolute bottom-0" />
                    )}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input required={isStudent} type="date" className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer flex-1 ml-2 font-bold text-xs" value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '8px', minHeight: '80px', fontSize: '9.5pt', marginBottom: '6mm' }}>
          <span style={{ fontWeight: 'bold' }}>Assessor's Feedback:</span>
          <textarea className="w-full bg-transparent border-none outline-none resize-none h-16 text-slate-800 mt-2" value={taskResults['t2_feedback'] || ''} onChange={(e) => setTaskResults({ ...taskResults, t2_feedback: e.target.value })} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginBottom: '4px' }}>
          Result: Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t2: 'S' })}>(S){taskResults['t2'] === 'S' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>/Not Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t2: 'NS' })}>(NS){taskResults['t2'] === 'NS' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top', background: '#f5f5f5' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top', background: '#f5f5f5' }}>
                <div className="flex items-center mb-4">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 relative min-h-[20px]">
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} className="max-h-[30px] max-w-[150px] object-contain absolute bottom-0" />}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input type="date" className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 flex-1 ml-2 font-bold text-xs ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 12 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 13 – TASK 3 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 3 – OBSERVATION</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: '3mm' }}>Fusion Splice</div>
        </div>

        <div style={{ fontSize: '10.5pt', lineHeight: '1.4' }}>
          <div style={{ marginBottom: '8px' }}>This assessment task requires candidate to demonstrate a fusion splice.</div>
          <div style={{ marginBottom: '8px' }}>The assessor will demonstrate the appropriate process, then ask candidates to:</div>
          <div style={{ marginBottom: '8px' }}>AT3.1 position and install cable according to agreed route</div>
          <div style={{ marginBottom: '8px' }}>AT3.2 Comply with manufacturer's specifications for installation and industry safety standards</div>
          <div style={{ marginBottom: '4px' }}>AT3.3 prepare and splice optical fibre following the correct procedure:</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 8px 0', listStyleType: 'disc' }}>
            <li>Position heat shrink splice protector over one end of the fibre</li>
            <li>Strip fibre for 20mm using appropriate fibre stripping tools</li>
            <li>Clean fibre with lint free wipe tissues and isopropyl alcohol(IPA fluid)</li>
            <li>Ensure fibre is dry before inserting into the splicer</li>
            <li>Cleave fibre to give a perpendicular mirror smooth end face cut</li>
            <li>10 to 12 mm for 40 mm splice protectors or 15 to 17 mm 60 mm splice protectors</li>
            <li>Splice the fibres in auto mode to align fibre cores automatically</li>
            <li>Check the quality of the cleaved fibre end face (the splicer estimates cleaved angle for both fibre end faces)</li>
            <li>Check LCD display for shadow, bubble, ballooning, necking across the joint</li>
          </ul>
          <div style={{ marginBottom: '8px' }}>AT3.4 Check loss acceptance level is less than 0.05db (re-splice if over)</div>
          <div style={{ marginBottom: '8px' }}>AT3.5 Place the heat shrink on one end of the fibre and perform splice</div>
          <div style={{ marginBottom: '8px' }}>AT3.6 Seal the heat shrink protector using splicer heater</div>
          <div style={{ marginBottom: '8px' }}>AT3.7 Select a suitable testing device and record test results following manufacturer instructions</div>

          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '4px' }}>Required Documents and Equipment</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0', listStyleType: 'disc' }}>
            <li>Cable stripping tool</li>
            <li>Various samples of cable connectors</li>
            <li>Tight buffered pigtail connectors</li>
            <li>Heat shrink splice protectors</li>
            <li>Lint free wipe tissues and isopropyl alcohol (IPA fluid)</li>
            <li>PPE for working with cable</li>
            <li>Fusion splicing equipment</li>
            <li>Field termination connector</li>
            <li>High precision fibre cleaver</li>
            <li>Manufacturer’s guidelines/specifications for all tools and machinery.</li>
          </ul>
        </div>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 13 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 14 – TASK 3 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</div>
        </div>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Record of Performance:</div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '6mm' }}>
          <thead>
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '70%', verticalAlign: 'top' }}>Did the Candidate:</td>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Satisfactory</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>Yes</td>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>No</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px', fontWeight: 'bold' }}>Install selected cable following manufacturers specification</td>
              <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, t3q1: 'correct' })}>
                  {grades['t3q1'] === 'correct' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                </div>
              </td>
              <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, t3q1: 'incorrect' })}>
                  {grades['t3q1'] === 'incorrect' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '6px' }}>
                <div style={{ marginBottom: '4px' }}>Prepare to splice cable using the correct procedure:</div>
                <ul style={{ paddingLeft: '24px', margin: '0', listStyleType: 'disc' }}>
                  <li>Position heat shrink splice protector over one end of the fibre</li>
                  <li>Strip fibre for 20mm using appropriate fibre stripping tools</li>
                  <li>Clean fibre with lint free wipe tissues and isopropyl alcohol(IPA fluid)</li>
                  <li>Ensure fibre is dry before inserting into the splicer</li>
                  <li>Cleave fibre to give a perpendicular mirror smooth end face cut</li>
                  <li>10 to 12 mm for 40 mm splice protectors or 15 to 17 mm 60 mm splice protectors</li>
                  <li>Splice the fibres in auto mode to align fibre cores automatically</li>
                  <li>Check the quality of the cleaved fibre end face (the splicer estimates cleaved angle for both fibre end faces)</li>
                  <li>Check LCD display for shadow, bubble, ballooning, necking across the joint</li>
                </ul>
              </td>
              <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, t3q2: 'correct' })}>
                  {grades['t3q2'] === 'correct' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                </div>
              </td>
              <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, t3q2: 'incorrect' })}>
                  {grades['t3q2'] === 'incorrect' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                </div>
              </td>
            </tr>
            {[
              "Check loss acceptance level is less than 0.05db",
              "Repeat the splice procedure if the loss level is above 0.05db",
              "Place the heat shrink on one end of the fibre and perform splice",
              "Seal the heat shrink protector using splicer heater",
              "Perform the fusion splice in line with regulatory requirements?",
              "Perform the fusion splice in line with safety/OHS considerations?",
              "Select the appropriate tools and safety equipment for the task?",
              "Appropriately prepare the work area to minimise risk (disposable cable waste containers, tape, PPE, etc.)"
            ].map((itemText, idx) => {
              const qKey = `t3q${idx + 3}`;
              return (
                <tr key={qKey}>
                  <td style={{ border: '1px solid #555', padding: '6px' }}>{itemText}</td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>
                      {grades[qKey] === 'correct' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>
                      {grades[qKey] === 'incorrect' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Comments/Feedback to Participant</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top' }}>
                <div className="flex items-center mb-4">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('student_signature', 'submission')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 relative min-h-[20px]">
                    {(answers.student_signature_url || submission.signature_url) && (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[30px] max-w-[150px] object-contain absolute bottom-0" />
                    )}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input required={isStudent} type="date" className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer flex-1 ml-2 font-bold text-xs" value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '8px', minHeight: '80px', fontSize: '9.5pt', marginBottom: '6mm' }}>
          <span style={{ fontWeight: 'bold' }}>Assessor's Feedback:</span>
          <textarea className="w-full bg-transparent border-none outline-none resize-none h-16 text-slate-800 mt-2" value={taskResults['t3_feedback'] || ''} onChange={(e) => setTaskResults({ ...taskResults, t3_feedback: e.target.value })} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginBottom: '4px' }}>
          Result: Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t3: 'S' })}>(S){taskResults['t3'] === 'S' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>/Not Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t3: 'NS' })}>(NS){taskResults['t3'] === 'NS' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top', background: '#f5f5f5' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top', background: '#f5f5f5' }}>
                <div className="flex items-center mb-4">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 relative min-h-[20px]">
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} className="max-h-[30px] max-w-[150px] object-contain absolute bottom-0" />}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input type="date" className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 flex-1 ml-2 font-bold text-xs ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 14 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 15 – TASK 4 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 4</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: '3mm' }}>Mechanical Splice</div>
        </div>

        <div style={{ fontSize: '10.5pt', lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>This assessment task requires candidates to:</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 8px 0', listStyleType: 'disc' }}>
            <li>Demonstrate an 'in-line' mechanical splice.</li>
          </ul>
          <div style={{ marginBottom: '8px' }}>Candidates will need to make sure that they understand the equipment, procedure and safety measures involved so that they undertake this task safely and correctly.</div>
          <div style={{ marginBottom: '8px' }}>Assessors will demonstrate this process then, ask the students to:</div>
          <div style={{ marginBottom: '8px' }}>AT4.1Strip fibre for 20mm using appropriate fibre stripping tools</div>
          <div style={{ marginBottom: '8px' }}>AT4.2clean fibre with lint free wipe tissues and isopropyl alcohol (IPA fluid</div>
          <div style={{ marginBottom: '8px' }}>AT4.3Ensure fibre is dry before inserting into the slicer</div>
          <div style={{ marginBottom: '4px' }}>AT4.4Cleave fibre to give a perpendicular mirror smooth end face cut:</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 8px 0', listStyleType: 'disc' }}>
            <li>10 to 12 mm for 40 mm splice protectors or 15 to 17 mm 60 mm splice protectors</li>
            <li>Cleaved fibre length must be adhered to as per the manufacture's specifications</li>
          </ul>
          <div style={{ marginBottom: '8px' }}>AT4.5Check the quality of the cleaved fibre end face</div>
          <div style={{ marginBottom: '8px' }}>AT4.6Insert fibres into the mechanical splice</div>
          <div style={{ marginBottom: '8px' }}>AT4.7Lock or crimp the fibres into positions</div>
          <div style={{ marginBottom: '8px' }}>AT4.8apply specific fibre waste procedures to control fibre hazards</div>
          <div style={{ marginBottom: '8px' }}>AT4.8Update records for site and notify client of completion of work.</div>

          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '4px' }}>Required Documents and Equipment</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0', listStyleType: 'disc' }}>
            <li>Cable stripping tool</li>
            <li>Cable connectors pigtail connectors</li>
            <li>Heat shrink splice protectors</li>
            <li>Lint free wipe tissues and isopropyl alcohol(IPA fluid)</li>
            <li>PPE for working with cable</li>
            <li>In-line mechanical splicing product set</li>
            <li>Field termination connectors</li>
            <li>High precision fibre cleaver</li>
            <li>Manufacturer’s guidelines/specifications for all tools and machinery.</li>
          </ul>
        </div>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 15 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 16 – TASK 4 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 4 – ASSESSOR CHECKLIST</div>
        </div>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Record of Performance:</div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '6mm' }}>
          <thead>
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '70%', verticalAlign: 'top' }}>Did the Candidate:</td>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Satisfactory</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>Yes</td>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>No</td>
            </tr>
          </thead>
          <tbody>
            {[
              "Perform the fusion splice in line with regulatory requirements?",
              "Perform the fusion splice in line with safety/OHS considerations?",
              "Select the appropriate tools and safety equipment for the task?",
              "Appropriately prepare the work area to minimise risk (disposable cable waste containers, tape, PPE, etc.)",
              "Cleave fibre to the correct length?",
              "Use the correct settings on the mechanical splicer?",
              "Correctly position the cleaved fibre in the splicer?",
              "Use the correct action for crimping the joint?",
              "Clean up the work area and remove all waste in a safe manner?"
            ].map((itemText, idx) => {
              const qKey = `t4q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td style={{ border: '1px solid #555', padding: '6px' }}>{itemText}</td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>
                      {grades[qKey] === 'correct' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>
                      {grades[qKey] === 'incorrect' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Comments/Feedback to Participant</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top' }}>
                <div className="flex items-center mb-4">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('student_signature', 'submission')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 relative min-h-[20px]">
                    {(answers.student_signature_url || submission.signature_url) && (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[30px] max-w-[150px] object-contain absolute bottom-0" />
                    )}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input required={isStudent} type="date" className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer flex-1 ml-2 font-bold text-xs" value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '8px', minHeight: '80px', fontSize: '9.5pt', marginBottom: '6mm' }}>
          <span style={{ fontWeight: 'bold' }}>Assessor's Feedback:</span>
          <textarea className="w-full bg-transparent border-none outline-none resize-none h-16 text-slate-800 mt-2" value={taskResults['t4_feedback'] || ''} onChange={(e) => setTaskResults({ ...taskResults, t4_feedback: e.target.value })} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginBottom: '4px' }}>
          Result: Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t4: 'S' })}>(S){taskResults['t4'] === 'S' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>/Not Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t4: 'NS' })}>(NS){taskResults['t4'] === 'NS' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top', background: '#f5f5f5' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top', background: '#f5f5f5' }}>
                <div className="flex items-center mb-4">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 relative min-h-[20px]">
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} className="max-h-[30px] max-w-[150px] object-contain absolute bottom-0" />}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input type="date" className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 flex-1 ml-2 font-bold text-xs ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 16 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 17 – TASK 5 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 5</div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: '3mm' }}>Insertion Loss Measurements</div>
        </div>

        <div style={{ fontSize: '10.5pt', lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>This assessment task requires candidates to:</div>
          <div style={{ marginBottom: '8px' }}>Undertake testing to make an insertion loss measurement.</div>
          <div style={{ marginBottom: '8px' }}>Candidates work in Paris to optimise use of resources.</div>
          <div style={{ marginBottom: '8px' }}>Candidates will need to make sure that they understand the equipment, procedure and safety measures involved so that they undertake this task safely and correctly.</div>
          <div style={{ marginBottom: '8px' }}>The assessor will demonstrate the following tasks then, ask participants to:</div>
          <div style={{ marginBottom: '8px' }}>AT5.1construct a fibre link using 500m fibre length (spools).</div>
          <div style={{ marginBottom: '4px' }}>AT5.2 Ensure the link has:</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0 8px 0', listStyleType: 'disc' }}>
            <li>An APC connector</li>
            <li>PC connector</li>
            <li>A fusion splice(which can be easily identified and measured with an OTDR)</li>
          </ul>
          <div style={{ marginBottom: '8px' }}>AT5.3 Calculate the pass/fail maximum loss cleaved fibre length must be adhered to as per the manufacture's specifications for the fibre link</div>
          <div style={{ marginBottom: '8px' }}>AT5.4 Test, measure and record the insertion loss of the link at 1310nm and 1550nm using either the one-way or two-way insertion loss measurement techniques</div>
          <div style={{ marginBottom: '8px' }}>AT5.5Compare the pass/fail insertion loss and measured results.</div>
          <div style={{ marginBottom: '8px' }}>Optional task: use an OTDR to measure the insertion loss all events that interconnect all the spools of fibre and verify the results of candidates.</div>

          <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '4px' }}>Required Documents and Equipment</div>
          <ul style={{ paddingLeft: '24px', margin: '2px 0', listStyleType: 'disc' }}>
            <li>Spools of fibre optic cable</li>
            <li>Connectors:</li>
          </ul>
          <ul style={{ paddingLeft: '48px', margin: '2px 0 8px 0', listStyleType: 'circle' }}>
            <li>An APC connector</li>
            <li>Pc connector</li>
            <li>A fusion spile</li>
          </ul>
          <ul style={{ paddingLeft: '24px', margin: '2px 0', listStyleType: 'disc' }}>
            <li>LED light sources</li>
            <li>Power meters</li>
            <li>Optical time –domain reflect meter (ODTR)</li>
            <li>PPE for working with cable</li>
            <li>Cable system with identifiable fault.</li>
          </ul>
        </div>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 17 of 18</span>
        </div>
      </div>

      {/* ═══════════════════ PAGE 18 – TASK 5 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4mm' }}>
          <div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>Assessment Booklet</div>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', textDecoration: 'underline' }}>ICTCBL322 Install, test and terminate optical fiber cable on customer premises</div>
          </div>
          <img src="/assets/acta-logo.png" alt="ACTA Logo" style={{ height: '55px', objectFit: 'contain' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>ASSESSMENT TASK 5 – ASSESSOR CHECKLIST</div>
        </div>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Record of Performance:</div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: '6mm' }}>
          <thead>
            <tr>
              <td rowSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '70%', verticalAlign: 'top' }}>Did the Candidate:</td>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px' }}>Satisfactory</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>Yes</td>
              <td style={{ border: '1px solid #555', background: '#bfbfbf', fontWeight: 'bold', padding: '6px', width: '15%' }}>No</td>
            </tr>
          </thead>
          <tbody>
            {[
              "Perform the testing in line with safety/OHS considerations?",
              "Select the appropriate tools and safety equipment for the task?",
              "Appropriately prepare the work area to minimise risk (disposable cable waste containers, tape, PPE, etc.)",
              "Construct a fibre link using four fibre lengths (spools), each link greater than 500m?",
              "Attach similar connector types to end A and end B of the fibre link?",
              "Correctly calculate the pass/fail maximum loss at 1310nm and 1550nm for the fibre link?",
              "Test and measure the insertion loss of the link at 1310nm and 1550nm using either the one-way or two-way insertion loss measurement techniques?",
              "Analyse the results of the testing by comparing the measurements against the pass/fail insertion loss?",
              "Report results to customer and restore site"
            ].map((itemText, idx) => {
              const qKey = `t5q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td style={{ border: '1px solid #555', padding: '6px' }}>{itemText}</td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}>
                      {grades[qKey] === 'correct' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                  <td style={{ border: '1px solid #555', padding: '0', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div className="flex items-center justify-center cursor-pointer h-full w-full min-h-[30px]" onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}>
                      {grades[qKey] === 'incorrect' && <span style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '4px' }}>Comments/Feedback to Participant</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '9.5pt' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top' }}>
                <span style={{ fontWeight: 'bold' }}>Student Declaration:</span> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top' }}>
                <div className="flex items-center mb-4 mt-2">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('student_signature', 'submission')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 min-h-[30px]">
                    {(answers.student_signature_url || submission.signature_url) && (
                      <img src={answers.student_signature_url || submission.signature_url} className="max-h-[26px] max-w-[150px] object-contain inline-block mix-blend-multiply" />
                    )}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input required={isStudent} type="date" className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer flex-1 ml-2 font-bold text-xs" value={answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : '')} onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(answers['st-date'] || (submission?.submitted_at ? submission.submitted_at.split('T')[0] : ''))}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1px solid #555', padding: '8px', minHeight: '80px', fontSize: '9.5pt', marginBottom: '6mm' }}>
          <span style={{ fontWeight: 'bold' }}>Assessor's Feedback:</span>
          <textarea className="w-full bg-transparent border-none outline-none resize-none h-16 text-slate-800 mt-2" value={taskResults['t5_feedback'] || ''} onChange={(e) => setTaskResults({ ...taskResults, t5_feedback: e.target.value })} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginBottom: '4px' }}>
          Result: Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t5: 'S' })}>(S){taskResults['t5'] === 'S' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>/Not Satisfactory <span className="cursor-pointer relative inline-block mx-1" onClick={() => setTaskResults({ ...taskResults, t5: 'NS' })}>(NS){taskResults['t5'] === 'NS' && <span style={{ position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', border: '2px solid red', borderRadius: '50%' }}></span>}</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '8mm' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '8px', width: '60%', verticalAlign: 'top', background: '#f5f5f5' }}>
                <span style={{ fontWeight: 'bold' }}>Assessor:</span> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
              </td>
              <td style={{ border: '1px solid #555', padding: '8px', verticalAlign: 'top', background: '#f5f5f5' }}>
                <div className="flex items-center mb-4 mt-2">
                  <span>Signature:</span>
                  <div onClick={() => openSigModal('assessor_signature', 'comp')} className="sig-visual cursor-pointer inline-flex items-center justify-center border-b border-black flex-1 ml-2 min-h-[30px]">
                    {compRecord.assessor_signature && <img src={compRecord.assessor_signature} className="max-h-[26px] max-w-[150px] object-contain inline-block mix-blend-multiply" />}
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <span>Date:</span>
                  <input type="date" className={`no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 flex-1 ml-2 font-bold text-xs ${isStudent ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`} value={compRecord.assessment_date || ''} onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })} readOnly={isStudent} />
                  <span className="hidden print:inline border-b border-black flex-1 text-center min-h-[18px] ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <span style={{ fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase' }}>END OF ASSESSMENT</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontSize: '10.5pt', lineHeight: '1.4', maxWidth: '800px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Before you hand in your assessment, make sure that you:</div>
            <ol style={{ paddingLeft: '24px', margin: '0' }}>
              <li>Re-check your answers and make sure you are happy with your responses.</li>
              <li>Have written your Name, Student ID, on the first page and signed the student declaration</li>
              <li>If you are submitting this assessment as a separate attachment, please attached an Assessment Submission Sheet available from the Student Administration or the ACTA intranet.</li>
            </ol>
          </div>
        </div>

        <div className="page-footer" style={{ borderTop: 'none', paddingTop: '4mm', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565 | V3.4/25</span>
          <span>Page 18 of 18</span>
        </div>
      </div>
    </div>
  );
};
