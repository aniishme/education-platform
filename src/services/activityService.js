import { api } from './api';
export const getRecentActivity=async(limit=6)=>(await api('/activity')).slice(0,limit);
export function timeAgo(date) {
 const minutes=Math.max(0,Math.floor((Date.now()-new Date(date).getTime())/60000));
 return minutes<1?'Just now':minutes<60?minutes+' minutes ago':Math.floor(minutes/60)+' hours ago';
}
