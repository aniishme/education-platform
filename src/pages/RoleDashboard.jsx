import { Link } from 'react-router-dom';
import { getAuth, getRole } from '../utils/auth';
import useResource from '../utils/useResource';
import ResourceState from '../components/ResourceState';
import '../Dashboard.css';
import '../Admin.css';
export default function RoleDashboard(){
 const role=getRole();const resource=useResource(role==='LEARNER'?'/enrolments':'/dashboard');
 return <div className="dashboard"><header className="dashboard-heading"><p className="eyebrow">{role.toLowerCase()} dashboard</p><h1>Welcome, {getAuth()?.name}</h1><p>{role==='LEARNER'?'Continue your learning journey.':'Manage your platform and courses.'}</p></header>
 <ResourceState resource={resource}/>
 {resource.data&&<>{role==='LEARNER'?<>
  <div className="admin-stats-grid"><Stat label="Enrolled courses" value={resource.data.length}/><Stat label="Completed courses" value={resource.data.filter(c=>c.total_lessons>0&&c.progress===100).length}/><Stat label="Completed lessons" value={resource.data.reduce((n,c)=>n+c.completed_lessons,0)}/></div>
  <h2>Recently accessed courses</h2><div className="lms-grid">{resource.data.slice(0,6).map(c=><article className="dash-card" key={c.id}><h3>{c.title}</h3><p>{c.completed_lessons} of {c.total_lessons} lessons completed</p><progress max="100" value={c.progress}/><p>{c.progress}%</p><Link className="primary-button" to={'/courses/'+c.course_id+(c.last_lesson_id?'?lesson='+c.last_lesson_id:'')}>Continue learning</Link></article>)}</div>
  {!resource.data.length&&<p>No enrolments yet. <Link to="/courses">Explore courses</Link>.</p>}
 </>:<><div className="admin-stats-grid">{Object.entries(resource.data).map(([key,value])=><Stat key={key} label={key} value={value}/>)}</div><p><Link className="primary-button" to={role==='ADMIN'?'/admin/courses':'/educator/courses'}>Manage courses</Link> {role==='ADMIN'&&<Link className="secondary-button" to="/admin/users">Manage users</Link>}</p></>}</>}
 </div>;
}
function Stat({label,value}){return <article className="dash-card admin-stat-card"><p className="dash-kicker">{label}</p><strong className="admin-stat-value">{value}</strong></article>;}
