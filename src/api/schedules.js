import client from './client';

export const getSchedules = () => client.get('/schedules/');
export const addSchedule = (data) => client.post('/schedules/', data);
export const updateSchedule = (id, data) => client.put(`/schedules/${id}/`, data);
export const deleteSchedule = (id) => client.delete(`/schedules/${id}/`);
