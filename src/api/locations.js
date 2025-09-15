import client from './client';

export const getLocations = () => client.get('/locations/');
export const addLocation = (data) => client.post('/locations/', data);
export const updateLocation = (id, data) => client.put(`/locations/${id}/`, data);
export const deleteLocation = (id) => client.delete(`/locations/${id}/`);
