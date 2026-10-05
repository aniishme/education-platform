const router=require('express').Router();
const db=require('../db');
const s=require('../security');
const access=require('../courseAccess');
const managers=s.requireRole('ADMIN','EDUCATOR');
function courseValues(body) {
 return [s.text(body.title,'Title'),s.text(body.description,'Description',20000),s.text(body.category,'Category',100),
 s.text(body.level||'Beginner','Level',50),s.text(body.duration||'','Duration',50,false),s.url(body.image),body.status||'DRAFT'];
}
function status(value) { if(!['DRAFT','PUBLISHED'].includes(value)) s.fail(400,'Invalid course status.'); }
async function publishCheck(courseId,value) {
 if(value==='PUBLISHED') {
  const {rowCount}=await db.query('SELECT l.id FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=$1',[courseId]);
  if(!rowCount) s.fail(400,'Add at least one lesson before publishing.');
 }
}
router.get('/',async(req,res)=>{
 const args=[]; const where=[];
 if(req.user?.role!=='ADMIN') {
  if(req.query.mine==='true' && req.user?.role==='EDUCATOR') {args.push(req.user.id);where.push(`c.educator_id=$${args.length}`);}
  else where.push("c.status='PUBLISHED'");
 }
 if(req.query.q) {args.push(`%${s.text(req.query.q,'Search',150)}%`);where.push(`(c.title ILIKE $${args.length} OR c.description ILIKE $${args.length})`);}
 if(req.query.category) {args.push(s.text(req.query.category,'Category',100));where.push(`c.category=$${args.length}`);}
 const {rows}=await db.query(`SELECT c.*,u.name AS instructor FROM courses c JOIN users u ON u.id=c.educator_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY c.created_at DESC,c.id DESC`,args);
 res.json(rows);
});
router.post('/',managers,async(req,res)=>{
 const values=courseValues(req.body); status(values[6]);
 if(values[6]!=='DRAFT') s.fail(400,'Create a draft first, then add lessons and publish.');
 const {rows}=await db.query(`INSERT INTO courses(title,description,category,level,duration,image,status,educator_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[...values,req.user.id]);
 res.status(201).json({course:rows[0]});
});
router.get('/:id',async(req,res)=>{
 const course=await access.course(req,req.params.id);
 const {rows:sections}=await db.query('SELECT * FROM sections WHERE course_id=$1 ORDER BY position,id',[course.id]);
 const {rows:lessons}=await db.query('SELECT l.id,l.section_id,l.title,l.position FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=$1 ORDER BY s.position,s.id,l.position,l.id',[course.id]);
 const enrolment=req.user ? (await db.query('SELECT * FROM enrolments WHERE user_id=$1 AND course_id=$2',[req.user.id,course.id])).rows[0] : null;
 res.json({...course,sections:sections.map(section=>({...section,lessons:lessons.filter(l=>l.section_id===section.id)})),enrolment});
});
router.put('/:id',managers,async(req,res)=>{
 const course=await access.course(req,req.params.id,true); const values=courseValues({...course,...req.body});status(values[6]);await publishCheck(course.id,values[6]);
 const {rows}=await db.query('UPDATE courses SET title=$1,description=$2,category=$3,level=$4,duration=$5,image=$6,status=$7,updated_at=NOW() WHERE id=$8 RETURNING *',[...values,course.id]);res.json({course:rows[0]});
});
router.delete('/:id',managers,async(req,res)=>{const course=await access.course(req,req.params.id,true);await db.query('DELETE FROM courses WHERE id=$1',[course.id]);res.json({message:'Course deleted.'});});
router.post('/:id/sections',managers,async(req,res)=>{
 const course=await access.course(req,req.params.id,true);
 const {rows}=await db.query('INSERT INTO sections(course_id,title,position) VALUES($1,$2,$3) RETURNING *',[course.id,s.text(req.body.title,'Module title'),position(req.body.position)]);res.status(201).json(rows[0]);
});
function position(value=0) { if(!Number.isInteger(Number(value)) || Number(value)<0 || Number(value)>100000) s.fail(400,'Order must be a non-negative integer.');return Number(value); }
router.put('/sections/:id',managers,async(req,res)=>{
 const section=await access.section(req,req.params.id);
 const {rows}=await db.query('UPDATE sections SET title=$1,position=$2 WHERE id=$3 RETURNING *',[s.text(req.body.title,'Module title'),position(req.body.position),section.id]);res.json(rows[0]);
});
router.delete('/sections/:id',managers,async(req,res)=>{const section=await access.section(req,req.params.id);await db.query('DELETE FROM sections WHERE id=$1',[section.id]);res.json({message:'Module deleted.'});});
router.post('/sections/:id/lessons',managers,async(req,res)=>{
 const section=await access.section(req,req.params.id);
 const {rows}=await db.query('INSERT INTO lessons(section_id,title,description,content,video_url,position) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[section.id,...lessonValues(req.body)]);res.status(201).json(rows[0]);
});
function lessonValues(body) {return [s.text(body.title,'Lesson title'),s.text(body.description||'','Description',20000,false),s.text(body.content||'','Content',100000,false),s.url(body.video_url),position(body.position)];}
router.put('/lessons/:id',managers,async(req,res)=>{const lesson=await access.lesson(req,req.params.id,true);const {rows}=await db.query('UPDATE lessons SET title=$1,description=$2,content=$3,video_url=$4,position=$5 WHERE id=$6 RETURNING *',[...lessonValues(req.body),lesson.id]);res.json(rows[0]);});
router.delete('/lessons/:id',managers,async(req,res)=>{const lesson=await access.lesson(req,req.params.id,true);await db.query('DELETE FROM lessons WHERE id=$1',[lesson.id]);res.json({message:'Lesson deleted.'});});
router.get('/:id/learners',managers,async(req,res)=>{
 const course=await access.course(req,req.params.id,true);
 const {rows}=await db.query(`SELECT u.id,u.name,u.email,e.enrolled_at,
 (SELECT COUNT(*)::int FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=e.course_id) AS total_lessons,
 (SELECT COUNT(*)::int FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id WHERE p.user_id=e.user_id AND s.course_id=e.course_id) AS completed_lessons
 FROM enrolments e JOIN users u ON u.id=e.user_id WHERE e.course_id=$1 ORDER BY e.enrolled_at DESC`,[course.id]);res.json(rows.map(progress));
});
function progress(row) {return {...row,progress:row.total_lessons?Math.round(100*row.completed_lessons/row.total_lessons):0};}
module.exports={router,progress};
