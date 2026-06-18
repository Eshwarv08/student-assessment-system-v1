import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { downloadBookletAsPdf } from '../lib/downloadPdf';
import { Q1Booklet } from './Q1Booklet';
import { Q2Booklet } from './Q2Booklet';
import { Q3Booklet } from './Q3Booklet';
import { Q4Booklet } from './Q4Booklet';
import { Q5Booklet } from './Q5Booklet';
import { Q6Booklet } from './Q6Booklet';
import { Q7Booklet } from './Q7Booklet';
import { Q8Booklet } from './Q8Booklet';
import { Q9Booklet } from './Q9Booklet';
import { Q10Booklet } from './Q10Booklet';
import { Q11Booklet } from './Q11Booklet';
import { Q12Booklet } from './Q12Booklet';
import { Q13Booklet } from './Q13Booklet';
import { Q14Booklet } from './Q14Booklet';
import { Q15Booklet } from './Q15Booklet';

interface Props {
  submissionId: string;
  onDone: () => void;
}

const NOOP = () => {};
const NOOP_ASYNC = async () => {};

const TOKEN_MAP: Record<string, { cls: string; Component: React.ComponentType<any> }> = {
  'question-1':  { cls: 'q1-booklet-view',  Component: Q1Booklet },
  'question-2':  { cls: 'q2-booklet-view',  Component: Q2Booklet },
  'question-3':  { cls: 'q3-booklet-view',  Component: Q3Booklet },
  'question-4':  { cls: 'q4-booklet-view',  Component: Q4Booklet },
  'question-5':  { cls: 'q5-booklet-view',  Component: Q5Booklet },
  'question-6':  { cls: 'q6-booklet-view',  Component: Q6Booklet },
  'question-7':  { cls: 'q7-booklet-view',  Component: Q7Booklet },
  'question-8':  { cls: 'q8-booklet-view',  Component: Q8Booklet },
  'question-9':  { cls: 'q9-booklet-view',  Component: Q9Booklet },
  'question-10': { cls: 'q10-booklet-view', Component: Q10Booklet },
  'question-11': { cls: 'q11-booklet-view', Component: Q11Booklet },
  'question-12': { cls: 'q12-booklet-view', Component: Q12Booklet },
  'question-13': { cls: 'q13-booklet-view', Component: Q13Booklet },
  'question-14': { cls: 'q14-booklet-view', Component: Q14Booklet },
  'question-15': { cls: 'q15-booklet-view', Component: Q15Booklet },
};

export const SubmissionPdfRenderer: React.FC<Props> = ({ submissionId, onDone }) => {
  const [submission, setSubmission] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.getSubmission(submissionId).then((data: any) => {
      setSubmission(data);
      // Give React time to paint the booklet into the hidden container
      setTimeout(() => setReady(true), 1800);
    }).catch(() => { alert('Failed to load submission data.'); onDone(); });
  }, [submissionId]);

  useEffect(() => {
    if (!ready || !submission) return;
    const token = (submission.assessment_id?.token || 'question-1').toLowerCase();
    const entry = TOKEN_MAP[token];
    if (!entry) { onDone(); return; }

    const studentName = submission.student_name || 'Assessment';
    downloadBookletAsPdf(entry.cls, `${token.toUpperCase()}-${studentName}.pdf`)
      .catch(() => {})
      .finally(onDone);
  }, [ready, submission]);

  if (!submission) return null;

  const token = (submission.assessment_id?.token || 'question-1').toLowerCase();
  const entry = TOKEN_MAP[token];
  if (!entry) return null;

  const { Component } = entry;
  const answers = submission.answers || {};
  const compRecord = submission.comp_record || {};
  const studentName = submission.student_name || '';
  const submitDate = submission.submitted_at || '';

  return (
    <div
      style={{
        position: 'fixed',
        left: '-99999px',
        top: 0,
        width: '210mm',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      <Component
        answers={answers}
        setAnswers={NOOP}
        onSubmit={NOOP_ASYNC}
        submitting={false}
        studentName={studentName}
        submitDate={submitDate}
        isStudent={false}
        compRecord={compRecord}
        setCompRecord={NOOP}
      />
    </div>
  );
};
