const db = require('./db');
const {fail,id} = require('./security');
async function course(req, courseId, manage = false, content = false) {
 const {rows} = await db.query(`SELECT c.*,u.name AS instructor FROM courses c JOIN users u ON u.id=c.educator_id WHERE c.id=$1`,[id(courseId)]);
 const result=rows[0];
 if(!result) fail(404,'Course not found.');
 const owner=req.user?.role==='EDUCATOR' && result.educator_id===req.user.id;
 const admin=req.user?.role==='ADMIN';
 if(manage && !owner && !admin) fail(403,'You can only manage your own courses.');
 if(!manage && !owner && !admin && result.status!=='PUBLISHED') fail(404,'Course is unavailable.');
 if(content && !owner && !admin) {
  if(!req.user) fail(401,'Please log in to access lessons.');
  const enrolment=await db.query('SELECT id FROM enrolments WHERE user_id=$1 AND course_id=$2',[req.user.id,result.id]);
  if(!enrolment.rowCount) fail(403,'Enrol in this course to access lessons.');
 }
 return result;
}
async function section(req, sectionId) {
 const {rows}=await db.query('SELECT * FROM sections WHERE id=$1',[id(sectionId)]);
 if(!rows[0]) fail(404,'Module not found.');
 await course(req,rows[0].course_id,true); return rows[0];
}
async function lesson(req, lessonId, manage=false) {
 const {rows}=await db.query('SELECT l.*,s.course_id FROM lessons l JOIN sections s ON s.id=l.section_id WHERE l.id=$1',[id(lessonId)]);
 if(!rows[0]) fail(404,'Lesson not found.');
 await course(req,rows[0].course_id,manage,!manage); return rows[0];
}
module.exports={course,section,lesson};
