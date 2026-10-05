import { useState } from 'react';
import { getSavedProfile,saveProfile,getInitials } from '../utils/profile';
import '../Profile.css';
export default function Profile(){
 const [profile,setProfile]=useState(getSavedProfile);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
 async function save(event){event.preventDefault();setBusy(true);setError('');setNotice('');try{setProfile(await saveProfile(profile));setNotice('Profile saved.');}catch(error){setError(error.message);}finally{setBusy(false);}}
 return <section className="lms-page"><h1>My profile</h1><div className="profile-avatar">{getInitials(profile.name)}</div><p>Role: {profile.role}</p><form className="lms-form" onSubmit={save}>{['name','email'].map(field=><label className="lms-field" key={field}>{field==='name'?'Full name':'Email'}<input type={field==='email'?'email':'text'} required value={profile[field]} onChange={e=>setProfile({...profile,[field]:e.target.value})}/></label>)}{error&&<p className="error-message" role="alert">{error}</p>}{notice&&<p className="lms-notice" role="status">{notice}</p>}<button className="primary-button" disabled={busy}>{busy?'Saving…':'Save profile'}</button></form></section>;
}
