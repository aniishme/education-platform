import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { setAuth } from '../utils/auth';
import FormField from './FormField';
import logo from '../assets/studyflow-favicon.svg';
export default function AuthForm({signup=false}) {
 const [form,setForm]=useState({name:'',email:'',password:'',confirm:'',role:'LEARNER'});
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const navigate=useNavigate();
 const field=(name,label,type='text')=><FormField id={name} label={label} type={type} value={form[name]} onChange={event=>setForm({...form,[name]:event.target.value})} required autoComplete={name==='password'?(signup?'new-password':'current-password'):name}/>;
 async function submit(event){
  event.preventDefault();setError('');
  if(signup && form.password!==form.confirm){setError('Passwords do not match.');return;}
  setBusy(true);
  try {const {user}=await api('/auth/'+(signup?'signup':'login'),{method:'POST',body:form});setAuth(user);navigate('/',{replace:true});}
  catch(error){setError(error.message);}finally{setBusy(false);}
 }
 return <div className="login-page"><div className="login-card">
  <h1><img className="login-logo" src={logo} alt=""/>StudyFlow</h1>
  <p className="login-subtitle">{signup?'Create your learning account':'Welcome back. Log in to continue.'}</p>
  <form onSubmit={submit}>
   {signup&&field('name','Full name')}{field('email','Email','email')}{field('password','Password','password')}
   {signup&&<>{field('confirm','Confirm password','password')}<label className="lms-field">Account type<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="LEARNER">Learner</option><option value="EDUCATOR">Educator</option></select></label><p>Use at least 8 characters for your password.</p></>}
   {error&&<p role="alert" className="error-message">{error}</p>}
   <button className="login-button" disabled={busy}>{busy?'Please wait…':signup?'Create account':'Login'}</button>
  </form>
  <p className="login-footer"><Link to={signup?'/login':'/signup'}>{signup?'Already registered? Log in':'Create an account'}</Link> · <Link to="/">Home</Link></p>
 </div></div>;
}
