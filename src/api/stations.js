import client from './client';

export const getStations = () => client.get('/stations/');
export const addStation = (data) => client.post('/stations/', data);
export const updateStation = (id, data) => client.put(`/stations/${id}/`, data);
export const deleteStation = (id) => client.delete(`/stations/${id}/`);
