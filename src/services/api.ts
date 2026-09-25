import { AssessmentResult, CriterionDoc, DashboardStats, User } from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    collegeName: string;
  }): Promise<{ token: string; user: User; message: string }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: User; message: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/auth/me');
  },

  // Criteria
  async getCriteria(type: 'aicte' | 'ugc'): Promise<{ type: string; count: number; criteria: CriterionDoc[] }> {
    return request(`/criteria/${type}`);
  },

  async updateCriterion(type: 'aicte' | 'ugc', id: string, updates: Partial<CriterionDoc>): Promise<{ message: string; criterion: CriterionDoc }> {
    return request(`/criteria/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Assessments
  async evaluateAssessment(
    moduleType: 'aicte' | 'ugc',
    formData: any,
    saveResult = false
  ): Promise<{ assessment: AssessmentResult; isSaved: boolean }> {
    return request('/assessments/evaluate', {
      method: 'POST',
      body: JSON.stringify({ moduleType, formData, saveResult }),
    });
  },

  async saveAssessment(assessment: AssessmentResult): Promise<{ message: string; assessment: AssessmentResult }> {
    return request('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    });
  },

  async getHistory(): Promise<{ total: number; assessments: AssessmentResult[] }> {
    return request('/assessments');
  },

  async getAssessmentById(id: string): Promise<{ assessment: AssessmentResult }> {
    return request(`/assessments/${id}`);
  },

  async deleteAssessment(id: string): Promise<{ message: string }> {
    return request(`/assessments/${id}`, {
      method: 'DELETE',
    });
  },

  async getStatsSummary(): Promise<DashboardStats> {
    return request('/assessments/stats/summary');
  },
};
