import client from './client';

// Admin-oriented endpoints
export const getBookings = () => client.get('/admin/bookings/');
export const getBooking = (id) => client.get(`/admin/bookings/${id}/`);
export const updateBooking = (id, data) => client.put(`/admin/bookings/${id}/`, data);
export const deleteBooking = (id) => client.delete(`/admin/bookings/${id}/`);
