import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link, Copy, Check, Clock, UserCheck, FileText, ChevronRight, AlertCircle, ExternalLink, ChevronDown, ChevronUp, Printer, X, Trash2, Download } from 'lucide-react'
import Layout from '../components/Layout'
import { availableQuestions } from '../data'
import { SubmissionPdfRenderer } from '../components/SubmissionPdfRenderer'

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
  const [activeStudentModal, setActiveStudentModal] = useState<any>(null)
  const [selectedPdfIds, setSelectedPdfIds] = useState<Set<string>>(new Set())
  const [downloadingSubIds, setDownloadingSubIds] = useState<string[]>([])

  useEffect(() => { setSelectedPdfIds(new Set()) }, [activeStudentModal?.student_id])

  const triggerSinglePdf = (subId: string) => {
    setDownloadingSubIds(prev => [...prev, subId])
  }

  const handleDownloadAllPdfs = () => {
    const ids = Array.from(selectedPdfIds)
    if (ids.length === 0) return
    // Queue them sequentially — each renderer removes itself from the list when done
    setDownloadingSubIds(prev => [...prev, ...ids.filter(id => !prev.includes(id))])
  }

  const gradedSubmissions = activeStudentModal?.submissions.filter((s: any) => s.status === 'graded') ?? []
  const allGradedSelected = gradedSubmissions.length > 0 && gradedSubmissions.every((s: any) => selectedPdfIds.has(s._id))

  const toggleSelectAll = () => {
    if (allGradedSelected) {
      setSelectedPdfIds(new Set())
    } else {
      setSelectedPdfIds(new Set(gradedSubmissions.map((s: any) => s._id)))
    }
  }

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

  const handleDeleteCommonAssessment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this common assessment link?')) return
    try {
      const result = await api.deleteCommonAssessment(id)
      if (result.error) throw new Error(result.error)
      alert('✅ Common link deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['commonAssessments'] })
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteStudentSubmissions = async (studentKey: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete all submissions for ${studentName}? This action cannot be undone.`)) return
    try {
      const result = await api.deleteStudentSubmissions(studentKey)
      if (result.error) throw new Error(result.error)
      alert(`✅ All submissions for ${studentName} deleted successfully!`)
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteSingleSubmission = async (id: string, templateName: string) => {
    if (!window.confirm(`Are you sure you want to delete the submission for "${templateName}"?`)) return
    try {
      const result = await api.deleteSubmission(id)
      if (result.error) throw new Error(result.error)
      alert('✅ Submission deleted successfully!')
      
      if (activeStudentModal) {
        const updatedSubmissions = activeStudentModal.submissions.filter((s: any) => s._id !== id)
        if (updatedSubmissions.length === 0) {
          setActiveStudentModal(null)
        } else {
          setActiveStudentModal({
            ...activeStudentModal,
            submissions: updatedSubmissions
          })
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    } catch (err: any) {
      alert('Error: ' + err.message)
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
                        const assessLink = `${window.location.origin}/common-assessment?token=${a.token}`
                        const isSelected = selectedQuestions.includes(a.token)
                        const assessmentSubmissions = submissions?.filter((sub: any) => sub.assessment_id?.token === a.token) || []
                        const isExpanded = expandedAssessment === a.token

                        return (
                          <tr
                            key={a._id}
                            className={`${isSelected ? 'bg-blue-50/50' : ''} hover:bg-gray-50 transition-colors`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectQuestion(a.token)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="font-black text-slate-800 text-xs uppercase tracking-wider">{availableQuestions.find(q => q.id === a.token)?.name || a.name || 'Assessment Task 4-6'}</div>
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
                              >
                                {assessLink}
                              </a>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-[11px] whitespace-nowrap">
                              <div className="font-bold">{new Date(a.created_at).toLocaleDateString()}</div>
                              <div className="text-[9px] opacity-60">{new Date(a.created_at).toLocaleTimeString()}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(assessLink)
                                  alert('✅ Link copied!')
                                }}
                                className="inline-flex items-center justify-center gap-1 text-white font-black text-[11px] bg-[#1e3a8a] px-3 py-1.5 rounded-lg hover:bg-[#1e40af] transition-all uppercase tracking-tight shadow-sm"
                              >
                                <Copy size={14} /> Copy
                              </button>
                            </td>
                          </tr>
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
                      const assessLink = `${window.location.origin}/common-assessment?token=${a.token}`
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
                                <div className="font-black text-slate-800 text-xs uppercase tracking-wider leading-tight">{availableQuestions.find(q => q.id === a.token)?.name || a.name}</div>
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
                          </div>
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
                              className="text-white bg-[#1e3a8a] p-2 rounded-lg hover:bg-blue-800 transition-colors"
                              title="Copy Common Link"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCommonAssessment(ca._id)}
                              className="text-white bg-red-600 p-2 rounded-lg hover:bg-red-700 transition-colors"
                              title="Delete Common Link"
                            >
                              <Trash2 size={14} />
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(commonLink)
                            alert('✅ Link copied!')
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1e3a8a] text-white rounded-lg font-black text-xs uppercase tracking-tight shadow-md active:scale-95 transition-all"
                        >
                          <Copy size={14} /> Copy
                        </button>
                        <button
                          onClick={() => handleDeleteCommonAssessment(ca._id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-tight shadow-md active:scale-95 transition-all hover:bg-red-700"
                          title="Delete Common Link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

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
                    <tr
                      key={group.id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => setActiveStudentModal(group)}
                    >
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
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveStudentModal(group)}
                            className="inline-flex items-center gap-1 text-[#1e3a8a] font-black text-[13px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-tight"
                          >
                            Review Student
                            <ChevronRight size={14} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudentSubmissions(group.id, group.student_name)}
                            className="text-white bg-red-600 p-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            title="Delete Student Submissions"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveStudentModal(group)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-[#1e3a8a] rounded-lg font-black text-xs uppercase tracking-tight border border-blue-100"
                      >
                        Review Assessments
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudentSubmissions(group.id, group.student_name)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-tight shadow-md active:scale-95 transition-all hover:bg-red-700"
                        title="Delete Student Submissions"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-50 w-full max-w-5xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#1e3a8a] text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-black text-lg tracking-tight uppercase m-0 p-0 border-none">{activeStudentModal.student_name}</h3>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-0.5">
                  Student ID: {activeStudentModal.student_id || '—'}
                </p>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="flex items-center justify-between bg-blue-50/50 px-5 py-4 rounded-2xl border border-blue-100">
                <span className="text-sm font-black uppercase text-slate-500 tracking-wider">Total Submissions:</span>
                <span className="bg-blue-600 text-white text-sm font-black px-4 py-1.5 rounded-full">
                  {activeStudentModal.submissions.length} {activeStudentModal.submissions.length === 1 ? 'Assessment' : 'Assessments'}
                </span>
              </div>

              <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-xs uppercase font-black text-gray-500 tracking-wider">
                        <th className="px-4 py-4 w-10">
                          <input
                            type="checkbox"
                            checked={allGradedSelected}
                            onChange={toggleSelectAll}
                            disabled={gradedSubmissions.length === 0}
                            title="Select all graded"
                            className="w-4 h-4 accent-blue-700 cursor-pointer disabled:opacity-30"
                          />
                        </th>
                        <th className="px-5 py-4">Assessment Template</th>
                        <th className="px-5 py-4">Submitted On</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeStudentModal.submissions.map((sub: any) => {
                        const isGraded = sub.status === 'graded';
                        return (
                          <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4">
                              {isGraded && (
                                <input
                                  type="checkbox"
                                  checked={selectedPdfIds.has(sub._id)}
                                  onChange={(e) => {
                                    const next = new Set(selectedPdfIds)
                                    if (e.target.checked) next.add(sub._id); else next.delete(sub._id)
                                    setSelectedPdfIds(next)
                                  }}
                                  className="w-4 h-4 accent-blue-700 cursor-pointer"
                                />
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-tight">
                                {availableQuestions.find(q => q.id === sub.assessment_id?.token)?.name || sub.assessment_id?.name || 'Question 1'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {sub._id.slice(-8)}</div>
                            </td>
                            <td className="px-5 py-4 text-xs sm:text-sm text-slate-500 font-semibold">
                              <div>{new Date(sub.submitted_at).toLocaleDateString()}</div>
                              <div className="text-[10px] opacity-60 mt-0.5">{new Date(sub.submitted_at).toLocaleTimeString()}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${isGraded
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                                }`}>
                                {isGraded ? <UserCheck size={12} /> : <Clock size={12} />}
                                {isGraded ? 'Graded' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {isGraded && (
                                  <button
                                    onClick={() => triggerSinglePdf(sub._id)}
                                    disabled={downloadingSubIds.includes(sub._id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                                    title="Download PDF"
                                  >
                                    {downloadingSubIds.includes(sub._id)
                                      ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Generating…</>
                                      : <><Printer size={14} /> PDF</>
                                    }
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    window.location.href = `/grade/${sub._id}`;
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase bg-[#1e3a8a] hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                                >
                                  Grade
                                </button>
                                <button
                                  onClick={() => handleDeleteSingleSubmission(sub._id, availableQuestions.find(q => q.id === sub.assessment_id?.token)?.name || sub.assessment_id?.name || 'Question')}
                                  className="inline-flex items-center justify-center text-white bg-red-600 hover:bg-red-700 p-2 rounded-xl shadow-sm transition-colors"
                                  title="Delete Submission"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between flex-shrink-0 gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadAllPdfs}
                  disabled={selectedPdfIds.size === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm transition-all outline-none"
                >
                  <Download size={15} />
                  Download All PDFs
                  {selectedPdfIds.size > 0 && (
                    <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedPdfIds.size}
                    </span>
                  )}
                </button>
                {selectedPdfIds.size > 0 && (
                  <span className="text-xs text-slate-500 font-semibold">
                    Each PDF opens in a new tab and downloads automatically.
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Off-screen PDF renderers — one per queued download */}
      {downloadingSubIds.map(subId => (
        <SubmissionPdfRenderer
          key={subId}
          submissionId={subId}
          onDone={() => setDownloadingSubIds(prev => prev.filter(id => id !== subId))}
        />
      ))}
    </Layout>
  )
}

export default Dashboard
