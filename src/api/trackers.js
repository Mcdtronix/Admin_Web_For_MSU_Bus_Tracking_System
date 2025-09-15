import client from './client';

export const getTrackers = () => client.get('/trackers/');
export const addTracker = (data) => client.post('/trackers/', data);
export const updateTracker = (id, data) => client.put(`/trackers/${id}/`, data);
export const deleteTracker = (id) => client.delete(`/trackers/${id}/`);
