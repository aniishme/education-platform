import { api } from './api';
export const getEnrolments=()=>api('/enrolments');
export const createEnrolment=(_userId,courseId)=>api('/enrolments',{method:'POST',body:{course_id:courseId}}).then(data=>data.enrolment);
export const deleteEnrolment=id=>api('/enrolments/'+id,{method:'DELETE'});
