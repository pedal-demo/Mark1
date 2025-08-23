// Lightweight mock backend for PEDAL
// Provides minimal endpoints used by the app across browser profiles
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const API_PREFIX = '/api';

// In-memory store (resets on server restart)
const db = {
  users: new Map(), // id -> { id, name, avatar }
};

function ensureUser(id) {
  if (!id) return null;
  const key = String(id).toLowerCase();
  if (!db.users.has(key)) {
    db.users.set(key, {
      id: key,
      name: key,
      username: key,
      fullName: key,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(key)}&background=random`,
    });
  }
  return db.users.get(key);
}

function auth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : '';
  if (!token) {
    return res.status(401).json({ message: 'Missing Bearer token' });
  }
  req.user = ensureUser(token);
  if (!req.user) return res.status(401).json({ message: 'Invalid token' });
  next();
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// Health
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({ ok: true, users: db.users.size });
});

// Users
app.get(`${API_PREFIX}/users/me`, auth, (req, res) => {
  res.json(req.user);
});

app.get(`${API_PREFIX}/users`, (req, res) => {
  const list = Array.from(db.users.values()).map(u => ({
    id: u.id,
    username: u.username || u.id,
    fullName: u.fullName || u.name || u.id,
    avatar: u.avatar,
    name: u.name || u.id,
  }));
  res.json(list);
});

app.get(`${API_PREFIX}/users/search`, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const all = Array.from(db.users.values()).map(u => ({
    id: u.id,
    username: u.username || u.id,
    fullName: u.fullName || u.name || u.id,
    avatar: u.avatar,
    name: u.name || u.id,
  }));
  const filtered = q
    ? all.filter(u => u.id.includes(q) || (u.name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q))
    : all;
  res.json({ users: filtered.slice(0, limit) });
});

// Optional register/login endpoints for userService.ts compatibility
app.post(`${API_PREFIX}/auth/register`, (req, res) => {
  const { username, email, fullName } = req.body || {};
  if (!username) return res.status(400).json({ message: 'username is required' });
  const user = ensureUser(username);
  // Issue a simple token = username
  const u = {
    id: user.id,
    username: user.username || user.id,
    fullName: fullName || user.fullName || user.id,
    email: email || `${user.id}@demo.local`,
  };
  res.json({ token: username, user: u });
});

app.post(`${API_PREFIX}/auth/login`, (req, res) => {
  const { emailOrUsername } = req.body || {};
  if (!emailOrUsername) return res.status(400).json({ message: 'emailOrUsername is required' });
  const id = String(emailOrUsername).toLowerCase().split('@')[0];
  const user = ensureUser(id);
  const u = {
    id: user.id,
    username: user.username || user.id,
    fullName: user.fullName || user.id,
    email: `${user.id}@demo.local`,
  };
  res.json({ token: id, user: u });
});

app.listen(PORT, () => {
  console.log(`PEDAL mock API listening on http://localhost:${PORT}${API_PREFIX}`);
});
