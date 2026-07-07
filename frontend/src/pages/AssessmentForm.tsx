import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import SignaturePad from 'signature_pad'
import { AlertCircle, CheckCircle2, Save, Send, Loader2, Printer, X } from 'lucide-react'
import { getQuestionsForAssessment } from '../data'
import { Q1Booklet } from '../components/Q1Booklet'
import { Q2Booklet } from '../components/Q2Booklet'
import { Q3Booklet } from '../components/Q3Booklet'
import { Q4Booklet } from '../components/Q4Booklet'
import { Q5Booklet } from '../components/Q5Booklet'
import { Q6Booklet } from '../components/Q6Booklet'
import { Q7Booklet } from '../components/Q7Booklet'
import { Q8Booklet } from '../components/Q8Booklet'
import { Q9Booklet } from '../components/Q9Booklet'
import { Q10Booklet } from '../components/Q10Booklet'
import { Q11Booklet } from '../components/Q11Booklet'
import { Q12Booklet } from '../components/Q12Booklet'
import { Q13Booklet } from '../components/Q13Booklet'
import { Q14Booklet } from '../components/Q14Booklet'
import { Q15Booklet } from '../components/Q15Booklet'
import { downloadBookletAsPdf } from '../lib/downloadPdf'
import '../assessment-styles.css'

const AssessmentForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParams = searchParams.get('token');
    const stId = searchParams.get('st-id');
    const suffix = stId ? `${tokenParams}_${stId}` : tokenParams;
    return tokenParams ? localStorage.getItem(`assessment_submitted_${suffix}`) === 'true' : false;
  })
  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<any>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParams = searchParams.get('token');
    const stId = searchParams.get('st-id');
    if (tokenParams) {
      const suffix = stId ? `${tokenParams}_${stId}` : tokenParams;
      const saved = localStorage.getItem(`assessment_answers_${suffix}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  })

  useEffect(() => {
    if (token) {
      const stId = searchParams.get('st-id');
      const suffix = stId ? `${token}_${stId}` : token;
      localStorage.setItem(`assessment_answers_${suffix}`, JSON.stringify(answers));
    }
  }, [answers, token, searchParams]);

  useEffect(() => {
    const stId = searchParams.get('st-id');
    if (stId && token && submitted) {
      api.getSubmissionStatus(stId).then((status) => {
        if (status && status.completedTokens && !status.completedTokens.includes(token)) {
          setSubmitted(false);
          const suffix = `${token}_${stId}`;
          localStorage.removeItem(`assessment_submitted_${suffix}`);
        }
      }).catch(console.error);
    }
  }, [searchParams, token, submitted]);

  const [showErrors, setShowErrors] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [signatureEmpty, setSignatureEmpty] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const assessmentQuestions = getQuestionsForAssessment(token)
  const isQ2 = (token || '').toLowerCase() === 'question-2' || assessmentQuestions?.metadata?.code === 'ICTCBL330';
  const isQ3 = (token || '').toLowerCase() === 'question-3' || assessmentQuestions?.metadata?.code === 'ICTCBL322';
  const isQ1 = (token || '').toLowerCase() === 'question-1' || assessmentQuestions?.metadata?.code === 'ICTCBL246 & ICTCBL247';
  const isQ4 = (token || '').toLowerCase() === 'question-4' || assessmentQuestions?.metadata?.code === 'ICTCBL320';
  const isQ5 = (token || '').toLowerCase() === 'question-5' || assessmentQuestions?.metadata?.code === 'ICTCBL254';
  const isQ6 = (token || '').toLowerCase() === 'question-6' || assessmentQuestions?.metadata?.code === 'ICTTEN208';
  const isQ7 = (token || '').toLowerCase() === 'question-7' || assessmentQuestions?.metadata?.code === 'ICTCBL334';
  const isQ8 = (token || '').toLowerCase() === 'question-8' || assessmentQuestions?.metadata?.code === 'ICTBWN308';
  const isQ9 = (token || '').toLowerCase() === 'question-9' || assessmentQuestions?.metadata?.code === 'ICTBWN307';
  const isQ10 = (token || '').toLowerCase() === 'question-10' || assessmentQuestions?.metadata?.code === 'ICTWHS204';
  const isQ11 = (token || '').toLowerCase() === 'question-11' || assessmentQuestions?.metadata?.code === 'ICTTEN318';
  const isQ12 = (token || '').toLowerCase() === 'question-12' || assessmentQuestions?.metadata?.code === 'ICTTEN313';
  const isQ13 = (token || '').toLowerCase() === 'question-13' || assessmentQuestions?.metadata?.code === 'ICTCBL301';
  const isQ14 = (token || '').toLowerCase() === 'question-14' || assessmentQuestions?.metadata?.code === 'ICTCBL303';
  const isQ15 = (token || '').toLowerCase() === 'question-15' || assessmentQuestions?.metadata?.code === 'ICTCBL334 ICTCBL329 ICTCBL249 ICTCBL253';
  const isPdfBooklet = isQ1 || isQ2 || isQ3 || isQ4 || isQ5 || isQ6 || isQ7 || isQ8 || isQ9 || isQ10 || isQ11 || isQ12 || isQ13 || isQ14 || isQ15;

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const sigCanvas = useRef<HTMLCanvasElement>(null)
  const signaturePad = useRef<SignaturePad | null>(null)

  const sigContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setError('Missing assessment token. Please use the link provided by your assessor.')
      setLoading(false)
    }
  }, [token])

  // Function to resize canvas
  const resizeCanvas = () => {
    const canvas = sigCanvas.current;
    if (canvas && sigContainerRef.current) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const containerWidth = sigContainerRef.current.offsetWidth;
      const containerHeight = sigContainerRef.current.offsetHeight;

      // Only resize if the logical dimensions don't match the display dimensions * ratio
      if (canvas.width !== containerWidth * ratio || canvas.height !== containerHeight * ratio) {
        canvas.width = containerWidth * ratio;
        canvas.height = containerHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signaturePad.current?.clear();
        setSignatureEmpty(true);
      }
    }
  };

  // Initialize signature pad and handle resizing
  useEffect(() => {
    if (!loading && !error && sigCanvas.current && !signaturePad.current) {
      const pad = new SignaturePad(sigCanvas.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });

      pad.addEventListener("endStroke", () => {
        setSignatureEmpty(false);
      });

      signaturePad.current = pad;

      // Initial resize
      setTimeout(resizeCanvas, 100);

      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  }, [loading, error])

  const validateToken = async () => {
    const data = await api.validateToken(token!)
    if (data.error || !data) {
      setError('Invalid assessment link.')
    } else {
      setAssessment(data)
    }
    setLoading(false)
  }

  const clearSignature = () => {
    signaturePad.current?.clear()
    setSignatureEmpty(true)
  }

  const getMissingFields = (currentAnswers: any) => {
    const missing = new Set<string>();

    if (!assessmentQuestions) return missing;

    Object.keys(assessmentQuestions)
      .filter(key => key.startsWith('task'))
      .sort((a, b) => parseInt(a.replace('task', '')) - parseInt(b.replace('task', '')))
      .forEach((taskKey) => {
        const tNum = parseInt(taskKey.replace('task', ''));
        const taskData = assessmentQuestions[taskKey];

        if (taskData.assessorOnly) return;

        const isPlainArray = Array.isArray(taskData) && taskData.length > 0 && typeof taskData[0] === 'object';
        const hasNestedQuestions = !Array.isArray(taskData) && Array.isArray((taskData as any)?.questions);
        const isChecklist = !isPlainArray && !hasNestedQuestions;

        if (isChecklist) {
          if (taskData.sections) {
            taskData.sections.forEach((section: any) => {
              if (section.type === 'table') {
                section.rows.forEach((row: any) => {
                  if (row.isSubHeader) return;
                  if (row.cells) {
                    row.cells.forEach((cell: any) => {
                      const val = currentAnswers[cell.name];
                      const isEmpty = !val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === '');
                      if (isEmpty) {
                        missing.add(cell.name);
                      }
                    });
                  } else if (row.editable) {
                    const val = currentAnswers[row.id];
                    const isEmpty = !val || String(val).trim() === '';
                    if (isEmpty) {
                      missing.add(row.id);
                    }
                  }
                });
              }
            });
          }
          return;
        }

        const questionsArray: any[] = isPlainArray
          ? taskData
          : (taskData as any).questions;

        if (hasNestedQuestions && (taskData as any).sections) {
          (taskData as any).sections.forEach((section: any) => {
            if (section.type === 'table') {
              section.rows.forEach((row: any) => {
                if (row.isSubHeader) return;
                if (row.cells) {
                  row.cells.forEach((cell: any) => {
                    const val = currentAnswers[cell.name];
                    const isEmpty = !val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === '');
                    if (isEmpty) {
                      missing.add(cell.name);
                    }
                  });
                } else if (row.editable) {
                  const val = currentAnswers[row.id];
                  const isEmpty = !val || String(val).trim() === '';
                  if (isEmpty) {
                    missing.add(row.id);
                  }
                }
              });
            }
          });
        }

        if (questionsArray) {
          questionsArray.forEach((q: any) => {
            const qKey = `t${tNum}q${q.id}`;
            if (q.type === 'text') {
              const val = currentAnswers[qKey];
              const isEmpty = !val || String(val).trim() === '';
              if (isEmpty) {
                missing.add(qKey);
              }
            } else if (q.type === 'text_inputs') {
              q.textInputs.forEach((ti: any) => {
                const val = currentAnswers[ti.name];
                const isEmpty = !val || String(val).trim() === '';
                if (isEmpty) {
                  missing.add(ti.name);
                }
              });
            } else if (q.type === 'table') {
              q.rows.forEach((row: any) => {
                if (row.isSubHeader) return;
                if (row.cells) {
                  row.cells.forEach((cell: any) => {
                    const val = currentAnswers[cell.name];
                    const isEmpty = !val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === '');
                    if (isEmpty) {
                      missing.add(cell.name);
                    }
                  });
                } else if (row.editable) {
                  const val = currentAnswers[row.id];
                  const isEmpty = !val || String(val).trim() === '';
                  if (isEmpty) {
                    missing.add(row.id);
                  }
                }
              });
            } else if (q.type === 'multipart_radio') {
              q.parts.forEach((part: any) => {
                const val = currentAnswers[part.name];
                const isEmpty = !val || String(val).trim() === '';
                if (isEmpty) {
                  missing.add(part.name);
                }
              });
            } else if (q.type === 'jsa_table' && q.fields) {
              q.fields.forEach((f: any) => {
                const val = currentAnswers[f.name];
                const isEmpty = !val || String(val).trim() === '';
                if (isEmpty) {
                  missing.add(f.name);
                }
              });
              for (let rIdx = 0; rIdx < q.steps.rowCount; rIdx++) {
                for (let cIdx = 0; cIdx < 3; cIdx++) {
                  const stepKey = `t${tNum}q${q.id}_r${rIdx}c${cIdx}`;
                  const val = currentAnswers[stepKey];
                  const isEmpty = !val || String(val).trim() === '';
                  if (isEmpty) {
                    missing.add(stepKey);
                  }
                }
              }
            } else {
              const val = currentAnswers[qKey];
              const isEmpty = !val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === '');
              if (isEmpty) {
                missing.add(qKey);
              }
            }
          });
        }
      });

    return missing;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    let form: HTMLFormElement | null = null;
    if (e) {
      e.preventDefault();
      form = e.currentTarget as HTMLFormElement;
    }

    const isSigEmpty = isPdfBooklet ? !answers['student_signature_url'] : (!signaturePad.current || signaturePad.current.isEmpty());

    if (form && !form.checkValidity()) {
      setShowErrors(true);
      showToast('Please fill in all the missing answers highlighted in red before submitting.', 'error');
      
      // Scroll to the first missing field
      setTimeout(() => {
        const firstInvalid = form!.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (isSigEmpty) {
      setShowErrors(true);
      showToast('Please provide your signature before submitting.', 'error');

      setTimeout(() => {
        if (!isPdfBooklet && sigCanvas.current) {
          sigCanvas.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setSubmitting(true)
    const answersToSubmit: any = { ...answers }
    if (e?.currentTarget) {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      formData.forEach((value, key) => {
        if (typeof value === 'string' && value.trim() === '') {
          return;
        }
        if (answersToSubmit[key] && answersToSubmit[key] !== value) {
          if (!Array.isArray(answersToSubmit[key])) answersToSubmit[key] = [answersToSubmit[key]]
          answersToSubmit[key].push(value)
        } else {
          answersToSubmit[key] = value
        }
      })
    }

    try {
      const signatureData = isPdfBooklet ? (answers['student_signature_url'] || '') : (signaturePad.current ? signaturePad.current.toDataURL() : '')

      const data = await api.submitAssessment({
        assessment_id: assessment._id || assessment.id,
        student_name: answersToSubmit['st-name'] || searchParams.get('st-name') || '',
        student_id: answersToSubmit['st-id'] || searchParams.get('st-id') || '',
        answers: answersToSubmit,
        signature_url: signatureData
      })

      if (data.error) throw new Error(data.error)

      setSubmitted(true)
      if (token) {
        const stId = searchParams.get('st-id');
        const suffix = stId ? `${token}_${stId}` : token;
        localStorage.setItem(`assessment_submitted_${suffix}`, 'true');
        // Clear answers from localStorage after successful submission
        localStorage.removeItem(`assessment_answers_${suffix}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (q: any, i: number, tNum: number) => {
    const qKey = `t${tNum}q${q.id}`

    // Check if the question has any answers
    let isAttempted = false;
    if (q.type === 'text_inputs') {
      isAttempted = q.textInputs.some((ti: any) => answers[ti.name] && answers[ti.name].trim() !== '');
    } else if (q.type === 'multipart_radio') {
      isAttempted = q.parts.some((part: any) => answers[part.name]);
    } else {
      const val = answers[qKey];
      isAttempted = val && (Array.isArray(val) ? val.length > 0 : val.trim() !== '');
    }

    return (
      <div key={q.id} className="legacy-q-block group relative">
        <div className="legacy-q-num flex justify-between items-start gap-4">
          <div className="flex-1">
            <span className="inline-flex items-center justify-center bg-blue-100 text-[#1e3a8a] w-8 h-8 rounded-full mr-3 text-sm">{q.id}</span>
            {q.text}
          </div>

          {/* Print-only status badge */}
          {!isAttempted && (
            <div className="hidden print:block pdf-not-attempted flex-shrink-0">
              Not Attempted
            </div>
          )}
        </div>

        {/* Optional image for question */}
        {q.image && (
          <div className="flex flex-col items-center gap-2 mt-4 mb-3 px-2">
            <div className={`bg-white p-1 sm:p-2 border border-slate-200 shadow-sm rounded-lg w-full ${q.smallImage ? 'max-w-[300px]' : 'max-w-[600px]'}`}>
              <img src={q.image} alt={q.imageCaption || `Question ${q.id} diagram`} className="w-full h-auto rounded" />
            </div>
            {q.imageCaption && (
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{q.imageCaption}</span>
            )}
          </div>
        )}

        <div className="ml-0 md:ml-11">
          {q.type === 'text' ? (
            (() => {
              const isMissing = showErrors && (!answers[qKey] || answers[qKey].trim() === '');
              return (
                <div className="relative">
                  <textarea
                    name={qKey}
                    className={`w-full p-4 border-2 rounded-xl min-h-[120px] outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10 transition-all bg-gray-50/50 ${isMissing ? 'border-red-500 bg-red-50/10' : 'border-gray-100'
                      }`}
                    placeholder="Enter your detailed answer here..."
                    onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })}
                  ></textarea>
                </div>
              );
            })()
          ) : q.type === 'text_inputs' ? (
            <div className="grid grid-cols-1 gap-6 mt-4">
              {q.textInputs.map((ti: any, idx: number) => {
                const isTiMissing = showErrors && (!answers[ti.name] || answers[ti.name].trim() === '');
                return (
                  <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {ti.image && (
                      <div className="w-full md:w-64 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                        <img src={ti.image} alt={ti.placeholder || `Input ${idx + 1}`} className="w-full h-24 object-contain" />
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{ti.placeholder}</p>
                      <input
                        type="text"
                        name={ti.name}
                        className={`w-full p-3 bg-white border-2 rounded-lg outline-none focus:border-[#1e3a8a] transition-all font-bold ${isTiMissing ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
                          }`}
                        placeholder="Identify this cable type..."
                        onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : q.type === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {q.headers.map((header: string, hIdx: number) => (
                      <th key={hIdx} className="p-3 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.rows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 text-sm text-slate-700 font-medium bg-slate-50/30 w-1/3">
                        {row.label}
                      </td>
                      {row.cells ? (
                        row.cells.map((cell: any, cIdx: number) => {
                          const val = answers[cell.name];
                          const isCellMissing = showErrors && (!val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === ''));
                          return (
                            <td key={cIdx} className="p-2 border-l border-slate-100 align-top">
                              <div className={`flex flex-col gap-1.5 p-1 rounded transition-all ${isCellMissing ? 'border-2 border-red-500 bg-red-50/10' : ''
                                }`}>
                                {cell.options ? cell.options.map((opt: any, oIdx: number) => (
                                  <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                      type={cell.type || 'radio'}
                                      name={cell.name}
                                      value={opt.value}
                                      checked={cell.type === 'checkbox'
                                        ? (Array.isArray(answers[cell.name]) ? answers[cell.name].includes(opt.value) : false)
                                        : answers[cell.name] === opt.value}
                                      onChange={(e) => {
                                        if (cell.type === 'checkbox') {
                                          const current = Array.isArray(answers[cell.name]) ? answers[cell.name] : [];
                                          const updated = e.target.checked
                                            ? [...current, opt.value]
                                            : current.filter((v: string) => v !== opt.value);
                                          setAnswers({ ...answers, [cell.name]: updated });
                                        } else {
                                          setAnswers({ ...answers, [cell.name]: e.target.value });
                                        }
                                      }}
                                      className="w-3.5 h-3.5 accent-[#1e3a8a] cursor-pointer"
                                    />
                                    <span className="text-[10px] sm:text-[11px] text-slate-600 group-hover:text-[#1e3a8a] transition-colors leading-tight">{opt.text}</span>
                                  </label>
                                )) : (
                                  <input
                                    type="text"
                                    name={cell.name}
                                    className={`w-full p-2 text-sm bg-white border rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all ${isCellMissing ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                                      }`}
                                    placeholder="Comments..."
                                    value={answers[cell.name] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [cell.name]: e.target.value })}
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })
                      ) : (
                        <td className="p-2" colSpan={q.headers.length - 1}>
                          {row.editable ? (
                            (() => {
                              const isRowMissing = showErrors && (!answers[row.id] || answers[row.id].trim() === '');
                              return (
                                <input
                                  type="text"
                                  name={row.id}
                                  className={`w-full p-2 text-sm bg-white border rounded-lg outline-none focus:border-[#1e3a8a] transition-all ${isRowMissing ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                                    }`}
                                  placeholder="Enter answer..."
                                  value={answers[row.id] || ''}
                                  onChange={(e) => setAnswers({ ...answers, [row.id]: e.target.value })}
                                />
                              );
                            })()
                          ) : (
                            <span className="p-2 text-sm text-slate-600">{row.value}</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : q.type === 'multipart_radio' ? (
            <div className="flex flex-col gap-6 mt-4">
              {q.parts.map((part: any, pIdx: number) => {
                const isPartMissing = showErrors && (!answers[part.name] || answers[part.name].trim() === '');
                return (
                  <div key={pIdx}>
                    <div className="text-[13px] text-gray-600 italic mb-2 leading-relaxed">{part.text}</div>
                    <div className={`flex flex-col gap-1 p-1 rounded-xl transition-all ${isPartMissing ? 'border-2 border-red-500 bg-red-50/10' : ''
                      }`}>
                      {part.options.map((opt: any, idx: number) => (
                        <label key={idx} className="legacy-opt-label hover:shadow-md transition-shadow">
                          <input
                            type="radio"
                            name={part.name}
                            value={opt.value}
                            className="accent-[#1e3a8a]"
                            onChange={(e) => setAnswers({ ...answers, [part.name]: e.target.value })}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : q.type === 'jsa_table' ? (
            <div className="mt-4 border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-md">
              {/* Top metadata grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200">
                {q.fields.slice(0, 4).map((f: any, idx: number) => {
                  const isFMissing = showErrors && (!answers[f.name] || answers[f.name].trim() === '');
                  return (
                    <div key={idx} className={`p-3 border-r border-slate-100 last:border-r-0 ${idx === 3 ? 'bg-slate-50' : ''}`}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label}</label>
                      {f.options ? (
                        <div className={`flex gap-4 mt-1 p-1 rounded transition-all ${isFMissing ? 'border border-red-500 bg-red-50/10' : ''}`}>
                          {f.options.map((opt: string) => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name={f.name}
                                value={opt}
                                checked={answers[f.name] === opt}
                                onChange={(e) => setAnswers({ ...answers, [f.name]: e.target.value })}
                                className="w-3.5 h-3.5 accent-[#1e3a8a]"
                              />
                              <span className="text-xs font-bold text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          name={f.name}
                          className={`w-full bg-transparent border-b outline-none text-sm font-bold text-[#1e3a8a] ${isFMissing ? 'border-b-red-500 bg-red-50/10' : 'border-b-slate-100'
                            }`}
                          value={answers[f.name] || ''}
                          onChange={(e) => setAnswers({ ...answers, [f.name]: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Middle metadata grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200">
                {q.fields.slice(4, 10).map((f: any, idx: number) => {
                  const isFMissing = showErrors && (!answers[f.name] || answers[f.name].trim() === '');
                  return (
                    <div key={idx} className="p-3 border-r border-b border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label}</label>
                      <input
                        type="text"
                        name={f.name}
                        className={`w-full bg-transparent border-b outline-none text-sm font-bold text-[#1e3a8a] ${isFMissing ? 'border-b-red-500 bg-red-50/10' : 'border-b-slate-100'
                          }`}
                        value={answers[f.name] || ''}
                        onChange={(e) => setAnswers({ ...answers, [f.name]: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom metadata grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
                {q.fields.slice(10).map((f: any, idx: number) => {
                  const isFMissing = showErrors && (!answers[f.name] || answers[f.name].trim() === '');
                  return (
                    <div key={idx} className="p-3 border-r border-slate-100 last:border-r-0">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label}</label>
                      <input
                        type="text"
                        name={f.name}
                        className={`w-full bg-transparent border-b outline-none text-sm font-bold text-[#1e3a8a] ${isFMissing ? 'border-b-red-500 bg-red-50/10' : 'border-b-slate-100'
                          }`}
                        value={answers[f.name] || ''}
                        onChange={(e) => setAnswers({ ...answers, [f.name]: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Main JSA Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      {q.steps.headers.map((h: string, idx: number) => (
                        <th key={idx} className="p-3 text-xs font-bold uppercase tracking-widest border-r border-slate-700 last:border-0">{h}</th>
                      ))}
                    </tr>
                    <tr className="bg-slate-100 italic text-slate-500">
                      {q.steps.subHeaders.map((sh: string, idx: number) => (
                        <td key={idx} className="p-2 text-[10px] border-r border-slate-200 last:border-0">{sh}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(q.steps.rowCount)].map((_, rIdx) => (
                      <tr key={rIdx} className="border-t border-slate-200">
                        {[0, 1, 2].map((cIdx) => {
                          const stepKey = `t${tNum}q${q.id}_r${rIdx}c${cIdx}`;
                          const isStepMissing = showErrors && (!answers[stepKey] || answers[stepKey].trim() === '');
                          return (
                            <td key={cIdx} className="p-1 border-r border-slate-200 last:border-0">
                              <textarea
                                name={stepKey}
                                className={`w-full p-2 text-sm outline-none bg-transparent min-h-[60px] resize-none focus:bg-blue-50/30 transition-colors ${isStepMissing ? 'border border-red-500 bg-red-50/10 rounded' : ''
                                  }`}
                                value={answers[stepKey] || ''}
                                onChange={(e) => setAnswers({ ...answers, [stepKey]: e.target.value })}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            (() => {
              const val = answers[qKey];
              const isDefaultQMissing = showErrors && (!val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === ''));
              return (
                <div className={`flex flex-col gap-1 mt-2 p-1 rounded-xl transition-all ${isDefaultQMissing ? 'border-2 border-red-500 bg-red-50/10' : ''
                  }`}>
                  {q.options?.map((opt: any, idx: number) => (
                    <label key={idx} className="legacy-opt-label hover:shadow-md transition-shadow">
                      <input
                        type={opt.type || 'radio'}
                        name={qKey}
                        value={opt.value}
                        checked={opt.type === 'checkbox'
                          ? (Array.isArray(answers[qKey]) ? answers[qKey].includes(opt.value) : false)
                          : answers[qKey] === opt.value}
                        className="accent-[#1e3a8a]"
                        onChange={(e) => {
                          if (opt.type === 'checkbox') {
                            const current = answers[qKey] || [];
                            const next = e.target.checked
                              ? [...current, opt.value]
                              : current.filter((v: string) => v !== opt.value);
                            setAnswers({ ...answers, [qKey]: next });
                          } else {
                            setAnswers({ ...answers, [qKey]: e.target.value });
                          }
                        }}
                      />
                      <span>
                        {opt.value.length === 1 ? (
                          <strong className="text-[#1e3a8a] mr-2">{opt.value.toUpperCase()})</strong>
                        ) : null}
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#1e3a8a] mb-4" size={48} />
        <p className="text-gray-600 font-bold animate-pulse">Loading assessment details...</p>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-blue-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error || 'This assessment link is no longer valid or has expired.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-gray-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-900 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {submitted && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 print:hidden">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Assessment Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">Your responses have been recorded securely. You may now download a copy of your assessment record.</p>
            <button
              onClick={async () => {
                setIsDownloading(true);
                try {
                  const bookletClass = isQ1 ? 'q1-booklet-view' : isQ2 ? 'q2-booklet-view' : isQ3 ? 'q3-booklet-view' : isQ4 ? 'q4-booklet-view' : isQ5 ? 'q5-booklet-view' : isQ6 ? 'q6-booklet-view' : isQ7 ? 'q7-booklet-view' : isQ8 ? 'q8-booklet-view' : isQ9 ? 'q9-booklet-view' : isQ10 ? 'q10-booklet-view' : isQ11 ? 'q11-booklet-view' : isQ12 ? 'q12-booklet-view' : isQ13 ? 'q13-booklet-view' : isQ14 ? 'q14-booklet-view' : isQ15 ? 'q15-booklet-view' : null;
                  if (bookletClass) {
                    await downloadBookletAsPdf(bookletClass, `Assessment-${token}.pdf`);
                  } else {
                    window.print();
                  }
                } finally {
                  setIsDownloading(false);
                }
              }}
              disabled={isDownloading}
              className={`bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-700 w-full flex items-center justify-center gap-3 transition-colors ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Printer size={24} />} 
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}

      <div className={`print:bg-white min-h-screen ${isPdfBooklet ? 'bg-[#d0d0d0] p-0' : 'bg-[#eff6ff] py-6 sm:py-10 px-2 sm:px-4'} print:py-0 print:px-0 font-sans text-[#111] ${submitted ? 'hidden print:block' : 'block'}`}>
        <div className={`max-w-[1000px] mx-auto overflow-hidden print:max-w-none print:mx-0 print:shadow-none print:border-none print:rounded-none ${isPdfBooklet ? 'bg-transparent p-0 shadow-none border-none' : 'bg-white shadow-2xl p-4 sm:p-6 md:p-12 border border-gray-200 rounded-2xl sm:rounded-3xl'}`}>

          {!isPdfBooklet && (
            <div className="text-center pb-6 mb-8 sm:mb-12 relative flex flex-col items-center">
              <div className="hidden sm:block absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mt-12 -z-10"></div>
              <img
                src="/assets/acta-logo.png"
                alt="Logo"
                className="w-20 h-20 sm:w-32 sm:h-32 object-contain mb-4 drop-shadow-xl"
              />

              <div className="mb-2">
                <p className="text-[#4b90e2] font-black text-sm sm:text-xl tracking-[0.2em] uppercase">ACTA College Pty. Ltd</p>
                <p className="text-gray-400 font-bold text-[10px] sm:text-xs tracking-widest uppercase">RTO NO: 40954</p>
              </div>

              <div className="text-[#1e3a8a] mb-6 sm:mb-8 flex flex-col items-center w-full px-2">
                <h1 className="text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 sm:mb-4 text-center leading-tight">
                  {assessmentQuestions.metadata?.title || 'Assessment Booklet'}
                  {assessmentQuestions.metadata?.code && (
                    <span className="block text-lg sm:text-2xl mt-1 opacity-80">{assessmentQuestions.metadata.code}</span>
                  )}
                </h1>
                <div className="w-24 sm:w-48 h-1 sm:h-1.5 bg-[#4b90e2] rounded-full"></div>
              </div>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] sm:text-sm px-4">{assessmentQuestions.metadata?.subtitle || 'Open Registration - Customer Cabling (Tasks 4, 5 & 6)'}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`student-mode ${showErrors ? 'show-errors' : ''}`} noValidate>
            {!isPdfBooklet ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 bg-gray-50 p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 shadow-inner">
                  <label className="block">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Student Name</span>
                    <input name="st-name" value={answers['st-name'] !== undefined ? answers['st-name'] : (searchParams.get('st-name') || '')} onChange={(e) => setAnswers({ ...answers, 'st-name': e.target.value })} required className="w-full p-2.5 sm:p-3 border-2 border-white bg-white rounded-lg sm:rounded-xl shadow-sm focus:border-[#1e3a8a] outline-none transition-all font-bold text-sm sm:text-base" placeholder="Full Name" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Student ID</span>
                    <input name="st-id" value={answers['st-id'] !== undefined ? answers['st-id'] : (searchParams.get('st-id') || '')} onChange={(e) => setAnswers({ ...answers, 'st-id': e.target.value })} required className="w-full p-2.5 sm:p-3 border-2 border-white bg-white rounded-lg sm:rounded-xl shadow-sm focus:border-[#1e3a8a] outline-none transition-all font-bold text-sm sm:text-base" placeholder="ID Number" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assessment Date</span>
                    <input type="date" name="st-date" value={answers['st-date'] !== undefined ? answers['st-date'] : new Date().toISOString().split('T')[0]} onChange={(e) => setAnswers({ ...answers, 'st-date': e.target.value })} className="w-full p-2.5 sm:p-3 border-2 border-white bg-white rounded-lg sm:rounded-xl shadow-sm focus:border-[#1e3a8a] outline-none transition-all font-bold text-sm sm:text-base" />
                  </label>
                </div>

                {assessmentQuestions.adminInfo && (
                  <div className="mb-12 border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm px-0">
                    <table className="w-full text-left border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-4 bg-slate-50 text-slate-700 font-bold w-1/4 align-top border-r border-slate-200 text-xs sm:text-sm">Assessment Instruction</td>
                          <td className="p-4 text-[13px] sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {assessmentQuestions.adminInfo.assessmentInstruction}
                          </td>
                        </tr>
                        {assessmentQuestions.adminInfo.taskOverviews?.map((task: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0">
                            <td className="p-4 bg-slate-50 text-slate-700 font-bold w-1/4 align-top border-r border-slate-200 text-xs sm:text-sm">{task.id}</td>
                            <td className="p-4 text-[13px] sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <input type="hidden" name="st-name" value={answers['st-name'] !== undefined ? answers['st-name'] : (searchParams.get('st-name') || '')} />
                <input type="hidden" name="st-id" value={answers['st-id'] !== undefined ? answers['st-id'] : (searchParams.get('st-id') || '')} />
                <input type="hidden" name="st-date" value={answers['st-date'] !== undefined ? answers['st-date'] : new Date().toISOString().split('T')[0]} />
              </>
            )}

            {isQ2 ? (
              <div className="mb-0">
                <Q2Booklet
                  answers={answers}
                  setAnswers={setAnswers}
                  onSubmit={() => { }}
                  submitting={submitting}
                  studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                  submitDate={answers['st-date'] || new Date().toISOString().split('T')[0]}
                  isStudent={true}
                />
              </div>
            ) : isQ3 ? (
              <div className="mb-0">
                <Q3Booklet
                  answers={answers}
                  setAnswers={setAnswers}
                  onSubmit={() => { }}
                  submitting={submitting}
                  studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                  submitDate={answers['st-date'] || new Date().toISOString().split('T')[0]}
                  isStudent={true}
                />
              </div>
            ) : isQ4 ? (
              <Q4Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ5 ? (
              <Q5Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ6 ? (
              <Q6Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ7 ? (
              <Q7Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ8 ? (
              <Q8Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ9 ? (
              <Q9Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ10 ? (
              <Q10Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ11 ? (
              <Q11Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ12 ? (
              <Q12Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ13 ? (
              <Q13Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ14 ? (
              <Q14Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ15 ? (
              <Q15Booklet
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                submitting={submitting}
                studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                submitDate={new Date().toISOString()}
                isStudent={true}
              />
            ) : isQ1 ? (
              <div className="mb-0">
                <Q1Booklet
                  answers={answers}
                  setAnswers={setAnswers}
                  onSubmit={() => { }}
                  submitting={submitting}
                  studentName={answers['st-name'] || searchParams.get('st-name') || ''}
                  submitDate={answers['st-date'] || new Date().toISOString().split('T')[0]}
                  isStudent={true}
                />
              </div>

            ) : (
              Object.keys(assessmentQuestions)
                .filter(key => key.startsWith('task'))
                .sort((a, b) => parseInt(a.replace('task', '')) - parseInt(b.replace('task', '')))
                .map((taskKey) => {
                  const tNum = parseInt(taskKey.replace('task', ''));
                  const taskData = assessmentQuestions[taskKey];

                  if (taskData.assessorOnly) return null;

                  // Case 1: plain array of question objects
                  const isPlainArray = Array.isArray(taskData) && taskData.length > 0 && typeof taskData[0] === 'object';
                  // Case 2: object with a nested .questions array (e.g. ICTCBL322 task1)
                  const hasNestedQuestions = !Array.isArray(taskData) && Array.isArray((taskData as any)?.questions);
                  // Case 3: observation/checklist object
                  const isChecklist = !isPlainArray && !hasNestedQuestions;

                  if (isChecklist) {
                    return (
                      <section key={taskKey} className="mb-12 sm:mb-16 page-break-before">
                        {/* Observation Section - Only show if it has observation data */}
                        {(taskData.observationTitle || taskData.observationSubtitle || taskData.sections) && (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="text-center space-y-2 px-2">
                              <div className="task-banner-ribbon text-xs sm:text-base py-2 sm:py-3 px-4 sm:px-6 mb-4">
                                {taskData.observationTitle || `ASSESSMENT TASK ${tNum} OBSERVATION`}
                              </div>
                              {taskData.observationSubtitle && (
                                <div className="text-sm sm:text-lg font-bold text-slate-600 border-y border-slate-200 py-3 mt-4">
                                  {taskData.observationSubtitle}
                                </div>
                              )}
                            </div>

                            {taskData.sections && (
                              <div className="space-y-4 sm:space-y-6 mt-2">
                                {taskData.sections.map((section: any, sIdx: number) => (
                                  <div key={sIdx} className="space-y-2 sm:space-y-3 px-2">
                                    {(section.type === 'text' || !section.type) && (
                                      <div className={`space-y-2 sm:space-y-3 ${sIdx === 0 ? '' : 'bg-slate-50 border border-slate-200 rounded-xl p-4'}`}>
                                        {section.title && (
                                          <h3 className={`font-bold text-slate-800 pb-1 ${sIdx === 0 ? 'text-[15px] sm:text-base border-b border-slate-200' : 'text-sm sm:text-base text-[#1e3a8a] border-b-2 border-[#1e3a8a]/20'}`}>
                                            {section.title}
                                          </h3>
                                        )}
                                        <div className="text-[13px] sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                          {section.content}
                                        </div>
                                      </div>
                                    )}
                                    {section.type === 'image' && (
                                      <div className="flex flex-col items-center gap-2 py-2 sm:py-4">
                                        <div className="bg-white p-1 sm:p-2 border border-slate-200 shadow-sm rounded-lg w-full max-w-[550px]">
                                          <img src={section.src} alt={section.caption || 'Observation'} className="w-full h-auto rounded" />
                                        </div>
                                        {section.caption && (
                                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {section.caption}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {section.type === 'table' && (
                                      <div className="space-y-3 px-2">
                                        {section.title && (
                                          <h3 className="font-bold text-slate-800 pb-1 text-sm sm:text-base border-b border-slate-200">
                                            {section.title}
                                          </h3>
                                        )}
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                          <table className="w-full text-left border-collapse">
                                            <thead>
                                              <tr className="bg-slate-50 border-b border-slate-200">
                                                {section.headers.map((header: string, hIdx: number) => (
                                                  <th key={hIdx} className="p-3 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    {header}
                                                  </th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {section.rows.map((row: any, rIdx: number) => {
                                                if (row.isSubHeader) {
                                                  return (
                                                    <tr key={rIdx} className="bg-slate-100 border-b border-slate-200">
                                                      <td colSpan={section.headers.length} className="p-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                        {row.label}
                                                      </td>
                                                    </tr>
                                                  )
                                                }
                                                return (
                                                  <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-3 text-sm text-slate-700 font-medium bg-slate-50/30 w-1/3">
                                                      {row.label}
                                                    </td>
                                                    {row.cells ? (
                                                      row.cells.map((cell: any, cIdx: number) => {
                                                        const val = answers[cell.name];
                                                        const isCellMissing = showErrors && (!val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === ''));
                                                        return (
                                                          <td key={cIdx} className="p-2 border-l border-slate-100 align-top">
                                                            <div className={`flex flex-col gap-1.5 p-1 rounded transition-all ${isCellMissing ? 'border-2 border-red-500 bg-red-50/10' : ''
                                                              }`}>
                                                              {cell.options ? cell.options.map((opt: any, oIdx: number) => (
                                                                <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                                                                  <div className="relative flex items-center justify-center">
                                                                    <input
                                                                      type={cell.type || 'radio'}
                                                                      name={cell.name}
                                                                      value={opt.value}
                                                                      checked={cell.type === 'checkbox'
                                                                        ? (Array.isArray(answers[cell.name]) ? answers[cell.name].includes(opt.value) : false)
                                                                        : answers[cell.name] === opt.value}
                                                                      onChange={(e) => {
                                                                        if (cell.type === 'checkbox') {
                                                                          const current = Array.isArray(answers[cell.name]) ? answers[cell.name] : [];
                                                                          const updated = e.target.checked
                                                                            ? [...current, opt.value]
                                                                            : current.filter((v: string) => v !== opt.value);
                                                                          setAnswers({ ...answers, [cell.name]: updated });
                                                                        } else {
                                                                          setAnswers({ ...answers, [cell.name]: e.target.value });
                                                                        }
                                                                      }}
                                                                      className="w-3.5 h-3.5 accent-[#1e3a8a] cursor-pointer"
                                                                    />
                                                                  </div>
                                                                  <span className="text-[10px] sm:text-[11px] text-slate-600 group-hover:text-[#1e3a8a] transition-colors leading-tight">{opt.text}</span>
                                                                </label>
                                                              )) : (
                                                                <input
                                                                  type="text"
                                                                  name={cell.name}
                                                                  className={`w-full p-2 text-sm bg-white border rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all ${isCellMissing ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                                                                    }`}
                                                                  placeholder="Comments..."
                                                                  value={answers[cell.name] || ''}
                                                                  onChange={(e) => setAnswers({ ...answers, [cell.name]: e.target.value })}
                                                                />
                                                              )}
                                                            </div>
                                                          </td>
                                                        );
                                                      })
                                                    ) : (
                                                      <td className="p-2" colSpan={section.headers.length - 1}>
                                                        {row.editable ? (
                                                          (() => {
                                                            const isRowMissing = showErrors && (!answers[row.id] || answers[row.id].trim() === '');
                                                            return (
                                                              <input
                                                                type="text"
                                                                name={row.id}
                                                                className={`w-full p-2 text-sm bg-white border rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all ${isRowMissing ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                                                                  }`}
                                                                placeholder="Enter result..."
                                                                value={answers[row.id] || ''}
                                                                onChange={(e) => setAnswers({ ...answers, [row.id]: e.target.value })}
                                                              />
                                                            );
                                                          })()
                                                        ) : (
                                                          <span className="p-2 text-sm text-slate-600">{row.value}</span>
                                                        )}
                                                      </td>
                                                    )}
                                                  </tr>
                                                )
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </section>
                    );
                  }

                  // Written questions: resolve the actual array and title
                  const questionsArray: any[] = isPlainArray
                    ? taskData
                    : (taskData as any).questions;

                  let taskTitle = `Task ${tNum}`;
                  if ((taskData as any).title) {
                    taskTitle = (taskData as any).title;
                  } else if (assessmentQuestions.metadata?.code === 'ICTCBL322' && tNum === 1) {
                    taskTitle = 'ASSESSMENT TASK 1 – WRITTEN QUESTIONS AND ANSWERS';
                  } else if (tNum === 4) {
                    taskTitle += ' – Knowledge Questions';
                  } else if (tNum === 5) {
                    taskTitle += ' – Questions and Answers';
                  } else if (tNum === 6) {
                    taskTitle += ' – Multi Choice Questions';
                  }

                  return (
                    <section key={taskKey} className="mb-10 sm:mb-12">
                      <div className="task-banner-ribbon text-xs sm:text-base py-2 sm:py-3 px-4 sm:px-6">{taskTitle}</div>

                      {(taskData as any).observationSubtitle && (
                        <div className="text-center mt-4 mb-2">
                          <div className="text-sm sm:text-lg font-bold text-slate-600 border-y border-slate-200 py-3">
                            {(taskData as any).observationSubtitle}
                          </div>
                        </div>
                      )}

                      {/* Show instruction sections (if any) above the questions */}
                      {hasNestedQuestions && (taskData as any).sections && (
                        <div className="space-y-6 mt-4 mb-8 px-2">
                          {(taskData as any).sections.map((section: any, sIdx: number) => (
                            <div key={sIdx} className="space-y-3">
                              {(section.type === 'text' || !section.type) && (
                                <div className="space-y-2">
                                  {section.title && (
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base border-b border-slate-200 pb-1">
                                      {section.title}
                                    </h3>
                                  )}
                                  <div className="text-[13px] sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-blue-50/40 border border-blue-100 rounded-xl p-4">
                                    {section.content}
                                  </div>
                                </div>
                              )}

                              {section.type === 'image' && (
                                <div className="flex flex-col items-center gap-2 py-2">
                                  <div className={`bg-white p-1 sm:p-2 border border-slate-200 shadow-sm rounded-lg w-full ${section.smallImage ? 'max-w-[300px]' : 'max-w-[600px]'}`}>
                                    <img src={section.src} alt={section.caption || 'Instruction diagram'} className="w-full h-auto rounded" />
                                  </div>
                                  {section.caption && (
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{section.caption}</span>
                                  )}
                                </div>
                              )}

                              {section.type === 'table' && (
                                <div className="space-y-3">
                                  {section.title && (
                                    <h3 className="font-bold text-slate-800 pb-1 text-sm sm:text-base border-b border-slate-200">
                                      {section.title}
                                    </h3>
                                  )}
                                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                          {section.headers.map((header: string, hIdx: number) => (
                                            <th key={hIdx} className="p-3 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {section.rows.map((row: any, rIdx: number) => (
                                          <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 text-sm text-slate-700 font-medium bg-slate-50/30 w-1/3">
                                              {row.label}
                                            </td>
                                            {row.cells ? (
                                              row.cells.map((cell: any, cIdx: number) => {
                                                const val = answers[cell.name];
                                                const isCellMissing = showErrors && (!val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === ''));
                                                return (
                                                  <td key={cIdx} className="p-2 border-l border-slate-100 align-top">
                                                    <div className={`flex flex-col gap-1.5 p-1 rounded transition-all ${isCellMissing ? 'border-2 border-red-500 bg-red-50/10' : ''
                                                      }`}>
                                                      {cell.options ? cell.options.map((opt: any, oIdx: number) => (
                                                        <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                                                          <input
                                                            type={cell.type || 'radio'}
                                                            name={cell.name}
                                                            value={opt.value}
                                                            checked={cell.type === 'checkbox'
                                                              ? (Array.isArray(answers[cell.name]) ? answers[cell.name].includes(opt.value) : false)
                                                              : answers[cell.name] === opt.value}
                                                            onChange={(e) => {
                                                              if (cell.type === 'checkbox') {
                                                                const current = Array.isArray(answers[cell.name]) ? answers[cell.name] : [];
                                                                const updated = e.target.checked
                                                                  ? [...current, opt.value]
                                                                  : current.filter((v: string) => v !== opt.value);
                                                                setAnswers({ ...answers, [cell.name]: updated });
                                                              } else {
                                                                setAnswers({ ...answers, [cell.name]: e.target.value });
                                                              }
                                                            }}
                                                            className="w-3.5 h-3.5 accent-[#1e3a8a] cursor-pointer"
                                                          />
                                                          <span className="text-[10px] sm:text-[11px] text-slate-600 group-hover:text-[#1e3a8a] transition-colors leading-tight">{opt.text}</span>
                                                        </label>
                                                      )) : (
                                                        <input
                                                          type="text"
                                                          name={cell.name}
                                                          className={`w-full p-2 text-sm bg-white border rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all ${isCellMissing ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                                                            }`}
                                                          placeholder="Comments..."
                                                          value={answers[cell.name] || ''}
                                                          onChange={(e) => setAnswers({ ...answers, [cell.name]: e.target.value })}
                                                        />
                                                      )}
                                                    </div>
                                                  </td>
                                                );
                                              })
                                            ) : (
                                              <td className="p-2" colSpan={section.headers.length - 1}>
                                                {row.editable ? (
                                                  (() => {
                                                    const isRowMissing = showErrors && (!answers[row.id] || answers[row.id].trim() === '');
                                                    return (
                                                      <input
                                                        type="text"
                                                        name={row.id}
                                                        className={`w-full p-2 text-sm bg-white border rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all ${isRowMissing ? 'border-red-500 bg-red-50/10' : 'border-slate-200'
                                                          }`}
                                                        placeholder="Enter result..."
                                                        value={answers[row.id] || ''}
                                                        onChange={(e) => setAnswers({ ...answers, [row.id]: e.target.value })}
                                                      />
                                                    );
                                                  })()
                                                ) : (
                                                  <span className="p-2 text-sm text-slate-600">{row.value}</span>
                                                )}
                                              </td>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-0">
                        {hasNestedQuestions && (taskData as any).sections && (
                          <div className="bg-slate-200 py-2 sm:py-3 px-4 mb-6 mt-8 rounded-lg shadow-inner border border-slate-300">
                            <h3 className="text-center font-bold text-slate-700 uppercase tracking-widest text-xs sm:text-sm">Questions</h3>
                          </div>
                        )}
                        {questionsArray.map((q: any, i: number) => renderQuestion(q, i, tNum))}
                      </div>
                    </section>
                  );
                })
            )}


            {!isPdfBooklet && (
              <div className="mt-12 sm:mt-16 p-4 sm:p-8 border-2 sm:border-4 border-dashed border-gray-300 rounded-xl sm:rounded-2xl bg-gray-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Save size={20} className="text-[#1e3a8a] sm:w-[24px] sm:h-[24px]" />
                  Student Declaration & Signature
                </h3>
                <p className="text-gray-600 mb-6 text-[11px] sm:text-sm italic leading-relaxed">
                  "I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source."
                </p>
                <div className="flex flex-col items-center w-full">
                  <div
                    ref={sigContainerRef}
                    className={`bg-white border-2 rounded-lg shadow-inner overflow-hidden w-full max-w-[600px] h-[200px] transition-all ${showErrors && signatureEmpty
                        ? 'border-red-500 bg-red-50/10 ring-4 ring-red-500/10'
                        : 'border-gray-300'
                      }`}
                  >
                    <canvas ref={sigCanvas} className="w-full h-full cursor-crosshair" style={{ touchAction: 'none' }} />
                  </div>
                  <div className="flex gap-4 mt-4">
                    {!submitted && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="px-4 py-2 text-[11px] sm:text-sm font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Clear Signature
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={`pt-8 sm:pt-12 flex justify-center print:hidden ${isPdfBooklet ? 'pb-12' : ''}`}>
              <button
                type="submit"
                disabled={submitting || submitted}
                className={`group relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-12 py-4 sm:py-5 rounded-full font-black text-sm sm:text-xl uppercase tracking-tighter shadow-2xl transition-all w-full sm:w-auto ${submitted
                  ? 'bg-green-600 text-white shadow-green-200 cursor-not-allowed opacity-90'
                  : 'bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-blue-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50'
                  }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Submitting...</span>
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle2 size={20} className="sm:w-[28px] sm:h-[28px]" />
                    <span>Submitted</span>
                  </>
                ) : (
                  <>
                    <Send size={20} className="sm:w-[28px] sm:h-[28px]" />
                    <span>Submit Assessment ?</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {!isPdfBooklet && (
          <footer className="bg-white border-t border-gray-200 mt-16 sm:mt-24 no-print shadow-inner">
            <div className="max-w-[1000px] mx-auto py-8 sm:py-12 px-4">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/assets/Yencode Logo.png"
                    alt="Yencode Technologies Logo"
                    className="h-10 sm:h-14 object-contain"
                  />
                  <div>
                    <p className="text-[12px] sm:text-base font-black text-[#1e3a8a] uppercase tracking-widest">Yencode Technologies</p>
                    <a href="https://yencodetechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-sm text-gray-400 hover:text-[#1e3a8a] transition-colors font-bold">www.yencodetechnologies.com</a>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Contact Support</p>
                  <p className="text-[11px] sm:text-base font-bold text-gray-600">For any issues contact us: <a href="mailto:info@yencodetechnologies.com" className="text-[#1e3a8a] hover:underline block sm:inline">info@yencodetechnologies.com</a></p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      {toast && (
        <>
          <style>{`
            @keyframes toast-in {
              from {
                transform: translateY(1.5rem) scale(0.95);
                opacity: 0;
              }
              to {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
            }
            .premium-toast {
              animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-l-4 border-red-500 premium-toast max-w-sm sm:max-w-md no-print">
            <div className="bg-red-500/10 p-2 rounded-xl text-red-500">
              <AlertCircle size={20} className="flex-shrink-0" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Validation Error</p>
              <p className="text-[13px] sm:text-sm font-bold text-slate-100 leading-snug mt-0.5">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default AssessmentForm
