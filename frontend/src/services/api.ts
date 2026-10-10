const API_BASE = '/api';

let activeToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  activeToken = token;
};

export const getAuthToken = () => activeToken;

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
};

export const api = {
  getHealth: () => request<{ status: string; app_name: string; llm_provider: string }>('/health'),

  login: (email: string, password: string) =>
    request<{ access_token: string; role: string; email: string; display_name: string; workspace_id: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    ),

  demoSwitchRole: (role: string) =>
    request<{ access_token: string; role: string; email: string; display_name: string; workspace_id: string; workspace_name: string }>(
      `/auth/demo-switch?role=${role}`,
      { method: 'POST' }
    ),

  getContent: (params?: { status?: string; platform?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.platform && params.platform !== 'all') query.append('platform', params.platform);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<any[]>(`/content${qs ? `?${qs}` : ''}`);
  },

  createContent: (payload: { title: string; body: string; platform: string; format: string; language: string; tone: string; campaign_id?: string }) =>
    request<any>('/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  transitionContent: (contentId: string, action: string, feedback?: string, scheduledAt?: string) =>
    request<any>(`/content/${contentId}/transition`, {
      method: 'POST',
      body: JSON.stringify({ action, feedback, scheduled_at: scheduledAt }),
    }),

  generateAI: (payload: { topic: string; platform: string; format_type: string; tone: string; language: string }) =>
    request<{ title: string; body: string; provider: string; model: string }>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  repurposeAI: (sourceBody: string, targetPlatform: string) =>
    request<{ target_platform: string; adapted_body: string }>('/ai/repurpose', {
      method: 'POST',
      body: JSON.stringify({ source_body: sourceBody, target_platform: targetPlatform }),
    }),

  qualityCheckAI: (body: string, platform: string) =>
    request<any>('/ai/quality-check', {
      method: 'POST',
      body: JSON.stringify({ body, platform }),
    }),

  getBrandProfile: () => request<any>('/brand-profile'),

  updateBrandProfile: (payload: any) =>
    request<any>('/brand-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getCampaigns: () => request<any[]>('/campaigns'),

  getCalendar: () => request<any[]>('/calendar'),
};
