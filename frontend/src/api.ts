/**
 * API Utility with JWT Token Management
 * Automatically attaches access tokens and handles token refresh
 */

const API_BASE_URL = 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Set access token in localStorage
 */
function setAccessToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

/**
 * Remove access token from localStorage
 */
function removeAccessToken(): void {
  localStorage.removeItem('accessToken');
}

/**
 * Refresh the access token using the refresh token in httpOnly cookie
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * Automatically adds Authorization header and handles token refresh
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add Authorization header if not skipping auth
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Make the request
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  let response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include', // Include cookies for refresh token
  });

  // If unauthorized and we haven't already tried to refresh, attempt token refresh
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry the original request with new token
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include',
      });
    } else {
      // Refresh failed - clear tokens and redirect to login
      removeAccessToken();
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
  }

  // Parse response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Convenience methods for different HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Plant and Document Type APIs
 */
export const plantApi = {
  // Get all available plants
  getPlants: () => api.get('/api/plants'),

  // Get available document types for a plant
  getDocumentTypes: (plantNo: number) =>
    api.get(`/api/plants/${plantNo}/documents`),

  // Get financial data for a specific document type
  getDocumentData: (plantNo: number, docTypeCode: string) =>
    api.get(`/api/plants/${plantNo}/documents/${encodeURIComponent(docTypeCode)}/data`),
};

export default api;

