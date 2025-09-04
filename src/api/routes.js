import client from './client';

export const getRoutes = () => client.get('/routes/');
export const addRoute = (data) => client.post('/routes/', data);
export const updateRoute = (id, data) => client.put(`/routes/${id}/`, data);
export const deleteRoute = (id) => client.delete(`/routes/${id}/`);
export const suspendRoute = (id, suspended) => client.patch(`/routes/${id}/`, { suspended });
