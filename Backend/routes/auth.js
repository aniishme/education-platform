const router = require('express').Router();
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const s = require('../security');
const fields = 'id,name,email,role,status,created_at';
router.use(rateLimit({ windowMs: 15 * 60000, limit: 100 }));
router.post('/signup', async (req, res) => {
 const { name, email, password, role = 'LEARNER' } = req.body;
 if (!['LEARNER','EDUCATOR'].includes(role)) s.fail(400, 'Choose Learner or Educator.');
 const result = await db.query(`INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING ${fields}`,
  [s.text(name,'Name',100), s.email(email), await bcrypt.hash(s.password(password),12),role]);
 await s.issue(res,result.rows[0]);
 res.status(201).json({ user: result.rows[0] });
});
router.post('/login', async (req,res) => {
 const result = await db.query('SELECT * FROM users WHERE email=$1',[s.email(req.body.email)]);
 const user = result.rows[0];
 if (typeof req.body.password !== 'string' || !user || !await bcrypt.compare(req.body.password,user.password)) s.fail(401,'Invalid email or password.');
 if (user.status !== 'active') s.fail(403,'Your account has been deactivated.');
 await s.issue(res,user);
 delete user.password;
 res.json({ user });
});
router.get('/me',s.requireRole(), (req,res) => res.json({user:req.user}));
router.post('/logout',async (req,res) => {
 if(s.token(req)) await db.query('DELETE FROM sessions WHERE token_hash=$1',[s.hash(s.token(req))]);
 res.clearCookie('studyflow_session',s.cookieOptions); res.json({message:'Logged out.'});
});
router.put('/password',s.requireRole(),async (req,res) => {
 const {rows} = await db.query('SELECT password FROM users WHERE id=$1',[req.user.id]);
 if(typeof req.body.currentPassword !== 'string' || !await bcrypt.compare(req.body.currentPassword,rows[0].password)) s.fail(400,'Current password is incorrect.');
 await db.query('UPDATE users SET password=$1 WHERE id=$2',[await bcrypt.hash(s.password(req.body.newPassword),12),req.user.id]);
 await db.query('DELETE FROM sessions WHERE user_id=$1',[req.user.id]);
 await s.issue(res,req.user); res.json({message:'Password updated.'});
});
router.put('/profile',s.requireRole(),async(req,res) => {
 const {rows} = await db.query(`UPDATE users SET name=$1,email=$2 WHERE id=$3 RETURNING ${fields}`,
 [s.text(req.body.name,'Name',100),s.email(req.body.email),req.user.id]);
 res.json({user:rows[0]});
});
module.exports=router;
