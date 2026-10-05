import { api } from './api';
export const getCourses = () => api('/courses');
export const getCourseById = id => api('/courses/'+id);
export const addCourse = body => api('/courses',{method:'POST',body}).then(data=>data.course);
export const updateCourse = (id,body) => api('/courses/'+id,{method:'PUT',body}).then(data=>data.course);
export const deleteCourse = id => api('/courses/'+id,{method:'DELETE'});
