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
        <div style={{ border: '3.5px solid #1a5fa8', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>

            {/* Skilscope Logo */}
            <img
              src="/assets/Skilscope.png"
              alt="Skilscope Logo"
              style={{ width: '300px', height: '300px', objectFit: 'contain', marginBottom: '5mm', marginTop: '5mm' }}
            />

            {/* <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#991b1b', marginBottom: '10mm', fontFamily: 'Arial, sans-serif', letterSpacing: '0.3px' }}>RTO NO: 40954</div> */}
            <div style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
            <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
            <div style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>ICTCBL322</div>
            <div style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>
              Splice and terminate optical fibre cable<br />for telecommunications projects
            </div>
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '110mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{studentName}</span>
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
              <div><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
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
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                />
                <span className="hidden print:inline">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Assessor Declaration */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #555', background: '#f0f0f0', fontWeight: 'bold', padding: '3px 6px', fontSize: '9pt' }}>Assessor Declaration</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #555', padding: '4px 6px', fontSize: '9pt' }}>In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '4px 6px', fontSize: '9pt', fontWeight: 'bold', width: '38%' }}>Evidence is Confirmed as:</td>
              <td style={{ border: '1px solid #555', padding: '4px 6px', fontSize: '9pt' }}>
                <span
                  className={`cb cursor-pointer ${compRecord.evidence?.valid ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, valid: !compRecord.evidence?.valid } })}
                ></span> Valid &nbsp;&nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.evidence?.sufficient ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, sufficient: !compRecord.evidence?.sufficient } })}
                ></span> Sufficient &nbsp;&nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.evidence?.current ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, current: !compRecord.evidence?.current } })}
                ></span> Current &nbsp;&nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.evidence?.authentic ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, authentic: !compRecord.evidence?.authentic } })}
                ></span> Authentic
              </td>
            </tr>
          </tbody>
        </table>

        {/* Attach docs + Final Result */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #555', padding: '4px 6px', fontWeight: 'bold', fontSize: '9pt', width: '40%' }}>Please attach the following documentation to this form</td>
              <td style={{ border: '1px solid #555', padding: '4px 6px', fontWeight: 'bold', fontSize: '9pt', width: '22%', textAlign: 'center' }}>Result</td>
              <td rowSpan={5} style={{ border: '1px solid #555', padding: '5px 8px', fontSize: '9pt', verticalAlign: 'top', width: '38%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>FINAL ASSESSMENT RESULT:</div>
                <div className="checkbox-row cursor-pointer" onClick={() => setFinalResult('C')}>
                  <span className={`cb-sq ${finalResult === 'C' ? 'checked' : ''}`}></span> Competent (C)
                </div>
                <div className="checkbox-row cursor-pointer" onClick={() => setFinalResult('NC')}>
                  <span className={`cb-sq ${finalResult === 'NC' ? 'checked' : ''}`}></span> Not Competent (NC)
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt' }}>
                Assessment Task 1 &nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.tasks?.t1 ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t1: !compRecord.tasks?.t1 } })}
                ></span> Observation 1
              </td>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt', textAlign: 'center' }}>
                {taskResults['t1'] === 'S' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t1: 'NS' })}>S</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t1: 'S' })}>S</span>
                )}
                {' '}/{' '}
                {taskResults['t1'] === 'NS' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t1: 'S' })}>NS</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t1: 'NS' })}>NS</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt' }}>
                Assessment Task 2 &nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.tasks?.t2 ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t2: !compRecord.tasks?.t2 } })}
                ></span> Observation 2
              </td>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt', textAlign: 'center' }}>
                {taskResults['t2'] === 'S' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t2: 'NS' })}>S</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t2: 'S' })}>S</span>
                )}
                {' '}/{' '}
                {taskResults['t2'] === 'NS' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t2: 'S' })}>NS</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t2: 'NS' })}>NS</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt' }}>
                Assessment Task 3 &nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.tasks?.t3 ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t3: !compRecord.tasks?.t3 } })}
                ></span> Observation 3
              </td>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt', textAlign: 'center' }}>
                {taskResults['t3'] === 'S' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t3: 'NS' })}>S</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t3: 'S' })}>S</span>
                )}
                {' '}/{' '}
                {taskResults['t3'] === 'NS' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t3: 'S' })}>NS</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t3: 'NS' })}>NS</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt' }}>
                Assessment Task 4 &nbsp;
                <span
                  className={`cb cursor-pointer ${compRecord.tasks?.t4 ? 'checked' : ''}`}
                  onClick={() => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, t4: !compRecord.tasks?.t4 } })}
                ></span> Written question and answers
              </td>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt', textAlign: 'center' }}>
                {taskResults['t4'] === 'S' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t4: 'NS' })}>S</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t4: 'S' })}>S</span>
                )}
                {' '}/{' '}
                {taskResults['t4'] === 'NS' ? (
                  <span className="result-circle-red" onClick={() => setTaskResults({ ...taskResults, t4: 'S' })}>NS</span>
                ) : (
                  <span className="result-inactive" onClick={() => setTaskResults({ ...taskResults, t4: 'NS' })}>NS</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Attempt table */}
        <table className="attempt-table" style={{ marginBottom: '5px' }}>
          <tbody>
            <tr>
              <td className="attempt-num" style={{ background: '#e0e0e0', fontWeight: 'bold' }}>Attempt</td>
              <td className="attempt-date" style={{ background: '#e0e0e0', fontWeight: 'bold' }}>Date</td>
              <td className="attempt-fb" style={{ background: '#e0e0e0', fontWeight: 'bold' }}>Assessor's Feedback (as Required):</td>
            </tr>
            <tr>
              <td className="attempt-num">1</td>
              <td className="attempt-date">
                <input
                  type="date"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print"
                  value={compRecord.attempts?.[0]?.date || ''}
                  onChange={(e) => {
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[0]) att[0] = { date: '', feedback: '' };
                    att[0].date = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[0]?.date)}</span>
              </td>
              <td className="attempt-fb">
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                  value={compRecord.attempts?.[0]?.feedback || ''}
                  onChange={(e) => {
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
              <td className="attempt-num">2</td>
              <td className="attempt-date">
                <input
                  type="date"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print"
                  value={compRecord.attempts?.[1]?.date || ''}
                  onChange={(e) => {
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[1]) att[1] = { date: '', feedback: '' };
                    att[1].date = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[1]?.date)}</span>
              </td>
              <td className="attempt-fb">
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                  value={compRecord.attempts?.[1]?.feedback || ''}
                  onChange={(e) => {
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
              <td className="attempt-num">3</td>
              <td className="attempt-date">
                <input
                  type="date"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5 cursor-pointer no-print"
                  value={compRecord.attempts?.[2]?.date || ''}
                  onChange={(e) => {
                    const att = [...(compRecord.attempts || [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }])];
                    if (!att[2]) att[2] = { date: '', feedback: '' };
                    att[2].date = e.target.value;
                    setCompRecord({ ...compRecord, attempts: att });
                  }}
                />
                <span className="hidden print:inline text-xs">{formatDisplayDate(compRecord.attempts?.[2]?.date)}</span>
              </td>
              <td className="attempt-fb">
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-slate-800 text-xs py-0.5"
                  value={compRecord.attempts?.[2]?.feedback || ''}
                  onChange={(e) => {
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
              <td colSpan={2} style={{ border: '1px solid #555', fontWeight: 'bold', padding: '3px 6px', textAlign: 'center', fontSize: '9pt' }}>Final Feedback:</td>
              <td style={{ border: '1px solid #555', padding: '3px 6px', fontSize: '9pt' }}>
                <textarea
                  className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs py-0.5"
                  value={compRecord.final_feedback || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, final_feedback: e.target.value })}
                  placeholder="Enter final summary feedback here..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Declaration */}
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
                    onChange={(e) => setCompRecord({ ...compRecord, assessor_sig_date: e.target.value })}
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
                  <span className="border-b border-dashed border-gray-400 inline-block min-w-[80px] text-center ml-1">
                    {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/_________'}
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
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
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
                  value={compRecord.db_entry_date || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, db_entry_date: e.target.value })}
                />
                <span className="hidden print:inline ml-1">{formatDisplayDate(compRecord.db_entry_date)}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Unit info table */}
        <table className="unit-info-table">
          <tbody>
            <tr><td className="key-col">Unit Code/Name</td><td className="font-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</td></tr>
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
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
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
                <p style={{ marginTop: '3px' }}>The assessment consists of 5 tasks. Assessment Task 1, Assessment Task 2, Assessment Task 3 and Assessment Task 4</p>
                <p style={{ marginTop: '3px' }}>Assessment Task 1 is Observation 1</p>
                <p>Assessment Task 2 is Observation 2</p>
                <p>Assessment Task 3 is Observation 3</p>
                <p>Assessment Task 4 is Observation\nAssessment Task 5 is Observation</p>
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
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
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
                <td style={{ verticalAlign: 'top' }}>
                  <div className="checkbox-row cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, edu_support: !compRecord.reasonable_adjustment?.edu_support } })}>
                    <span className={`cb-sq ${compRecord.reasonable_adjustment?.edu_support ? 'checked' : ''}`}></span> Educational and bilingual support
                  </div>
                  <div className="checkbox-row cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, oral_q: !compRecord.reasonable_adjustment?.oral_q } })}>
                    <span className={`cb-sq ${compRecord.reasonable_adjustment?.oral_q ? 'checked' : ''}`}></span> Presenting questions orally
                  </div>
                  <div className="checkbox-row cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, diagram_instructions: !compRecord.reasonable_adjustment?.diagram_instructions } })}>
                    <span className={`cb-sq ${compRecord.reasonable_adjustment?.diagram_instructions ? 'checked' : ''}`}></span> Presenting work instructions in diagrammatic form
                  </div>
                  <div className="checkbox-row cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, extra_time: !compRecord.reasonable_adjustment?.extra_time } })}>
                    <span className={`cb-sq ${compRecord.reasonable_adjustment?.extra_time ? 'checked' : ''}`}></span> Extra time to complete
                  </div>
                  <div className="checkbox-row cursor-pointer" onClick={() => setCompRecord({ ...compRecord, reasonable_adjustment: { ...compRecord.reasonable_adjustment, others: !compRecord.reasonable_adjustment?.others } })}>
                    <span className={`cb-sq ${compRecord.reasonable_adjustment?.others ? 'checked' : ''}`}></span> Others:
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

      
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 1 – WRITTEN QUESTIONS AND ANSWERS</h1>
        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Student Instructions:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>This is a written assessment that will test your knowledge. This assessment may be completed over the duration of the training day or in one sitting of about 45-60 minutes. As you learn, practice and review knowledge and skills, you will keep Assessment 1 in front of you and answer the questions as the information becomes clear to you.</p>

        <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9.5pt' }}>Make sure you:</p>
        <ul className="steps-list" style={{ marginBottom: '5px' }}>
          <li>Answer all questions</li>
          <li>Print clearly or select and circle the appropriate answer or type it as a word document.</li>
          <li>Use a blue or black pen. Assessments written in pencil will not be accepted.</li>
        </ul>
        {/* Q1 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>1. Optical fibre is normally made from: (PC 1.5)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Window glass"}, {"val": "b", "text": "Water"}, {"val": "c", "text": "Lead crystal"}, {"val": "d", "text": "Silica glass or plastic"}].map((opt) => {
                  const isSelected = (answers['t1q1'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q1': opt.val })}>
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
                      <td onClick={() => setGrades({ ...grades, t1q1: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q1'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q1: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q1'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q2 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>2. As a ray enters glass from air, its velocity will change because of the refractive index of glass. As a consequence, the ………change. (PC 1.6)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Frequency"}, {"val": "b", "text": "Wave length"}, {"val": "c", "text": "Frequency and wave length"}, {"val": "d", "text": "None of the above"}].map((opt) => {
                  const isSelected = (answers['t1q2'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q2': opt.val })}>
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
                      <td onClick={() => setGrades({ ...grades, t1q2: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q2'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q2: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q2'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Not Satisfactory (NS)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>          </tbody>
        </table>

        {/* Q3 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
          <tbody>
            <tr><td style={{ border: '1px solid #777', padding: '6px 10px', fontSize: '9.5pt', fontWeight: 'bold', background: '#f5f5f5' }}>3. The two fields that makeup an electromagnetic wave are called: (PC 1.2)</td></tr>
            <tr>
              <td style={{ border: '1px solid #777', padding: '8px 12px', fontSize: '9.5pt' }}>
                {[{"val": "a", "text": "Electric and magnetostrictive"}, {"val": "b", "text": "Electric and magnetic"}, {"val": "c", "text": "Electronic and magnetic"}, {"val": "d", "text": "Electronic and magnetostrictive"}].map((opt) => {
                  const isSelected = (answers['t1q3'] || '').toLowerCase() === opt.val;
                  return (
                    <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''} cursor-pointer hover:opacity-80`} style={{ marginTop: '3px' }} onClick={() => setAnswers({ ...answers, 't1q3': opt.val })}>
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
                      <td onClick={() => setGrades({ ...grades, t1q3: 'correct' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q3'] === 'correct' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
                        </span>
                        Satisfactory (S)
                      </td>
                      <td onClick={() => setGrades({ ...grades, t1q3: 'incorrect' })} style={{ width: '31%', border: '1px solid #777', padding: '6px', background: '#faefe2', color: '#1a3fa8', fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #1a3fa8', background: '#fff', position: 'relative', marginRight: '6px', verticalAlign: 'middle' }}>
                          {grades['t1q3'] === 'incorrect' && <span style={{ position: 'absolute', top: '-6px', left: '-1px', fontSize: '15px', color: '#cc0000', fontWeight: 'bold' }}>✓</span>}
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q11'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q11': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q12'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q12': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q13'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q13': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q14'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q14': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q15'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q15': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q16'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q16': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q17'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q17': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q18'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q18': e.target.value })} placeholder="No answer provided" />
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
                <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" style={{ color: 'inherit', font: 'inherit' }} value={answers['t1q20'] || ''} onChange={(e) => setAnswers({ ...answers, 't1q20': e.target.value })} placeholder="No answer provided" />
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
                  <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                    {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/________'}
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
                  <span className="underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
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
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 2</h1>
        <h2 className="sub-title">Prepare for Optical Cable Installation</h2>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>Step1: Assume your own home is a property into which you will be installing optical fibre. Prepare a check list for gaining entry to your home as if it were not your own. In that list:</p>
        <div className="spacer-sm"></div>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.1 Identify and locate regulations relevant to optical fibre cabling and obtain as sample (one page) of ACMA or Australian standards regulations</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.2 List the administrative steps you would take to gain access to the property</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.3 Identify a common hazard found in most cabling worksites</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.4 Select the correct authority to report tis WHS hazard</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.5 Select the tools suitable for installing cable-including installing a lead in from a Telco pit and splicing fibres.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.6 Select suitable cable and hardware for a standard domestic cable installation</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.7 Select a route for the cable installation with suitable bend ratios and discuss and adapt it by consulting with the customer-role played by your assessor</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.8 Conduct and record the results of a cable drum test. Prepare cables for a fibre termination</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.9 Clean and inspect a connector end face using wet and dry cleaning and inspection methods</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.10 All work to be conducted in line with regulatory and WHS requirements including avoiding hazards of laser based systems and risk injury due to optical fibres.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.11 List the PPE used to control hazards when working with laser and optical fibre.</p>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>Step2: Candidates are required to prepare a single-end cable for termination</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.12 Cable preparation process</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Remove the outer cable sheath of a standard cable</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Expose the loose tubes and separate one tube</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Clean the fibres for splicing</span></div>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT2.13 Connector inspection and cleaning process</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Connector dismantled and reassembled</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Connector inspection to asses cleaning need</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Dry clean connectors</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Wet clean connectors</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Inspect the connector after each cleaning</span></div>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>Required Documents and Equipment</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cleaning agents and devices</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cable stripping tool</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cable cleaving tool</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Samples of single end cable</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Multi-fibre connectors and single fibre connectors</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• A range of adaptors</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cleaning products</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Manual inspection ,microscopes and/or video inspection probes</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• PPE for working with cable</span></div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 11 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 12 – TASK 2 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 2 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        
        <table className="chk-table" style={{ marginTop: '10px' }}>
          <thead>
            <tr><td className="chk-q">Record of Performance: Did the Candidate:</td><td className="chk-case">Satisfactory</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
            {[
              "Obtain or describe the regulations for optical fibre cabling?",
              "Observe correct procedures for gaining access to a cabling worksite?",
              "Follow correct identification and reporting procedures for a safety risks?",
              "Plan a cable route in consultation with the customer (the assessor)?",
              "Select tools suitable for installation along cable route?",
              "Select suitable hardware-cable and connectors-for the cable route and customer needs?",
              "Expose, clean and prepare the loose tubes ready for splicing?",
              "Demonstrate wet and dry cleaning methods for connector end faces and adaptors?",
              "Perform and record a cable drum test?"
            ].map((itemText, idx) => {
              const qKey = `t2q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{itemText}</td>
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
                  <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                    {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/________'}
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
                  <span className="underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
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
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 3</h1>
        <h2 className="sub-title">Fusion splice</h2>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>This assessment task requires candidates to demonstrate a fusion splice. Candidates work in pairs to optimise use of resources. Candidates will need to make sure that they understand the equipment, procedure and safety measures involved so that they undertake this task safely and correctly.</p>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>The assessor will demonstrate the following tasks then, ask participants to:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.1 Prepare the fibre</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.2 Cleave the fibre</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.3 Strip away the protective jacket/coating (nylon and/or acrylate coating) from the fibre using appropriate fibre stripping tools</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.4 Clean the bare fibre using lint free wipe tissues and isopropyl alcohol (IPA fluid) – ensuring the fibre is dry before inserting into the splicer.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.5 Follow the correct cleaving procedure to ensure perpendicular mirror smooth end face cut</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.6 Splice in auto mode to align the core of both fibres automatically</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.7 Splice the fibre</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.8 Check the LCD display for estimated loss acceptance level – industry specification of less than 0.05 dB is an acceptable level</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT3.9 Splice protection</p>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>Required Documents and Equipment</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cable</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Fusion splicer</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cleaning Products</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cleaver</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Heat shrink protectors</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• PPE for working with cable</span></div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 13 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 14 – TASK 3 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        
        <table className="chk-table" style={{ marginTop: '10px' }}>
          <thead>
            <tr><td className="chk-q">Record of Performance: Did the Candidate:</td><td className="chk-case">Satisfactory</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
            {[
              "Perform the splicing in line with safety/OHS considerations?",
              "Select the appropriate tools and safety equipment for the task?",
              "Appropriately prepare the work area to minimise risk (disposable cable waste containers, tape, PPE, etc.)",
              "Prepare the fibre (Step 1-4)?",
              "Cleave the fibre (Step 5)?",
              "Insert/align the fibres into the fusion splicer appropriately?",
              "Protect the fibre joint correctly?",
              "Follow correct procedures for dealing with laser related risks (Do not look directly into active fibre ends)?",
              "Analyse the LCD display for splice errors/acceptable loss estimation? (<0.05dB)?",
              "Complete the splicing successfully?"
            ].map((itemText, idx) => {
              const qKey = `t3q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{itemText}</td>
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
                  <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                    {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/________'}
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
                  <span className="underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 14 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 15 – TASK 4 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 4</h1>
        <h2 className="sub-title">Mechanical splice</h2>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>This assessment task requires candidates to demonstrate an 'in-line' mechanical splice. Candidates work in Paris to optimise use of resources. Candidates will need to make sure that they understand the equipment, procedure and safety measures involved so that they undertake this task safely and correctly.</p>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>The assessor will demonstrate the following tasks then, ask participants to:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.1 Prepare the fibre</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.2 Cleave the fibre</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.3 Strip away the protective jacket/coating (nylon and/or acrylate coating) from the fibre using appropriate fibre stripping tools</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.4 Clean the bare fibre using lint free wipe tissues and isopropyl alcohol (IPA fluid) – ensuring the fibre is dry before inserting into the splicer.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.5 Follow the correct cleaving procedure to ensure perpendicular mirror smooth end face cut. However the cleaved fibre length must be adhered to as per the manufacture's specifications.</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.6 Insert/align fibres into the mechanical splice</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.7 Lock or crimp the fibres into position</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT4.8 Complete the splicing.</p>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>Required Documents and Equipment</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cable</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Mechanical Splice</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cleaning Products</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cleaver</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Mechanical splice assembly tools (If required by the manufacture)</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• PPE for working with cable</span></div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 15 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 16 – TASK 4 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 4 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        
        <table className="chk-table" style={{ marginTop: '10px' }}>
          <thead>
            <tr><td className="chk-q">Record of Performance: Did the Candidate:</td><td className="chk-case">Satisfactory</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
            {[
              "Perform the splicing in line with safety/OHS considerations?",
              "Select the appropriate tools and safety equipment for the task?",
              "Appropriately prepare the work area to minimise risk (disposable cable waste containers, tape, PPE, etc.)",
              "Prepare the fibre?",
              "Cleave the fibre? The cleaved fibre length must be adhered to as per the manufacture's specifications.",
              "Insert/align the fibres into the mechanical splice?",
              "Lock or crimp the fibres into position?",
              "Follow correct procedures for dealing with laser related risks (Do not look directly into active fibre ends)?",
              "Complete the splicing successfully?"
            ].map((itemText, idx) => {
              const qKey = `t4q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q">{itemText}</td>
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
                  <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                    {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/________'}
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
                  <span className="underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 16 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 17 – TASK 5 OBSERVATION ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 5</h1>
        <h2 className="sub-title">Insertion Loss Measurements</h2>
        <p style={{ fontSize: '9.5pt', marginBottom: '3px' }}>This assessment task requires candidates to: Undertake testing to make an insertion loss measurement. Candidates work in Paris to optimise use of resources. Candidates will need to make sure that they understand the equipment, procedure and safety measures involved so that they undertake this task safely and correctly.</p>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>The assessor will demonstrate the following tasks then, ask participants to:</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT5.1 construct a fibre link using 500m fibre length (spools).</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT5.2 Ensure the link has:</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• An APC connector</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• PC connector</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• A fusion splice(which can be easily identified and measured with an OTDR)</span></div>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT5.3 Calculate the pass/fail maximum loss cleaved fibre length must be adhered to as per the manufacture's specifications for the fibre link</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT5.4 Test, measure and record the insertion loss of the link at 1310nm and 1550nm using either the one-way or two-way insertion loss measurement techniques</p>
        <p style={{ fontSize: '9.5pt', marginBottom: '2px' }}>AT5.5 Compare the pass/fail insertion loss and measured results.</p>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>Optional task: use an OTDR to measure the insertion loss all events that interconnect all the spools of fibre and verify the results of candidates.</p>
        <div className="spacer-sm"></div>
        <p style={{ fontWeight: 'bold', fontSize: '9.5pt', marginTop: '4px', marginBottom: '2px' }}>Required Documents and Equipment</p>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Spools of fibre optic cable</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Connectors:</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• An APC connector</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Pc connector</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• A fusion spile</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• LED light sources</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Power meters</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Optical time –domain reflect meter (ODTR)</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• PPE for working with cable</span></div>
        <div style={{ display: 'flex', fontSize: '9.5pt', marginBottom: '2px', paddingLeft: '10px' }}><span>• Cable system with identifiable fault.</span></div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 17 of 18</span>
        </div>
      </div>
      {/* ═══════════════════ PAGE 18 – TASK 5 ASSESSOR CHECKLIST ═══════════════════ */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div><span className="underline-bold">Assessment book</span><br /><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            <img src="/assets/Skilscope.png" alt="Skilscope Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="section-title">ASSESSMENT TASK 5 – ASSESSOR CHECKLIST</h1>
        <p className="italic-note">This checklist is to be used when assessing the students in the associated task. This checklist is to be completed for each student. Please refer to separate mapping document for specific details relating to alignment of this task to the unit requirements.</p>
        
        <table className="chk-table" style={{ marginTop: '10px' }}>
          <thead>
            <tr><td className="chk-q">Record of Performance: Did the Candidate:</td><td className="chk-case">Satisfactory</td><td className="chk-comment">Comments</td></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ fontWeight: 'bold', padding: '3px 6px', background: '#f5f5f5' }}>
                Date Observed:
                <input
                  type="date"
                  className="no-print border-b border-dashed border-gray-400 outline-none text-slate-800 bg-transparent px-1 cursor-pointer text-xs ml-2 font-bold"
                  value={compRecord.assessment_date || ''}
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                />
                <span className="hidden print:inline font-bold ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </td>
            </tr>
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
                  <td className="chk-q">{itemText}</td>
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
                  <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                    {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/________'}
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
            value={taskResults['t5_feedback'] || ''}
            onChange={(e) => setTaskResults({ ...taskResults, t5_feedback: e.target.value })}
            placeholder="Enter Assessor Feedback for Task 5..."
          />
        </div>

        <div className="result-line">
          Result:{' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t5'] === 'S' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t5: 'S' })}
          >S</span>
          {' '}/ Not Satisfactory (NS){' '}
          <span
            className={`result-circle cursor-pointer ${taskResults['t5'] === 'NS' ? 'active' : ''}`}
            onClick={() => setTaskResults({ ...taskResults, t5: 'NS' })}
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
                  <span className="underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '5mm' }}>
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
