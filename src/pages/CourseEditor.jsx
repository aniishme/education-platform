import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import useResource from '../utils/useResource';
import ResourceState from '../components/ResourceState';
const emptyCourse={title:'',description:'',category:'',level:'Beginner',duration:'',image:'',status:'DRAFT'};
export default function CourseEditor(){
 const {id}=useParams();
 return id?<ExistingCourse id={id}/>:<Editor initial={emptyCourse}/>;
}
function ExistingCourse({id}){
 const resource=useResource('/courses/'+id);
 if(resource.loading||resource.error)return <ResourceState resource={resource}/>;
 return <Editor initial={resource.data} reload={resource.reload}/>;
}
function Editor({initial,reload}){
 const [form,setForm]=useState(initial);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);const navigate=useNavigate();
 async function save(event){event.preventDefault();setBusy(true);setError('');setNotice('');try{const data=await api('/courses'+(initial.id?'/'+initial.id:''),{method:initial.id?'PUT':'POST',body:form});if(!initial.id)navigate('/educator/courses/'+data.course.id+'/edit');else{setForm(data.course);setNotice('Course saved.');reload();}}catch(error){setError(error.message);}finally{setBusy(false);}}
 async function addSection(event){event.preventDefault();const element=event.currentTarget;setBusy(true);setError('');try{await api('/courses/'+initial.id+'/sections',{method:'POST',body:{title:new FormData(element).get('title'),position:initial.sections.length}});element.reset();reload();}catch(error){setError(error.message);}finally{setBusy(false);}}
 return <section className="lms-page"><Link to="/">Dashboard</Link><h1>{initial.id?'Edit course':'Create course'}</h1>{error&&<p role="alert" className="error-message">{error}</p>}{notice&&<p role="status" className="lms-notice">{notice}</p>}
 <form className="lms-form" onSubmit={save}><Fields values={form} setValues={setForm} fields={['title','description','category','level','duration','image']}/>{initial.id&&<label className="lms-field">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>DRAFT</option><option>PUBLISHED</option></select></label>}<button className="primary-button" disabled={busy}>{busy?'Saving…':'Save course'}</button></form>
 {initial.id&&<><h2>Modules & lessons</h2><p>Order starts at zero. Changes are saved separately. Add a lesson before publishing.</p><form className="lms-actions" onSubmit={addSection}><label className="lms-field">New module title<input name="title" required maxLength={150}/></label><button className="primary-button" disabled={busy}>Add module</button></form>{initial.sections.map(section=><Module key={section.id} section={section} reload={reload}/>)}<Link to={'/educator/courses/'+initial.id+'/learners'}>View enrolled learners</Link></>}
 </section>;
}
function Fields({values,setValues,fields}){
 return fields.map(name=><label className="lms-field" key={name}>{({video_url:'Video URL',image:'Thumbnail URL',position:'Order',content:'Lesson text'})[name]||name[0].toUpperCase()+name.slice(1)}
 {['content','description'].includes(name)?<textarea value={values[name]} required={name==='description'&&fields.includes('category')} onChange={e=>setValues({...values,[name]:e.target.value})}/>:<input type={name==='position'?'number':['image','video_url'].includes(name)?'url':'text'} min={0} max={name==='position'?100000:undefined} maxLength={name==='title'?150:undefined} required={['title','category'].includes(name)} value={values[name]} onChange={e=>setValues({...values,[name]:name==='position'?Number(e.target.value):e.target.value})}/>}
 </label>);
}
function Module({section,reload}){
 const [form,setForm]=useState({title:section.title,position:section.position});const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [editing,setEditing]=useState(null);
 async function mutate(path,method,body){setBusy(true);setError('');try{await api(path,{method,body});reload();}catch(error){setError(error.message);}finally{setBusy(false);}}
 return <section className="lms-module"><h3>{section.title}</h3>{error&&<p role="alert" className="error-message">{error}</p>}<form className="lms-form" onSubmit={e=>{e.preventDefault();mutate('/courses/sections/'+section.id,'PUT',form);}}><Fields values={form} setValues={setForm} fields={['title','position']}/><div className="lms-actions"><button className="secondary-button" disabled={busy}>Save module</button><button type="button" className="secondary-button" disabled={busy} onClick={()=>{if(window.confirm('Delete module and its lessons?'))mutate('/courses/sections/'+section.id,'DELETE');}}>Delete module</button></div></form>
 <ol>{section.lessons.map(lesson=><li key={lesson.id}><div className="lms-actions"><span>{lesson.title}</span><button className="text-link" disabled={busy} onClick={()=>setEditing(lesson.id)}>Edit lesson</button><button className="text-link" disabled={busy} onClick={()=>{if(window.confirm('Delete lesson and its completion records?'))mutate('/courses/lessons/'+lesson.id,'DELETE');}}>Delete</button></div></li>)}</ol>
 <button className="secondary-button" onClick={()=>setEditing('new')}>Add lesson</button>
 {editing&&(editing==='new'?<LessonForm key="new" sectionId={section.id} initial={{title:'',description:'',content:'',video_url:'',position:section.lessons.length}} saved={()=>{setEditing(null);reload();}} cancel={()=>setEditing(null)}/>:<LessonEdit key={editing} id={editing} saved={()=>{setEditing(null);reload();}} cancel={()=>setEditing(null)}/>)}
 </section>;
}
function LessonEdit({id,...props}){
 const resource=useResource('/lessons/'+id);
 if(resource.loading||resource.error)return <ResourceState resource={resource}/>;
 return <LessonForm initial={resource.data} {...props}/>;
}
function LessonForm({initial,sectionId,saved,cancel}){
 const [form,setForm]=useState(initial);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function save(event){event.preventDefault();setBusy(true);setError('');try{await api(initial.id?'/courses/lessons/'+initial.id:'/courses/sections/'+sectionId+'/lessons',{method:initial.id?'PUT':'POST',body:form});saved();}catch(error){setError(error.message);}finally{setBusy(false);}}
 return <form className="lms-form lms-module" onSubmit={save}><h4>{initial.id?'Edit lesson':'New lesson'}</h4><Fields values={form} setValues={setForm} fields={['title','description','content','video_url','position']}/>{error&&<p role="alert" className="error-message">{error}</p>}<div className="lms-actions"><button className="primary-button" disabled={busy}>Save lesson</button><button type="button" className="secondary-button" onClick={cancel}>Cancel</button></div></form>;
}
