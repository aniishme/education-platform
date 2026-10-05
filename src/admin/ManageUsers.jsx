import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import useResource from '../utils/useResource';
import ResourceState from '../components/ResourceState';
export default function ManageUsers(){
 const resource=useResource('/users');const [params,setParams]=useSearchParams();const [role,setRole]=useState('');const [editing,setEditing]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const users=(resource.data||[]).filter(u=>(!role||u.role===role)&&`${u.name} ${u.email}`.toLowerCase().includes((params.get('q')||'').toLowerCase()));
 async function save(event){event.preventDefault();setBusy(true);setError('');try{await api('/users/'+editing.id,{method:'PUT',body:editing});setEditing(null);resource.reload();}catch(error){setError(error.message);}finally{setBusy(false);}}
 async function toggle(user){setBusy(true);setError('');try{await api('/users/'+user.id+'/status',{method:'PUT',body:{status:user.status==='active'?'deactivated':'active'}});resource.reload();}catch(error){setError(error.message);}finally{setBusy(false);}}
 return <section className="lms-page"><h1>Manage users</h1><div className="lms-actions"><label className="lms-field">Search users<input type="search" value={params.get('q')||''} onChange={e=>setParams(e.target.value?{q:e.target.value}:{})}/></label><label className="lms-field">Role<select value={role} onChange={e=>setRole(e.target.value)}><option value="">All roles</option>{['ADMIN','EDUCATOR','LEARNER'].map(r=><option key={r}>{r}</option>)}</select></label></div><ResourceState resource={resource}/>{error&&<p role="alert" className="error-message">{error}</p>}
 {!users.length&&resource.data&&<p>No matching users.</p>}
 {users.length>0&&<div className="lms-table-wrap"><table className="lms-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}</td><td><div className="lms-actions"><button className="secondary-button" disabled={busy} onClick={()=>{setError('');setEditing(user);}}>Edit</button><button className="secondary-button" disabled={busy} onClick={()=>toggle(user)}>{user.status==='active'?'Deactivate':'Activate'}</button></div></td></tr>)}</tbody></table></div>}
 {editing&&<form className="lms-form lms-module" onSubmit={save}><h2>Edit user</h2>{['name','email'].map(field=><label className="lms-field" key={field}>{field}<input type={field==='email'?'email':'text'} required value={editing[field]} onChange={e=>setEditing({...editing,[field]:e.target.value})}/></label>)}<label className="lms-field">Role<select value={editing.role} onChange={e=>setEditing({...editing,role:e.target.value})}>{['ADMIN','EDUCATOR','LEARNER'].map(r=><option key={r}>{r}</option>)}</select></label><div className="lms-actions"><button className="primary-button" disabled={busy}>Save user</button><button className="secondary-button" type="button" onClick={()=>setEditing(null)}>Cancel</button></div></form>}
 </section>;
}
