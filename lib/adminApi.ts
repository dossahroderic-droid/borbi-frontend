const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borbi-backend.onrender.com/api';

const getToken = () => localStorage.getItem('token');

export const adminApi = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erreur API');
  return data;
};

// Dashboard
export const getAdminDashboard = () => adminApi('/admin/dashboard');

// Utilisateurs
export const getAdminUsers = (filters?: any) => {
  const params = new URLSearchParams(filters).toString();
  return adminApi(`/admin/users${params ? `?${params}` : ''}`);
};
export const disableUser = (userId: string) => adminApi(`/admin/users/${userId}/disable`, { method: 'POST' });
export const deleteUser = (userId: string) => adminApi(`/admin/users/${userId}`, { method: 'DELETE' });

// Commissions
export const getCommissions = (filters?: any) => {
  const params = new URLSearchParams(filters).toString();
  return adminApi(`/admin/commissions${params ? `?${params}` : ''}`);
};
export const markCommissionCollected = (commissionId: string) =>
  adminApi(`/admin/commissions/${commissionId}/collect`, { method: 'POST' });

// Sponsoring
export const getSponsoredProducts = () => adminApi('/admin/sponsored-products');
export const createSponsoredProduct = (data: any) =>
  adminApi('/admin/sponsored-products', { method: 'POST', body: JSON.stringify(data) });
export const updateSponsoredProduct = (id: string, data: any) =>
  adminApi(`/admin/sponsored-products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSponsoredProduct = (id: string) =>
  adminApi(`/admin/sponsored-products/${id}`, { method: 'DELETE' });

// Grossistes
export const getWholesalers = () => adminApi('/admin/wholesalers');
export const toggleFeatured = (wholesalerId: string) =>
  adminApi(`/admin/wholesalers/${wholesalerId}/toggle-featured`, { method: 'POST' });

// Messages (modération)
export const getAdminMessages = (filters?: any) => {
  const params = new URLSearchParams(filters).toString();
  return adminApi(`/admin/messages${params ? `?${params}` : ''}`);
};
export const blockUser = (userId: string) => adminApi(`/admin/users/${userId}/block`, { method: 'POST' });

// Audit logs
export const getAuditLogs = (filters?: any) => {
  const params = new URLSearchParams(filters).toString();
  return adminApi(`/admin/audit-logs${params ? `?${params}` : ''}`);
};

// Suppression données (droit à l'oubli)
export const getDeletionRequests = () => adminApi('/admin/deletion-requests');
export const anonymizeClient = (requestId: string) =>
  adminApi(`/admin/deletion-requests/${requestId}/anonymize`, { method: 'POST' });

// Licences
export const getLicenses = () => adminApi('/admin/licenses');
export const createLicense = (data: any) => adminApi('/admin/licenses', { method: 'POST', body: JSON.stringify(data) });
export const renewLicense = (id: string) => adminApi(`/admin/licenses/${id}/renew`, { method: 'POST' });
export const cancelLicense = (id: string) => adminApi(`/admin/licenses/${id}/cancel`, { method: 'POST' });

// Affiliation
export const getAffiliateLinks = () => adminApi('/admin/affiliate-links');
export const createAffiliateLink = (data: any) =>
  adminApi('/admin/affiliate-links', { method: 'POST', body: JSON.stringify(data) });

// Data Insights
export const getDataInsights = () => adminApi('/admin/data-insights');
export const getSubscribers = () => adminApi('/admin/data-subscribers');
export const addSubscriber = (data: any) => adminApi('/admin/data-subscribers', { method: 'POST', body: JSON.stringify(data) });
