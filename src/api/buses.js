import client from './client';

const BASE_URL = '/api';

export const getBuses = () => client.get('/buses/');
export const addBus = (data) => client.post('/buses/', data);
export const updateBus = (id, data) => client.put(`/buses/${id}/`, data);
export const deleteBus = (id) => client.delete(`/buses/${id}/`);
export const publishBus = (id, publish) => client.patch(`/buses/${id}/`, { published: publish });

// Add this function for getting bus locations
export const getBusLocations = () => client.get('/buses/locations/');