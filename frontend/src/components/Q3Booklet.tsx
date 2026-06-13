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
}

export const Q3Booklet: React.FC<Q3BookletProps> = ({ answers, setAnswers, onSubmit, submitting, studentName, submitDate, isStudent }) => {
  const navigate = useNavigate();

  const grades: Record<string, string> = answers.grades || {};
  const setGrades = (val: any) => setAnswers({ ...answers, grades: val });
  const taskResults: Record<string, string> = answers.taskResults || {};
  const setTaskResults = (val: any) => setAnswers({ ...answers, taskResults: val });
  const compRecord: any = answers.compRecord || { tasks: {}, attempts: [], evidence: {} };
  const setCompRecord = (val: any) => setAnswers({ ...answers, compRecord: val });

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

  const formatDisplayDate = (d: string) => {
    if (!d) return '_____/_____/__________';
    if (!d.includes('-')) return d;
    const [y, m, d2] = d.split('-');
    return `${d2}/${m}/${y}`;
  };

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
        font-size: 12.5pt;
        font-weight: bold;
        text-align: center;
        margin: 5mm 0 4mm;
        text-transform: uppercase;
        letter-spacing: .3px;
        background: transparent !important;
        color: #000 !important;
        padding: 0 !important;
      }
      .q3-booklet-view h2.sub-title {
        font-size: 12.5pt;
        font-weight: bold;
        text-align: center;
        margin: 0mm 0 4mm;
      }
      .q3-booklet-view p {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.45;
        font-size: 10pt;
      }
      .q3-booklet-view .steps-list {
        padding-left: 24px;
        margin: 4px 0 8px;
        font-size: 10pt;
      }
      .q3-booklet-view .steps-list li {
        margin-bottom: 3px;
        line-height: 1.4;
      }
      .q3-booklet-view .chk-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9.5pt;
        margin-bottom: 16px;
      }
      .q3-booklet-view .chk-table td, .q3-booklet-view .chk-table th {
        border: 1px solid #777;
        padding: 8px 10px;
        vertical-align: middle;
        line-height: 1.45;
      }
      .q3-booklet-view .chk-table .chk-q { width: 70%; }
      .q3-booklet-view .chk-table .chk-case { width: 30%; text-align: center; }
      .q3-booklet-view .chk-table thead td {
        background: #e8e8e8;
        color: #000;
        font-weight: bold;
        text-align: center;
        border: 1.5px solid #777;
        padding: 10px 14px;
      }
      .q3-booklet-view .cb {
        display: inline-block; width: 13px; height: 13px; border: 1.5px solid #555; background: #fff; vertical-align: middle; position: relative; margin-right: 4px;
      }
      .q3-booklet-view .cb.checked::after {
        content: '✓'; position: absolute; top: -5px; left: 0px; font-size: 14px; color: #cc0000; font-weight: bold;
      }
      .q3-booklet-view .cb-label { font-size: 9pt; }
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
      .q3-booklet-view .inner-header {
        margin-bottom: 15px;
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
        padding-top: 4px;
        width: 100%;
        padding-bottom: 2mm;
      }
      .q3-booklet-view .underline-bold { font-weight: normal; }

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
          padding: 12mm 14mm !important;
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
        .q3-booklet-view .no-print { display: none !important; }
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

      {/* PAGE 13 - TASK 3 OBSERVATION */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div className="title-block">
              <div><span className="underline-bold">Assessment Booklet</span></div>
              <div><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            </div>
          </div>
        </div>

        <h1 className="section-title" style={{ marginTop: '30px' }}>ASSESSMENT TASK 3 – OBSERVATION</h1>
        <h2 className="sub-title">Fusion Splice</h2>
        
        <p>This assessment task requires candidate to demonstrate a fusion splice.</p>
        <p>The assessor will demonstrate the appropriate process, then ask candidates to:</p>
        
        <p><strong>AT3.1</strong> position and install cable according to agreed route</p>
        <p><strong>AT3.2</strong> Comply with manufacturer's specifications for installation and industry safety standards</p>
        <p><strong>AT3.3</strong> prepare and splice optical fibre following the correct procedure:</p>
        <ul className="steps-list" style={{ listStyleType: 'disc' }}>
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
        <p><strong>AT3.4</strong> Check loss acceptance level is less than 0.05db (re-splice if over)</p>
        <p><strong>AT3.5</strong> Place the heat shrink on one end of the fibre and perform splice</p>
        <p><strong>AT3.6</strong> Seal the heat shrink protector using splicer heater</p>
        <p><strong>AT3.7</strong> Select a suitable testing device and record test results following manufacturer instructions</p>

        <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Required Documents and Equipment</p>
        <ul className="steps-list" style={{ listStyleType: 'disc' }}>
          <li>Cable stripping tool</li>
          <li>Various samples of cable connectors</li>
          <li>Tight buffered pigtail connectors</li>
          <li>Heat shrink splice protectors</li>
          <li>Lint free wipe tissues and isopropyl alcohol (IPA fluid)</li>
          <li>PPE for working with cable</li>
          <li>Fusion splicing equipment</li>
          <li>Field termination connector</li>
          <li>High precision fibre cleaver</li>
          <li>Manufacturer's guidelines/specifications for all tools and machinery.</li>
        </ul>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 13 of 18</span>
        </div>
      </div>

      {/* PAGE 14 - TASK 3 ASSESSOR CHECKLIST */}
      <div className="page">
        <div className="inner-header">
          <div className="top-row">
            <div className="title-block">
              <div><span className="underline-bold">Assessment Booklet</span></div>
              <div><span className="underline-bold">ICTCBL322 Install, test and terminate optical fiber cable on customer premises</span></div>
            </div>
          </div>
        </div>

        <h1 className="section-title" style={{ marginTop: '20px' }}>ASSESSMENT TASK 3 – ASSESSOR CHECKLIST</h1>
        
        <p style={{ fontWeight: 'bold' }}>Record of Performance:</p>

        <table className="chk-table">
          <thead>
            <tr>
              <td className="chk-q" style={{ textAlign: 'left', paddingLeft: '14px' }}>Did the Candidate:</td>
              <td className="chk-case">Satisfactory<br/>Yes &nbsp;&nbsp;&nbsp; No</td>
            </tr>
          </thead>
          <tbody>
            {[
              "Install selected cable following manufacturers specification",
              `Prepare to splice cable using the correct procedure:
• Position heat shrink splice protector over one end of the fibre
• Strip fibre for 20mm using appropriate fibre stripping tools
• Clean fibre with lint free wipe tissues and isopropyl alcohol(IPA fluid)
• Ensure fibre is dry before inserting into the splicer
• Cleave fibre to give a perpendicular mirror smooth end face cut:
• 10 to 12 mm for 40 mm splice protectors or 15 to 17 mm 60 mm splice protectors
• Splice the fibres in auto mode to align fibre cores automatically
• Check the quality of the cleaved fibre end face (the splicer estimates cleaved angle for both fibre end faces)
• Check LCD display for shadow, bubble, ballooning, necking across the joint`,
              "Check loss acceptance level is less than 0.05db",
              "Repeat the splice procedure if the loss level is above 0.05db",
              "Place the heat shrink on one end of the fibre and perform splice",
              "Seal the heat shrink protector using splicer heater",
              "Perform the fusion splice in line with regulatory requirements?",
              "Perform the fusion splice in line with safety/OHS considerations?",
              "Select the appropriate tools and safety equipment for the task?",
              "Appropriately prepare the work area to minimise risk (disposable cable waste containers, tape, PPE, etc.)"
            ].map((itemText, idx) => {
              const qKey = `t3q${idx + 1}`;
              return (
                <tr key={qKey}>
                  <td className="chk-q" style={{ whiteSpace: 'pre-wrap' }}>{itemText}</td>
                  <td className="chk-case">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <span
                          className={`cb ${grades[qKey] === 'yes' ? 'checked' : ''}`}
                          onClick={() => setGrades({ ...grades, [qKey]: 'yes' })}
                        ></span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <span
                          className={`cb ${grades[qKey] === 'no' ? 'checked' : ''}`}
                          onClick={() => setGrades({ ...grades, [qKey]: 'no' })}
                        ></span>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: '10px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '3px' }}>Comments/Feedback to Participant</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '5px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt', width: '50%', verticalAlign: 'top' }}>
                  <strong>Student Declaration:</strong> I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.
                </td>
                <td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt', width: '50%', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Signature:
                    <div
                      onClick={() => openSigModal('student_signature', 'submission')}
                      className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2"
                      style={{ borderBottom: '1px solid #000', flex: 1, minWidth: '100px' }}
                    >
                      {answers.student_signature_url ? (
                        <img src={answers.student_signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic"></span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    Date:
                    <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', textAlign: 'center', marginLeft: '4px' }}>
                      {formatDisplayDate(submitDate || '')}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ border: '1px solid #777', padding: '5px 8px', minHeight: '38px', fontSize: '9pt', marginBottom: '5px' }}>
            <strong>Assessor's Feedback:</strong>
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none h-12 text-slate-800 text-xs mt-1 no-print"
              value={taskResults['t3_feedback'] || ''}
              onChange={(e) => setTaskResults({ ...taskResults, t3_feedback: e.target.value })}
            />
            <div className="hidden print:block">{taskResults['t3_feedback']}</div>
          </div>

          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            Result: Satisfactory (S)/Not Satisfactory (NS)
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt', width: '55%', verticalAlign: 'top' }}>
                  <strong>Assessor:</strong> I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
                </td>
                <td style={{ border: '1px solid #777', padding: '5px 8px', fontSize: '9pt', width: '45%', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Signature:
                    <div
                      onClick={() => openSigModal('assessor_signature', 'comp')}
                      className="sig-visual cursor-pointer inline-flex items-center justify-center min-h-[26px] border-b border-black px-2"
                      style={{ borderBottom: '1px solid #000', flex: 1, minWidth: '100px' }}
                    >
                      {compRecord.assessor_signature ? (
                        <img src={compRecord.assessor_signature} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic"></span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    Date:
                    <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', textAlign: 'center', marginLeft: '4px' }}>
                      {formatDisplayDate(compRecord.assessment_date)}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="page-footer">
          <span>ACTA College RTO 40954 | 15/3 Lancaster Street Ingleburn NSW 2565| V3.4/25</span>
          <span>Page 14 of 18</span>
        </div>
      </div >

    </div >
  );
};
