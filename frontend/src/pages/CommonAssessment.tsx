import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { availableQuestions } from '../data'
import { Link, ExternalLink, FileText, AlertCircle, Loader2, UserCheck, CheckCircle2, Clock } from 'lucide-react'

const CommonAssessment: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const queryClient = useQueryClient()

  const [studentInfo, setStudentInfo] = useState<{ name: string, id: string } | null>(() => {
    const saved = localStorage.getItem('student_info')
    return saved ? JSON.parse(saved) : null
  })

  const [verifying, setVerifying] = useState(false)

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ['commonAssessment', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided')
      
      // If the token is a direct single question token, return it as a single-item array
      if (token.startsWith('question-')) {
        return { question_ids: [token] }
      }

      const data = await api.validateCommonToken(token)
      if (data.error) throw new Error(data.error)
      return data
    },
    enabled: !!token
  })

  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['submissionStatus', studentInfo?.id],
    queryFn: async () => {
      if (!studentInfo?.id) return null
      return api.getSubmissionStatus(studentInfo.id)
    },
    enabled: !!studentInfo?.id
  })

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setVerifying(true)
    const formData = new FormData(e.currentTarget)
    const info = {
      name: formData.get('st-name') as string,
      id: formData.get('st-id') as string
    }

    // Simulate a quick check or just save
    setTimeout(() => {
      setStudentInfo(info)
      localStorage.setItem('student_info', JSON.stringify(info))
      setVerifying(false)
    }, 800)
  }

  const handleLogout = () => {
    setStudentInfo(null)
    localStorage.removeItem('student_info')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#1e3a8a] mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Assessment Set...</p>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-500 mb-8 font-medium">This assessment link is either invalid or has expired. Please contact your assessor.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-blue-50">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <UserCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Student Verification</h2>
            <p className="text-gray-500 font-medium italic">Please identify yourself to continue</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                name="st-name"
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student ID</label>
              <input
                name="st-id"
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300"
                placeholder="Enter your ID number"
              />
            </div>
            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {verifying ? <Loader2 className="animate-spin" size={20} /> : 'Access Assessment'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-blue-50 shadow-sm">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Verified Student</p>
              <p className="text-sm font-black text-gray-900 truncate max-w-[150px]">{studentInfo.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 text-[10px] font-black text-red-500 uppercase hover:underline"
            >
              Change
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portal Version</p>
            <p className="text-sm font-black text-[#1e3a8a]">v2.1.0-Elite</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <img
            src="/assets/Skilscope.png"
            alt="Skilscope Logo"
            className="w-24 h-24 object-contain mb-6 drop-shadow-sm mx-auto"
          />
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-4 uppercase">
            Assessment <span className="text-blue-600">Portal</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-lg mx-auto leading-relaxed italic">
            "Complete each task below. Your progress is automatically tracked across all your devices."
          </p>
        </div>

        <div className="grid gap-6">
          {assessment.question_ids.map((qid: string, index: number) => {
            const questionData = availableQuestions.find(q => q.id === qid)
            const isCompleted = statusData?.completedTokens?.includes(qid)
            const assessmentLink = `/assessment?token=${qid}&st-name=${encodeURIComponent(studentInfo.name)}&st-id=${encodeURIComponent(studentInfo.id)}`

            return (
              <div
                key={qid}
                className={`bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border-2 transition-all group relative overflow-hidden ${isCompleted ? 'border-green-100 bg-green-50/20' : 'border-gray-50 hover:border-blue-100 hover:shadow-xl'
                  }`}
              >
                {/* Background Decor */}
                <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-5 group-hover:scale-150 transition-transform ${isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-50 text-[#1e3a8a] group-hover:bg-[#1e3a8a] group-hover:text-white'
                      }`}>
                      {isCompleted ? <CheckCircle2 size={28} /> : index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                          {questionData?.name || qid}
                        </h3>
                        {isCompleted && (
                          <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-bold ${isCompleted ? 'text-green-600/70' : 'text-gray-400'}`}>
                        {isCompleted
                          ? 'This task has been successfully submitted.'
                          : 'Demonstrate your proficiency by completing this task.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!isCompleted && (
                      <div className="flex flex-col items-end mr-2 hidden md:flex">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Status</span>
                        <div className="flex items-center gap-1.5 text-orange-500 font-black text-xs uppercase tracking-tight bg-orange-50 px-3 py-1 rounded-full">
                          <Clock size={12} /> Pending
                        </div>
                      </div>
                    )}

                    <a
                      href={isCompleted ? '#' : assessmentLink}
                      onClick={(e) => isCompleted && e.preventDefault()}
                      className={`flex-shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg active:scale-95 ${isCompleted
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-[#1e3a8a] text-white hover:bg-blue-700 shadow-blue-100'
                        }`}
                    >
                      {isCompleted ? 'Task Locked' : 'Start Assessment'}
                      {!isCompleted && <ExternalLink size={18} strokeWidth={3} />}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <footer className="bg-white border-t border-gray-200 mt-24 no-print shadow-inner rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto py-16 px-4">
            <div className="flex flex-col items-center text-center gap-8">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/assets/Yencode Logo.png"
                  alt="Yencode Technologies Logo"
                  className="h-14 object-contain"
                />
                <div>
                  <p className="text-base font-black text-[#1e3a8a] uppercase tracking-[0.2em]">Yencode Technologies</p>
                  <a href="https://yencodetechnologies.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-[#1e3a8a] transition-colors font-bold">www.yencodetechnologies.com</a>
                </div>
              </div>

              <div className="space-y-3 bg-gray-50 px-8 py-6 rounded-3xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Contact Support</p>
                <p className="text-base font-bold text-gray-600">For any issues contact us: <a href="mailto:info@yencodetechnologies.com" className="text-[#1e3a8a] hover:underline font-black">info@yencodetechnologies.com</a></p>
              </div>

            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CommonAssessment
