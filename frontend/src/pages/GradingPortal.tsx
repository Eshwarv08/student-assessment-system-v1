import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ArrowLeft, Save, Printer, Loader2, CheckCircle2, XCircle, Info, RotateCcw } from 'lucide-react'
import SignaturePad from 'signature_pad'
import { getQuestionsForAssessment, questionSets } from '../data'
import '../grading-print.css'
import '../assessment-styles.css'

const GradingPortal: React.FC = () => {
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '_____/_____/_________';
    if (!dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [grades, setGrades] = useState<any>({})
  const [taskResults, setTaskResults] = useState<any>({})
  const [finalResult, setFinalResult] = useState<string>('')
  const [sigModal, setSigModal] = useState<{ open: boolean, field: string, type: 'task' | 'comp' | 'grades' } | null>(null)
  const sigCanvasRef = useRef<HTMLCanvasElement>(null)
  const sigPadRef = useRef<SignaturePad | null>(null)
  const [compRecord, setCompRecord] = useState<any>({
    assessor_name: '',
    assessment_site: '',
    assessment_date: new Date().toISOString().split('T')[0],
    evidence: { valid: false, sufficient: false, current: false, authentic: false },
    tasks: { t1: false, t2: false, t3: false, t4: false, t5: false, t6: false },
    attempts: [
      { date: '', feedback: '' },
      { date: '', feedback: '' },
      { date: '', feedback: '' }
    ],
    assessor_signature: '',
    student_signature: '',
    assessor_sig_date: new Date().toISOString().split('T')[0],
    student_sig_date: '',
    reasonable_adjustment: { reason: '', outcome: '' },
    final_feedback: ''
  })

  const { data: submission, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const data = await api.getSubmission(id!)
      if (data.error) throw new Error(data.error)
      if (!data) throw new Error('Submission not found')
      return data
    },
    retry: 1,
  })

  const currentAssessmentQuestions = getQuestionsForAssessment(submission?.assessment_id?.token || 'question-1');
  const isQuestion15 = (submission?.assessment_id?.token || '').toLowerCase() === 'question-15';

  useEffect(() => {
    if (submission) {
      setGrades(submission.grades || {})
      setTaskResults(submission.task_results || {})
      setFinalResult(submission.final_result || '')

      // comp_record from DB can be {} (empty object) which is truthy but has no fields.
      // Always merge with safe defaults field-by-field to prevent render crashes.
      const saved = submission.comp_record || {}
      setCompRecord({
        assessor_name: saved.assessor_name || '',
        assessment_site: saved.assessment_site || '',
        assessment_date: saved.assessment_date || new Date().toISOString().split('T')[0],
        evidence: saved.evidence || { valid: false, sufficient: false, current: false, authentic: false },
        tasks: saved.tasks || { t1: false, t2: false, t3: false, t4: false, t5: false, t6: false },
        attempts: (Array.isArray(saved.attempts) && saved.attempts.length >= 3)
          ? saved.attempts
          : [{ date: '', feedback: '' }, { date: '', feedback: '' }, { date: '', feedback: '' }],
        assessor_signature: saved.assessor_signature || '',
        student_signature: saved.student_signature || '',
        assessor_sig_date: saved.assessor_sig_date || new Date().toISOString().split('T')[0],
        student_sig_date: saved.student_sig_date || '',
        reasonable_adjustment: saved.reasonable_adjustment || { reason: '', outcome: '' },
        final_feedback: saved.final_feedback || ''
      })
    }
  }, [submission])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('print') === 'true' && !isLoading && submission) {
      // Small delay to ensure styles and images are loaded
      const timer = setTimeout(() => {
        window.print()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [location.search, isLoading, submission])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = await api.updateSubmission(id!, {
        grades,
        task_results: taskResults,
        final_result: finalResult,
        comp_record: compRecord,
        status: 'graded'
      })
      if (data.error) throw new Error(data.error)
    },
    onSuccess: () => {
      alert('✅ Grades saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['submission', id] })
    },
    onError: (err: any) => {
      alert('⚠️ Error saving: ' + err.message)
    }
  })

  const handlePrint = () => {
    window.print()
  }

  const sigModalCanvasRef = useRef<HTMLCanvasElement>(null)
  const sigModalContainerRef = useRef<HTMLDivElement>(null)

  const openSigModal = (field: string, type: 'task' | 'comp' | 'grades') => {
    setSigModal({ open: true, field, type })
  }

  const closeSigModal = () => {
    setSigModal(null)
  }

  const resizeSigModalCanvas = () => {
    const canvas = sigModalCanvasRef.current;
    if (canvas && sigModalContainerRef.current) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const containerWidth = sigModalContainerRef.current.offsetWidth;
      const containerHeight = sigModalContainerRef.current.offsetHeight;

      // Only resize if the logical dimensions don't match the display dimensions * ratio
      if (canvas.width !== containerWidth * ratio || canvas.height !== containerHeight * ratio) {
        canvas.width = containerWidth * ratio;
        canvas.height = containerHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        sigPadRef.current?.clear();
      }
    }
  };

  useEffect(() => {
    if (sigModal?.open && sigModalCanvasRef.current) {
      // Small delay to ensure modal animation is complete and dimensions are stable
      const timer = setTimeout(() => {
        if (sigModalCanvasRef.current) {
          sigPadRef.current = new SignaturePad(sigModalCanvasRef.current);
          resizeSigModalCanvas();
        }
      }, 250);

      window.addEventListener("resize", resizeSigModalCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", resizeSigModalCanvas);
        sigPadRef.current = null;
      };
    }
  }, [sigModal?.open])

  const saveSignature = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) return
    const dataUrl = sigPadRef.current.toDataURL()
    if (sigModal?.type === 'task') {
      setTaskResults({ ...taskResults, [sigModal.field]: dataUrl })
    } else if (sigModal?.type === 'comp') {
      setCompRecord({ ...compRecord, [sigModal.field]: dataUrl })
    } else if (sigModal?.type === 'grades') {
      setGrades({ ...grades, [sigModal.field]: dataUrl })
    }
    closeSigModal()
  }

  const clearSig = () => {
    sigPadRef.current?.clear()
  }

  const renderQuestionReview = (q: any, i: number, tNum: number) => {
    const qKey = `t${tNum}q${q.id}`
    const studentAnswer = submission?.answers?.[qKey]
    const grade = grades[qKey]

    // Check if the question has any answers
    let isAttempted = false;
    if (q.type === 'text_inputs') {
      isAttempted = q.textInputs.some((ti: any) => submission?.answers?.[ti.name] && submission.answers[ti.name].trim() !== '');
    } else if (q.type === 'multipart_radio') {
      isAttempted = q.parts.some((part: any) => submission?.answers?.[part.name]);
    } else {
      isAttempted = !!studentAnswer && (Array.isArray(studentAnswer) ? studentAnswer.length > 0 : String(studentAnswer).trim() !== '');
    }

    return (
      <div key={q.id} className="legacy-q-block group relative">
        <div className="legacy-q-num flex items-start gap-2">
          <span className="inline-flex items-center justify-center bg-blue-100 text-[#1e3a8a] w-8 h-8 rounded-full flex-shrink-0 text-sm">{q.id}</span>
          <span className="flex-1">{q.text}</span>
        </div>

        {/* Optional image for question */}
        {q.image && (
          <div className="flex flex-col items-center gap-2 mt-3 mb-2 px-2">
            <div className={`bg-white p-1 sm:p-2 border border-slate-200 shadow-sm rounded-lg w-full ${q.smallImage ? 'max-w-[300px]' : 'max-w-[600px]'}`}>
              <img src={q.image} alt={q.imageCaption || `Question ${q.id} diagram`} className="w-full h-auto rounded" />
            </div>
            {q.imageCaption && (
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{q.imageCaption}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-4 sm:gap-8 items-start ml-0 md:ml-11">
          <div className="md:col-span-3 print:col-span-3">
            <div className={`p-4 sm:p-6 rounded-2xl border-2 mb-4 transition-all ${q.type === 'text' ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                Student Response:
              </p>
              {q.type === 'text' ? (
                <p className="text-slate-800 whitespace-pre-wrap font-medium leading-relaxed italic text-sm sm:text-base">"{studentAnswer || '(No response provided)'}"</p>
              ) : q.type === 'text_inputs' ? (
                <div className="grid grid-cols-1 gap-4">
                  {q.textInputs.map((ti: any, idx: number) => {
                    const ans = submission?.answers?.[ti.name] || '(No response provided)'
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        {ti.image && (
                          <div className="w-32 sm:w-40 bg-slate-50 p-1 rounded-lg border border-slate-100 flex-shrink-0">
                            <img src={ti.image} alt={ti.placeholder || `Input ${idx + 1}`} className="w-full h-12 sm:h-16 object-contain" />
                          </div>
                        )}
                        <div className="flex-1 w-full text-center sm:text-left">
                          <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-wider">{ti.placeholder}</p>
                          <p className="text-[#1e3a8a] font-black text-base sm:text-lg">{ans}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : q.type === 'multipart_radio' ? (
                <div className="grid grid-cols-1 gap-4">
                  {q.parts.map((part: any, pIdx: number) => {
                    const ans = submission?.answers?.[part.name]
                    return (
                      <div key={pIdx} className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="text-xs sm:text-[13px] text-gray-600 italic mb-3 leading-relaxed">{part.text}</div>
                        <div className="grid grid-cols-1 gap-2">
                          {part.options.map((opt: any, idx: number) => {
                            const isSelected = Array.isArray(ans)
                              ? ans.includes(opt.value)
                              : ans === opt.value
                            return (
                              <div key={idx} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${isSelected ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] font-bold scale-[1.02] shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}>
                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>}
                                </div>
                                <span className="text-[13px] sm:text-sm leading-tight">
                                  {opt.text}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : q.type === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {q.headers.map((header: string, hIdx: number) => (
                          <th key={hIdx} className="p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {q.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="border-b border-slate-100 last:border-0">
                          <td className="p-3 text-sm text-slate-700 font-bold bg-slate-50/30 w-1/3">
                            {row.label}
                          </td>
                          {row.cells ? (
                            row.cells.map((cell: any, cIdx: number) => {
                              const ans = submission?.answers?.[cell.name]
                              return (
                                <td key={cIdx} className="p-3 border-l border-slate-100 align-top">
                                  <div className="flex flex-col gap-1.5">
                                    {cell.options ? cell.options.map((opt: any, oIdx: number) => {
                                      const isSelected = Array.isArray(ans) ? ans.includes(opt.value) : ans === opt.value
                                      return (
                                        <div key={oIdx} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${isSelected ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] font-bold shadow-sm' : 'bg-white border-slate-50 text-slate-400 opacity-60'}`}>
                                          <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                          </div>
                                          <span className="text-[10px] leading-tight">{opt.text}</span>
                                        </div>
                                      )
                                    }) : (
                                      <div className="text-[10px] text-slate-700 italic bg-slate-50 p-2 rounded">
                                        {ans || '(No comments provided)'}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              )
                            })
                          ) : (
                            <td className="p-3" colSpan={q.headers.length - 1}>
                              <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[#1e3a8a] font-bold text-sm">
                                {submission?.answers?.[row.id] || '(No response provided)'}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : q.type === 'jsa_table' ? (
                <div className="mt-4 border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-md">
                  {/* Top metadata grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200">
                    {q.fields.slice(0, 4).map((f: any, idx: number) => (
                      <div key={idx} className={`p-3 border-r border-slate-100 last:border-r-0 ${idx === 3 ? 'bg-slate-50' : ''}`}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label}</label>
                        <div className="text-sm font-bold text-[#1e3a8a]">{submission?.answers?.[f.name] || '(Not provided)'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Middle metadata grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200">
                    {q.fields.slice(4, 10).map((f: any, idx: number) => (
                      <div key={idx} className="p-3 border-r border-b border-slate-100 last:border-r-0">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label}</label>
                        <div className="text-sm font-bold text-[#1e3a8a]">{submission?.answers?.[f.name] || '(Not provided)'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom metadata grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
                    {q.fields.slice(10).map((f: any, idx: number) => (
                      <div key={idx} className="p-3 border-r border-slate-100 last:border-r-0">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label}</label>
                        <div className="text-sm font-bold text-[#1e3a8a]">{submission?.answers?.[f.name] || '(Not provided)'}</div>
                      </div>
                    ))}
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
                      </thead>
                      <tbody>
                        {[...Array(q.steps.rowCount)].map((_, rIdx) => (
                          <tr key={rIdx} className="border-t border-slate-200">
                            {[0, 1, 2].map((cIdx) => {
                              const stepKey = `t${tNum}q${q.id}_r${rIdx}c${cIdx}`;
                              const ans = submission?.answers?.[stepKey];
                              return (
                                <td key={cIdx} className="p-3 border-r border-slate-200 last:border-0 align-top">
                                  <div className="p-2 bg-blue-50/50 border border-blue-100 rounded text-slate-800 text-[13px] min-h-[40px] italic">
                                    {ans || '(Empty)'}
                                  </div>
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
                <div className="grid grid-cols-1 gap-2">
                  {q.options ? q.options.map((opt: any, idx: number) => {
                    const isSelected = Array.isArray(studentAnswer)
                      ? studentAnswer.includes(opt.value)
                      : studentAnswer === opt.value
                    return (
                      <div key={idx} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${isSelected ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] font-bold scale-[1.02] shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}>
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-[13px] sm:text-sm leading-tight">
                          {opt.value.length === 1 ? (
                            <strong className={`${isSelected ? 'text-red-100' : 'text-slate-500'} mr-2`}>{opt.value.toUpperCase()})</strong>
                          ) : null}
                          {opt.text}
                        </span>
                      </div>
                    )
                  }) : (
                    <div className="p-3 bg-slate-50 text-slate-500 italic rounded-lg text-sm">
                      {studentAnswer || '(No options or response provided)'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 md:gap-3 sticky top-20 md:top-24 print:static print:justify-center print:h-full print:col-span-1 no-print">
            <button
              onClick={() => setGrades({ ...grades, [qKey]: 'correct' })}
              className={`grading-btn grading-btn-correct flex-1 md:flex-none py-2 px-3 sm:px-4 ${grade === 'correct' ? 'active' : ''}`}
            >
              <CheckCircle2 size={14} /> <span className="text-[10px] sm:text-xs">Correct</span>
            </button>
            <button
              onClick={() => setGrades({ ...grades, [qKey]: 'incorrect' })}
              className={`grading-btn grading-btn-incorrect flex-1 md:flex-none py-2 px-3 sm:px-4 ${grade === 'incorrect' ? 'active' : ''}`}
            >
              <XCircle size={14} /> <span className="text-[10px] sm:text-xs">Incorrect</span>
            </button>
          </div>

          {/* Print-only status badges */}
          <div className="hidden print:flex pdf-grade-col">
            {grade === 'correct' ? (
              <div className="pdf-correct-selected">
                <span className="pdf-icon">✔</span> Correct
              </div>
            ) : grade === 'incorrect' ? (
              <div className="pdf-incorrect-selected">
                <span className="pdf-icon">✘</span> Incorrect
              </div>
            ) : (
              <div className="pdf-not-corrected">Not Corrected</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFinalResultBlock = (tNum: number) => (
    <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-10 final-result-block-container bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
      <div className="space-y-4 sm:space-y-6">
        <h3 className="font-black text-lg sm:text-xl text-slate-800 uppercase tracking-tight border-b-2 border-slate-100 pb-2">Comments/Feedback to Participant</h3>
        <div className="overflow-x-auto">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="flex flex-col sm:table-row">
                  <td className="p-4 sm:p-6 sm:w-2/3 bg-slate-50/50 border-b sm:border-b-0 sm:border-r border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-slate-700 mb-2">Student Declaration:</p>
                    <p className="text-[13px] sm:text-sm text-slate-500 italic leading-relaxed">I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source.</p>
                  </td>
                  <td className="p-4 sm:p-6 sm:w-1/3 text-slate-700 bg-white">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Signature</span>
                        <div className="border-b-2 border-slate-200 h-12 sm:h-14 flex items-center justify-center overflow-hidden p-1">
                          {submission.signature_url ? (
                            <img src={submission.signature_url} alt="Sig" className="max-h-full max-w-full object-contain opacity-60" />
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">No signature</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Date</span>
                        <div className="border-b-2 border-slate-200 flex-1 text-xs sm:text-sm font-bold text-slate-700 h-8 flex items-center">
                          {submission.submitted_at ? formatDisplayDate(new Date(submission.submitted_at).toISOString().split('T')[0]) : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="group transition-all">
          <h4 className="font-black text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-[#1e3a8a]">Assessor's Feedback:</h4>
          <div className="border-2 border-slate-100 rounded-xl sm:rounded-2xl bg-slate-50/30 p-4 sm:p-6 focus-within:border-blue-100 focus-within:bg-white transition-all shadow-inner min-h-[120px] sm:min-h-[160px]">
            <textarea
              className="w-full h-24 sm:h-32 outline-none resize-none text-sm sm:text-base p-1 border-none bg-transparent text-slate-700 font-medium placeholder:text-slate-300"
              placeholder="Provide detailed feedback for this task..."
              value={taskResults[`t${tNum}_feedback`] || ''}
              onChange={(e) => setTaskResults({ ...taskResults, [`t${tNum}_feedback`]: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 py-6 sm:py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <span className="text-sm sm:text-base font-black text-slate-400 uppercase tracking-widest">Outcome:</span>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto px-4 sm:px-0">
          <button
            onClick={() => setTaskResults({ ...taskResults, [`t${tNum}`]: 'S' })}
            className={`w-full sm:w-auto px-6 sm:px-10 py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all border-2 ${taskResults[`t${tNum}`] === 'S' ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xl shadow-blue-200 sm:scale-110' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
          >
            Satisfactory (S)
          </button>
          <button
            onClick={() => setTaskResults({ ...taskResults, [`t${tNum}`]: 'NS' })}
            className={`w-full sm:w-auto px-6 sm:px-10 py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all border-2 ${taskResults[`t${tNum}`] === 'NS' ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-200 sm:scale-110' : 'bg-white text-slate-400 border-slate-200 hover:border-red-400 hover:text-red-600'}`}
          >
            Not Satisfactory (NS)
          </button>
        </div>
      </div>

      <div className="">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="flex flex-col sm:table-row">
                <td className="p-4 sm:p-6 sm:w-2/3 bg-slate-50/50 border-b sm:border-b-0 sm:border-r border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-slate-700 mb-2">Assessor Declaration:</p>
                  <p className="text-[13px] sm:text-sm text-slate-500 italic leading-relaxed">I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.</p>
                </td>
                <td className="p-4 sm:p-6 sm:w-1/3 text-slate-700 bg-white">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Signature</span>
                      <div
                        onClick={() => openSigModal('assessor_signature', 'comp')}
                        className="border-b-2 border-slate-200 h-14 sm:h-16 flex items-center justify-center cursor-pointer relative group bg-slate-50/30 rounded-t-lg transition-all hover:bg-blue-50/50 overflow-hidden p-1"
                      >
                        {compRecord.assessor_signature ? (
                          <img src={compRecord.assessor_signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold group-hover:text-blue-500 transition-colors">Sign Here</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Date</span>
                      <div className="border-b-2 border-slate-200 flex-1">
                        <input
                          type="date"
                          className="w-full outline-none text-xs sm:text-sm font-black text-slate-800 bg-transparent no-print cursor-pointer py-1"
                          value={compRecord.assessment_date}
                          onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                        />
                        <span className="hidden print:inline text-xs sm:text-sm font-black text-slate-800">{formatDisplayDate(compRecord.assessment_date)}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )


  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#eff6ff]">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#1e3a8a] mx-auto mb-4" size={48} />
        <p className="text-gray-600 font-semibold">Loading submission...</p>
      </div>
    </div>
  )

  if (isError || !submission) return (
    <div className="min-h-screen flex items-center justify-center bg-[#eff6ff]">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-blue-100">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Cannot Load Submission</h2>
        <p className="text-gray-600 text-sm mb-2">There was an error loading this submission. This may be a database permissions issue.</p>
        {queryError && <p className="text-red-500 text-xs font-mono bg-blue-50 p-2 rounded mb-4">{(queryError as any)?.message}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
            ← Back to Dashboard
          </button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#1e3a8a] text-white font-bold rounded-lg hover:bg-[#1e40af]">
            Retry
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#eff6ff] print:bg-white min-h-screen pb-20 font-sans">
      {/* Signature Modal */}
      {sigModal?.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1e3a8a] text-white p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold">Assessor Signature</h3>
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

      <div className="sticky top-0 z-50 bg-[#1e3a8a] text-white px-3 sm:px-4 py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between shadow-xl no-print gap-2 md:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-black text-sm sm:text-base leading-none uppercase tracking-tight m-0 p-0 border-none text-left truncate">Reviewing: {submission.student_name}</div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest truncate">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            <span className="whitespace-nowrap">Save Changes</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-blue-900/20"
          >
            <Printer size={14} />
            <span className="whitespace-nowrap">Download</span>
          </button>
        </div>
      </div>

      {/* Cover page: hidden on screen, shown only when printing */}
      <div className="cover-page" id="pg-cover">
        <div className="cover-border-outer"></div>
        <div className="cover-border-middle"></div>
        <div className="cover-border-inner"></div>
        <div className="cover">
          <img
            src="/assets/Skilscope.png"
            alt="Skilscope Logo"
            className="w-32 h-32 object-contain mb-6"
          />
          <div className="cover-title">{currentAssessmentQuestions.metadata?.title || 'Assessment Booklet'}</div>
          <div className="cover-unit">{currentAssessmentQuestions.metadata?.code || 'ICTCBL246 & ICTCBL247'}</div>
          <div className="cover-course" dangerouslySetInnerHTML={{ __html: (currentAssessmentQuestions.metadata?.course || 'Install, Maintain and Modify Customer Premises<br />Communications Cabling:<br />ACMA Restricted Rule & Open Rule').replace(/\n/g, '<br />') }}></div>
          <div className="cover-student">Student Name: <span className="font-bold border-b border-black inline-block min-w-0 sm:min-w-[200px] text-center px-4">{submission.student_name}</span></div>
        </div>
      </div>

      <div className="max-w-[850px] mx-auto bg-white mt-0 sm:mt-8 shadow-sm border rounded-sm p-4 sm:p-8 md:p-12 paper review-mode overflow-visible">
        {/* Header Info */}
        {/* New Header UI matching the image */}
        <div className="space-y-6 mb-12">
          {/* Student Info Box */}
          <div className="border-2 border-black p-4 space-y-4 text-black bg-gray-50/30 break-inside-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Student Name:</span>
              <span className="font-bold text-base">{submission.student_name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Student ID:</span>
              <span className="font-bold text-base">{submission.student_id || '—'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Date:</span>
              <span className="font-bold text-base">{formatDisplayDate(submission.answers?.['st-date'])}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Signature:</span>
              <div className="border border-black h-20 flex items-center justify-center bg-white w-full overflow-hidden p-1">
                {submission.signature_url ? (
                  <img src={submission.signature_url} alt="Sig" className="max-h-full max-w-full object-contain" />
                ) : <span className="text-gray-400 italic text-sm">No signature</span>}
              </div>
            </div>
          </div>

          {/* Assessor Info Box */}
          <div className="border-2 border-black p-4 space-y-4 text-black bg-gray-50/30 break-inside-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Assessor's Name:</span>
              <input
                type="text"
                className="w-full border border-black p-2 outline-none focus:bg-blue-50 font-bold"
                placeholder="Enter assessor name..."
                value={compRecord.assessor_name}
                onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Assessment Site:</span>
              <input
                type="text"
                className="w-full border border-black p-2 outline-none focus:bg-blue-50"
                placeholder="Enter assessment site..."
                value={compRecord.assessment_site}
                onChange={(e) => setCompRecord({ ...compRecord, assessment_site: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Assessment Date/s:</span>
              <div className="flex-1 flex items-center">
                <input
                  type="date"
                  className="w-full border border-black p-2 outline-none focus:bg-blue-50 no-print"
                  value={compRecord.assessment_date}
                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                />
                <span className="hidden print:inline font-bold text-base ml-2">{formatDisplayDate(compRecord.assessment_date)}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] items-start sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm">Signature:</span>
              <div
                onClick={() => openSigModal('assessor_signature', 'comp')}
                className="relative cursor-pointer border border-black bg-white h-20 flex items-center justify-center overflow-hidden group w-full p-1"
              >
                {compRecord.assessor_signature ? (
                  <img src={compRecord.assessor_signature} alt="Signature" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-gray-400 italic text-sm">Click here to sign</span>
                )}
                <div className="absolute right-2 bottom-1 text-[9px] text-blue-600 font-bold flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-2 py-0.5 rounded shadow-sm border border-blue-100">
                  <span>✎ EDIT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Use Only Section - Match PDF exactly */}
        {currentAssessmentQuestions.adminInfo && !currentAssessmentQuestions.adminInfo.hideAdminUseOnly && (
          <div className="border-2 border-slate-400 mb-12 no-print-section break-inside-avoid">
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] p-3 font-bold text-white uppercase tracking-wider text-sm border-l-4 border-[#fbbf24]">
              {(currentAssessmentQuestions.adminInfo.markingGuide && currentAssessmentQuestions.metadata.code !== 'ICTCBL303') ? "Asseror’s Marking Guide Instructions" : "Administrative Use Only:"}
            </div>
            <div className="p-4 bg-white space-y-4 text-sm">
              <div className="flex flex-wrap gap-8 items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl text-slate-400">❑</span>
                  <span className="font-medium text-slate-600">Entered into Student Management Database</span>
                </div>
                <div className="flex items-center gap-2">

                  <span className="font-medium text-slate-600">Signature/Initial:</span>
                  <div
                    onClick={() => openSigModal('assessor_signature', 'comp')}
                    className="border-b border-slate-400 min-w-0 sm:min-w-[120px] h-10 flex items-center justify-center cursor-pointer relative bg-slate-50/50 hover:bg-slate-100 transition-colors group flex-1 overflow-hidden p-1"
                  >
                    {compRecord.assessor_signature ? (
                      <img src={compRecord.assessor_signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Click to sign</span>
                    )}
                    <div className="absolute -right-6 bottom-1 text-[8px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      EDIT
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">Date:</span>
                  <input
                    type="date"
                    className="w-32 border-b border-slate-400 outline-none focus:border-[#1e3a8a] transition-colors bg-transparent px-1 no-print"
                    value={compRecord.assessment_date}
                    onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                  />
                  <span className="hidden print:inline border-b border-slate-400 min-w-[100px] px-2">{formatDisplayDate(compRecord.assessment_date)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-0 border border-slate-200">
                {(currentAssessmentQuestions.adminInfo.markingGuide
                  ? currentAssessmentQuestions.adminInfo.markingGuide.map((item: any) => [item.label, item.content])
                  : [
                    ["Unit Code/Name", currentAssessmentQuestions.adminInfo.unitCodeName],
                    ["Pre-requisites", currentAssessmentQuestions.adminInfo.preRequisites],
                    ["Co-requisites", currentAssessmentQuestions.adminInfo.coRequisites],
                    ["Unit Summary", currentAssessmentQuestions.adminInfo.unitSummary],
                    ["Target Group", currentAssessmentQuestions.adminInfo.targetGroup],
                    ["Conditions and Context of the Assessments", currentAssessmentQuestions.adminInfo.conditionsAndContext],
                    ["Specific Resources Required", currentAssessmentQuestions.adminInfo.specificResources],
                    ["Re-Assessment", currentAssessmentQuestions.adminInfo.reAssessment],
                    ["Plagiarism", currentAssessmentQuestions.adminInfo.plagiarism],
                    ["Complaints and appeal", currentAssessmentQuestions.adminInfo.complaintsAndAppeals],
                    ["Assessors Intervention", currentAssessmentQuestions.adminInfo.assessorsIntervention],
                    ["Attaching Documents", currentAssessmentQuestions.adminInfo.attachingDocuments],
                    ["Assessment Instruction", currentAssessmentQuestions.adminInfo.assessmentInstruction],
                    ...(currentAssessmentQuestions.adminInfo.taskOverviews
                      ? currentAssessmentQuestions.adminInfo.taskOverviews.map((task: any) => [task.id.replace(':', ''), task.text])
                      : [
                        ["Assessment Task 1", currentAssessmentQuestions.adminInfo.task1Description],
                        ["Assessment Task 2", currentAssessmentQuestions.adminInfo.task2Description],
                        ["Assessment Task 3", currentAssessmentQuestions.adminInfo.task3Description],
                        ...(currentAssessmentQuestions.adminInfo.task4Description
                          ? [["Assessment Task 4", currentAssessmentQuestions.adminInfo.task4Description]]
                          : []),
                        ...(currentAssessmentQuestions.adminInfo.task5Description
                          ? [["Assessment Task 5", currentAssessmentQuestions.adminInfo.task5Description]]
                          : []),
                        ...(currentAssessmentQuestions.adminInfo.task6Description
                          ? [["Assessment Task 6", currentAssessmentQuestions.adminInfo.task6Description]]
                          : [])
                      ]),
                    ["Competency Decision", currentAssessmentQuestions.adminInfo.competencyDecision]
                  ]).map(([label, value]: any, idx: number) => (
                    <div key={idx} className="flex flex-col md:grid md:grid-cols-[250px_1fr] border-b border-slate-200 last:border-0">
                      <div className="bg-slate-50 p-3 font-bold text-slate-700 md:border-r border-slate-200 text-xs uppercase tracking-wider">{label}</div>
                      <div className="p-3 text-slate-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{value}</div>
                    </div>
                  ))}
              </div>

              {/* New Overview Sections for Question 13 / ICTCBL301 */}
              {currentAssessmentQuestions.adminInfo.tasksOverview && (
                <div className="mt-8 space-y-8 no-print-section">
                  {/* Tasks Overview */}
                  <div className="border-2 border-slate-400 break-inside-avoid">
                    <div className="bg-[#1e3a8a] p-3 font-bold text-white uppercase tracking-wider text-sm">
                      {currentAssessmentQuestions.adminInfo.tasksOverview.title}
                    </div>
                    <div className="p-4 bg-white space-y-4 text-sm text-slate-700">
                      <p className="whitespace-pre-wrap">{currentAssessmentQuestions.adminInfo.tasksOverview.intro}</p>
                      <ul className="list-decimal ml-6 space-y-1">
                        {currentAssessmentQuestions.adminInfo.tasksOverview.elements.map((el: string, i: number) => (
                          <li key={i}>{el}</li>
                        ))}
                      </ul>
                      <p className="font-bold mt-4">{currentAssessmentQuestions.adminInfo.tasksOverview.evidenceIntro}</p>
                      <ul className="list-disc ml-6 space-y-1">
                        {currentAssessmentQuestions.adminInfo.tasksOverview.evidenceItems.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                      <p className="mt-6 font-medium italic text-blue-800">{currentAssessmentQuestions.adminInfo.tasksOverview.summary}</p>
                      <div className="overflow-x-auto mt-2">
                        <table className="w-full border-collapse border border-slate-300">
                          <tbody>
                            {currentAssessmentQuestions.adminInfo.tasksOverview.tasks.map((task: any, i: number) => (
                              <tr key={i}>
                                <td className="border border-slate-300 p-3 bg-slate-50 font-bold w-[180px]">{task.id}</td>
                                <td className="border border-slate-300 p-3 bg-slate-50 w-[120px]">{task.type}</td>
                                <td className="border border-slate-300 p-3 leading-relaxed">{task.text}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Recording Assessment */}
                  <div className="border-2 border-slate-400 break-inside-avoid">
                    <div className="bg-[#1e3a8a] p-3 font-bold text-white uppercase tracking-wider text-sm">
                      {currentAssessmentQuestions.adminInfo.recordingAssessment.title}
                    </div>
                    <div className="p-4 bg-white text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {currentAssessmentQuestions.adminInfo.recordingAssessment.content}
                    </div>
                  </div>

                  {/* Assessment of Competency */}
                  <div className="border-2 border-slate-400 break-inside-avoid">
                    <div className="bg-[#1e3a8a] p-3 font-bold text-white uppercase tracking-wider text-sm">
                      {currentAssessmentQuestions.adminInfo.competencyAssessment.title}
                    </div>
                    <div className="p-4 bg-white space-y-4 text-sm text-slate-700">
                      <p className="whitespace-pre-wrap leading-relaxed">{currentAssessmentQuestions.adminInfo.competencyAssessment.content}</p>
                      <div className="flex flex-wrap gap-8 ml-4">
                        {currentAssessmentQuestions.adminInfo.competencyAssessment.criteria.map((c: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="font-bold">{c}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1 mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {currentAssessmentQuestions.adminInfo.competencyAssessment.codes.map((item: any, i: number) => (
                          <div key={i} className="flex gap-4 text-xs">
                            <span className="font-bold w-12 text-blue-700">{item.code}</span>
                            <span className="text-slate-400">-</span>
                            <span className="font-medium">{item.text}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 pt-4 border-t border-slate-200 italic text-slate-500 text-xs">{currentAssessmentQuestions.adminInfo.competencyAssessment.footer}</p>
                    </div>
                  </div>

                  {/* Assessor Feedback Overview */}
                  <div className="border-2 border-slate-400 break-inside-avoid">
                    <div className="bg-[#1e3a8a] p-3 font-bold text-white uppercase tracking-wider text-sm">
                      {currentAssessmentQuestions.adminInfo.assessorFeedback.title}
                    </div>
                    <div className="p-4 bg-white text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                      {currentAssessmentQuestions.adminInfo.assessorFeedback.content}
                    </div>
                  </div>

                  {/* Cover Sheet Overview */}
                  <div className="border-2 border-slate-400 break-inside-avoid">
                    <div className="bg-[#1e3a8a] p-3 font-bold text-white uppercase tracking-wider text-sm">
                      {currentAssessmentQuestions.adminInfo.coverSheet.title}
                    </div>
                    <div className="p-4 bg-white text-sm text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
                      {currentAssessmentQuestions.adminInfo.coverSheet.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Reasonable Adjustment Section */}
              {currentAssessmentQuestions.adminInfo.reasonableAdjustment && (
                <div className="mt-8 border-2 border-slate-400 break-inside-avoid">
                  <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] p-3 font-bold text-white uppercase tracking-wider text-sm border-l-4 border-[#fbbf24]">
                    Reasonable Adjustment
                  </div>
                  <div className="p-4 bg-white space-y-4 text-[11px]">
                    <p className="text-slate-600 leading-relaxed">{currentAssessmentQuestions.adminInfo.reasonableAdjustment}</p>
                    <div className="hidden md:block">
                      <table className="w-full border-collapse border border-slate-300">
                        <thead className="bg-slate-50 text-slate-700">
                          <tr>
                            <th className="border border-slate-300 p-2 text-left w-1/3 font-bold">Reasonable Adjustment Provided</th>
                            <th className="border border-slate-300 p-2 text-left w-1/3 font-bold">Reason for Reasonable Adjustment</th>
                            <th className="border border-slate-300 p-2 text-left w-1/3 font-bold">Outcome</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 p-2 align-top">
                              <div className="space-y-2">
                                {[
                                  "Educational and bilingual support",
                                  "Presenting questions orally",
                                  "Presenting work instructions in diagrammatic or pictorial form instead of words and sentences",
                                  "Extra time to complete a course or assessment",
                                  "Others:"
                                ].map((adj, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="text-slate-600 leading-tight">{adj}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="border border-slate-300 p-2 align-top">
                              <textarea
                                className="w-full h-full min-h-[120px] p-2 outline-none resize-none bg-transparent text-sm"
                                placeholder="Enter reason here..."
                                value={compRecord.reasonable_adjustment?.reason || ''}
                                onChange={(e) => setCompRecord({
                                  ...compRecord,
                                  reasonable_adjustment: { ...compRecord.reasonable_adjustment, reason: e.target.value }
                                })}
                              />
                            </td>
                            <td className="border border-slate-300 p-2 align-top">
                              <textarea
                                className="w-full h-full min-h-[120px] p-2 outline-none resize-none bg-transparent text-sm"
                                placeholder="Enter outcome here..."
                                value={compRecord.reasonable_adjustment?.outcome || ''}
                                onChange={(e) => setCompRecord({
                                  ...compRecord,
                                  reasonable_adjustment: { ...compRecord.reasonable_adjustment, outcome: e.target.value }
                                })}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-6">
                      <div className="space-y-3">
                        <div className="font-bold text-slate-700">Adjustments Provided:</div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                          {[
                            "Educational and bilingual support",
                            "Presenting questions orally",
                            "Presenting work instructions in diagrammatic or pictorial form instead of words and sentences",
                            "Extra time to complete a course or assessment",
                            "Others:"
                          ].map((adj, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-slate-600 text-xs leading-tight">• {adj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="font-bold text-slate-700">Reason:</div>
                        <textarea
                          className="w-full min-h-[100px] p-3 bg-white border border-slate-200 rounded-xl outline-none resize-none text-sm"
                          placeholder="Enter reason..."
                          value={compRecord.reasonable_adjustment?.reason || ''}
                          onChange={(e) => setCompRecord({
                            ...compRecord,
                            reasonable_adjustment: { ...compRecord.reasonable_adjustment, reason: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="font-bold text-slate-700">Outcome:</div>
                        <textarea
                          className="w-full min-h-[100px] p-3 bg-white border border-slate-200 rounded-xl outline-none resize-none text-sm"
                          placeholder="Enter outcome..."
                          value={compRecord.reasonable_adjustment?.outcome || ''}
                          onChange={(e) => setCompRecord({
                            ...compRecord,
                            reasonable_adjustment: { ...compRecord.reasonable_adjustment, outcome: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Sheet Info */}
              <div className="mt-8 p-6 bg-slate-50 border-4 border-double border-slate-300 text-center space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">COVER SHEET FOR SUBMISSION OF WORK FOR ASSESSMENT</h2>
                <p className="text-sm text-slate-600 font-medium">{currentAssessmentQuestions.adminInfo.coverSheetInstruction}</p>
                <div className="text-xs text-slate-400 italic">Work submitted without a signed cover sheet will be returned unmarked.</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-16">
          {Object.keys(currentAssessmentQuestions)
            .filter(key => key.startsWith('task')) // Only process task1, task2, etc.
            .sort((a, b) => {
              const aNum = parseInt(a.replace('task', ''));
              const bNum = parseInt(b.replace('task', ''));
              return aNum - bNum;
            })
            .map((taskKey) => {
              const tNum = parseInt(taskKey.replace('task', ''));
              const taskData = currentAssessmentQuestions[taskKey];

              // Case 1: plain array of question objects
              const isPlainArray = Array.isArray(taskData) && taskData.length > 0 && typeof taskData[0] === 'object';
              // Case 2: object with a nested .questions array
              const hasNestedQuestions = !Array.isArray(taskData) && Array.isArray((taskData as any)?.questions);

              const oralQuestions = (taskData as any).checklistItems || (taskData as any).oral || (taskData as any).items || [];
              const perfQuestions = (taskData as any).performance || [];
              const observationItems = (taskData as any).observationItems || [];
              const observationList = (taskData as any).observationList || [];
              const hasChecklist = oralQuestions.length > 0 || perfQuestions.length > 0 || observationItems.length > 0 || observationList.length > 0;

              const questionsArray: any[] = isPlainArray
                ? taskData
                : (taskData as any).questions || [];
              const hasQuestions = questionsArray.length > 0;

              let taskTitle: string;
              if ((taskData as any).title) {
                taskTitle = (taskData as any).title;
              } else if (currentAssessmentQuestions.metadata?.code === 'ICTCBL322' && tNum === 1) {
                taskTitle = 'ASSESSMENT TASK 1 – WRITTEN QUESTIONS AND ANSWERS';
              } else {
                const typeLabel = tNum === 4 ? 'WRITTEN QUESTIONS AND ANSWERS' : tNum === 5 ? 'WRITTEN ASSESSMENT' : tNum === 6 ? 'MULTIPLE CHOICE QUESTIONS' : `TASK ${tNum}`;
                taskTitle = `ASSESSMENT TASK ${tNum} – ${typeLabel}`;
              }

              return (
                <section key={taskKey} className="space-y-12 page-break-before">
                  {/* Observation Section - Only show if observation data exists */}
                  {(taskData.observationTitle || taskData.observationSubtitle || taskData.sections || taskData.assessorSections) && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="task-banner-ribbon">
                          {taskData.observationTitle || (hasQuestions ? taskTitle : `ASSESSMENT TASK ${tNum} OBSERVATION`)}
                        </div>
                        {taskData.observationSubtitle && (
                          <div className="text-lg font-bold text-slate-600 border-y border-slate-200 py-2 mt-4">
                            {taskData.observationSubtitle}
                          </div>
                        )}
                      </div>

                      {(taskData.sections || taskData.assessorSections) && (
                        <div className="space-y-4">
                          {[
                            ...(taskData.sections || []),
                            ...(taskData.assessorSections || []).map((s: any) => ({ ...s, isAssessorOnly: true }))
                          ].map((section: any, sIdx: number) => (
                            <div key={sIdx} className="space-y-3">
                              {section.type === 'text' && (
                                <div className={`space-y-2 ${sIdx === 0 ? '' : 'bg-slate-50 border border-slate-200 rounded-xl p-4'}`}>
                                  {section.title && (
                                    <h3 className={`font-bold text-slate-800 pb-1 ${sIdx === 0 ? 'text-base border-b border-slate-200' : 'text-sm text-[#1e3a8a] border-b-2 border-[#1e3a8a]/20'}`}>
                                      {section.title}
                                    </h3>
                                  )}
                                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {section.content}
                                  </div>
                                </div>
                              )}
                              {section.type === 'image' && (
                                <div className="flex flex-col items-center gap-2 py-4">
                                  <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-lg max-w-[550px]">
                                    <img src={section.src} alt={section.caption || 'Observation'} className="w-full h-auto rounded" />
                                  </div>
                                  {section.caption && (
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                      {section.caption}
                                    </span>
                                  )}
                                </div>
                              )}
                              {section.type === 'table' && (
                                <div className="space-y-4 px-2">
                                  {section.title && (
                                    <h3 className="font-bold text-slate-800 pb-2 text-base border-b border-slate-200">
                                      {section.title}
                                    </h3>
                                  )}
                                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                          {section.headers.map((header: string, hIdx: number) => (
                                            <th key={hIdx} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {section.rows.map((row: any, rIdx: number) => {
                                          if (row.isSubHeader) {
                                            return (
                                              <tr key={rIdx} className="bg-slate-100/80 border-b border-slate-200">
                                                <td colSpan={section.headers.length} className="p-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                  {row.label}
                                                </td>
                                              </tr>
                                            )
                                          }
                                          return (
                                            <tr key={rIdx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                              <td className="p-4 text-sm text-slate-700 font-bold bg-slate-50/30 w-1/3">
                                                {row.label}
                                              </td>
                                              {row.cells ? (
                                                row.cells.map((cell: any, cIdx: number) => {
                                                  const isAssessorInput = taskData.assessorOnly || section.isAssessorOnly;
                                                  const ans = isAssessorInput ? grades[cell.name] : submission?.answers?.[cell.name]
                                                  return (
                                                    <td key={cIdx} colSpan={row.colSpan || 1} className="p-4 border-l border-slate-100 align-top">
                                                      <div className="flex flex-col gap-1.5">
                                                        {cell.options ? cell.options.map((opt: any, oIdx: number) => {
                                                          const isSelected = Array.isArray(ans) ? ans.includes(opt.value) : ans === opt.value

                                                          if (isAssessorInput) {
                                                            if (isQuestion15) {
                                                              // Q15: each cell has exactly ONE option (Yes OR No per cell).
                                                              // Detect the intent by the option value itself.
                                                              const isYes = ['Yes','yes','Satisfactory','S','C','Completed'].includes(opt.value);
                                                              const q15Checked = grades[cell.name] === opt.value;
                                                              return (
                                                                <div
                                                                  key={oIdx}
                                                                  className="flex items-center justify-center cursor-pointer select-none"
                                                                  title={q15Checked ? `Uncheck ${opt.value}` : `Check ${opt.value}`}
                                                                  onClick={() => {
                                                                    // Toggle: clicking the same value unchecks it
                                                                    const newVal = grades[cell.name] === opt.value ? null : opt.value;
                                                                    setGrades({ ...grades, [cell.name]: newVal });
                                                                  }}
                                                                >
                                                                  <div className={`w-[22px] h-[22px] border-2 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 ${q15Checked ? (isYes ? 'bg-green-500 border-green-600 shadow-sm' : 'bg-red-500 border-red-600 shadow-sm') : 'bg-white border-slate-300 hover:border-[#1e3a8a] hover:bg-blue-50'}`}>
                                                                    {q15Checked && (
                                                                      <span className="text-white font-black text-[13px] leading-none select-none">{isYes ? '✔' : '✘'}</span>
                                                                    )}
                                                                  </div>
                                                                  {/* Hidden checkbox for print/form purposes */}
                                                                  <input type="checkbox" checked={q15Checked} onChange={() => {}} className="sr-only" />
                                                                  {/* Print symbols */}
                                                                  {q15Checked && isYes && <span className="print-symbol correct">✔</span>}
                                                                  {q15Checked && !isYes && <span className="print-symbol incorrect">✘</span>}
                                                                  {opt.text && <span className="text-[10px] sm:text-[11px] text-slate-600 leading-tight ml-1.5">{opt.text}</span>}
                                                                </div>
                                                              )
                                                            }
                                                            return (
                                                              <label key={oIdx} className="flex items-center gap-2 cursor-pointer group">
                                                                <input
                                                                  type={cell.type || 'radio'}
                                                                  name={cell.name}
                                                                  value={opt.value}
                                                                  checked={isSelected}
                                                                  onChange={(e) => {
                                                                    if (cell.type === 'checkbox') {
                                                                      const current = Array.isArray(grades[cell.name]) ? grades[cell.name] : [];
                                                                      const updated = e.target.checked
                                                                        ? [...current, opt.value]
                                                                        : current.filter((v: string) => v !== opt.value);
                                                                      setGrades({ ...grades, [cell.name]: updated });
                                                                    } else {
                                                                      setGrades({ ...grades, [cell.name]: e.target.value });
                                                                    }
                                                                  }}
                                                                  className="w-3.5 h-3.5 accent-[#1e3a8a] cursor-pointer"
                                                                />
                                                                <span className="text-[10px] sm:text-[11px] text-slate-600 group-hover:text-[#1e3a8a] transition-colors leading-tight">{opt.text}</span>
                                                              </label>
                                                            )
                                                          }

                                                          return (
                                                            <div key={oIdx} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${isSelected ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] font-bold shadow-sm' : 'bg-white border-slate-50 text-slate-400 opacity-60'}`}>
                                                              <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-white bg-white/20' : 'border-slate-200'}`}>
                                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                              </div>
                                                              <span className="text-[10px] leading-tight">{opt.text}</span>
                                                            </div>
                                                          )
                                                        }) : (
                                                          isAssessorInput ? (
                                                            cell.type === 'signature' ? (
                                                              <div
                                                                onClick={() => openSigModal(cell.name, 'grades')}
                                                                className="relative cursor-pointer border border-slate-200 bg-slate-50/50 h-16 flex items-center justify-center overflow-hidden group w-full p-1 rounded"
                                                              >
                                                                {grades[cell.name] ? (
                                                                  <img src={grades[cell.name]} alt="Signature" className="max-h-full max-w-full object-contain" />
                                                                ) : (
                                                                  <span className="text-slate-400 italic text-xs">Click to sign</span>
                                                                )}
                                                              </div>
                                                            ) : cell.type === 'date' ? (
                                                              <input
                                                                type="date"
                                                                className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
                                                                value={grades[cell.name] || ''}
                                                                onChange={(e) => setGrades({ ...grades, [cell.name]: e.target.value })}
                                                              />
                                                            ) : (
                                                              <input
                                                                type="text"
                                                                className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
                                                                placeholder={cell.placeholder || "Comments..."}
                                                                value={grades[cell.name] || ''}
                                                                onChange={(e) => setGrades({ ...grades, [cell.name]: e.target.value })}
                                                              />
                                                            )
                                                          ) : (
                                                            <div className="text-[10px] text-slate-700 italic bg-slate-50 p-2 rounded">
                                                              {ans || '(No comments provided)'}
                                                            </div>
                                                          )
                                                        )}
                                                      </div>
                                                    </td>
                                                  )
                                                })
                                              ) : (
                                                <td className="p-4" colSpan={section.headers.length - 1}>
                                                  {row.editable === false ? (
                                                    <div className="text-sm text-slate-700 font-medium">
                                                      {row.value}
                                                    </div>
                                                  ) : (
                                                    (taskData.assessorOnly || section.isAssessorOnly) ? (
                                                      <input
                                                        type="text"
                                                        className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all"
                                                        placeholder="Enter result..."
                                                        value={grades[row.id] || ''}
                                                        onChange={(e) => setGrades({ ...grades, [row.id]: e.target.value })}
                                                      />
                                                    ) : (
                                                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[#1e3a8a] font-black text-sm min-h-[40px] flex items-center">
                                                        {submission?.answers?.[row.id] || <span className="text-slate-300 font-normal italic">(No result provided)</span>}
                                                      </div>
                                                    )
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

                  {/* Written Questions Section */}
                  {hasQuestions && (
                    <div className="space-y-10 px-4">
                      {questionsArray.map((q: any, i: number) => renderQuestionReview(q, i, tNum))}
                    </div>
                  )}

                  {/* Assessor Checklist Section */}
                  {hasChecklist && !currentAssessmentQuestions.adminInfo?.hideAssessorChecklist && (
                    <div className="pt-12 space-y-8 border-t-4 border-double border-slate-200">
                      <div className="text-center">
                        <div className="task-banner-ribbon">
                          {taskData.checklistTitle || `ASSESSMENT TASK ${tNum} – ASSESSOR CHECKLIST`}
                        </div>
                      </div>

                      {taskData.assessorInstructions && (
                        <div className="space-y-4">
                          {taskData.checklistIntro && (
                            <div className="text-sm text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                              {taskData.checklistIntro}
                            </div>
                          )}
                          <div className="text-sm text-slate-500 italic bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 whitespace-pre-wrap">
                            {taskData.assessorInstructions}
                          </div>
                        </div>
                      )}


                      {/* Observation List Section (Plain) - Matching PDF */}
                      {observationList.length > 0 && (
                        <div className="space-y-4 w-full max-w-2xl mx-auto py-6 px-4 md:px-0">
                          <h4 className="font-bold text-black text-sm">The following was observed during the observations:</h4>
                          <div className="space-y-2 ml-4">
                            {observationList.map((item: string, idx: number) => (
                              <div key={idx} className="flex gap-2 py-1 border-b border-slate-50 last:border-0">
                                <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                                <span className="text-sm text-slate-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Observations List Section (With Checkboxes) - Matching PDF */}
                      {observationItems.length > 0 && (
                        <div className="space-y-4 w-full max-w-2xl mx-auto py-6 px-4 md:px-0">
                          <h4 className="font-bold text-black text-sm">The following was observed during the observations:</h4>
                          <div className="space-y-2 ml-4">
                            {observationItems.map((item: string, idx: number) => {
                              const obsKey = `t${tNum}obs${idx}`;
                              const isObserved = grades[obsKey] === true;
                              return (
                                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                                  <div className="flex gap-2 items-center">
                                    <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                                    <span className="text-sm text-slate-700">{item}</span>
                                  </div>
                                  <div
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => setGrades({ ...grades, [obsKey]: !isObserved })}
                                  >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isObserved ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                      {isObserved ? <span className="text-xs">✔</span> : <span className="text-transparent">❑</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isObserved ? 'text-blue-600' : 'text-slate-400'}`}>Observation 1</span>
                                  </div>
                                </div>
                              );
                            })}


                          </div>
                        </div>
                      )}

                      <div className="hidden md:block">
                        {taskData.oralHeader && (
                          <h4 className="text-lg font-bold text-slate-800 mt-6 mb-4">{taskData.oralHeader}</h4>
                        )}
                        <table className="legacy-review-tbl w-full">
                          <thead>
                            <tr>
                              <th className="left">{taskData.checklistLabel || 'Checklist'}</th>
                              <th colSpan={2} className="text-center">Yes / No</th>
                              <th>Comments</th>
                            </tr>
                            <tr className="bg-gray-100">
                              <th className="left text-[10px] py-1">Date Observed:</th>
                              <th colSpan={3} className="py-1 text-left px-4">
                                <input
                                  type="date"
                                  className="border-none outline-none bg-transparent text-[10px] font-bold no-print"
                                  value={compRecord.assessment_date}
                                  onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                                />
                                <span className="hidden print:inline text-[10px] font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {oralQuestions.map((q: string, i: number) => {
                              const qKey = `t${tNum}q${i + 1}`;
                              const isCorrect = grades[qKey] === 'correct';
                              const isIncorrect = grades[qKey] === 'incorrect';
                              return (
                                <tr key={i}>
                                  <td className="text-sm py-4 whitespace-pre-wrap align-top">{i + 1}. {q}</td>
                                  <td className="legacy-chk-col">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={isCorrect}
                                        onChange={() => setGrades({ ...grades, [qKey]: isCorrect ? null : 'correct' })}
                                        className="correct-box"
                                      />
                                      <span className="text-[10px] font-bold">Yes</span>
                                    </div>
                                    {isCorrect && <span className="print-symbol correct">✔</span>}
                                  </td>
                                  <td className="legacy-chk-col">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={isIncorrect}
                                        onChange={() => setGrades({ ...grades, [qKey]: isIncorrect ? null : 'incorrect' })}
                                        className="incorrect-box"
                                      />
                                      <span className="text-[10px] font-bold">No</span>
                                    </div>
                                    {isIncorrect && <span className="print-symbol incorrect">✘</span>}
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="legacy-cmt-input"
                                      value={grades[`${qKey}_cmt`] || ''}
                                      onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                            {perfQuestions.length > 0 && (
                              <>
                                <tr className="bg-slate-100">
                                  <td colSpan={4} className="p-3 font-bold text-slate-800">
                                    {taskData.performanceHeader || 'Evidence of Performance'}
                                  </td>
                                </tr>
                                {perfQuestions.map((q: string, i: number) => {
                                  const qKey = `t${tNum}pq${i + oralQuestions.length + 1}`;
                                  const isCorrect = grades[qKey] === 'correct';
                                  const isIncorrect = grades[qKey] === 'incorrect';
                                  return (
                                    <tr key={i}>
                                      <td className="text-sm py-4 whitespace-pre-wrap align-top">{i + oralQuestions.length + 1}. {q}</td>
                                      <td className="legacy-chk-col">
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="checkbox"
                                            checked={isCorrect}
                                            onChange={() => setGrades({ ...grades, [qKey]: isCorrect ? null : 'correct' })}
                                            className="correct-box"
                                          />
                                          <span className="text-[10px] font-bold">Yes</span>
                                        </div>
                                        {isCorrect && <span className="print-symbol correct">✔</span>}
                                      </td>
                                      <td className="legacy-chk-col">
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="checkbox"
                                            checked={isIncorrect}
                                            onChange={() => setGrades({ ...grades, [qKey]: isIncorrect ? null : 'incorrect' })}
                                            className="incorrect-box"
                                          />
                                          <span className="text-[10px] font-bold">No</span>
                                        </div>
                                        {isIncorrect && <span className="print-symbol incorrect">✘</span>}
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          className="legacy-cmt-input"
                                          value={grades[`${qKey}_cmt`] || ''}
                                          onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Checklist View */}
                      <div className="md:hidden space-y-6">
                        <div className="bg-slate-100 p-4 rounded-xl space-y-2">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Observed</div>
                          <input
                            type="date"
                            className="w-full p-2 bg-white rounded-lg border border-slate-200 outline-none text-sm font-bold no-print"
                            value={compRecord.assessment_date}
                            onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                          />
                        </div>

                        <div className="divide-y divide-slate-100 border-y border-slate-100">
                          {oralQuestions.map((q: string, i: number) => {
                            const qKey = `t${tNum}q${i + 1}`;
                            return (
                              <div key={i} className="py-6 space-y-4">
                                <div className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{i + 1}. {q}</div>
                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <input
                                      type="checkbox"
                                      checked={grades[qKey] === 'correct'}
                                      onChange={() => setGrades({ ...grades, [qKey]: grades[qKey] === 'correct' ? null : 'correct' })}
                                      className="w-5 h-5 accent-green-600"
                                    />
                                    <span className="text-xs font-black uppercase text-slate-600">Yes</span>
                                  </div>
                                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <input
                                      type="checkbox"
                                      checked={grades[qKey] === 'incorrect'}
                                      onChange={() => setGrades({ ...grades, [qKey]: grades[qKey] === 'incorrect' ? null : 'incorrect' })}
                                      className="w-5 h-5 accent-red-600"
                                    />
                                    <span className="text-xs font-black uppercase text-slate-600">No</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessor Comments</span>
                                  <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                                    placeholder="Add comment..."
                                    value={grades[`${qKey}_cmt`] || ''}
                                    onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                                  />
                                </div>
                              </div>
                            );
                          })}

                          {perfQuestions.length > 0 && (
                            <div className="pt-8">
                              <div className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">Evidence of Performance</div>
                              {perfQuestions.map((q: string, i: number) => {
                                const qKey = `t${tNum}pq${i + oralQuestions.length + 1}`;
                                return (
                                  <div key={i} className="py-6 space-y-4 border-t border-slate-100">
                                    <div className="text-sm text-slate-800 font-medium leading-relaxed">{i + oralQuestions.length + 1}. {q}</div>
                                    <div className="flex flex-wrap items-center gap-4">
                                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <input
                                          type="checkbox"
                                          checked={grades[qKey] === 'correct'}
                                          onChange={() => setGrades({ ...grades, [qKey]: grades[qKey] === 'correct' ? null : 'correct' })}
                                          className="w-5 h-5 accent-green-600"
                                        />
                                        <span className="text-xs font-black uppercase text-slate-600">Yes</span>
                                      </div>
                                      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <input
                                          type="checkbox"
                                          checked={grades[qKey] === 'incorrect'}
                                          onChange={() => setGrades({ ...grades, [qKey]: grades[qKey] === 'incorrect' ? null : 'incorrect' })}
                                          className="w-5 h-5 accent-red-600"
                                        />
                                        <span className="text-xs font-black uppercase text-slate-600">No</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessor Comments</span>
                                      <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                                        placeholder="Add comment..."
                                        value={grades[`${qKey}_cmt`] || ''}
                                        onChange={(e) => setGrades({ ...grades, [`${qKey}_cmt`]: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {!currentAssessmentQuestions.adminInfo?.hideCommentsFeedback && renderFinalResultBlock(tNum)}
                </section>
              );
            })
          }
        </div>

        {/* Final Result Section */}
        {/* LEGACY ASSESSMENT COMPETENCY RECORD SECTION */}
        {/* ASSESSMENT COMPETENCY RECORD SECTION - REDESIGNED TO MATCH IMAGE */}
        {!isQuestion15 && (
          <div className="mt-12 md:mt-20 border-t-2 border-slate-200 pt-10 md:pt-20">
            <div className="flex flex-col-reverse md:flex-row justify-between items-center md:items-start mb-6 md:mb-4 gap-4">
              <div className="text-center md:text-left w-full">
                <div className="text-[10px] md:text-sm font-bold border-b border-black inline-block mb-1">Assessment booklet</div>
                <div className="text-xs md:text-sm font-bold underline leading-tight">
                  {currentAssessmentQuestions.metadata?.code} - {currentAssessmentQuestions.metadata?.subtitle}
                </div>
              </div>
              <img src="/assets/Skilscope.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-center mb-6 md:mb-10 uppercase tracking-tighter text-slate-800">ASSESSMENT COMPETENCY RECORD</h2>

            <div className="bg-blue-50/50 p-4 md:p-8 border border-blue-100 rounded-2xl mb-8 md:mb-12 text-xs md:text-sm font-medium leading-relaxed text-slate-600 italic shadow-sm">
              This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
            </div>

            {/* Basic Info Table */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl mb-12 shadow-sm bg-white break-inside-avoid">
              <div className="flex flex-col">
                <div className="flex flex-col md:flex-row border-b border-slate-200">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Student's Name</div>
                  <div className="p-4 md:p-6 font-black text-lg md:text-xl text-slate-900 bg-white flex-1">{submission.student_name}</div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-slate-200">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Assessor's Name</div>
                  <div className="p-4 md:p-6 bg-white flex-1">
                    <input type="text" className="w-full border-none outline-none font-bold text-lg md:text-xl text-slate-800 placeholder:text-slate-200" placeholder="Enter assessor name..." value={compRecord.assessor_name} onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-slate-200">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Assessment Site</div>
                  <div className="p-4 md:p-6 bg-white flex-1">
                    <input type="text" className="w-full border-none outline-none text-base md:text-lg text-slate-600 placeholder:text-slate-200" placeholder="Enter site..." value={compRecord.assessment_site} onChange={(e) => setCompRecord({ ...compRecord, assessment_site: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Assessment Date/s</div>
                  <div className="p-4 md:p-6 bg-white flex-1">
                    <input
                      type="date"
                      className="w-full border-none outline-none text-base md:text-lg text-slate-600 no-print cursor-pointer"
                      value={compRecord.assessment_date}
                      onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                    />
                    <span className="hidden print:inline font-bold text-lg md:text-xl text-slate-800">{formatDisplayDate(compRecord.assessment_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessor Declaration Block */}
            <div className="border border-slate-300 rounded-xl mb-10 overflow-hidden shadow-sm bg-white break-inside-avoid">
              <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] p-3 font-bold text-sm text-white uppercase tracking-widest border-l-4 border-[#fbbf24]">Assessor Declaration</div>
              <div className="p-4 border-b border-slate-200 text-xs leading-relaxed italic text-slate-500 bg-slate-50/50">
                In completing this assessment, it is confirmed that the participant has demonstrated all unit outcomes through consistent and repeated application of skills with competent performance.
              </div>
              <div className="flex flex-col md:grid md:grid-cols-[200px_1fr] border-b border-slate-200">
                <div className="p-4 font-bold text-xs border-b md:border-b-0 md:border-r border-slate-200 flex items-center text-slate-700 uppercase tracking-wider bg-slate-50/30">Evidence is Confirmed as:</div>
                <div className="flex flex-wrap items-center">
                  {['valid', 'sufficient', 'current', 'authentic'].map((key) => (
                    <div key={key} className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-slate-100 h-full px-4 py-3 last:border-0 flex-1 min-w-0" >
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 border-2 border-slate-300 rounded appearance-none cursor-pointer checked:border-blue-600 transition-colors"
                          checked={compRecord.evidence[key]}
                          onChange={(e) => setCompRecord({ ...compRecord, evidence: { ...compRecord.evidence, [key]: e.target.checked } })}
                        />
                        {compRecord.evidence[key] && (
                          <span className="absolute -top-1 text-blue-600 font-black text-xl pointer-events-none">✔</span>
                        )}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="border-r border-slate-300 p-3 font-black text-[9px] uppercase text-slate-600 w-1/3 text-left tracking-tighter">Documentation to be attached</th>
                      <th className="border-r border-slate-300 p-3 font-black text-[9px] uppercase text-slate-600 w-24 text-center tracking-tighter">Result</th>
                      <th className="bg-slate-200 p-3 font-black text-xs uppercase text-slate-800 text-center tracking-tight" rowSpan={Object.keys(currentAssessmentQuestions).filter(k => k.startsWith('task')).length + 1}>
                        FINAL ASSESSMENT RESULT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(currentAssessmentQuestions)
                      .filter(key => key.startsWith('task'))
                      .sort((a, b) => parseInt(a.replace('task', '')) - parseInt(b.replace('task', '')))
                      .map((taskKey, idx) => {
                        const tNum = parseInt(taskKey.replace('task', ''));
                        const id = `t${tNum}`;
                        const result = taskResults[id];
                        let taskLabel = '';
                        if (currentAssessmentQuestions.metadata?.code === 'ICTCBL322') {
                          if (tNum === 1) taskLabel = 'Written question and answers';
                          else taskLabel = `Observation ${tNum - 1}`;
                        } else if (currentAssessmentQuestions.metadata?.code === 'ICTBWN307') {
                          if (tNum <= 2) taskLabel = `Observation ${tNum}`;
                          else taskLabel = 'Written question and answers';
                        } else if (currentAssessmentQuestions.metadata?.code === 'ICTTEN318') {
                          if (tNum === 1) taskLabel = 'Observation';
                          else taskLabel = 'Questions and Answers';
                        } else {
                          if (tNum <= 3) taskLabel = `Observation ${tNum}`;
                          else if (tNum === 4) taskLabel = 'Written question and answers';
                          else taskLabel = 'Written assessment';
                        }


                        return (
                          <tr key={idx} className="border-b border-slate-200 last:border-0 group hover:bg-slate-50/50 transition-colors break-inside-avoid">
                            <td className="border-r border-slate-200 p-3 h-[52px]">
                              <div className="flex items-center gap-4">
                                <span className="font-black text-[10px] text-slate-800 w-28 shrink-0 uppercase tracking-tighter">Task {tNum}</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 border border-slate-300 rounded accent-blue-600"
                                    checked={compRecord.tasks[id]}
                                    onChange={(e) => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, [id]: e.target.checked } })}
                                  />
                                  <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">{taskLabel}</span>
                                </div>
                              </div>
                            </td>
                            <td className="border-r border-slate-200 p-3 h-[52px] text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-black text-xs transition-all ${result === 'S' ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-100 scale-110' : 'text-slate-400 opacity-40'}`}>S</div>
                                <span className="text-[10px] font-black text-slate-300">/</span>
                                <div className={`w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-black text-xs transition-all ${result === 'NS' ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-100 scale-110' : 'text-slate-400 opacity-40'}`}>NS</div>
                              </div>
                            </td>
                            {idx === 0 && (
                              <td className="bg-slate-200 p-6 align-middle" rowSpan={Object.keys(currentAssessmentQuestions).filter(k => k.startsWith('task')).length}>
                                <div className="flex flex-col items-center space-y-6">
                                  <div className="space-y-5 text-left w-full max-w-[200px]">
                                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setFinalResult('C')}>
                                      <div className="relative w-7 h-7 flex items-center justify-center">
                                        <div className={`w-7 h-7 border-2 rounded-lg transition-all ${finalResult === 'C' ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}></div>
                                        {finalResult === 'C' && (
                                          <span className="absolute text-white font-black text-xl pointer-events-none">✔</span>
                                        )}
                                      </div>
                                      <span className={`font-black text-sm uppercase tracking-tighter transition-colors ${finalResult === 'C' ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-800'}`}>Competent</span>
                                    </div>
                                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setFinalResult('NC')}>
                                      <div className="relative w-7 h-7 flex items-center justify-center">
                                        <div className={`w-7 h-7 border-2 rounded-lg transition-all ${finalResult === 'NC' ? 'bg-red-600 border-red-600 shadow-lg shadow-red-200' : 'bg-white border-slate-300 group-hover:border-red-400'}`}></div>
                                        {finalResult === 'NC' && (
                                          <span className="absolute text-white font-black text-xl pointer-events-none">✘</span>
                                        )}
                                      </div>
                                      <span className={`font-black text-sm uppercase tracking-tighter transition-colors ${finalResult === 'NC' ? 'text-red-700' : 'text-slate-500 group-hover:text-slate-800'}`}>Not Yet Competent</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Documentation View */}
              <div className="md:hidden">
                <div className="bg-slate-100 p-3 font-black text-[10px] uppercase text-slate-600 border-b border-slate-200 tracking-tighter">Documentation & Results</div>
                <div className="divide-y divide-slate-100">
                  {Object.keys(currentAssessmentQuestions)
                    .filter(key => key.startsWith('task'))
                    .sort((a, b) => parseInt(a.replace('task', '')) - parseInt(b.replace('task', '')))
                    .map((taskKey, idx) => {
                      const tNum = parseInt(taskKey.replace('task', ''));
                      const id = `t${tNum}`;
                      const result = taskResults[id];
                      let taskLabel = '';
                      if (currentAssessmentQuestions.metadata?.code === 'ICTBWN307') {
                        if (tNum <= 2) taskLabel = `Observation ${tNum}`;
                        else taskLabel = 'Written question and answers';
                      } else if (currentAssessmentQuestions.metadata?.code === 'ICTTEN318') {
                        if (tNum === 1) taskLabel = 'Observation';
                        else taskLabel = 'Questions and Answers';
                      } else if (tNum <= 3) taskLabel = `Observation ${tNum}`;
                      else if (tNum === 4) taskLabel = 'Written question and answers';
                      else taskLabel = 'Written assessment';


                      return (
                        <div key={idx} className="p-4 space-y-4 bg-white break-inside-avoid">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[11px] text-slate-800 uppercase tracking-tighter">Task {tNum}</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-black text-[10px] ${result === 'S' ? 'bg-green-600 border-green-600 text-white' : 'text-slate-300'}`}>S</div>
                              <div className={`w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-black text-[10px] ${result === 'NS' ? 'bg-red-600 border-red-600 text-white' : 'text-slate-300'}`}>NS</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border border-slate-300 rounded accent-blue-600"
                              checked={compRecord.tasks[id]}
                              onChange={(e) => setCompRecord({ ...compRecord, tasks: { ...compRecord.tasks, [id]: e.target.checked } })}
                            />
                            <span className="text-xs text-slate-600 font-bold">{taskLabel}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="bg-slate-200 p-6 border-t border-slate-300">
                  <div className="text-center font-black text-xs uppercase text-slate-800 tracking-tight mb-6">FINAL ASSESSMENT RESULT</div>
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex items-center gap-4 w-full max-w-[240px] p-4 bg-white rounded-xl border-2 border-transparent shadow-sm" onClick={() => setFinalResult('C')}>
                      <div className="relative w-7 h-7 flex items-center justify-center">
                        <div className={`w-7 h-7 border-2 rounded-lg ${finalResult === 'C' ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}></div>
                        {finalResult === 'C' && <span className="absolute text-white font-black text-xl">✔</span>}
                      </div>
                      <span className={`font-black text-sm uppercase tracking-tighter ${finalResult === 'C' ? 'text-blue-700' : 'text-slate-500'}`}>Competent</span>
                    </div>
                    <div className="flex items-center gap-4 w-full max-w-[240px] p-4 bg-white rounded-xl border-2 border-transparent shadow-sm" onClick={() => setFinalResult('NC')}>
                      <div className="relative w-7 h-7 flex items-center justify-center">
                        <div className={`w-7 h-7 border-2 rounded-lg ${finalResult === 'NC' ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}></div>
                        {finalResult === 'NC' && <span className="absolute text-white font-black text-xl">✘</span>}
                      </div>
                      <span className={`font-black text-sm uppercase tracking-tighter ${finalResult === 'NC' ? 'text-red-700' : 'text-slate-500'}`}>Not Yet Competent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attempts Table */}
            <div className="border border-slate-300 rounded-xl mb-10 overflow-hidden shadow-sm bg-white break-inside-avoid">
              <div className="hidden md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-3 font-black text-[10px] uppercase text-slate-600 w-20 text-center border-r border-slate-200 tracking-tighter">Attempt</th>
                      <th className="p-3 font-black text-[10px] uppercase text-slate-600 w-48 text-center border-r border-slate-200 tracking-tighter">Date</th>
                      <th className="p-3 font-black text-[10px] uppercase text-slate-600 text-left tracking-tighter">Assessor's Feedback (as Required)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2].map((idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 group hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 text-center font-black text-slate-700 border-r border-slate-100">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-100">
                          <input
                            type="date"
                            className="w-full border-none outline-none text-slate-600 text-center no-print cursor-pointer"
                            value={compRecord.attempts[idx].date}
                            onChange={(e) => {
                              const newAttempts = [...compRecord.attempts];
                              newAttempts[idx].date = e.target.value;
                              setCompRecord({ ...compRecord, attempts: newAttempts });
                            }}
                          />
                          <span className="hidden print:inline text-slate-800 font-bold">{formatDisplayDate(compRecord.attempts[idx].date)}</span>
                        </td>
                        <td className="p-3">
                          <textarea
                            className="w-full h-full min-h-[44px] border-none outline-none resize-none text-slate-600 text-sm placeholder:text-slate-300"
                            placeholder="Provide feedback for this attempt..."
                            value={compRecord.attempts[idx].feedback}
                            onChange={(e) => {
                              const newAttempts = [...compRecord.attempts];
                              newAttempts[idx].feedback = e.target.value;
                              setCompRecord({ ...compRecord, attempts: newAttempts });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td colSpan={2} className="p-4 font-black text-[10px] text-center text-slate-700 uppercase tracking-widest border-r border-slate-200 border-t border-slate-200">Final Feedback</td>
                      <td className="p-4 border-t border-slate-200">
                        <textarea
                          className="w-full h-full min-h-[80px] border-none outline-none resize-none text-slate-800 text-sm font-medium bg-transparent placeholder:text-slate-300"
                          placeholder="Summarize final assessment findings..."
                          value={compRecord.final_feedback}
                          onChange={(e) => setCompRecord({ ...compRecord, final_feedback: e.target.value })}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Attempts View */}
              <div className="md:hidden divide-y divide-slate-100">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="p-4 space-y-3 bg-white">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-xs text-slate-400 uppercase tracking-widest">Attempt {idx + 1}</span>
                      <input
                        type="date"
                        className="border-none outline-none text-slate-600 text-xs no-print cursor-pointer bg-slate-50 px-2 py-1 rounded"
                        value={compRecord.attempts[idx].date}
                        onChange={(e) => {
                          const newAttempts = [...compRecord.attempts];
                          newAttempts[idx].date = e.target.value;
                          setCompRecord({ ...compRecord, attempts: newAttempts });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Assessor's Feedback:</span>
                      <textarea
                        className="w-full min-h-[60px] p-3 bg-slate-50 rounded-lg border-none outline-none resize-none text-slate-600 text-xs"
                        placeholder="Provide feedback..."
                        value={compRecord.attempts[idx].feedback}
                        onChange={(e) => {
                          const newAttempts = [...compRecord.attempts];
                          newAttempts[idx].feedback = e.target.value;
                          setCompRecord({ ...compRecord, attempts: newAttempts });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-slate-50 space-y-2">
                  <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Final Feedback</span>
                  <textarea
                    className="w-full min-h-[100px] p-3 bg-white border border-slate-200 rounded-xl outline-none resize-none text-slate-800 text-sm font-medium"
                    placeholder="Summarize final findings..."
                    value={compRecord.final_feedback}
                    onChange={(e) => setCompRecord({ ...compRecord, final_feedback: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Declaration Section */}
            <div className="mt-12 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-md break-inside-avoid">
              <div className="bg-[#1e3a8a] p-4 text-white font-black text-sm uppercase tracking-widest">Declaration</div>
              <div className="divide-y divide-slate-200">
                {/* Assessor Declaration Row */}
                <div className="flex flex-col md:flex-row">
                  <div className="p-4 md:p-6 md:w-2/3 align-top bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-[10px] md:text-xs font-black leading-relaxed text-slate-800 uppercase tracking-tighter mb-2">Assessor Declaration</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      I declare that I have conducted a fair, valid, reliable and flexible assessment with this student, and I have provided appropriate feedback.
                    </p>
                  </div>
                  <div className="p-4 md:p-6 md:w-1/3 bg-white">
                    <div className="space-y-4 md:space-y-5">
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signature</div>
                        <div
                          className="border-b-2 border-slate-200 h-16 md:h-20 w-full flex items-center justify-center cursor-pointer relative group transition-all hover:border-blue-400 bg-slate-50/30 rounded-t-lg overflow-hidden p-1"
                          onClick={() => openSigModal('assessor_signature', 'comp')}
                        >
                          {compRecord.assessor_signature ? (
                            <img src={compRecord.assessor_signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest group-hover:text-blue-500">Click to Sign</span>
                          )}
                          {compRecord.assessor_signature && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.08]">
                              <span className="text-blue-600 text-3xl md:text-5xl rotate-[-15deg] font-black uppercase border-4 border-blue-600 px-4 whitespace-nowrap">VERIFIED</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                        <div className="flex-1 border-b-2 border-slate-200">
                          <input
                            type="date"
                            className="w-full outline-none text-sm text-slate-800 font-bold no-print bg-transparent py-1"
                            value={compRecord.assessor_sig_date}
                            onChange={(e) => setCompRecord({ ...compRecord, assessor_sig_date: e.target.value })}
                          />
                          <span className="hidden print:inline text-sm font-black text-slate-800">{formatDisplayDate(compRecord.assessor_sig_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Declaration Row */}
                <div className="flex flex-col md:flex-row">
                  <div className="p-4 md:p-6 md:w-2/3 align-top bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-[10px] md:text-xs font-black leading-relaxed text-slate-800 uppercase tracking-tighter mb-2">Student Declaration</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      I declare that I accept the assessment competency outcome and consider the feedback of my assessor positively. I also declare that the work submitted is my own, and has not been copied or plagiarised from any person or source.
                    </p>
                  </div>
                  <div className="p-4 md:p-6 md:w-1/3 bg-white">
                    <div className="space-y-4 md:space-y-5">
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signature</div>
                        <div className="border-b-2 border-slate-200 h-16 md:h-20 w-full flex items-center justify-center bg-slate-50/30 rounded-t-lg overflow-hidden p-1">
                          {submission.signature_url ? (
                            <img src={submission.signature_url} alt="Sig" className="max-h-full max-w-full object-contain opacity-60" />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Digital Sign</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                        <div className="border-b-2 border-slate-200 flex-1 text-sm font-black text-slate-800 h-8 flex items-center">
                          {submission.submitted_at ? formatDisplayDate(new Date(submission.submitted_at).toISOString().split('T')[0]) : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Submit Button */}
        <div className="flex justify-center pt-12 no-print">
          <button
            onClick={() => {
              if (!isQuestion15 && (!compRecord.assessor_name || !compRecord.assessor_signature || !compRecord.assessment_date)) {
                alert('CRITICAL: Assessor Name, Signature, and Date must be completed before downloading the final report.');
                return;
              }
              saveMutation.mutate()
              setTimeout(() => handlePrint(), 500)
            }}
            disabled={saveMutation.isPending}
            className="flex items-center gap-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-10 py-4 rounded-xl font-bold text-xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            SUBMIT & DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
    // </div>
  )
}

export default GradingPortal
