import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';
import { getRole } from '../utils/auth';
import useResource from '../utils/useResource';
import ResourceState from '../components/ResourceState';
export default function CourseManagement(){
 const resource=useResource('/courses?mine=true');const [params]=useSearchParams();const [error,setError]=useState('');const [busy,setBusy]=useState(null);
 async function remove(id){if(!window.confirm('Delete this course, its lessons, enrolments and progress?'))return;setBusy(id);try{await api('/courses/'+id,{method:'DELETE'});resource.reload();}catch(error){setError(error.message);}finally{setBusy(null);}}
 const courses=(resource.data||[]).filter(c=>c.title.toLowerCase().includes((params.get('q')||'').toLowerCase()));
 return <section className="lms-page"><p className="eyebrow">{getRole()==='ADMIN'?'Platform catalogue':'Educator workspace'}</p><h1>Manage courses</h1><Link className="primary-button" to="/educator/courses/new">Create course</Link><ResourceState resource={resource}/>{error&&<p role="alert" className="error-message">{error}</p>}{resource.data&&!courses.length&&<p>No courses found. Create your first draft.</p>}
 <div className="lms-grid">{courses.map(c=><article className="lms-module" key={c.id}><span className="course-category">{c.category} · {c.status}</span><h2>{c.title}</h2><p>{c.instructor}</p><p>Created {new Date(c.created_at).toLocaleDateString()}</p><div className="lms-actions"><Link className="primary-button" to={'/educator/courses/'+c.id+'/edit'}>Edit</Link><Link className="secondary-button" to={'/educator/courses/'+c.id+'/learners'}>Learners & progress</Link><Link to={'/courses/'+c.id}>Preview</Link><button className="secondary-button" disabled={busy===c.id} onClick={()=>remove(c.id)}>Delete</button></div></article>)}</div></section>;
}
