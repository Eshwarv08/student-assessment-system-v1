const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('auth_token', data.token);
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // Assessments
  getAssessments: async () => {
    const res = await fetch(`${API_URL}/assessments`, { headers: getHeaders() });
    return res.json();
  },

  createAssessment: async (name: string) => {
    const res = await fetch(`${API_URL}/assessments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    return res.json();
  },

  validateToken: async (token: string) => {
    const res = await fetch(`${API_URL}/assessments/validate/${token}`);
    return res.json();
  },

  // Common Assessments (Multi-link)
  getCommonAssessments: async () => {
    const res = await fetch(`${API_URL}/common-assessments`, { headers: getHeaders() });
    return res.json();
  },

  createCommonAssessment: async (questionIds: string[]) => {
    const res = await fetch(`${API_URL}/common-assessments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question_ids: questionIds })
    });
    return res.json();
  },

  validateCommonToken: async (token: string) => {
    const res = await fetch(`${API_URL}/common-assessments/validate/${token}`);
    return res.json();
  },


  // Submissions
  getSubmissions: async () => {
    const res = await fetch(`${API_URL}/submissions`, { headers: getHeaders() });
    return res.json();
  },

  getSubmission: async (id: string) => {
    const res = await fetch(`${API_URL}/submissions/${id}`, { headers: getHeaders() });
    return res.json();
  },

  submitAssessment: async (payload: any) => {
    const res = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateSubmission: async (id: string, payload: any) => {
    const res = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getSubmissionStatus: async (studentId: string) => {
    const res = await fetch(`${API_URL}/submissions/status/${studentId}`);
    return res.json();
  }
};

