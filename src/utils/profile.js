import { getAuth, setAuth } from './auth';
import { api } from '../services/api';
export const PROFILE_UPDATED_EVENT='studyflow-profile-updated';
export function getSavedProfile(){return getAuth()||{name:'Guest',email:''};}
export async function saveProfile(profile){
 const {user}=await api('/auth/profile',{method:'PUT',body:{name:profile.name,email:profile.email}});
 setAuth(user);window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));return user;
}
export function getInitials(name){return name.split(' ').filter(Boolean).map(part=>part[0]).join('').slice(0,2).toUpperCase();}
