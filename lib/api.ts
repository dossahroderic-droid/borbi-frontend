const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borbi-backend.onrender.com/api';

export const api = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Une erreur est survenue');
  return data;
};

// Auth
export const login = (identifier: string, password: string) =>
  api('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });

export const register = (data: any) =>
  api('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Produits
export const getDefaultProducts = () => api('/products/default');
export const getVendorProducts = () => api('/vendors/products');
export const addVendorProduct = (data: any) =>
  api('/vendors/products', { method: 'POST', body: JSON.stringify(data) });

// Clients
export const getClients = () => api('/vendors/clients');
export const createClient = (data: any) =>
  api('/vendors/clients', { method: 'POST', body: JSON.stringify(data) });

// Transactions
export const createTransaction = (data: any) =>
  api('/vendors/transactions', { method: 'POST', body: JSON.stringify(data) });

// Commandes
export const getOrders = () => api('/orders/vendor');
export const createOrder = (data: any) =>
  api('/orders', { method: 'POST', body: JSON.stringify(data) });

// Messages
export const getConversations = () => api('/messages/conversations');
export const getMessages = (userId: string) => api(`/messages/${userId}`);
export const sendMessage = (data: any) =>
  api('/messages', { method: 'POST', body: JSON.stringify(data) });

// Upload
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erreur upload');
  return data;
};
