import axios from 'axios';

const baseURL = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: baseURL || '/api',
  withCredentials: true,
});

// Attach Authorization from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auth helpers
export function setAuthToken(token: string) {
  localStorage.setItem('authToken', token);
}
export async function loginWithToken(token: string) {
  setAuthToken(token);
  return me();
}

// Health
export async function getHealth() {
  const { data } = await api.get('/health');
  return data;
}

// Messages
export interface Message { id: string; text: string; createdAt: string; authorId?: string }
export async function listMessages() {
  const { data } = await api.get<Message[]>('/messages');
  return data;
}
export async function createMessage(text: string) {
  const { data } = await api.post<Message>('/messages', { text });
  return data;
}

// Users
export interface UserSummary { id: string; name: string; avatar?: string }
export async function me() {
  try {
    const { data } = await api.get<UserSummary>('/users/me');
    return data;
  } catch (err) {
    // Fallback to mock user using the token as an identifier when backend is unavailable (e.g., 404)
    const token = localStorage.getItem('authToken') || 'guest';
    const id = token.toLowerCase();
    const mock: UserSummary = {
      id,
      name: id,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(id)}&background=random`,
    };
    return mock;
  }
}
export async function listUsers() {
  const { data } = await api.get<UserSummary[]>('/users');
  return data;
}
export async function followUser(id: string) {
  const { data } = await api.post(`/follow/${id}`, {});
  return data;
}
export async function unfollowUser(id: string) {
  const { data } = await api.delete(`/follow/${id}`);
  return data;
}

// Posts / Feed
export interface Post { id: string; authorId: string; text: string; createdAt: string; reactions?: Record<string,string> }
export async function getFeed() {
  const { data } = await api.get<Post[]>('/feed');
  return data;
}
export async function createPost(text: string) {
  const { data } = await api.post<Post>('/posts', { text });
  return data;
}
export async function reactPost(id: string, type: string = 'like') {
  const { data } = await api.post<Post>(`/posts/${id}/react`, { type });
  return data;
}
