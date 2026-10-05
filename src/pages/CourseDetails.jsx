import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { getAuth, getRole } from '../utils/auth';
import useResource from '../utils/useResource';
import ResourceState from '../components/ResourceState';
export default function CourseDetails(){
 const {id}=useParams();const [params,setParams]=useSearchParams();
 const resource=useResource('/courses/'+id);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [completed,setCompleted]=useState([]);
 const course=resource.data;const user=getAuth();const role=getRole();
 const manager=user&&(role==='ADMIN'||(role==='EDUCATOR'&&course?.educator_id===user.id));
 const canLearn=Boolean(course&&(course.enrolment||manager));
 const lessonId=params.get('lesson');
 useEffect(()=>{
  let current=true;
  if(canLearn)api('/courses/'+id+'/progress').then(ids=>{if(current)setCompleted(ids);}).catch(error=>{if(current)setError(error.message);});
  return ()=>{current=false;};
 },[id,canLearn]);
 async function enrol(){setBusy(true);setError('');try{await api('/enrolments',{method:'POST',body:{course_id:Number(id)}});resource.reload();}catch(error){setError(error.message);}finally{setBusy(false);}}
 if(resource.loading||resource.error)return <ResourceState resource={resource}/>;
 const lessons=course.sections.flatMap(s=>s.lessons);
 const percentage=lessons.length?Math.round(100*completed.length/lessons.length):0;
 return <section className="lms-page"><p className="eyebrow">{course.category} · {course.level}</p><h1>{course.title}</h1><p>{course.description}</p><p>Instructor: {course.instructor} · {course.duration||'Self-paced'}</p>
 {course.image&&<img className="lms-thumbnail" src={course.image} alt={course.title+' thumbnail'}/>}
 {error&&<p role="alert" className="error-message">{error}</p>}
 <div className="lms-actions">{!user?<Link className="primary-button" to="/login">Log in to enrol</Link>:role==='LEARNER'&&!course.enrolment?<button className="primary-button" disabled={busy} onClick={enrol}>{busy?'Enrolling…':'Enrol for free'}</button>:course.enrolment?<span className="lms-notice">You are enrolled</span>:null}
 {manager&&<Link className="secondary-button" to={'/educator/courses/'+id+'/edit'}>Edit course</Link>}
 </div>
 {canLearn&&<><p>{completed.length} of {lessons.length} lessons complete · {percentage}%</p><progress max="100" value={percentage} aria-label="Course progress"/></>}
 <h2>Course modules</h2>{!course.sections.length&&<p>No modules yet.</p>}
 {course.sections.map(section=><section key={section.id} className="lms-module"><h3>{section.title}</h3><ol className="lms-lessons">{section.lessons.map(lesson=><li key={lesson.id}>{canLearn?<button className="text-link" onClick={()=>setParams({lesson:String(lesson.id)})}>{lesson.title}</button>:lesson.title} {canLearn&&<span>{completed.includes(lesson.id)?'✓ Completed':'Incomplete'}</span>}</li>)}</ol>{!section.lessons.length&&<p>No lessons yet.</p>}</section>)}
 {canLearn&&lessonId&&<Lesson key={lessonId} id={lessonId} expectedCourseId={Number(id)} learner={role==='LEARNER'} onComplete={(lessonId,done)=>setCompleted(ids=>done?[...new Set([...ids,lessonId])]:ids.filter(id=>id!==lessonId))}/>}
 </section>;
}
function Lesson({id,expectedCourseId,learner,onComplete}){
 const resource=useResource('/lessons/'+id);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const lesson=resource.data;
 async function toggle(){setBusy(true);setError('');try{const data=await api('/lessons/'+id+'/progress',{method:'PUT',body:{completed:!lesson.completed}});onComplete(Number(id),data.completed);resource.reload();}catch(error){setError(error.message);}finally{setBusy(false);}}
 if(resource.loading||resource.error)return <ResourceState resource={resource}/>;
 if(lesson.course_id!==expectedCourseId)return <p role="alert">This lesson belongs to a different course. Choose a lesson above.</p>;
 return <article className="lms-module" aria-label="Lesson content"><h2>{lesson.title}</h2><p>{lesson.description}</p><div className="lms-content">{lesson.content||'No text content provided.'}</div>{lesson.video_url&&<p><a className="primary-button" href={lesson.video_url} target="_blank" rel="noreferrer">Open lesson video</a></p>}{error&&<p role="alert" className="error-message">{error}</p>}{learner&&<button className="primary-button" disabled={busy} onClick={toggle}>{busy?'Saving…':lesson.completed?'Mark incomplete':'Mark lesson complete'}</button>}</article>;
}
