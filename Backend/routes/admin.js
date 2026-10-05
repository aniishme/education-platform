const router=require('express').Router();
const db=require('../db');
const s=require('../security');
router.use(s.requireRole('ADMIN'));
router.get('/users',async(req,res)=>{res.json((await db.query('SELECT id,name,email,role,status,created_at FROM users ORDER BY created_at DESC')).rows);});
router.put('/users/:id',async(req,res)=>{
 const userId=s.id(req.params.id); const {role}=req.body;
 if(!['ADMIN','EDUCATOR','LEARNER'].includes(role)) s.fail(400,'Invalid role.');
 if(userId===req.user.id && role!=='ADMIN') s.fail(400,'You cannot remove your own administrator role.');
 const owns=await db.query('SELECT 1 FROM courses WHERE educator_id=$1',[userId]);
 if(owns.rowCount && role==='LEARNER') s.fail(400,'An owner of courses cannot become a learner.');
 const {rows}=await db.query('UPDATE users SET name=$1,email=$2,role=$3 WHERE id=$4 RETURNING id,name,email,role,status,created_at',[s.text(req.body.name,'Name',100),s.email(req.body.email),role,userId]);
 if(!rows[0]) s.fail(404,'User not found.');res.json({user:rows[0]});
});
router.put('/users/:id/status',async(req,res)=>{
 const userId=s.id(req.params.id);const {status}=req.body;
 if(!['active','deactivated'].includes(status)) s.fail(400,'Invalid status.');
 if(userId===req.user.id && status!=='active') s.fail(400,'You cannot deactivate your own account.');
 const {rows}=await db.query('UPDATE users SET status=$1 WHERE id=$2 RETURNING id,name,email,role,status,created_at',[status,userId]);
 if(!rows[0]) s.fail(404,'User not found.');
 if(status==='deactivated') await db.query('DELETE FROM sessions WHERE user_id=$1',[userId]);
 res.json({user:rows[0]});
});
router.get('/activity',async(req,res)=>res.json((await db.query('SELECT * FROM activity ORDER BY created_at DESC LIMIT 20')).rows));
router.get('/learner-growth',async(req,res)=>res.json((await db.query("SELECT id,created_at FROM users WHERE role='LEARNER' ORDER BY created_at")).rows));
module.exports=router;
