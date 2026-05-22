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

  const isQuestion2Assessment = (submission?.assessment_id?.token || '').toLowerCase() === 'question-2'

  useEffect(() => {
    if (isQuestion2Assessment) {
      document.documentElement.classList.add('q2-grading')
      return () => document.documentElement.classList.remove('q2-grading')
    }
    document.documentElement.classList.remove('q2-grading')
  }, [isQuestion2Assessment])

  const handlePrint = () => {
    const triggerPrint = () => window.print()
    if (isQuestion2Assessment) {
      requestAnimationFrame(() => {
        setTimeout(triggerPrint, 150)
      })
      return
    }
    triggerPrint()
  }

  const handleDownload = async () => {
    try {
      const data = await api.updateSubmission(id!, {
        grades,
        task_results: taskResults,
        final_result: finalResult,
        comp_record: compRecord,
        status: 'graded'
      })
      if (data.error) throw new Error(data.error)
      queryClient.invalidateQueries({ queryKey: ['submission', id] })
    } catch (err: any) {
      alert('⚠️ Error saving before download: ' + err.message)
      return
    }
    handlePrint()
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('print') === 'true' && !isLoading && submission) {
      const timer = setTimeout(() => handlePrint(), 1000)
      return () => clearTimeout(timer)
    }
  }, [location.search, isLoading, submission, isQuestion2Assessment])

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

  const markAllCorrect = () => {
    const newGrades: any = { ...grades };
    const newTaskResults: any = { ...taskResults };
    const newCompRecord: any = {
      ...compRecord,
      evidence: { valid: true, sufficient: true, current: true, authentic: true },
      tasks: { ...compRecord.tasks }
    };

    Object.keys(currentAssessmentQuestions)
      .filter(key => key.startsWith('task'))
      .forEach(taskKey => {
        const tNum = parseInt(taskKey.replace('task', ''));
        const taskData = currentAssessmentQuestions[taskKey];
        const tKey = `t${tNum}`;

        // Mark task outcome as Satisfactory (S)
        newTaskResults[tKey] = 'S';
        // Mark task as completed in competency record
        newCompRecord.tasks[tKey] = true;

        // 1. Written questions (renderQuestionReview)
        const isPlainArray = Array.isArray(taskData) && taskData.length > 0 && typeof taskData[0] === 'object';
        const questionsArray: any[] = isPlainArray ? taskData : (taskData as any).questions || [];
        questionsArray.forEach((q: any) => {
          const qKey = `t${tNum}q${q.id}`;
          newGrades[qKey] = 'correct';
        });

        // 2. Oral / checklist items
        const oralQuestions: string[] = (taskData as any).checklistItems || (taskData as any).oral || (taskData as any).items || [];
        oralQuestions.forEach((_: string, i: number) => {
          const qKey = `t${tNum}q${i + 1}`;
          newGrades[qKey] = 'correct';
        });

        // 3. Performance items
        const perfQuestions: string[] = (taskData as any).performance || [];
        perfQuestions.forEach((_: string, i: number) => {
          const qKey = `t${tNum}pq${i + oralQuestions.length + 1}`;
          newGrades[qKey] = 'correct';
        });

        // 4. Observation items (checkbox-based)
        const observationItems: string[] = (taskData as any).observationItems || [];
        observationItems.forEach((_: string, idx: number) => {
          const obsKey = `t${tNum}obs${idx}`;
          newGrades[obsKey] = true;
        });

        // 5. Assessor table sections (observation tables)
        const allSections = [
          ...((taskData as any).sections || []),
          ...((taskData as any).assessorSections || []).map((s: any) => ({ ...s, isAssessorOnly: true }))
        ];
        allSections.forEach((section: any) => {
          if (section.type !== 'table') return;
          const isAssessorInput = (taskData as any).assessorOnly || section.isAssessorOnly;
          if (!isAssessorInput) return;
          (section.rows || []).forEach((row: any) => {
            if (row.isSubHeader) return;
            if (row.cells) {
              row.cells.forEach((cell: any) => {
                if (cell.options && cell.options.length > 0) {
                  if (isQuestion15) {
                    // Q15: find the "Yes" option for this cell
                    const yesOpt = cell.options.find((o: any) =>
                      ['Yes', 'yes', 'Satisfactory', 'S', 'C', 'Completed'].includes(o.value)
                    );
                    if (yesOpt) newGrades[cell.name] = yesOpt.value;
                  } else {
                    if (cell.type === 'checkbox') {
                      // Check all options
                      newGrades[cell.name] = cell.options.map((o: any) => o.value);
                    } else {
                      // Radio: pick first option (typically 'Yes' / 'S' / 'C')
                      const yesOpt = cell.options.find((o: any) =>
                        ['Yes', 'yes', 'Satisfactory', 'S', 'C', 'Completed'].includes(o.value)
                      ) || cell.options[0];
                      if (yesOpt) newGrades[cell.name] = yesOpt.value;
                    }
                  }
                }
                // text/date/signature cells are left unchanged
              });
            }
          });
        });
      });

    setGrades(newGrades);
    setTaskResults(newTaskResults);
    setCompRecord(newCompRecord);
    setFinalResult('C'); // Competent
  };

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
                              <input
                                type="text"
                                className="w-full p-2.5 bg-blue-50/30 border border-slate-200 rounded text-[#1e3a8a] font-bold text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all print:border-none print:p-0 print:bg-transparent"
                                placeholder="Enter or edit answer..."
                                value={grades[row.id] !== undefined ? grades[row.id] : (submission?.answers?.[row.id] || '')}
                                onChange={(e) => setGrades({ ...grades, [row.id]: e.target.value })}
                              />
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
  const renderQuestion2Booklet = () => {
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
      .q2-booklet-view .comp-table td { padding: 4px 6px; font-size: 9pt; }
      .q2-booklet-view .comp-table .label-col { font-weight: bold; background: #f0f0f0; width: 36%; }
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
      .q2-booklet-view .checked-box::after { content: '✓'; position: absolute; top: -4.5px; left: 0px; font-size: 14px; color: #cc0000; font-weight: bold; }
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
    `;

    return (
      <div className="q2-booklet-view">
        <style dangerouslySetInnerHTML={{ __html: q2Styles }} />

        {/* Floating Top Action Bar */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:flex md:w-auto">
            <button
              onClick={markAllCorrect}
              title="Mark all answers as correct"
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-amber-900/20 col-span-2 sm:col-span-1"
            >
              <CheckCircle2 size={14} />
              <span className="whitespace-nowrap">Mark All Correct</span>
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              <span className="whitespace-nowrap">Save Changes</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Printer size={14} />}
              <span className="whitespace-nowrap">Download</span>
            </button>
          </div>
        </div>

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

        {/* ═══════════════════ PAGE 1 – COVER ═══════════════════ */}
        <div className="page" style={{ padding: '8mm 10mm' }}>
          <div style={{ border: '3.5px solid #1a5fa8', padding: '4px', minHeight: '277mm', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ border: '1.2px solid #1a5fa8', padding: '12mm 14mm', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>

              {/* Shield SVG Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130" width="170" height="185" style={{ marginBottom: '5mm', marginTop: '5mm' }}>
                {/* outer shield */}
                <path d="M60,4 L110,20 L110,75 Q110,110 60,126 Q10,110 10,75 L10,20 Z" fill="#1a3fa8" stroke="#c8a800" strokeWidth="3.5"/>
                {/* gold inner border */}
                <path d="M60,12 L102,26 L102,74 Q102,104 60,118 Q18,104 18,74 L18,26 Z" fill="none" stroke="#c8a800" strokeWidth="2.5"/>
                {/* red band */}
                <path d="M18,55 L102,55 L102,74 Q102,104 60,118 Q18,104 18,74 Z" fill="#cc1111"/>
                {/* gold lower banner */}
                <path d="M24,95 L96,95 L90,108 L30,108 Z" fill="#c8a800"/>
                {/* Stars */}
                <polygon points="60,18 62,24 68,24 63,28 65,34 60,30 55,34 57,28 52,24 58,24" fill="#fff"/>
                <polygon points="38,36 39.5,41 44.5,41 40.5,44 42,49 38,46 34,49 35.5,44 31.5,41 36.5,41" fill="#fff"/>
                <polygon points="82,36 83.5,41 88.5,41 84.5,44 86,49 82,46 78,49 79.5,44 75.5,41 80.5,41" fill="#fff"/>
                {/* Southern cross small stars */}
                <polygon points="50,62 51,65 54,65 52,67 53,70 50,68 47,70 48,67 46,65 49,65" fill="#fff"/>
                <polygon points="72,58 73,61 76,61 74,63 75,66 72,64 69,66 70,63 68,61 71,61" fill="#fff"/>
                <polygon points="60,72 61,75 64,75 62,77 63,80 60,78 57,80 58,77 56,75 59,75" fill="#fff"/>
                {/* ACTA text on banner */}
                <text x="60" y="104" textAnchor="middle" fontSize="6.2" fontFamily="Arial" fontWeight="bold" fill="#1a1a1a">ACTA COLLEGE PTY LTD</text>
              </svg>

              <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#991b1b', marginBottom: '10mm', fontFamily: 'Arial, sans-serif', letterSpacing: '0.3px' }}>RTO NO: 40954</div>
              <div style={{ fontSize: '44pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', marginBottom: '5mm' }}>Assessment Booklet</div>
              <div style={{ background: '#1a5fa8', height: '11px', width: '100%', margin: '5mm 0' }}></div>
              <div style={{ fontSize: '26pt', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#000', marginBottom: '5mm', marginTop: '5mm', letterSpacing: '0.6px' }}>ICTCBL330</div>
              <div style={{ fontSize: '21pt', fontWeight: 'bold', fontFamily: '"Times New Roman", Times, serif', color: '#000', lineHeight: 1.35, marginBottom: '25mm' }}>
                Splice and terminate optical fibre cable<br />for telecommunications projects
              </div>
              <div style={{ width: '100%', marginTop: 'auto', paddingTop: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '14pt', fontFamily: '"Times New Roman", Times, serif', color: '#000', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                  Student Name: <span style={{ display: 'inline-block', borderBottom: '1.8px solid #000', width: '110mm', fontWeight: 'bold', paddingLeft: '8px', fontFamily: 'Arial, sans-serif', textAlign: 'left' }}>{submission.student_name}</span>
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

          <table className="comp-table" style={{ marginBottom: '5px' }}>
            <tbody>
              <tr><td className="label-col">Student's Name</td><td className="field-value-cell font-bold">{submission.student_name}</td></tr>
              <tr>
                <td className="label-col">Assessor's Name</td>
                <td className="field-value-cell">
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 outline-none px-2 py-0.5 text-slate-800 font-bold"
                    value={compRecord.assessor_name || ''}
                    onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })}
                    placeholder="Enter Assessor Name"
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
                    <div className="sig-visual inline-flex items-center justify-center min-h-[30px] border-b border-black px-2">
                      {submission.signature_url ? (
                        <img src={submission.signature_url} className="max-h-[25px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">—</span>
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
            <div className="obs-row"><span>Interpret technical documents</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Liaison with experts</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Communication skills</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Read equipment manuals</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Appropriate cable installation</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Taking measurements</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Identify signal strength loss</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Identify the faults</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Suggest remedies</span><span><span className="checked-box"></span> Observation 1</span></div>
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
                    onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
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
                    <div className="sig-visual inline-flex items-center justify-center min-h-[26px] border-b border-black px-2">
                      {submission.signature_url ? (
                        <img src={submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">—</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    Date:
                    <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                      {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/_________'}
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
                    <span className="underline ml-1 font-bold">{formatDisplayDate(compRecord.assessment_date)}</span>
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
            <div className="obs-row"><span>Install customer access network cable</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Operation of test equipment</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Perform fault clearance</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Use of diagnostic equipment</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Joining techniques adopted</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Use of tools and equipment</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Use of hand and power tools</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Follow safety standards and procedures</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Termination process</span><span><span className="checked-box"></span> Observation 1</span></div>
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
                    onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
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
                    <div className="sig-visual inline-flex items-center justify-center min-h-[26px] border-b border-black px-2">
                      {submission.signature_url ? (
                        <img src={submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">—</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    Date:
                    <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                      {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/_________'}
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
            <div className="obs-row"><span>Install customer access network cable</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Operation of test equipment</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Perform fault clearance</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Use of diagnostic equipment</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Joining techniques adopted</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Use of tools and equipment</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Use of hand and power tools</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Follow safety standards and procedures</span><span><span className="checked-box"></span> Observation 1</span></div>
            <div className="obs-row"><span>Termination process</span><span><span className="checked-box"></span> Observation 1</span></div>
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
                    onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
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
                    <div className="sig-visual inline-flex items-center justify-center min-h-[26px] border-b border-black px-2">
                      {submission.signature_url ? (
                        <img src={submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">—</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    Date:
                    <span className="border-b border-dashed border-gray-400 inline-block min-w-[100px] text-center ml-1">
                      {submission.submitted_at ? formatDisplayDate(submission.submitted_at.split('T')[0]) : '_____/_____/_________'}
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
                  {submission.answers?.['t4q1'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                  {submission.answers?.['t4q2'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                  {submission.answers?.['t4q3'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                    const isSelected = (submission.answers?.['t4q4'] || '').toLowerCase() === opt.val;
                    return (
                      <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''}`} style={{ marginTop: '3px' }}>
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
                  {submission.answers?.['t4q5'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                    <div>S/M 9/125: <span className="underline">{submission.answers?.['t4q6_a'] || '—'} microns</span></div>
                    <div>S/M 10/125: <span className="underline">{submission.answers?.['t4q6_b'] || '—'} microns</span></div>
                    <div>M/M 50/125: <span className="underline">{submission.answers?.['t4q6_c'] || '—'} microns</span></div>
                    <div>M/M 62.5/125: <span className="underline">{submission.answers?.['t4q6_d'] || submission.answers?.['t4q6_a'] || '—'} microns</span></div>
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
                  {submission.answers?.['t4q7'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                  {submission.answers?.['t4q8'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                    const isSelected = (submission.answers?.['t4q9'] || '').toLowerCase() === opt.val;
                    return (
                      <div key={opt.val} className={`choice-item ${isSelected ? 'font-bold text-red-600' : ''}`} style={{ marginTop: '3px' }}>
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
                  {submission.answers?.['t4q10'] || <span className="text-gray-400 font-normal">No answer provided</span>}
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
                    <div className="sig-visual inline-flex items-center justify-center min-h-[26px] border-b border-black px-2">
                      {submission.signature_url ? (
                        <img src={submission.signature_url} className="max-h-[22px] max-w-[100px] object-contain inline-block" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">—</span>
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

  if (isQuestion2Assessment && submission) {
    if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff6ff]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#1e3a8a] mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-semibold">Loading submission...</p>
        </div>
      </div>
    );
    return renderQuestion2Booklet();
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:flex md:w-auto">
          <button
            onClick={markAllCorrect}
            title="Mark all answers as correct"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg shadow-amber-900/20 col-span-2 sm:col-span-1"
          >
            <CheckCircle2 size={14} />
            <span className="whitespace-nowrap">Mark All Correct</span>
          </button>
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
        {/* ASSESSMENT COMPETENCY RECORD SECTION - MOVED TO PAGE 2 (TOP OF PAPER) */}
        {!isQuestion15 && (
          <div className="comp-record-section mb-12 md:mb-20 pb-10 md:pb-20 border-b-2 border-slate-200">
            <div className="flex flex-col-reverse md:flex-row justify-between items-center md:items-start mb-6 md:mb-4 gap-4">
              <div className="text-center md:text-left w-full">
                <div className="text-[10px] md:text-sm font-bold border-b border-black inline-block mb-1">Assessment booklet</div>
                <div className="text-xs md:text-sm font-bold underline leading-tight">
                  {currentAssessmentQuestions.metadata?.code} - {currentAssessmentQuestions.metadata?.subtitle}
                </div>
              </div>
              <img src="/assets/Skilscope.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-10 uppercase tracking-tight text-slate-800">ASSESSMENT COMPETENCY RECORD</h2>

            <div className="bg-blue-50/50 p-4 md:p-8 border border-blue-100 rounded-2xl mb-8 md:mb-12 text-xs md:text-sm font-medium leading-relaxed text-slate-600 italic shadow-sm">
              This form is to be completed by the assessor and used as the final record of the student competence in these discipline. All student submissions including any associated documents and checklists are to be attached to this cover sheet before placing on the students file. Student results are not to be entered onto the Student Database unless all relevant paperwork is completed and attached to this form.
            </div>

            {/* Basic Info Table */}
            <div className="overflow-hidden border border-slate-200 rounded-2xl mb-12 shadow-sm bg-white break-inside-avoid">
              <div className="flex flex-col">
                <div className="flex flex-col md:flex-row border-b border-slate-200">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Student's Name</div>
                  <div className="p-4 md:p-6 font-bold text-sm md:text-base text-slate-900 bg-white flex-1">{submission.student_name}</div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-slate-200">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Assessor's Name</div>
                  <div className="p-4 md:p-6 bg-white flex-1">
                    <input type="text" className="w-full border-none outline-none font-medium text-sm md:text-base text-slate-800 placeholder:text-slate-200" placeholder="Enter assessor name..." value={compRecord.assessor_name} onChange={(e) => setCompRecord({ ...compRecord, assessor_name: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-slate-200">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Assessment Site</div>
                  <div className="p-4 md:p-6 bg-white flex-1">
                    <input type="text" className="w-full border-none outline-none text-sm md:text-base text-slate-600 placeholder:text-slate-200" placeholder="Enter site..." value={compRecord.assessment_site} onChange={(e) => setCompRecord({ ...compRecord, assessment_site: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row">
                  <div className="bg-slate-50 p-4 md:p-6 font-bold text-xs md:text-sm w-full md:w-[250px] text-slate-700 border-b md:border-b-0 md:border-r border-slate-200 uppercase tracking-wider flex items-center">Assessment Date/s</div>
                  <div className="p-4 md:p-6 bg-white flex-1">
                    <input
                      type="date"
                      className="w-full border-none outline-none text-sm md:text-base text-slate-600 no-print cursor-pointer"
                      value={compRecord.assessment_date}
                      onChange={(e) => setCompRecord({ ...compRecord, assessment_date: e.target.value })}
                    />
                    <span className="hidden print:inline font-bold text-sm md:text-base text-slate-800">{formatDisplayDate(compRecord.assessment_date)}</span>
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

        <div className="max-w-[850px] mx-auto bg-white mt-0 sm:mt-8 shadow-sm border rounded-sm p-4 sm:p-8 paper review-mode overflow-visible">
          {/* Header Info */}
          {/* New Header UI matching the image */}
          <div className="space-y-6 mb-12 no-print">
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
                                                                const isYes = ['Yes', 'yes', 'Satisfactory', 'S', 'C', 'Completed'].includes(opt.value);
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
                                                                    <div className={`no-print w-[22px] h-[22px] border-2 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 ${q15Checked ? (isYes ? 'bg-green-500 border-green-600 shadow-sm' : 'bg-red-500 border-red-600 shadow-sm') : 'bg-white border-slate-300 hover:border-[#1e3a8a] hover:bg-blue-50'}`}>
                                                                      {q15Checked && (
                                                                        <span className="text-white font-black text-[13px] leading-none select-none">{isYes ? '✔' : '✘'}</span>
                                                                      )}
                                                                    </div>
                                                                    {/* Hidden checkbox for print/form purposes */}
                                                                    <input type="checkbox" checked={q15Checked} onChange={() => { }} className="sr-only" />
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
                                                        <input
                                                          type="text"
                                                          className="w-full p-3 bg-blue-50/30 border border-slate-200 rounded-xl text-[#1e3a8a] font-black text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 transition-all print:border-none print:p-0 print:bg-transparent"
                                                          placeholder="Enter or edit result..."
                                                          value={grades[row.id] !== undefined ? grades[row.id] : (submission?.answers?.[row.id] || '')}
                                                          onChange={(e) => setGrades({ ...grades, [row.id]: e.target.value })}
                                                        />
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
