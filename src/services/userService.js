import { api } from './api';
export const getUsers=()=>api('/users');
export const updateUser=(id,body)=>api('/users/'+id,{method:'PUT',body}).then(data=>data.user);
export const updateUserStatus=(id,status)=>api('/users/'+id+'/status',{method:'PUT',body:{status}}).then(data=>data.user);
