const crypto = require('node:crypto');
const db = require('./db');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' };
function token(req) {
 return req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('studyflow_session='))?.slice(18);
}
async function session(req, res, next) {
 const value = token(req);
 if (value) {
  const result = await db.query(`SELECT u.id,u.name,u.email,u.role,u.status FROM sessions s
   JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW() AND u.status='active'`, [hash(value)]);
  req.user = result.rows[0];
 }
 next();
}
async function issue(res, user) {
 const value = crypto.randomBytes(32).toString('hex');
 await db.query('DELETE FROM sessions WHERE expires_at<NOW()');
 await db.query("INSERT INTO sessions VALUES ($1,$2,NOW()+INTERVAL '7 days')", [hash(value), user.id]);
 res.cookie('studyflow_session', value, { ...cookieOptions, maxAge: 7 * 86400000 });
}
function requireRole(...roles) {
 return (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Please log in to continue.' });
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to do this.' });
  next();
 };
}
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function text(value, label, max = 150, required = true) {
 if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) fail(400, `${label} is required and must be at most ${max} characters.`);
 return value.trim();
}
function email(value) {
 const result = text(value, 'Email', 150).toLowerCase();
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'Enter a valid email address.');
 return result;
}
function password(value) {
 if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value) > 72) fail(400, 'Password must contain at least 8 characters and at most 72 bytes.');
 return value;
}
function id(value) { if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) fail(400, 'Invalid resource ID.'); return Number(value); }
function url(value) {
 if (!value) return '';
 try { const parsed = new URL(value); if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error(); }
 catch { fail(400, 'Enter a valid HTTP or HTTPS URL.'); }
 return text(value, 'URL', 2000);
}
module.exports = { hash, token, cookieOptions, session, issue, requireRole, fail, text, email, password, id, url };
