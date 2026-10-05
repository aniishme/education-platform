import { Link, useParams } from 'react-router-dom';
import useResource from '../utils/useResource';
import ResourceState from '../components/ResourceState';
export default function CourseLearners(){
 const {id}=useParams();const resource=useResource('/courses/'+id+'/learners');
 return <section className="lms-page"><Link to={'/educator/courses/'+id+'/edit'}>Back to course</Link><h1>Enrolled learners</h1><ResourceState resource={resource}/>{resource.data&&!resource.data.length&&<p>No learners have enrolled yet.</p>}{resource.data?.length>0&&<div className="lms-table-wrap"><table className="lms-table"><thead><tr><th>Name</th><th>Email</th><th>Enrolled</th><th>Lessons</th><th>Progress</th></tr></thead><tbody>{resource.data.map(user=><tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{new Date(user.enrolled_at).toLocaleDateString()}</td><td>{user.completed_lessons}/{user.total_lessons}</td><td>{user.progress}%</td></tr>)}</tbody></table></div>}</section>;
}
