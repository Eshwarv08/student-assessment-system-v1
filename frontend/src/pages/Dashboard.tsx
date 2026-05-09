import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link, Copy, Check, Clock, UserCheck, FileText, ChevronRight, AlertCircle, ExternalLink, ChevronDown, ChevronUp, Printer } from 'lucide-react'
import Layout from '../components/Layout'
import { availableQuestions } from '../data'

const Dashboard: React.FC = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Auto-sync predefined static questions with the database so they always exist
    Promise.all(availableQuestions.map(q => api.createAssessment(q.name)))
      .then(() => queryClient.invalidateQueries({ queryKey: ['assessments'] }))
      .catch(console.error)
  }, [])

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading, error: subError } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      console.log('Fetching submissions...')
      const data = await api.getSubmissions()
      if (data.error) throw new Error(data.error)
      return data
    },
  })

  // Fetch assessments
  const { data: assessments, isLoading: assessmentsLoading, error: assessError } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      console.log('Fetching assessments...')
      const data = await api.getAssessments()
      if (data.error) throw new Error(data.error)
      return data
    },
  })

  // Fetch common assessments
  const { data: commonAssessments, isLoading: commonAssessmentsLoading } = useQuery({
    queryKey: ['commonAssessments'],
    queryFn: async () => {
      const data = await api.getCommonAssessments()
      if (data.error) throw new Error(data.error)
      return data
    },
  })

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null)

  // Group submissions by student
  const groupedSubmissions = React.useMemo(() => {
    if (!submissions) return []
    const groups: Record<string, any> = {}
    submissions.forEach((sub: any) => {
      const key = sub.student_id || sub.student_name
      if (!groups[key]) {
        groups[key] = {
          id: key,
          student_id: sub.student_id,
          student_name: sub.student_name,
          submissions: [],
          latest_submission: sub.submitted_at
        }
      }
      groups[key].submissions.push(sub)
      if (new Date(sub.submitted_at) > new Date(groups[key].latest_submission)) {
        groups[key].latest_submission = sub.submitted_at
      }
    })
    return Object.values(groups).sort((a: any, b: any) =>
      new Date(b.latest_submission).getTime() - new Date(a.latest_submission).getTime()
    )
  }, [submissions])

  const handleSelectQuestion = (token: string) => {
    setSelectedQuestions(prev =>
      prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]
    )
  }

  const handleGenerateCommonLink = async () => {
    if (selectedQuestions.length < 1) return
    setIsGenerating(true)
    try {
      const result = await api.createCommonAssessment(selectedQuestions)
      if (result.error) throw new Error(result.error)
      alert('✅ Common link generated successfully!')
      setSelectedQuestions([])
      queryClient.invalidateQueries({ queryKey: ['commonAssessments'] })
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-none normal-case m-0 p-0">Assessor Dashboard</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Manage student links and grade submissions</p>
          </div>
        </div>

        {(subError || assessError) && (
          <div className="bg-blue-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5" />
            <div>
              <p className="font-bold">Database Connection Issue</p>
              <p className="opacity-80">There was an error loading your data. Please ensure you have the correct permissions and the database is configured.</p>
              <p className="mt-1 text-[10px] font-mono">{(subError || assessError)?.message}</p>
            </div>
          </div>
        )}

        {/* Submissions Table/Cards */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              Recent Submissions
            </h3>
            <span className="bg-gray-200 text-gray-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
              {submissions?.length || 0} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left hidden sm:table">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-black">Student</th>
                  <th className="px-6 py-4 font-black hidden lg:table-cell">ID</th>
                  <th className="px-6 py-4 font-black">Submitted</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissionsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : !groupedSubmissions.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Clock size={48} className="mx-auto mb-4 opacity-20" />
                      No submissions found yet.
                    </td>
                  </tr>
                ) : (
                  groupedSubmissions.map((group: any) => (
                    <React.Fragment key={group.id}>
                      <tr className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setExpandedStudent(expandedStudent === group.id ? null : group.id)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="font-black text-gray-900 text-base">{group.student_name}</div>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                              {group.submissions.length} {group.submissions.length === 1 ? 'Assessment' : 'Assessments'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm hidden lg:table-cell">{group.student_id || '—'}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          <div className="font-bold">{new Date(group.latest_submission).toLocaleDateString()}</div>
                          <div className="text-[10px] opacity-60">Latest Submission</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${group.submissions.every((s: any) => s.status === 'graded')
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {group.submissions.every((s: any) => s.status === 'graded') ? <UserCheck size={10} /> : <Clock size={10} />}
                            {group.submissions.every((s: any) => s.status === 'graded') ? 'All Graded' : group.submissions.some((s: any) => s.status === 'graded') ? 'Partially Graded' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="inline-flex items-center gap-1 text-[#1e3a8a] font-black text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-tight"
                          >
                            {expandedStudent === group.id ? 'Close' : 'Review Student'}
                            {expandedStudent === group.id ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                          </button>
                        </td>
                      </tr>
                      {expandedStudent === group.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50/50">
                            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
                              <table className="w-full text-left">
                                <thead className="bg-blue-50/50">
                                  <tr className="text-[10px] uppercase font-black text-blue-900 tracking-wider">
                                    <th className="px-4 py-3">Assessment Template</th>
                                    <th className="px-4 py-3">Submitted On</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-50">
                                  {group.submissions.map((sub: any) => (
                                    <tr key={sub._id} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="px-4 py-3">
                                        <div className="font-bold text-gray-800 text-sm">{sub.assessment_id?.name || 'Question 1'}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {sub._id.slice(-8)}</div>
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(sub.submitted_at).toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${sub.status === 'graded'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-amber-100 text-amber-700'
                                          }`}>
                                          {sub.status === 'graded' ? 'Graded' : 'Pending'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                          {sub.status === 'graded' && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/grade/${sub._id}?print=true`;
                                              }}
                                              className="text-[10px] font-black uppercase bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                                            >
                                              <Printer size={10} /> PDF
                                            </button>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.location.href = `/grade/${sub._id}`;
                                            }}
                                            className="text-[10px] font-black uppercase bg-[#1e3a8a] text-white px-3 py-1 rounded-md hover:bg-blue-800 transition-colors"
                                          >
                                            Review & Grade
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y">
              {submissionsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))
              ) : !groupedSubmissions.length ? (
                <div className="p-12 text-center text-gray-400">
                  <Clock size={48} className="mx-auto mb-4 opacity-20" />
                  No submissions found yet.
                </div>
              ) : (
                groupedSubmissions.map((group: any) => (
                  <div key={group.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-gray-900 text-base">{group.student_name}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">ID: {group.student_id || '—'}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${group.submissions.every((s: any) => s.status === 'graded')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {group.submissions.every((s: any) => s.status === 'graded') ? 'Graded' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>{group.submissions.length} Assessments</span>
                      <span>Last: {new Date(group.latest_submission).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => setExpandedStudent(expandedStudent === group.id ? null : group.id)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-[#1e3a8a] rounded-lg font-black text-xs uppercase tracking-tight border border-blue-100"
                    >
                      {expandedStudent === group.id ? 'Hide Details' : 'Review Assessments'}
                      {expandedStudent === group.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {expandedStudent === group.id && (
                      <div className="mt-2 space-y-2 animate-in slide-in-from-top-2">
                        {group.submissions.map((sub: any) => (
                          <div key={sub._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                            <div className="font-bold text-gray-800 text-xs">{sub.assessment_id?.name || 'Question 1'}</div>
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {sub.status}
                              </span>
                              <span className="text-[10px] text-gray-400">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                              {sub.status === 'graded' && (
                                <button
                                  onClick={() => window.location.href = `/grade/${sub._id}?print=true`}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 text-white rounded text-[10px] font-black uppercase"
                                >
                                  <Printer size={12} /> PDF
                                </button>
                              )}
                              <button
                                onClick={() => window.location.href = `/grade/${sub._id}`}
                                className="flex-1 py-1.5 bg-[#1e3a8a] text-white rounded text-[10px] font-black uppercase"
                              >
                                Grade
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Generated Links Table/Cards */}
        <div className="space-y-4">
          {selectedQuestions.length > 0 && (
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={handleGenerateCommonLink}
                disabled={isGenerating}
                className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-top-4"
              >
                <Link size={18} />
                {isGenerating ? 'Generating...' : `Generate Link for ${selectedQuestions.length} Questions`}
              </button>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Link size={18} className="text-gray-400" />
                Generated Assessment Links
              </h3>
            </div>

            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full text-left hidden sm:table">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-black w-10">Select</th>
                    <th className="px-6 py-4 font-black">Template Name</th>
                    <th className="px-6 py-4 font-black hidden lg:table-cell">Assessment Link</th>
                    <th className="px-6 py-4 font-black">Created</th>
                    <th className="px-6 py-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assessmentsLoading ? (
                    <tr><td colSpan={5} className="px-6 py-8 animate-pulse bg-gray-50"></td></tr>
                  ) : !assessments?.filter((a: any) => availableQuestions.some(q => q.id === a.token)).length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No links generated yet.
                      </td>
                    </tr>
                  ) : (
                    assessments
                      .filter((a: any) => availableQuestions.some(q => q.id === a.token))
                      .sort((a: any, b: any) => {
                        const indexA = availableQuestions.findIndex(q => q.id === a.token);
                        const indexB = availableQuestions.findIndex(q => q.id === b.token);
                        return indexA - indexB;
                      })
                      .map((a: any) => {
                        const assessLink = `${window.location.origin}/assessment?token=${a.token}`
                        const isSelected = selectedQuestions.includes(a.token)
                        const assessmentSubmissions = submissions?.filter((sub: any) => sub.assessment_id?.token === a.token) || []
                        const isExpanded = expandedAssessment === a.token

                        return (
                          <React.Fragment key={a._id}>
                            <tr
                              className={`${isSelected ? 'bg-blue-50/50' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                              onClick={() => setExpandedAssessment(isExpanded ? null : a.token)}
                            >
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectQuestion(a.token)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="font-black text-slate-800 text-xs uppercase tracking-wider">{a.name || 'Assessment Task 4-6'}</div>
                                  {assessmentSubmissions.length > 0 && (
                                    <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                      {assessmentSubmissions.length} Submissions
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                <a
                                  href={assessLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 font-mono text-[11px] underline truncate block max-w-[320px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {assessLink}
                                </a>
                              </td>
                              <td className="px-6 py-4 text-slate-400 text-[11px] whitespace-nowrap">
                                <div className="font-bold">{new Date(a.created_at).toLocaleDateString()}</div>
                                <div className="text-[9px] opacity-60">{new Date(a.created_at).toLocaleTimeString()}</div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setExpandedAssessment(isExpanded ? null : a.token)}
                                    className="inline-flex items-center gap-1 text-[#1e3a8a] font-black text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-tight"
                                  >
                                    {isExpanded ? 'Close' : 'Review Assessments'}
                                    {isExpanded ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(assessLink)
                                      alert('✅ Link copied!')
                                    }}
                                    className="inline-flex items-center justify-center gap-1 text-white font-black text-[11px] bg-[#1e3a8a] px-3 py-1.5 rounded-lg hover:bg-[#1e40af] transition-all uppercase tracking-tight shadow-sm"
                                  >
                                    <Copy size={14} /> Copy
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-gray-50/30">
                                <td colSpan={5} className="px-12 py-4">
                                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    {assessmentSubmissions.length === 0 ? (
                                      <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                                        No submissions yet.
                                      </div>
                                    ) : (
                                      <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50">
                                          <tr className="text-[9px] uppercase font-black text-gray-500 tracking-wider">
                                            <th className="px-4 py-2">Student</th>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2 text-right">Action</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                          {assessmentSubmissions.map((sub: any) => (
                                            <tr key={sub._id} className="hover:bg-blue-50/20">
                                              <td className="px-4 py-3 font-black text-gray-800">{sub.student_name}</td>
                                              <td className="px-4 py-3 text-gray-500">{sub.student_id || '—'}</td>
                                              <td className="px-4 py-3 text-gray-400">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                                              <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                  {sub.status}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-right">
                                                <button onClick={() => window.location.href = `/grade/${sub._id}`} className="bg-[#1e3a8a] text-white px-2 py-1 rounded text-[9px] font-black uppercase">Grade</button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })
                  )}
                </tbody>
              </table>

              {/* Mobile View for Links */}
              <div className="sm:hidden divide-y">
                {assessmentsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  ))
                ) : !assessments?.filter((a: any) => availableQuestions.some(q => q.id === a.token)).length ? (
                  <div className="p-12 text-center text-gray-400">
                    <Link size={48} className="mx-auto mb-4 opacity-20" />
                    No links generated yet.
                  </div>
                ) : (
                  assessments
                    .filter((a: any) => availableQuestions.some(q => q.id === a.token))
                    .sort((a: any, b: any) => {
                      const indexA = availableQuestions.findIndex(q => q.id === a.token);
                      const indexB = availableQuestions.findIndex(q => q.id === b.token);
                      return indexA - indexB;
                    })
                    .map((a: any) => {
                      const assessLink = `${window.location.origin}/assessment?token=${a.token}`
                      const isSelected = selectedQuestions.includes(a.token)
                      const assessmentSubmissions = submissions?.filter((sub: any) => sub.assessment_id?.token === a.token) || []
                      const isExpanded = expandedAssessment === a.token

                      return (
                        <div key={a._id} className={`p-4 flex flex-col gap-3 ${isSelected ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectQuestion(a.token)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <div className="font-black text-slate-800 text-xs uppercase tracking-wider leading-tight">{a.name}</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(a.created_at).toLocaleDateString()}</span>
                                  {assessmentSubmissions.length > 0 && (
                                    <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                      {assessmentSubmissions.length} {assessmentSubmissions.length === 1 ? 'Submission' : 'Submissions'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(assessLink)
                                alert('✅ Link copied!')
                              }}
                              className="p-2 bg-[#1e3a8a] text-white rounded-lg shadow-sm active:scale-95 transition-transform"
                            >
                              <Copy size={14} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="text-[10px] bg-white p-2 rounded border border-gray-100 font-mono text-blue-600 truncate">
                              {assessLink}
                            </div>
                            <button
                              onClick={() => setExpandedAssessment(isExpanded ? null : a.token)}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-[#1e3a8a] rounded-lg font-black text-xs uppercase tracking-tight border border-blue-100"
                            >
                              {isExpanded ? 'Hide Submissions' : 'Review Assessments'}
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 space-y-2 animate-in slide-in-from-top-2">
                              {assessmentSubmissions.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                  No submissions yet.
                                </div>
                              ) : (
                                assessmentSubmissions.map((sub: any) => (
                                  <div key={sub._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-bold text-gray-800 text-xs">{sub.student_name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {sub.student_id || '—'}</div>
                                      </div>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {sub.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-400">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                      <div className="flex gap-2">
                                        {sub.status === 'graded' && (
                                          <button
                                            onClick={() => window.location.href = `/grade/${sub._id}?print=true`}
                                            className="flex items-center justify-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-[9px] font-black uppercase"
                                          >
                                            <Printer size={12} /> PDF
                                          </button>
                                        )}
                                        <button
                                          onClick={() => window.location.href = `/grade/${sub._id}`}
                                          className="px-3 py-1 bg-[#1e3a8a] text-white rounded text-[9px] font-black uppercase"
                                        >
                                          Grade
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Common Links Table/Cards */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Link size={18} className="text-gray-400" />
              Common Assessment Links
            </h3>
            <span className="bg-[#1e3a8a] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
              {commonAssessments?.length || 0} Links
            </span>
          </div>

          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-left hidden sm:table">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-black">Included Questions</th>
                  <th className="px-6 py-4 font-black hidden lg:table-cell">Common Link</th>
                  <th className="px-6 py-4 font-black">Created</th>
                  <th className="px-6 py-4 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {commonAssessmentsLoading ? (
                  <tr><td colSpan={4} className="px-6 py-8 animate-pulse bg-gray-50"></td></tr>
                ) : !commonAssessments?.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No common links found.
                    </td>
                  </tr>
                ) : (
                  commonAssessments.map((ca: any) => {
                    const commonLink = `${window.location.origin}/common-assessment?token=${ca.token}`
                    return (
                      <tr key={ca._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {ca.question_ids.map((qid: string) => (
                              <span key={qid} className="bg-blue-50 text-[#1e3a8a] text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase">
                                {availableQuestions.find(q => q.id === qid)?.name || qid}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <a href={commonLink} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-blue-600 underline truncate block max-w-[200px]">
                            {commonLink}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(ca.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(commonLink)
                                alert('✅ Link copied!')
                              }}
                              className="text-white bg-[#1e3a8a] p-2 rounded-lg"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="sm:hidden divide-y">
              {commonAssessments?.map((ca: any) => {
                const commonLink = `${window.location.origin}/common-assessment?token=${ca.token}`
                return (
                  <div key={ca._id} className="p-4 space-y-4 hover:bg-gray-50/50 transition-colors">
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Included Questions:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ca.question_ids.map((qid: string) => (
                          <span key={qid} className="bg-blue-50 text-[#1e3a8a] text-[9px] font-black px-2 py-1 rounded border border-blue-100 uppercase shadow-sm">
                            {availableQuestions.find(q => q.id === qid)?.name || qid}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] bg-white p-2 rounded border border-gray-100 font-mono text-blue-600 truncate">
                        {commonLink}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(commonLink)
                          alert('✅ Link copied!')
                        }}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-[#1e3a8a] text-white rounded-lg font-black text-xs uppercase tracking-tight shadow-md active:scale-95 transition-all"
                      >
                        <Copy size={14} /> Copy Common Link
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
