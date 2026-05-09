import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import SignaturePad from 'signature_pad'
import { AlertCircle, CheckCircle2, Save, Send, Loader2, Printer } from 'lucide-react'
import { getQuestionsForAssessment } from '../data'
import '../assessment-styles.css'

const AssessmentForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [assessment, setAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<any>({})
  const assessmentQuestions = getQuestionsForAssessment(token)

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
      }
    }
  };

  // Initialize signature pad and handle resizing
  useEffect(() => {
    if (!loading && !error && sigCanvas.current && !signaturePad.current) {
      signaturePad.current = new SignaturePad(sigCanvas.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });

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

  const clearSignature = () => signaturePad.current?.clear()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signaturePad.current || signaturePad.current.isEmpty()) {
      alert('Please provide your signature before submitting.')
      return
    }

    setSubmitting(true)
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const answers: any = {}

    formData.forEach((value, key) => {
      if (typeof value === 'string' && value.trim() === '') {
        return;
      }
      if (answers[key]) {
        if (!Array.isArray(answers[key])) answers[key] = [answers[key]]
        answers[key].push(value)
      } else {
        answers[key] = value
      }
    })

    const questionKeys = Object.keys(answers).filter(key => !['st-name', 'st-id', 'st-date'].includes(key));
    if (questionKeys.length === 0) {
      alert('Please answer at least one question before submitting.');
      setSubmitting(false);
      return;
    }

    try {
      const signatureData = signaturePad.current.toDataURL()

      const data = await api.submitAssessment({
        assessment_id: assessment._id || assessment.id,
        student_name: answers['st-name'],
        student_id: answers['st-id'],
        answers: answers,
        signature_url: signatureData
      })

      if (data.error) throw new Error(data.error)

      setSubmitted(true)
    } catch (err: any) {
      alert('Error submitting assessment: ' + err.message)
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

        <div className="ml-0 md:ml-11">
          {q.type === 'text' ? (
            <div className="relative">
              <textarea
                name={qKey}
                className="w-full p-4 border-2 border-gray-100 rounded-xl min-h-[120px] outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10 transition-all bg-gray-50/50"
                placeholder="Enter your detailed answer here..."
                onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })}
              ></textarea>
            </div>
          ) : q.type === 'text_inputs' ? (
            <div className="grid grid-cols-1 gap-6 mt-4">
              {q.textInputs.map((ti: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-full md:w-64 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <img src={`/assets/cable${idx + 1}.png`} alt={`Cable Type ${idx + 1}`} className="w-full h-24 object-contain" />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{ti.placeholder}</p>
                    <input
                      type="text"
                      name={ti.name}
                      className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg outline-none focus:border-[#1e3a8a] transition-all font-bold"
                      placeholder="Identify this cable type..."
                      onChange={(e) => setAnswers({ ...answers, [ti.name]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : q.type === 'multipart_radio' ? (
            <div className="flex flex-col gap-6 mt-4">
              {q.parts.map((part: any, pIdx: number) => (
                <div key={pIdx}>
                  <div className="text-[13px] text-gray-600 italic mb-2 leading-relaxed">{part.text}</div>
                  <div className="flex flex-col gap-1">
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
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-2">
              {q.options?.map((opt: any, idx: number) => (
                <label key={idx} className="legacy-opt-label hover:shadow-md transition-shadow">
                  <input
                    type={opt.type || 'radio'}
                    name={qKey}
                    value={opt.value}
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
              onClick={() => window.print()}
              className="bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-700 w-full flex items-center justify-center gap-3 transition-colors"
            >
              <Printer size={24} /> Download PDF
            </button>
          </div>
        </div>
      )}

      <div className={`bg-[#eff6ff] print:bg-white min-h-screen py-6 sm:py-10 px-2 sm:px-4 print:py-0 print:px-0 font-sans text-[#111] ${submitted ? 'hidden print:block' : 'block'}`}>
        <div className="max-w-[1000px] mx-auto bg-white shadow-2xl p-4 sm:p-6 md:p-12 border border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden print:max-w-none print:mx-0 print:shadow-none print:border-none print:rounded-none">

          <div className="text-center pb-6 mb-8 sm:mb-12 relative flex flex-col items-center">
            <div className="hidden sm:block absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mt-12 -z-10"></div>
            <img
              src="/assets/Skilscope.png"
              alt="Skilscope Logo"
              className="w-20 h-20 sm:w-32 sm:h-32 object-contain mb-4 drop-shadow-xl"
            />
            <div className="text-[#1e3a8a] mb-6 sm:mb-8 flex flex-col items-center w-full px-2">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 sm:mb-4 text-center leading-tight">{assessmentQuestions.metadata?.title || 'Assessment Booklet'}</h1>
              <div className="w-24 sm:w-48 h-1 sm:h-1.5 bg-[#d4af37] rounded-full"></div>
            </div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] sm:text-sm px-4">{assessmentQuestions.metadata?.subtitle || 'Open Registration - Customer Cabling (Tasks 4, 5 & 6)'}</p>
          </div>

          <form onSubmit={handleSubmit} className="student-mode">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 bg-gray-50 p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 shadow-inner">
              <label className="block">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Student Name</span>
                <input name="st-name" defaultValue={searchParams.get('st-name') || ''} required className="w-full p-2.5 sm:p-3 border-2 border-white bg-white rounded-lg sm:rounded-xl shadow-sm focus:border-[#1e3a8a] outline-none transition-all font-bold text-sm sm:text-base" placeholder="Full Name" />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Student ID</span>
                <input name="st-id" defaultValue={searchParams.get('st-id') || ''} required className="w-full p-2.5 sm:p-3 border-2 border-white bg-white rounded-lg sm:rounded-xl shadow-sm focus:border-[#1e3a8a] outline-none transition-all font-bold text-sm sm:text-base" placeholder="ID Number" />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assessment Date</span>
                <input type="date" name="st-date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 sm:p-3 border-2 border-white bg-white rounded-lg sm:rounded-xl shadow-sm focus:border-[#1e3a8a] outline-none transition-all font-bold text-sm sm:text-base" />
              </label>
            </div>


            {Object.keys(assessmentQuestions)
              .filter(key => key.startsWith('task'))
              .sort((a, b) => parseInt(a.replace('task', '')) - parseInt(b.replace('task', '')))
              .map((taskKey) => {
                const tNum = parseInt(taskKey.replace('task', ''));
                const taskData = assessmentQuestions[taskKey];
                const isChecklist = !Array.isArray(taskData) || (Array.isArray(taskData) && taskData.length > 0 && typeof taskData[0] === 'string');

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
                            <div className="space-y-6 sm:space-y-8">
                              {taskData.sections.map((section: any, sIdx: number) => (
                                <div key={sIdx} className="space-y-3 sm:space-y-4 px-2">
                                  {section.type === 'text' && (
                                    <div className="space-y-2 sm:space-y-3">
                                      {section.title && (
                                        <h3 className="font-bold text-slate-800 text-base sm:text-lg border-b-2 border-slate-100 pb-1">
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
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </section>
                  );
                }

                // Standard written questions loop
                let taskTitle = `Task ${tNum}`;
                if (tNum === 4) taskTitle += ' – Knowledge Questions';
                else if (tNum === 5) taskTitle += ' – Questions and Answers';
                else if (tNum === 6) taskTitle += ' – Multi Choice Questions';

                return (
                  <section key={taskKey} className="mb-10 sm:mb-12">
                    <div className="task-banner-ribbon text-xs sm:text-base py-2 sm:py-3 px-4 sm:px-6">{taskTitle}</div>
                    <div className="space-y-0">
                      {taskData.map((q: any, i: number) => renderQuestion(q, i, tNum))}
                    </div>
                  </section>
                );
              })}


            <div className="mt-12 sm:mt-16 p-4 sm:p-8 border-2 sm:border-4 border-dashed border-gray-300 rounded-xl sm:rounded-2xl bg-gray-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Save size={20} className="text-[#1e3a8a] sm:w-[24px] sm:h-[24px]" />
                Student Declaration & Signature
              </h3>
              <p className="text-gray-600 mb-6 text-[11px] sm:text-sm italic leading-relaxed">
                "I declare that the work submitted is my own, and has not been copied or plagiarized from any person or source."
              </p>
              <div className="flex flex-col items-center w-full">
                <div ref={sigContainerRef} className="bg-white border-2 border-gray-300 rounded-lg shadow-inner overflow-hidden w-full max-w-[600px] h-[200px]">
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

            <div className="pt-8 sm:pt-12 flex justify-center print:hidden">
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
      </div>
    </>
  )
}

export default AssessmentForm
