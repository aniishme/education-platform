import { api } from '../services/api';
let user = null;
export function getAuth() { return user ? {...user,userId:user.id,isLoggedIn:true} : null; }
export function setAuth(value) { user=value; window.dispatchEvent(new Event('studyflow-auth-updated')); }
export function isLoggedIn() { return Boolean(user); }
export function getRole() { return user?.role || 'LEARNER'; }
export function isAdmin() { return user?.role==='ADMIN'; }
export async function restoreAuth() {
 try { const data=await api('/auth/me');setAuth(data.user); }
 catch(error) { setAuth(null); if(error.message!=='Please log in to continue.') throw error; }
}
export async function logout() { await api('/auth/logout',{method:'POST'});setAuth(null); }
